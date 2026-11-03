import {records} from './personal-chest-instance-read-factories.mjs';
import {helpers as c, verifySuccessfulAttemptProof, ref} from './personal-player-v3-attempt-contract.mjs';
import * as initial from './personal-player-action-contract.mjs';
import {createCrewInvitationBrowser} from './personal-chest-crew-invitation-browser.mjs';
import {requireJournalOrigin} from './d205-journal-origin.mjs';
import {prepareJournalCalendar} from './personal-journal-calendar.mjs';

// A local consistency projection, not authority against the device owner.
export const JOURNAL_VERSION = 1;
export const DEFAULT_MAX_CLOSURES = 128;
export const MAX_CLOSURES = 512;
export {ref};
export const helpers = c;

export function ownOptions(value, allowed) {
  if (!value || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) c.fail('INVALID_OPTIONS');
  const result = {};
  for (const key of Reflect.ownKeys(value)) {
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !allowed.includes(key) || !d.enumerable || !Object.hasOwn(d, 'value')) c.fail('INVALID_OPTIONS');
    result[key] = d.value;
  }
  return result;
}
export function closureLimit(value = DEFAULT_MAX_CLOSURES) {
  if (!Number.isSafeInteger(value) || value < 1 || value > MAX_CLOSURES) c.fail('INVALID_JOURNAL_LIMIT');
  return value;
}
function add(a, b) {
  if (!Number.isSafeInteger(a) || a < 0 || !Number.isSafeInteger(b) || b < 0 || a > Number.MAX_SAFE_INTEGER - b) c.fail('JOURNAL_COUNT_OVERFLOW');
  return a + b;
}
function metadata(player) {
  return player.documentVersion === 1 ? {lastClosedChestId: null, lastClosedActionId: null} : player.data.personal;
}
function frame(value) {
  const f = c.exact(value, ['uid', 'head', 'identity', 'player', 'chest', 'start']);
  const snapshot = records.requireActiveReadSet(f);
  return {documents: f, snapshot};
}
function activeCounts(snapshot) {
  return {cookies: snapshot.chest?.hintState.purchasedPackageCount ?? 0,
    lockpicks: snapshot.personal.activeAttempts?.bookedAttemptCount ?? 0};
}
function resourceLink(target, earlier, spent) {
  const a = target.data, b = earlier.data;
  return target.documentVersion >= earlier.documentVersion &&
    a.points === b.points && a.cookies === b.cookies - spent.cookies &&
    a.lockpicks === b.lockpicks - spent.lockpicks &&
    target.revision === add(earlier.revision, add(spent.cookies, spent.lockpicks));
}
function followsClosure(target, proof, spent, calendarLink = false) {
  const {head, player, chest, start} = target;
  if (!head || head.documentVersion < proof.closed[0].documentVersion ||
      head.revision !== add(proof.closed[0].revision, chest ? 1 : 0) ||
      chest && start.data.committedRevision !== head.revision ||
      !calendarLink && !resourceLink(player, proof.afterPlayer, spent)) c.fail('JOURNAL_HISTORY_BINDING');
  const p = metadata(player), expected = metadata(proof.afterPlayer);
  if (p.lastClosedChestId !== expected.lastClosedChestId || p.lastClosedActionId !== expected.lastClosedActionId) c.fail('JOURNAL_HISTORY_BINDING');
  if (head.revision === proof.closed[0].revision && c.canonical(head) !== c.canonical(proof.closed[0])) c.fail('JOURNAL_HISTORY_BINDING');
  if (player.revision === proof.afterPlayer.revision && c.canonical(player) !== c.canonical(proof.afterPlayer)) c.fail('JOURNAL_HISTORY_BINDING');
}
export function requireJournalSnapshot(value) {
  const s = c.exact(value, ['journalSnapshotVersion', 'scope', 'status', 'reason', 'binding', 'points', 'statistics']);
  const reasons = ['PLAYER_MISSING', 'INVALID_ORIGIN', 'CONTINUATION_REQUIRED', 'MISSING_CLOSURE_EVIDENCE', 'UNPROVEN_ORIGIN', 'RESOURCE_LIMIT', 'COUNT_OVERFLOW', 'INVALID_HISTORY'];
  if (s.journalSnapshotVersion !== JOURNAL_VERSION || s.scope !== 'DEVICE_LOCAL' ||
      !['COMPLETE', 'INCOMPLETE', 'INVALID', 'UNAVAILABLE'].includes(s.status) ||
      (s.status === 'COMPLETE' ? s.reason !== null : !reasons.includes(s.reason))) c.fail('INVALID_JOURNAL_SNAPSHOT');
  if (s.binding === null) {
    if (s.status !== 'UNAVAILABLE' || s.reason !== 'PLAYER_MISSING' || s.points !== null) c.fail('INVALID_JOURNAL_SNAPSHOT');
  } else {
    const hasOrigin = Object.hasOwn(s.binding, 'originDigest');
    const hasCalendar = Object.hasOwn(s.binding, 'calendarDigest');
    const b = c.exact(s.binding, ['headRevision', 'headDigest', 'playerRevision', 'playerDigest', ...(hasOrigin ? ['originDigest'] : []), ...(hasCalendar ? ['calendarDigest'] : [])]);
    if (hasOrigin && (typeof b.originDigest !== 'string' || !/^[a-f0-9]{64}$/.test(b.originDigest))) c.fail('INVALID_JOURNAL_SNAPSHOT');
    if (hasCalendar && (typeof b.calendarDigest !== 'string' || !/^[a-f0-9]{64}$/.test(b.calendarDigest))) c.fail('INVALID_JOURNAL_SNAPSHOT');
    c.revision(b.headRevision); c.revision(b.playerRevision, 1); c.revision(s.points);
    if (s.status === 'UNAVAILABLE' || !/^[a-f0-9]{64}$/.test(b.playerDigest) ||
        !(b.headDigest === null && b.headRevision === 0 || typeof b.headDigest === 'string' && /^[a-f0-9]{64}$/.test(b.headDigest))) c.fail('INVALID_JOURNAL_SNAPSHOT');
  }
  const stats = c.exact(s.statistics, ['openedChests', 'cookiesConsumed', 'lockpicksConsumed']);
  for (const count of Object.values(stats)) {
    if (s.status === 'COMPLETE') c.revision(count);
    else if (count !== null) c.fail('INVALID_JOURNAL_SNAPSHOT');
  }
  return c.freeze(s);
}
function publicResult(current, status, reason, statistics = null) {
  const s = current.snapshot;
  return requireJournalSnapshot({journalSnapshotVersion: JOURNAL_VERSION, scope: 'DEVICE_LOCAL', status, reason,
    binding: s ? {headRevision: s.anchors.headRevision, headDigest: s.anchors.headDigest,
      playerRevision: s.anchors.playerRevision, playerDigest: s.anchors.playerDigest,
      ...(current.origin?.publicDigest ? {originDigest: current.origin.publicDigest} : {}),
      ...(current.calendarDigest ? {calendarDigest: current.calendarDigest} : {})} : null,
    points: s?.wallet.points ?? null,
    statistics: statistics || {openedChests: null, cookiesConsumed: null, lockpicksConsumed: null}});
}

// Trusted callback supplies only the four addressed closure witnesses. It never
// receives a public view and cannot replace the current PLAYER projection.
export function createJournalEvaluation(value, options = {}) {
  const config = ownOptions(options, ['maxClosures', 'subtle', 'origin', 'calendar', 'observeClosure']);
  if (config.observeClosure !== undefined && typeof config.observeClosure !== 'function') c.fail('INVALID_JOURNAL_OBSERVER');
  const origin = config.origin === undefined ? null : requireJournalOrigin(config.origin);
  const max = closureLimit(config.maxClosures);
  const raw = c.exact(value, ['uid', 'head', 'identity', 'player', 'chest', 'start', 'init']);
  if (origin && origin.basePlayer.uid !== raw.uid) c.fail('JOURNAL_ORIGIN_UID_MISMATCH');
  const current = frame(Object.fromEntries(Object.entries(raw).filter(([k]) => k !== 'init')));
  current.origin = origin;
  const calendar = config.calendar === undefined ? null : prepareJournalCalendar(config.calendar,
    {origin, current: raw, subtle: config.subtle ?? globalThis.crypto?.subtle});
  if (calendar) current.calendarDigest = calendar.evidenceDigest;
  // Modern action proofs bind identity even when an abandoned CREW preparation
  // created it before a PERSONAL start whose HEAD remains v2. HEAD alone cannot
  // prove absence. Legacy v3 proof recomputation has an identity-free frame.
  const historicalIdentity = action => action.documentVersion === 5 && action.data.identityDigest !== null ? raw.identity : null;
  let terminal = current.snapshot ? null : publicResult(current, 'UNAVAILABLE', 'PLAYER_MISSING');
  let init = null;
  if (raw.init !== null && current.snapshot) {
    try {
      init = initial.document(raw.init, initial.ref(raw.uid, 'ACTION', initial.INIT_ID));
      if (init.data.kind !== 'INIT') c.fail('INVALID_JOURNAL_INIT');
    } catch { terminal = publicResult(current, 'INVALID', 'INVALID_ORIGIN'); }
  }
  if (origin && (origin.kind === 'IMPORT' ? raw.init !== null : c.canonical(raw.init) !== c.canonical(origin.init))) terminal = publicResult(current, 'INVALID', 'INVALID_ORIGIN');
  let target = current, totals = {openedChests: 0, cookiesConsumed: 0, lockpicksConsumed: 0}, busy = false;
  if (current.snapshot) {
    const active = activeCounts(current.snapshot);
    totals.cookiesConsumed = active.cookies; totals.lockpicksConsumed = active.lockpicks;
  }
  async function advance(options = {}) {
    const o = ownOptions(options, ['readClosure', 'signal', 'isCurrent']);
    if (typeof o.readClosure !== 'function' || o.signal !== undefined && !(o.signal instanceof AbortSignal) ||
        o.isCurrent !== undefined && typeof o.isCurrent !== 'function') c.fail('INVALID_JOURNAL_OPTIONS');
    if (busy) c.fail('JOURNAL_EVALUATION_BUSY');
    const check = () => {if (o.signal?.aborted) c.fail('JOURNAL_ABORTED'); if (o.isCurrent && !o.isCurrent()) c.fail('STALE_JOURNAL');};
    check(); if (terminal) return terminal;
    busy = true;
    const chests = new Set(), actions = new Set();
    try {
      if (calendar) {
        await calendar.verifyOrigin({signal: o.signal, isCurrent: () => {check(); return true;}});
        check();
      }
      const active = raw.chest?.data.record;
      if (active?.selection.modeId === 'CREW') {
        const material = await createCrewInvitationBrowser({subtle: config.subtle ?? globalThis.crypto?.subtle}).derivePrivateMaterial(
          {invitationCode: active.instanceBinding.invitationCode, browserSaltHex: raw.identity.data.browserSaltHex}, {signal: o.signal});
        check();
        if (c.canonical(material) !== c.canonical({chestId: active.chestId, ...active.material})) c.fail('CREW_MATERIAL_BINDING_MISMATCH');
      }
      while (metadata(target.documents.player).lastClosedChestId !== null) {
        check();
        const pointers = metadata(target.documents.player), cid = pointers.lastClosedChestId, aid = pointers.lastClosedActionId;
        if (chests.has(cid) || actions.has(aid)) c.fail('JOURNAL_HISTORY_CYCLE');
        if (chests.size >= max) return publicResult(current, 'INCOMPLETE', 'CONTINUATION_REQUIRED');
        chests.add(cid); actions.add(aid);
        const e = c.exact(await o.readClosure({chestId: cid, actionId: aid}), ['action', 'archive', 'start', 'end']);
        check();
        if (!e.action || !e.archive || !e.start || !e.end) return terminal = publicResult(current, 'INCOMPLETE', 'MISSING_CLOSURE_EVIDENCE');
        const action = e.action;
        if (action.id !== aid || action.uid !== raw.uid) c.fail('JOURNAL_HISTORY_BINDING');
        const proof = await verifySuccessfulAttemptProof({uid: raw.uid, identity: raw.identity, action},
          {subtle: config.subtle ?? globalThis.crypto?.subtle, signal: o.signal, isCurrent: () => {check(); return true;}});
        check();
        if (proof.request.chestId !== cid || proof.request.requestId !== aid ||
            c.canonical(e.archive) !== c.canonical(proof.closed[2]) ||
            c.canonical(e.end) !== c.canonical(proof.closed[3]) || c.canonical(e.start) !== c.canonical(proof.start)) c.fail('JOURNAL_CLOSURE_BINDING');
        records.requireClosedReadSet({uid: raw.uid, head: target.documents.head, identity: raw.identity,
          archive: e.archive, start: e.start, end: e.end});
        const spent = activeCounts(target.snapshot);
        const consumed = calendar ? await calendar.verifyLink({head: proof.closed[0], identity: historicalIdentity(action),
          player: proof.afterPlayer, chest: null, start: null}, target.documents, spent) : null;
        check();
        followsClosure(target.documents, proof, spent, calendar !== null);
        const summary = action.documentVersion === 5 ? proof.response.summary : proof.response.actionResult.summary;
        const nextTotals = {openedChests: add(totals.openedChests, 1),
          cookiesConsumed: add(totals.cookiesConsumed, summary.consumption.cookies),
          lockpicksConsumed: add(totals.lockpicksConsumed, summary.consumption.lockpicks)};
        const nextTarget = frame({uid: raw.uid, head: action.data.beforeHead, identity: calendar ? historicalIdentity(action) : raw.identity,
          player: action.data.beforePlayer, chest: action.data.beforeChest, start: action.data.beforeStart});
        // Notification only, after all step checks. No callback return value can
        // authorize a step, replace its totals, or supply a verified flag.
        if (config.observeClosure) {
          const witnesses = [e.action, e.archive, e.end, e.start].map(document => ({
            ref: {uid: document.uid, kind: document.kind, id: document.id}, digest: c.digest(document),
            bytes: new TextEncoder().encode(c.canonical(document)).length}));
          if (config.observeClosure(c.freeze(witnesses)) !== undefined) c.fail('INVALID_JOURNAL_OBSERVER');
        }
        if (calendar) calendar.consume(consumed);
        totals = nextTotals; target = nextTarget;
      }
      check();
      if (!init && origin?.kind !== 'IMPORT') return terminal = publicResult(current, 'INCOMPLETE', 'UNPROVEN_ORIGIN');
      const d = target.documents, spent = activeCounts(target.snapshot);
      const initialPlayer = origin?.basePlayer ?? {documentVersion: 1, ...initial.ref(raw.uid, 'PLAYER'), revision: 1,
        data: {walletVersion: 1, cookies: 20, lockpicks: 30, points: 0}};
      const originHead = d.chest ? d.head?.revision === 1 && d.start.data.committedRevision === 1 : d.head === null;
      if (!originHead) return terminal = publicResult(current, 'INCOMPLETE', 'UNPROVEN_ORIGIN');
      if (calendar) {
        const consumed = await calendar.verifyLink({head: null, identity: null, player: initialPlayer, chest: null, start: null}, d, spent);
        check(); calendar.consume(consumed); calendar.requireComplete();
      } else if (!resourceLink(d.player, initialPlayer, spent)) return terminal = publicResult(current, 'INCOMPLETE', 'UNPROVEN_ORIGIN');
      const base = origin?.statistics ?? {openedChests: 0, cookiesConsumed: 0, lockpicksConsumed: 0};
      return terminal = publicResult(current, 'COMPLETE', null, {openedChests: add(totals.openedChests, base.openedChests),
        cookiesConsumed: add(totals.cookiesConsumed, base.cookiesConsumed), lockpicksConsumed: add(totals.lockpicksConsumed, base.lockpicksConsumed)});
    } catch (error) {
      check();
      if (['JOURNAL_ABORTED', 'STALE_JOURNAL', 'READ_ABORTED', 'STALE_READ', 'VIEW_CLOSED', 'READSET_CHANGED'].includes(error.code)) throw error;
      if (error.code === 'JOURNAL_RESOURCE_LIMIT' && chests.size > 1) return publicResult(current, 'INCOMPLETE', 'CONTINUATION_REQUIRED');
      if (['JOURNAL_RESOURCE_LIMIT', 'JOURNAL_DOCUMENT_LIMIT'].includes(error.code)) return terminal = publicResult(current, 'INCOMPLETE', 'RESOURCE_LIMIT');
      if (error.code === 'CALENDAR_HISTORY_LIMIT') return terminal = publicResult(current, 'INCOMPLETE', 'RESOURCE_LIMIT');
      if (error.code === 'JOURNAL_COUNT_OVERFLOW') return terminal = publicResult(current, 'INVALID', 'COUNT_OVERFLOW');
      return terminal = publicResult(current, 'INVALID', 'INVALID_HISTORY');
    } finally {busy = false;}
  }
  // Only one historical frame and totals survive an etappe. Strict HEAD/PLAYER
  // descent forbids cycles across etappes, without growing private-history sets.
  return Object.freeze({advance});
}
export async function evaluateJournalReadSet(value, options = {}) {
  const o = ownOptions(options, ['readClosure', 'maxClosures', 'subtle', 'signal', 'isCurrent', 'origin', 'calendar']);
  return createJournalEvaluation(value, {maxClosures: o.maxClosures, subtle: o.subtle, ...(o.origin === undefined ? {} : {origin:o.origin}), ...(o.calendar === undefined ? {} : {calendar:o.calendar})})
    .advance({readClosure: o.readClosure, signal: o.signal, isCurrent: o.isCurrent});
}
