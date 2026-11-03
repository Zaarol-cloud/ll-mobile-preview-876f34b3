import {createJournalEvaluation, ownOptions, closureLimit, helpers as c, ref} from './personal-journal-contract.mjs';
import {INIT_ID} from './personal-player-action-contract.mjs';
import {records} from './personal-chest-instance-read-factories.mjs';
import {requireJournalOriginPort,MAX_ORIGIN_READS,MAX_ORIGIN_DOCUMENT_BYTES,MAX_SOURCE_DOCUMENT_BYTES,MAX_ORIGIN_READ_BYTES} from './d205-journal-origin.mjs';
import {createPersonalCalendarContract, LEVEL_COUNT, MAX_DOCUMENT_BYTES as MAX_CALENDAR_DOCUMENT_BYTES, MAX_EVIDENCE_BYTES} from './personal-calendar-contract.mjs';
import {prepareJournalCalendar} from './personal-journal-calendar.mjs';

// No persistence, scan, cache of private history, or writer is owned here.
export const MAX_DOCUMENT_BYTES = 1024 * 1024;
export const MAX_READ_BYTES = 16 * 1024 * 1024;
export const MAX_CALENDAR_READS = LEVEL_COUNT + 1;
export const MAX_CALENDAR_READ_BYTES = MAX_EVIDENCE_BYTES + MAX_CALENDAR_DOCUMENT_BYTES;
// Separate writer-proof limit, not a change to ordinary per-etappe readers.
export const MAX_CALENDAR_HISTORY_CLOSURES = 8192;
export const MAX_CALENDAR_HISTORY_BYTES = 256 * 1024 * 1024;
const calendarHistoryProofs = new WeakMap();
export const calendarTranscriptStart = uid => c.digest({domain: 'lockloot/calendar-journal-transcript/v1', uid: c.uid(uid)});
export function calendarTranscriptAppend(previous, witnesses) {
  if (typeof previous !== 'string' || !/^[a-f0-9]{64}$/.test(previous) || !Array.isArray(witnesses) || witnesses.length !== 4) c.fail('INVALID_CALENDAR_TRANSCRIPT');
  return c.digest({previous, witnesses});
}
export function takeCalendarHistoryProof(token) {
  const issued = calendarHistoryProofs.get(token);calendarHistoryProofs.delete(token);
  if (!issued) c.fail('CALENDAR_HISTORY_PROOF_REQUIRED');issued.check();return issued.value;
}
export function createPersonalJournalReader(value = {}) {
  const config = ownOptions(value, ['uid', 'databaseName', 'indexedDB', 'subtle', 'maxClosures', 'origin', 'calendar']);
  const uid = c.uid(config.uid), name = config.databaseName, idb = config.indexedDB ?? globalThis.indexedDB;
  const maxClosures = closureLimit(config.maxClosures), subtle = config.subtle ?? globalThis.crypto?.subtle;
  if (typeof name !== 'string' || !/^lockloot-d203c2-[A-Za-z0-9_-]{1,100}$/.test(name) || !idb?.open || typeof idb.databases !== 'function') c.fail('READONLY_DATABASE_CONFIGURATION');
  const origin = config.origin === undefined ? null : requireJournalOriginPort(config.origin);
  if (origin && (origin.uid !== uid || origin.databaseName !== name)) c.fail('JOURNAL_ORIGIN_TARGET_MISMATCH');
  const calendarConfig = config.calendar === undefined ? null : c.exact(config.calendar, ['sourceOrigin', 'fixtureRaw']);
  if (calendarConfig && !origin) c.fail('JOURNAL_CALENDAR_ORIGIN_REQUIRED');
  const calendar = calendarConfig ? createPersonalCalendarContract(calendarConfig) : null;
  const calendarReference = r => !!calendar && r.uid === uid &&
    (r.kind === 'CALENDAR_ASSETS' && r.id === 'current' || r.kind === 'CALENDAR_CLAIM' && /^[a-f0-9]{64}$/.test(r.id));
  let closed = false, generation = 0, continuation = null;
  const controls = new Set(), transactions = new Set(), handles = new Set();
  const metrics = {readRequests: 0, completedTransactions: 0, abortedTransactions: 0, maxReadsPerTransaction: 0, resumedEtappes: 0, discardedContinuations: 0};
  const reference = (kind, id = 'current') => ref({uid, kind, id});
  function begin(options) {
    const o = ownOptions(options, ['signal', 'isCurrent']);
    if (o.signal !== undefined && !(o.signal instanceof AbortSignal) || o.isCurrent !== undefined && typeof o.isCurrent !== 'function') c.fail('INVALID_JOURNAL_OPTIONS');
    if (closed) c.fail('VIEW_CLOSED');
    if (controls.size && continuation) {continuation = null; metrics.discardedContinuations++;}
    // Supersession affects only this reader's operations, never other readers.
    const token = ++generation, control = new AbortController(), forward = () => control.abort();
    for (const active of controls) active.abort();
    controls.add(control); o.signal?.addEventListener('abort', forward, {once: true});
    if (o.signal?.aborted) control.abort();
    return {control, witnesses: new Map(), bytes: 0, originBytes: 0, calendarBytes: 0, sourceRaw: undefined,
      check() {if (closed) c.fail('VIEW_CLOSED'); if (token !== generation || o.isCurrent && !o.isCurrent()) c.fail('STALE_READ'); if (control.signal.aborted) c.fail('READ_ABORTED');},
      async wait(promise) {this.check();let stop;try{return await Promise.race([promise,new Promise((_,reject)=>{stop=()=>reject(Object.assign(Error('READ_ABORTED'),{code:'READ_ABORTED'}));control.signal.addEventListener('abort',stop,{once:true});if(control.signal.aborted)stop();})]);}finally{control.signal.removeEventListener('abort',stop);}},
      done() {controls.delete(control); o.signal?.removeEventListener('abort', forward);}};
  }
  function stop() {
    closed = true; generation++; continuation = null;
    for (const control of controls) control.abort();
    for (const tx of transactions) {try {tx.abort();} catch {}}
    for (const db of handles) db.close(); handles.clear();
  }
  async function open(op) {
    const list = await op.wait(idb.databases());op.check();
    if (!Array.isArray(list) || !list.some(d => d.name === name)) c.fail('DATABASE_NOT_FOUND');
    return new Promise((resolve,reject)=>{let settled=false;
      const cleanup=()=>op.control.signal.removeEventListener('abort',cancel);
      const fail=e=>{if(!settled){settled=true;cleanup();reject(e);}};
      const cancel=()=>fail(Object.assign(Error('READ_ABORTED'),{code:'READ_ABORTED'}));
      op.control.signal.addEventListener('abort',cancel,{once:true});if(op.control.signal.aborted){cancel();return;}
      let request;try{request=idb.open(name);}catch(e){fail(e);return;}
      request.onupgradeneeded=()=>request.transaction.abort();
      request.onerror=()=>fail(Object.assign(Error('READONLY_OPEN_FAILED'),{code:'READONLY_OPEN_FAILED'}));
      request.onblocked=()=>fail(Object.assign(Error('DB_BLOCKED'),{code:'DB_BLOCKED'}));
      request.onsuccess=()=>{const db=request.result;if(settled||closed||op.control.signal.aborted){db.close();fail(Object.assign(Error('READ_ABORTED'),{code:'READ_ABORTED'}));return;}try{op.check();if(db.version!==1||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents'))c.fail('DB_SCHEMA_MISMATCH');handles.add(db);db.onversionchange=()=>{stop();db.close();};settled=true;cleanup();resolve(db);}catch(e){db.close();fail(e);}};
    });
  }
  function phase(db, op, collect, revalidate = false) {
    op.check();
    return new Promise((resolve, reject) => {
      let tx, error, result, reads = 0, journalReads = 0, originReads = 0, calendarReads = 0;
      const abort = failure => {error ||= failure; try {tx.abort();} catch {}};
      const signal = () => abort(Object.assign(Error('READ_ABORTED'), {code: 'READ_ABORTED'}));
      const cleanup = () => {transactions.delete(tx); op.control.signal.removeEventListener('abort', signal); metrics.maxReadsPerTransaction = Math.max(metrics.maxReadsPerTransaction, reads);};
      try {
        tx = db.transaction('documents', 'readonly'); transactions.add(tx);
        tx.onerror = () => {};
        tx.onabort = () => {cleanup(); metrics.abortedTransactions++; reject(error || tx.error || Error('READ_ABORTED'));};
        tx.oncomplete = () => {cleanup(); metrics.completedTransactions++; try {op.check();if(revalidate&&origin&&origin.source()!==op.sourceRaw)c.fail('JOURNAL_SOURCE_CHANGED');resolve(result);} catch (e) {reject(e);}};
        const store = tx.objectStore('documents');
        if(store.keyPath!=='key'||store.autoIncrement||store.indexNames.length)c.fail('DB_SCHEMA_MISMATCH');
        op.control.signal.addEventListener('abort', signal, {once: true}); op.check();
        const get = (r, callback) => {
          const imported = !!origin?.profile(r), calendarDocument = calendarReference(r);reads++;
          if (calendarDocument ? ++calendarReads > MAX_CALENDAR_READS : imported ? ++originReads > MAX_ORIGIN_READS : ++journalReads > 6 + 4 * maxClosures) c.fail('JOURNAL_RESOURCE_LIMIT');
          metrics.readRequests++;
          const key = c.canonical(r), request = store.get(key);
          request.onsuccess = () => {
            if (error) return;
            try {
              op.check(); let document = null;
              if (request.result !== undefined) {
                const row = c.exact(request.result, ['key', 'document']);
                if (row.key !== key) c.fail('STORED_KEY_MISMATCH');
                document = row.document;
              }
              const encoded = c.canonical(document), bytes = new TextEncoder().encode(encoded).byteLength;
              const limit=calendarDocument?MAX_CALENDAR_DOCUMENT_BYTES:imported?(r.kind==='LEGACY_SOURCE'?MAX_SOURCE_DOCUMENT_BYTES:MAX_ORIGIN_DOCUMENT_BYTES):MAX_DOCUMENT_BYTES;
              if (bytes > limit) c.fail('JOURNAL_DOCUMENT_LIMIT');
              if (!revalidate && (calendarDocument ? op.calendarBytes + bytes > MAX_CALENDAR_READ_BYTES : imported ? op.originBytes + bytes > MAX_ORIGIN_READ_BYTES : op.bytes + bytes > MAX_READ_BYTES)) c.fail('JOURNAL_RESOURCE_LIMIT');
              const witness = {ref: r, digest: c.digest(document)};
              if (revalidate) {if (witness.digest !== op.witnesses.get(key)?.digest) c.fail('READSET_CHANGED');if(origin&&origin.source()!==op.sourceRaw)c.fail('JOURNAL_SOURCE_CHANGED');}
              else {
                if(calendarDocument)op.calendarBytes+=bytes;else if(imported)op.originBytes+=bytes;else op.bytes += bytes;
                if (op.witnesses.has(key) && op.witnesses.get(key).digest !== witness.digest) c.fail('READSET_CHANGED');
                op.witnesses.set(key, witness);
              }
              callback(document);
            } catch (e) {abort(e);}
          };
        };
        collect(get, value => {result = value;});
      } catch (e) {if (tx) abort(e); else {cleanup(); reject(e);}}
    });
  }
  async function snapshot(options = {},guardOnly = false,captureCalendar = false) {
    const op = begin(options);let db;
    try {
      if (captureCalendar && !calendar) c.fail('JOURNAL_CALENDAR_REQUIRED');
      if(origin)op.sourceRaw=origin.source();
      db = await open(op); op.check();
      const current = await phase(db, op, (get, finish) => {
        const d = {uid, head: null, identity: null, player: null, chest: null, start: null, init: null};
        get(reference('HEAD'), head => {d.head = head;
          get(reference('PLAYER'), player => {d.player = player;
            get(reference('LOCAL_IDENTITY'), identity => {d.identity = identity;
              get(reference('ACTION', INIT_ID), init => {d.init = init;
                if (!head?.data?.activeChestId) {finish(d); return;}
                get(reference('CHEST', head.data.activeChestId), chest => {d.chest = chest;
                  if (!chest) {finish(d); return;}
                  get(reference('REQUEST', chest.data.start.requestId), start => {d.start = start; finish(d);});
                });
              });
            });
          });
        });
      });
      const originFrame=origin?await phase(db,op,(get,finish)=>origin.read(get,current,finish)):null;
      const proof=origin?await op.wait(origin.verify(originFrame,op.sourceRaw,{signal:op.control.signal,isCurrent:()=>{op.check();return true;}})):null;op.check();
      let calendarInput = null, calendarDigest = null;
      if (calendar && current.player) {
        const base = calendar.verifyBase({frame: originFrame, sourceRaw: op.sourceRaw});
        const evidence = await phase(db, op, (get, finish) => {
          const docs = {assets: null, claims: Array(LEVEL_COUNT).fill(null)}; let left = MAX_CALENDAR_READS;
          const done = () => {if (--left === 0) finish({assets: docs.assets, claims: docs.claims.filter(d => d !== null)});};
          get({uid, kind: 'CALENDAR_ASSETS', id: 'current'}, d => {docs.assets = d; done();});
          for (let level = 1; level <= LEVEL_COUNT; level++) get(calendar.claimReference(base, level), d => {docs.claims[level - 1] = d; done();});
        });
        op.check();
        calendarInput = {...calendarConfig, frame: originFrame, sourceRaw: op.sourceRaw, ...evidence};
        const checked = prepareJournalCalendar(calendarInput, {origin: proof, current, subtle});
        await op.wait(checked.verifyOrigin({signal: op.control.signal, isCurrent: () => {op.check(); return true;}}));op.check();
        calendarDigest = checked.evidenceDigest;
      }
      if(guardOnly){const state=records.requireActiveReadSet(Object.fromEntries(Object.entries(current).filter(([k])=>k!=='init')));
        await phase(db,op,(get,finish)=>{let left=op.witnesses.size;for(const witness of op.witnesses.values())get(witness.ref,()=>{if(--left===0)finish(true);});},true);op.check();
        return state?c.freeze({anchors:{...state.anchors,...(proof?{originDigest:proof.provenanceDigest,originKind:proof.kind}:{}),...(calendarDigest?{calendarDigest}:{})}}):null;
      }
      const stamp = c.digest(calendarDigest ? {current, provenanceDigest: proof.provenanceDigest, calendarDigest} : proof?{current,provenanceDigest:proof.provenanceDigest}:current);
      if (captureCalendar) continuation = null;
      if (continuation && continuation.stamp !== stamp) {continuation = null; metrics.discardedContinuations++;}
      const fixedWitnesses = captureCalendar ? new Map(op.witnesses) : null, fixedBytes = op.bytes;
      let transcript = calendarTranscriptStart(uid), closureCount = 0, historyBytes = 0;
      const observeClosure = captureCalendar ? witnesses => {
        if (closureCount >= MAX_CALENDAR_HISTORY_CLOSURES) c.fail('CALENDAR_HISTORY_LIMIT');
        const bytes = witnesses.reduce((sum, w) => sum + w.bytes, 0);
        if (!Number.isSafeInteger(bytes) || historyBytes + bytes > MAX_CALENDAR_HISTORY_BYTES) c.fail('CALENDAR_HISTORY_LIMIT');
        historyBytes += bytes;
        transcript = calendarTranscriptAppend(transcript, witnesses);closureCount++;
      } : undefined;
      const evaluation = continuation?.evaluation ?? createJournalEvaluation(current, {maxClosures, subtle,...(proof?{origin:proof}:{}),...(calendarInput?{calendar:calendarInput}:{}),...(observeClosure?{observeClosure}:{})});
      if (continuation) metrics.resumedEtappes++;
      // Never share a running evaluator with a superseding operation.
      continuation = null;
      let output;
      do {
      output = await op.wait(evaluation.advance({signal: op.control.signal,
        isCurrent: () => {op.check(); return true;},
        readClosure: ({chestId, actionId}) => phase(db, op, (get, finish) => {
          const d = {action: null, archive: null, start: null, end: null};
          get(reference('ACTION', actionId), action => {d.action = action;
            get(reference('ARCHIVE', chestId), archive => {d.archive = archive;
              get(reference('REQUEST', actionId), end => {d.end = end;
                if (!archive) {finish(d); return;}
                get(reference('REQUEST', archive.data.start.requestId), start => {d.start = start; finish(d);});
              });
            });
          });
        })}));
      op.check();
      // One atomic final read transaction rechecks the whole bounded witness
      // set, including absence witnesses, alongside the original current head.
      await phase(db, op, (get, finish) => {
        let left = op.witnesses.size;
        for (const witness of op.witnesses.values()) get(witness.ref, () => {if (--left === 0) finish(true);});
      }, true);
      op.check();
      if (captureCalendar && output.reason === 'CONTINUATION_REQUIRED') {
        // Only the transcript survives; old private documents and per-etappe
        // byte/read budgets do not accumulate or silently grow.
        op.witnesses = new Map(fixedWitnesses);op.bytes = fixedBytes;
      }
      } while (captureCalendar && output.reason === 'CONTINUATION_REQUIRED');
      if (captureCalendar) {
        if (output.reason === 'RESOURCE_LIMIT') c.fail('CALENDAR_HISTORY_RESOURCE_LIMIT');
        if (output.status !== 'COMPLETE' || !calendarInput) c.fail('CALENDAR_HISTORY_INCOMPLETE');
        if (output.statistics.openedChests - proof.statistics.openedChests !== closureCount) c.fail('CALENDAR_TRANSCRIPT_COUNT');
        const token = Object.freeze({calendarHistoryProofVersion: 1, status: 'PREPARED_REQUIRES_ATOMIC_RECHECK'});
        calendarHistoryProofs.set(token, {check: () => op.check(), value: c.freeze({
          uid, databaseName: name, current, calendarInput, sourceRaw: op.sourceRaw,
          fixedWitnesses: [...fixedWitnesses.values()], transcript, closureCount, historyBytes, snapshot: output})});
        return token;
      }
      if (output.reason === 'CONTINUATION_REQUIRED') continuation = {stamp, evaluation};
      return output;
    } catch (error) {
      // A failed calendar observation must not retain a prior private ledger,
      // even if the next observation happens to restore the old public stamps.
      if (calendar && continuation) {continuation = null; metrics.discardedContinuations++;}
      throw error;
    } finally {db?.close();if(db)handles.delete(db);op.done();}
  }
  return Object.freeze({snapshot:options=>snapshot(options),guard:options=>snapshot(options,true),
    captureCalendar:options=>snapshot(options,false,true), diagnostics: () => c.freeze(c.copy(metrics)), async close() {stop();}});
}
