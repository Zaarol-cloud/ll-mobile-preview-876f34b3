import {createPersonalCalendarContract, MAX_CLAIMS, MAX_DOCUMENT_BYTES, MAX_EVIDENCE_BYTES} from './personal-calendar-contract.mjs';
import {records} from './personal-chest-instance-read-factories.mjs';
import {instanceStartRecords} from './personal-chest-crew-lifecycle-factories.mjs';
import {createCrewInvitationBrowser} from './personal-chest-crew-invitation-browser.mjs';
import {applyHintPurchaseDocuments} from './personal-player-action-contract.mjs';
import {ownOptions, freeze, TARGET} from './d205-activation-contract.mjs';
import {copy, exact, canonical, digest, sha256, revision, fail} from './personal-chest-storage-contract.mjs';

// Only a win-free interval. Neither endpoint's earlier history, all-claims-used,
// native reads/absence witnesses nor a DB commit are established here.
export const RESOURCE_INTERVAL_VERSION = 1;
export const MAX_INTERVAL_CLAIMS = MAX_CLAIMS;
export const MAX_INTERVAL_BYTES = MAX_EVIDENCE_BYTES + 3 * MAX_DOCUMENT_BYTES;
const fields = ['base', 'sourceRaw', 'earlier', 'later', 'assets', 'claims'];
const eq = (a, b, code) => {if (canonical(a) !== canonical(b)) fail(code);};
const add = (a, b) => {revision(a); revision(b); if (a > Number.MAX_SAFE_INTEGER - b) fail('INTERVAL_OVERFLOW'); return a + b;};
const diff = (later, earlier) => {revision(later); revision(earlier); if (later < earlier) fail('INTERVAL_COUNTER_REGRESSION'); return later - earlier;};
const own = (value, keys) => {const out = ownOptions(value, keys); if (Object.keys(out).length !== keys.length) fail('INVALID_FIELDS'); return out;};
function bounded(value) {
  const v = copy(value);
  if (new TextEncoder().encode(canonical(v)).length > MAX_DOCUMENT_BYTES) fail('INTERVAL_DOCUMENT_LIMIT');
  return v;
}
function claimList(value) {
  if (!Array.isArray(value) || value.length > MAX_INTERVAL_CLAIMS) fail('INTERVAL_CLAIM_LIMIT');
  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1) fail('INVALID_FIELDS');
  const claims = [];
  for (let i = 0; i < value.length; i++) {
    const d = Object.getOwnPropertyDescriptor(value, String(i));
    if (!d || !d.enumerable || !Object.hasOwn(d, 'value')) fail('INVALID_FIELDS');
    claims.push(bounded(d.value));
  }
  return claims;
}
const count = s => ({cookies: s.chest?.hintState.purchasedPackageCount ?? 0, lockpicks: s.personal.activeAttempts?.bookedAttemptCount ?? 0});
const contextOf = s => ({head: s.head, identity: s.identity, chest: s.chest, start: s.start});
const publicBinding = f => ({playerRevision: f.player.revision, playerDigest: digest(f.player), contextDigest: digest(contextOf(f))});

export function createResourceIntervalContract(value) {
  const cfg = ownOptions(value, ['sourceOrigin', 'fixtureRaw', 'subtle']);
  const calendar = createPersonalCalendarContract({sourceOrigin: cfg.sourceOrigin, fixtureRaw: cfg.fixtureRaw});
  const crew = createCrewInvitationBrowser({subtle: cfg.subtle ?? globalThis.crypto?.subtle});
  function frame(value, base) {
    const v = exact(bounded(value), ['player', 'context']), context = exact(v.context, ['head', 'identity', 'chest', 'start']);
    const docs = {uid: TARGET.uid, player: v.player, ...context}, snapshot = records.requireActiveReadSet(docs);
    if (!snapshot || v.player.revision < base.basePlayer.revision || v.player.documentVersion < base.basePlayer.documentVersion) fail('INTERVAL_BEFORE_BASE');
    if (v.player.revision === base.basePlayer.revision) eq(v.player, base.basePlayer, 'INTERVAL_BASE_CONFLICT');
    return {...docs, snapshot};
  }
  function identityLink(a, b) {
    if (a.identity) eq(b.identity, a.identity, 'INTERVAL_IDENTITY_CHANGED');
    else if (b.identity && a.snapshot.activeChestId !== null) fail('INTERVAL_IDENTITY_DURING_ACTIVE_CHEST');
  }
  function debitLink(a, b) {
    identityLink(a, b);
    if (b.player.documentVersion < a.player.documentVersion) fail('INTERVAL_PLAYER_VERSION_REGRESSION');
    const ma = a.snapshot.personal, mb = b.snapshot.personal;
    if (ma.lastClosedChestId !== mb.lastClosedChestId || ma.lastClosedActionId !== mb.lastClosedActionId) fail('INTERVAL_CLOSURE_CHANGED');
    const activeA = a.snapshot.activeChestId, activeB = b.snapshot.activeChestId;
    let initialChest = a.chest;
    if (canonical(a.head) === canonical(b.head)) {
      if (activeA !== activeB) fail('INTERVAL_ACTIVE_CHEST_CHANGED');
      eq(a.start, b.start, 'INTERVAL_START_CHANGED');
    } else {
      if (activeA !== null || activeB === null || b.head.revision !== add(a.head?.revision ?? 0, 1) || b.start.data.committedRevision !== b.head.revision) fail('INTERVAL_START_CHRONOLOGY');
      const required = instanceStartRecords.makeHeadDocument({reference: {uid: TARGET.uid, kind: 'HEAD', id: 'current'}, revision: b.head.revision,
        state: {activeChestId: activeB, ...instanceStartRecords.projectIdentity({uid: TARGET.uid, head: b.head, identity: b.identity})}, previousHead: a.head});
      eq(b.head, required, 'INTERVAL_START_HEAD_CHANGED');
      // A new START has one CHEST revision and an unpaid assignment. Its complete
      // material/selection/hint set and START are validated by the existing reader.
      initialChest = copy(b.chest); initialChest.revision = 1;
      initialChest.data.record.assignment.revision = 0;
      initialChest.data.record.assignment.purchasedPackageCount = 0;
      records.requireActiveReadSet({uid: TARGET.uid, head: b.head, identity: b.identity, player: a.player, chest: initialChest, start: b.start});
    }
    const beforeCounts = activeA === activeB ? count(a.snapshot) : {cookies: 0, lockpicks: 0}, afterCounts = count(b.snapshot);
    const spent = {cookies: diff(afterCounts.cookies, beforeCounts.cookies), lockpicks: diff(afterCounts.lockpicks, beforeCounts.lockpicks)};
    const mutations = add(spent.cookies, spent.lockpicks), expectedRevision = add(a.player.revision, mutations);
    if (a.player.data.cookies < spent.cookies || a.player.data.lockpicks < spent.lockpicks) fail('INTERVAL_RESOURCE_UNDERFLOW');
    if (b.player.data.cookies !== a.player.data.cookies - spent.cookies || b.player.data.lockpicks !== a.player.data.lockpicks - spent.lockpicks ||
        b.player.data.points !== a.player.data.points || b.player.revision !== expectedRevision) fail('INTERVAL_RESOURCE_LINK');
    if (mutations === 0) eq(a.player, b.player, 'INTERVAL_UNBOOKED_PLAYER_CHANGE');
    const priorAttempts = activeA === activeB ? ma.activeAttempts : activeB === null ? null : {chestId: activeB, codeLength: b.snapshot.chest.selection.codeLength, bookedAttemptCount: 0, lastFeedback: null};
    if (spent.lockpicks === 0) eq(priorAttempts, mb.activeAttempts, 'INTERVAL_UNBOOKED_ATTEMPT_CHANGE');
    if (activeB !== null) {
      let materialized = {chest: initialChest, player: a.player};
      // Package count is bounded by the existing assignment validator. Reusing
      // its purchase primitive preserves every immutable CHEST field exactly.
      for (let i = 0; i < spent.cookies; i++) materialized = applyHintPurchaseDocuments(materialized);
      eq(materialized.chest, b.chest, 'INTERVAL_CHEST_CHANGED');
    }
    return spent;
  }
  async function verifyInterval(value) {
    const v = own(value, fields), base = calendar.requireBase(v.base);
    calendar.requireSource(base, v.sourceRaw);
    const history = calendar.verifyEvidence({base, assets: bounded(v.assets), claims: claimList(v.claims)});
    const earlier = frame(v.earlier, base), later = frame(v.later, base);
    if (later.player.revision < earlier.player.revision) fail('INTERVAL_REVERSED');
    let bytes = 0;
    for (const document of [v.earlier, v.later, history.assets, ...history.claims]) {
      bytes = add(bytes, new TextEncoder().encode(canonical(document)).length);
      if (bytes > MAX_INTERVAL_BYTES) fail('INTERVAL_EVIDENCE_LIMIT');
    }
    const selected = history.claims.filter(c => c.data.beforePlayer.revision >= earlier.player.revision && c.data.beforePlayer.revision < later.player.revision);
    const points = [earlier];
    for (const claim of selected) {
      const before = frame({player: claim.data.beforePlayer, context: claim.data.beforeContext}, base);
      // Materialize the endpoint already recomputed by verifyEvidence. Reward
      // eligibility, exact fixture values and claim digests stay in that contract.
      const p = copy(before.player); p.revision = add(p.revision, 1);
      p.data.cookies = add(p.data.cookies, claim.data.reward.cookies);
      p.data.lockpicks = add(p.data.lockpicks, claim.data.reward.lockpicks);
      if (digest(p) !== claim.data.afterPlayerDigest) fail('INTERVAL_CALENDAR_ENDPOINT_CHANGED');
      points.push(before, frame({player: p, context: claim.data.beforeContext}, base));
    }
    points.push(later);
    // Validate all private material using the existing CREW derivation. Local
    // copies were taken before this await; no caller-supplied verifier is used.
    const checked = new Set();
    for (const point of points) if (point.snapshot.chest?.selection.modeId === 'CREW') {
      const id = digest({identity: point.identity, chest: point.chest});
      if (checked.has(id)) continue;
      const material = await crew.derivePrivateMaterial({invitationCode: point.chest.data.record.instanceBinding.invitationCode, browserSaltHex: point.identity.data.browserSaltHex});
      eq(material, {chestId: point.chest.id, ...point.chest.data.record.material}, 'CREW_MATERIAL_BINDING_MISMATCH'); checked.add(id);
    }
    let cookies = 0, lockpicks = 0;
    for (let i = 0; i < points.length - 1; i += 2) {
      const spent = debitLink(points[i], points[i + 1]);
      cookies = add(cookies, spent.cookies); lockpicks = add(lockpicks, spent.lockpicks);
    }
    return freeze({resourceIntervalVersion: RESOURCE_INTERVAL_VERSION, scope: 'WIN_FREE_INTERVAL_ONLY', status: 'MATCH',
      resourceHistoryVerified: false, endpointHistoryVerified: false, allClaimsUsedVerified: false, committed: false,
      binding: {uid: TARGET.uid, calendarId: base.calendarId, originDigest: base.originDigest, configDigest: base.configDigest,
        sourceOrigin: base.sourceOrigin, sourceRawDigest: v.sourceRaw === null ? null : sha256(v.sourceRaw),
        calendarEvidenceDigest: digest({assets: history.assets, claims: history.claims.map(c => ({id: c.id, digest: digest(c)}))}),
        earlier: publicBinding(earlier), later: publicBinding(later)},
      consumption: {cookies, lockpicks}, consumedClaims: selected.map(c => ({id: c.id, digest: digest(c), beforePlayerRevision: c.data.beforePlayer.revision})),
      unconsumedClaimIds: history.claims.filter(c => !selected.includes(c)).map(c => c.id),
      requiredExternalChecks: ['VERIFIED_ORIGIN_AND_CLOSURE_ANCHORS', 'BOTH_JOURNAL_RESOURCE_LINKS', 'ALL_CLAIMS_USED_EXACTLY_ONCE', 'NATIVE_COMMON_READSET_RECHECK']});
  }
  return Object.freeze({verifyBase: value => calendar.verifyBase(value), verifyInterval,
    // Still calendar-chain evidence only. Journal callers must independently
    // prove origin, every resource interval and exactly-once claim coverage.
    verifyEvidence(value) {
      const v = own(value, ['base', 'assets', 'claims']);
      return calendar.verifyEvidence({base: v.base, assets: bounded(v.assets), claims: claimList(v.claims)});
    }});
}
