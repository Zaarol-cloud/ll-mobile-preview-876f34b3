import {createResourceIntervalContract} from './personal-resource-interval-contract.mjs';
import {createJournalOrigin, requireJournalOrigin} from './d205-journal-origin.mjs';
import {ownOptions} from './d205-activation-contract.mjs';
import {copy, exact, canonical, digest, fail} from './personal-chest-storage-contract.mjs';

// Pure evidence composition. No native reads, calendar claim, or commit.
// The existing origin verifier and interval verifier retain their own authority.
export function prepareJournalCalendar(value, {origin, current, subtle}) {
  requireJournalOrigin(origin);
  const fields = ['sourceOrigin', 'fixtureRaw', 'frame', 'sourceRaw', 'assets', 'claims'];
  const cfg = ownOptions(value, fields);
  if (Object.keys(cfg).length !== fields.length) fail('INVALID_JOURNAL_CALENDAR');
  const frame = exact(cfg.frame, ['manifest', 'source', 'player', 'origin', 'assets', 'learning', 'init']);
  const sourceRaw = copy(cfg.sourceRaw);
  const interval = createResourceIntervalContract({sourceOrigin: cfg.sourceOrigin, fixtureRaw: cfg.fixtureRaw, subtle});
  const base = interval.verifyBase({frame, sourceRaw});
  if (base.uid !== current.uid || canonical(frame.player) !== canonical(current.player) ||
      canonical(base.basePlayer) !== canonical(origin.basePlayer)) fail('JOURNAL_CALENDAR_ORIGIN_MISMATCH');
  const history = interval.verifyEvidence({base, assets: cfg.assets, claims: cfg.claims});
  const originPort = createJournalOrigin({sourceOrigin: cfg.sourceOrigin, fixtureRaw: cfg.fixtureRaw,
    sourcePort: {read: () => sourceRaw}, subtle});
  const claims = new Map(history.claims.map(claim => [claim.id, digest(claim)])), used = new Set();
  const evidenceDigest = digest({calendarId: base.calendarId, originDigest: base.originDigest,
    configDigest: base.configDigest, assets: history.assets,
    claims: [...claims].map(([id, hash]) => ({id, digest: hash}))});
  let originVerified = false;
  const endpoint = f => ({player: f.player, context: {head: f.head, identity: f.identity, chest: f.chest, start: f.start}});
  async function verifyOrigin(options) {
    if (originVerified) return;
    const actual = await originPort.verify(frame, sourceRaw, options);
    if (actual.provenanceDigest !== origin.provenanceDigest) fail('JOURNAL_CALENDAR_ORIGIN_MISMATCH');
    originVerified = true;
  }
  async function verifyLink(earlier, later, spent) {
    if (!originVerified) fail('JOURNAL_CALENDAR_ORIGIN_REQUIRED');
    const result = await interval.verifyInterval({base, sourceRaw, assets: history.assets, claims: history.claims,
      earlier: endpoint(earlier), later: endpoint(later)});
    if (canonical(result.consumption) !== canonical(spent)) fail('JOURNAL_CALENDAR_CONSUMPTION_MISMATCH');
    return result.consumedClaims;
  }
  function consume(entries) {
    // Validate the entire addition before changing the continuation's ledger.
    const next = new Set();
    for (const entry of entries) {
      if (claims.get(entry.id) !== entry.digest || used.has(entry.id) || next.has(entry.id)) fail('JOURNAL_CALENDAR_CLAIM_REUSED');
      next.add(entry.id);
    }
    for (const id of next) used.add(id);
  }
  function requireComplete() {
    if (!originVerified || used.size !== claims.size) fail('JOURNAL_CALENDAR_UNUSED_CLAIMS');
  }
  return Object.freeze({evidenceDigest, verifyOrigin, verifyLink, consume, requireComplete});
}
