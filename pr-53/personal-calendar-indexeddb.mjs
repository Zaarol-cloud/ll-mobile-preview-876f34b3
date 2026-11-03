import {createPersonalCalendarContract, utcDayFromMillis} from './personal-calendar-contract.mjs';
import {createPersonalJournalReader, takeCalendarHistoryProof, calendarTranscriptStart, calendarTranscriptAppend,
  MAX_CALENDAR_HISTORY_CLOSURES, MAX_CALENDAR_HISTORY_BYTES, MAX_DOCUMENT_BYTES} from './personal-journal-indexeddb.mjs';
import {createJournalOrigin, MAX_SOURCE_DOCUMENT_BYTES, MAX_ORIGIN_DOCUMENT_BYTES} from './d205-journal-origin.mjs';
import {TARGET, ownOptions, readSource, freeze} from './d205-activation-contract.mjs';
import {copy, exact, canonical, digest, fail} from './personal-chest-storage-contract.mjs';

export const MAX_FIXED_READS = 42;
export const MAX_COMMIT_READS = MAX_FIXED_READS + 4 * MAX_CALENDAR_HISTORY_CLOSURES;
const error = code => Object.assign(Error(code), {code});
const ref = (kind, id = 'current') => ({uid: TARGET.uid, kind, id});
const context = value => ({head: value.head, identity: value.identity, chest: value.chest, start: value.start});
const pointers = player => player.documentVersion === 1 ? {lastClosedChestId: null, lastClosedActionId: null} : player.data.personal;

// This adapter owns its reader. Neither a public journal result nor a caller's
// "verified" flag can authorize a write. It never initializes/upgrades a DB.
export function createPersonalCalendarAdapter(value) {
  const cfg = ownOptions(value, ['sourceOrigin', 'fixtureRaw', 'sourcePort', 'indexedDB', 'subtle', 'now']);
  const calendarConfig = exact({sourceOrigin: cfg.sourceOrigin, fixtureRaw: cfg.fixtureRaw}, ['sourceOrigin', 'fixtureRaw']);
  const calendar = createPersonalCalendarContract(calendarConfig), idb = cfg.indexedDB ?? globalThis.indexedDB;
  const subtle = cfg.subtle ?? globalThis.crypto?.subtle, now = cfg.now ?? (() => Date.now());
  if (!idb?.open || typeof idb.databases !== 'function' || typeof now !== 'function') fail('CALENDAR_PLATFORM_REQUIRED');
  const origin = createJournalOrigin({...calendarConfig, sourcePort: cfg.sourcePort, subtle});
  let closed = false, generation = 0;
  const controls = new Set(), readers = new Set(), handles = new Set(), transactions = new Set();
  const metrics = {captures: 0, reads: 0, writes: 0, commits: 0, replays: 0, aborted: 0, retries: 0, maxCommitReads: 0};
  const day = () => utcDayFromMillis(now());
  function begin(value = {}) {
    const o = ownOptions(value, ['signal', 'isCurrent']);
    if (o.signal !== undefined && !(o.signal instanceof AbortSignal) || o.isCurrent !== undefined && typeof o.isCurrent !== 'function') fail('CALENDAR_OPTIONS_INVALID');
    if (closed) fail('CALENDAR_CLOSED');
    const token = ++generation, control = new AbortController(), abort = () => control.abort();
    for (const pending of controls) pending.abort();controls.add(control);
    o.signal?.addEventListener('abort', abort, {once: true});if (o.signal?.aborted) control.abort();
    return {control, check() {if (closed) fail('CALENDAR_CLOSED');if (control.signal.aborted) fail('CALENDAR_ABORTED');if (token !== generation || o.isCurrent && !o.isCurrent()) fail('CALENDAR_STALE');},
      async wait(promise) {let stop;try {return await Promise.race([promise, new Promise((_, reject) => {
        stop = () => reject(error('CALENDAR_ABORTED'));control.signal.addEventListener('abort', stop, {once: true});if (control.signal.aborted) stop();
      })]);} finally {control.signal.removeEventListener('abort', stop);}},
      done() {controls.delete(control);o.signal?.removeEventListener('abort', abort);}};
  }
  async function capture(op) {
    op.check();const reader = createPersonalJournalReader({...TARGET, indexedDB: idb, subtle, origin, calendar: calendarConfig});readers.add(reader);
    try {
      metrics.captures++;const token = await reader.captureCalendar({signal: op.control.signal, isCurrent: () => {op.check();return true;}});op.check();
      const proof = takeCalendarHistoryProof(token);
      if (proof.uid !== TARGET.uid || proof.databaseName !== TARGET.databaseName || proof.snapshot.status !== 'COMPLETE' ||
          proof.closureCount > MAX_CALENDAR_HISTORY_CLOSURES || proof.historyBytes > MAX_CALENDAR_HISTORY_BYTES || proof.fixedWitnesses.length > MAX_FIXED_READS) fail('CALENDAR_HISTORY_BINDING');
      const input = proof.calendarInput, base = calendar.verifyBase({frame: input.frame, sourceRaw: proof.sourceRaw});
      const current = {player: proof.current.player, context: context(proof.current), assets: input.assets, claims: input.claims};
      return {proof, base, current};
    } finally {await reader.close();readers.delete(reader);}
  }
  async function open(op) {
    op.check();const names = await op.wait(idb.databases());op.check();
    if (!Array.isArray(names) || !names.some(d => d.name === TARGET.databaseName)) fail('DATABASE_NOT_FOUND');
    return new Promise((resolve, reject) => {
      let settled = false, q;
      const done = (e, db) => {if (settled) {db?.close();return;}settled = true;op.control.signal.removeEventListener('abort', abort);e ? reject(e) : resolve(db);};
      const abort = () => done(error('CALENDAR_ABORTED'));
      op.control.signal.addEventListener('abort', abort, {once: true});if (op.control.signal.aborted) {abort();return;}
      try {q = idb.open(TARGET.databaseName);} catch (e) {done(e);return;}
      q.onupgradeneeded = () => q.transaction.abort();q.onerror = () => done(error('CALENDAR_OPEN_FAILED'));q.onblocked = () => done(error('DB_BLOCKED'));
      q.onsuccess = () => {const db = q.result;if (settled) {db.close();return;}
        try {op.check();if (db.version !== 1 || db.objectStoreNames.length !== 1 || !db.objectStoreNames.contains('documents')) fail('DB_SCHEMA_MISMATCH');
          handles.add(db);db.onversionchange = () => {op.control.abort();db.close();handles.delete(db);};done(null, db);
        } catch (e) {db.close();done(e);}};
    });
  }
  function atomic(db, prepared, plan, op) {
    const {proof} = prepared, expected = new Map(proof.fixedWitnesses.map(w => [canonical(w.ref), w.digest]));
    for (const w of plan.readSet) if (expected.get(canonical(w.ref)) !== w.documentDigest) fail('CALENDAR_PLAN_OUTSIDE_PROOF');
    if (expected.size !== proof.fixedWitnesses.length) fail('CALENDAR_DUPLICATE_WITNESS');
    if (plan.writes.length !== (plan.replayed ? 0 : 3) || !plan.replayed && plan.writes.map(d => d.kind).join(',') !== 'PLAYER,CALENDAR_ASSETS,CALENDAR_CLAIM') fail('CALENDAR_WRITE_SET');
    const checkSource = () => {if (readSource(cfg.sourcePort) !== proof.sourceRaw) fail('CALENDAR_SOURCE_CHANGED');};
    const checkDay = () => {if (!plan.replayed && day() !== plan.receipt.dayKey) fail('CALENDAR_DAY_CHANGED');};
    op.check();checkSource();
    return new Promise((resolve, reject) => {
      let tx, failure, finished = false, reads = 0, writes = 0, historyBytes = 0;
      const abort = e => {failure ||= e;try {tx.abort();} catch {}};
      const cancelled = () => abort(error('CALENDAR_ABORTED'));
      const cleanup = () => {transactions.delete(tx);op.control.signal.removeEventListener('abort', cancelled);metrics.maxCommitReads = Math.max(metrics.maxCommitReads, reads);};
      try {
        tx = db.transaction('documents', plan.replayed ? 'readonly' : 'readwrite');transactions.add(tx);
        tx.onerror = () => {};
        tx.onabort = () => {finished = true;cleanup();metrics.aborted++;reject(failure || tx.error || error('CALENDAR_TRANSACTION_ABORTED'));};
        tx.oncomplete = () => {finished = true;cleanup();if (plan.replayed) metrics.replays++;else metrics.commits++;
          // Commit acknowledgement is derived only from this native event.
          resolve(freeze({calendarCommitVersion: 1, committed: true, replayed: plan.replayed, writeCount: writes, requestId: plan.requestId}));};
        const store = tx.objectStore('documents');
        if (store.keyPath !== 'key' || store.autoIncrement || store.indexNames.length) fail('DB_SCHEMA_MISMATCH');
        op.control.signal.addEventListener('abort', cancelled, {once: true});op.check();checkSource();
        const get = (reference, done) => {
          if (++reads > MAX_COMMIT_READS || reads > proof.fixedWitnesses.length + 4 * proof.closureCount) fail('CALENDAR_READ_LIMIT');metrics.reads++;
          const key = canonical(reference), q = store.get(key);
          q.onsuccess = () => {if (failure || finished) return;try {
            op.check();checkSource();let document = null;
            if (q.result !== undefined) {const row = exact(q.result, ['key', 'document']);if (row.key !== key) fail('STORED_KEY_MISMATCH');document = row.document;}
            const limit = reference.kind === 'LEGACY_SOURCE' ? MAX_SOURCE_DOCUMENT_BYTES : origin.profile(reference) ? MAX_ORIGIN_DOCUMENT_BYTES : MAX_DOCUMENT_BYTES;
            const bytes = new TextEncoder().encode(canonical(document)).length;
            if (bytes > limit) fail('CALENDAR_DOCUMENT_LIMIT');
            if (reads > proof.fixedWitnesses.length) {historyBytes += bytes;if (historyBytes > proof.historyBytes) fail('CALENDAR_HISTORY_CHANGED');}
            done(document, {ref: reference, digest: digest(document), bytes});
          } catch (e) {abort(e);}};
        };
        const book = () => {
          op.check();checkSource();checkDay();
          if (reads !== proof.fixedWitnesses.length + 4 * proof.closureCount) fail('CALENDAR_READSET_INCOMPLETE');
          for (const document of plan.writes) {
            const reference = ref(document.kind, document.id), key = canonical(reference);
            if (!expected.has(key)) fail('CALENDAR_WRITE_WITHOUT_READ');
            const q = document.kind === 'CALENDAR_CLAIM' ? store.add({key, document}) : store.put({key, document});writes++;metrics.writes++;
            q.onsuccess = () => {if (failure || finished) return;try {op.check();checkSource();checkDay();} catch (e) {abort(e);}};
          }
        };
        let transcript = calendarTranscriptStart(TARGET.uid), count = 0;
        const walk = pointer => {
          if (pointer.lastClosedChestId === null && pointer.lastClosedActionId === null) {
            if (count !== proof.closureCount || transcript !== proof.transcript || historyBytes !== proof.historyBytes) fail('CALENDAR_HISTORY_CHANGED');book();return;
          }
          if (count >= proof.closureCount || typeof pointer.lastClosedChestId !== 'string' || typeof pointer.lastClosedActionId !== 'string') fail('CALENDAR_HISTORY_CHANGED');
          const entries = [], cid = pointer.lastClosedChestId, aid = pointer.lastClosedActionId;
          get(ref('ACTION', aid), (action, a) => {entries.push(a);
            get(ref('ARCHIVE', cid), (archive, b) => {entries.push(b);
              get(ref('REQUEST', aid), (_end, e) => {entries.push(e);
                if (typeof archive?.data?.start?.requestId !== 'string') fail('CALENDAR_HISTORY_CHANGED');
                get(ref('REQUEST', archive.data.start.requestId), (_start, s) => {entries.push(s);
                  transcript = calendarTranscriptAppend(transcript, entries);count++;
                  if (!action?.data?.beforePlayer) fail('CALENDAR_HISTORY_CHANGED');walk(pointers(action.data.beforePlayer));
                });
              });
            });
          });
        };
        let left = proof.fixedWitnesses.length;
        for (const w of proof.fixedWitnesses) get(w.ref, (_d, actual) => {
          if (actual.digest !== w.digest) fail('READSET_CHANGED');
          if (--left === 0) walk(pointers(proof.current.player));
        });
      } catch (e) {if (tx && !finished) abort(e);else {cleanup();reject(e);}}
    });
  }
  async function inspect(options = {}) {
    const op = begin(options);try {const p = await capture(op);op.check();return calendar.inspect({base: p.base, current: p.current, currentDay: day()});} finally {op.done();}
  }
  async function claim(value, options = {}) {
    const v = exact(value, ['requestId']);if (typeof v.requestId !== 'string') fail('CALENDAR_REQUEST_ID');
    const op = begin(options);let db;
    try {
      for (let retry = 0; retry < 2; retry++) {
        try {
          const p = await capture(op);op.check();
          const known = p.current.claims.find(c => c.data.request.requestId === v.requestId), currentDay = day();
          const request = known?.data.request ?? calendar.makeRequest({base: p.base, current: p.current, requestId: v.requestId, dayKey: currentDay});
          const plan = calendar.prepareClaim({base: p.base, current: p.current, request, currentDay, sourceRaw: p.proof.sourceRaw, addressedClaim: known ?? null});
          db = await open(op);op.check();const commit = await atomic(db, p, plan, op);
          return freeze({calendarClaimResultVersion: 1, committed: true, replayed: plan.replayed, receipt: plan.receipt, commit});
        } catch (e) {
          if (retry !== 0 || e.code !== 'READSET_CHANGED') throw e;op.check();metrics.retries++;
        } finally {if (db) {db.close();handles.delete(db);db = null;}}
      }
    } finally {op.done();}
  }
  return Object.freeze({inspect, claim, diagnostics: () => freeze(copy(metrics)), async close() {
    closed = true;generation++;for (const c of controls) c.abort();for (const tx of transactions) {try {tx.abort();} catch {}}
    await Promise.all([...readers].map(r => r.close()));for (const db of handles) db.close();handles.clear();
  }});
}
