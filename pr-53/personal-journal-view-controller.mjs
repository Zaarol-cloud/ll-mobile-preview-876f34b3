import {requireJournalSnapshot} from './personal-journal-contract.mjs';

// Public UI state only. The two readers and the alias adapter are independently
// owned dependencies; this coordinator never books resources or stores history.
export function createPersonalJournalViewController({reader, guard, alias, ready = Promise.resolve(), now = () => Date.now()} = {}) {
  if (typeof reader?.snapshot !== 'function' || typeof guard?.snapshot !== 'function' ||
      typeof alias?.readAlias !== 'function' || typeof alias?.saveAlias !== 'function' || typeof now !== 'function') throw new TypeError('INVALID_JOURNAL_VIEW_DEPENDENCIES');
  let owner = null, owns = () => false, generation = 0, closed = false, pending = null;
  let phase = 'loading', snapshot = null, name = alias.readAlias(), cache = null, stamp = null, anchors = null;
  let needsGuard = true, needsPage = true, nextGuard = 0, nextPage = 0, errors = 0, unboundPage = false;
  const metrics = {guards: 0, pages: 0, cacheHits: 0, staleResults: 0, aliasReads: 1};
  const current = (token, scene) => !closed && generation === token && owner === scene && owns();
  const output = () => Object.freeze({phase, snapshot, alias: name, busy: !!pending, canRecheck: !closed && !pending});
  function refreshAlias() {if (!closed) {name = alias.readAlias(); metrics.aliasReads++;} return name;}
  function invalidate() {snapshot = null; cache = null; stamp = null; anchors = null; unboundPage = false; needsGuard = true; needsPage = true; phase = 'loading';}
  function cancel() {generation++; pending?.control.abort(); pending = null;}
  function enter(scene, isCurrent) {
    if (closed) return output();
    if (!scene || typeof isCurrent !== 'function') throw new TypeError('INVALID_JOURNAL_OWNER');
    if (owner !== scene) {
      cancel(); owner = scene; owns = isCurrent; needsGuard = true; errors = 0; nextGuard = 0; snapshot = null; phase = 'loading';
      refreshAlias();
    }
    return output();
  }
  function leave(scene) {if (owner === scene) {cancel(); owner = null; owns = () => false; needsGuard = true; snapshot = null; phase = 'loading';}}
  function failed(operation, error, kind) {
    if (!current(operation.token, operation.scene) || operation.control.signal.aborted) return;
    snapshot = null; cache = null; stamp = null; anchors = null; needsPage = true; errors++;
    if (kind === 'guard' && error?.code === 'CREW_MATERIAL_BINDING_MISMATCH' && errors <= 2) {
      // The frozen journal reader independently validates PLAYER and can expose
      // INVALID_HISTORY with its genuine stored points even when active HMAC
      // verification prevents the ordinary instance guard from returning.
      unboundPage = true; needsGuard = false; phase = 'loading'; nextGuard = Infinity; nextPage = now() + 20; return;
    }
    phase = 'error'; needsGuard = errors <= 2; nextGuard = now() + Math.min(1500, errors * 500);
  }
  function launch(kind) {
    const operation = {token: generation, scene: owner, control: new AbortController()};
    pending = operation;
    const valid = () => current(operation.token, operation.scene);
    const options = {signal: operation.control.signal, isCurrent: valid};
    Promise.resolve(ready).then(() => {
      if (!valid() || operation.control.signal.aborted) return null;
      if (kind === 'guard') {metrics.guards++; return guard.snapshot(options);}
      metrics.pages++; return reader.snapshot(options);
    }).then(value => {
      if (!valid() || operation.control.signal.aborted) {metrics.staleResults++; return;}
      if (kind === 'guard') {
        if (!value) {snapshot = null; cache = null; phase = 'unavailable'; needsGuard = false; needsPage = false; nextGuard = now() + 2000; return;}
        const a = value.anchors;
        if (!a || typeof a.headDigest !== 'string' && a.headDigest !== null || typeof a.playerDigest !== 'string') throw new TypeError('INVALID_JOURNAL_GUARD');
        if(a.originDigest!==undefined&&(typeof a.originDigest!=='string'||!/^[a-f0-9]{64}$/.test(a.originDigest)))throw new TypeError('INVALID_JOURNAL_GUARD');
        if(a.originKind!==undefined&&!['INIT','IMPORT'].includes(a.originKind))throw new TypeError('INVALID_JOURNAL_GUARD');
        if(a.calendarDigest!==undefined&&(typeof a.calendarDigest!=='string'||!/^[a-f0-9]{64}$/.test(a.calendarDigest)))throw new TypeError('INVALID_JOURNAL_GUARD');
        const next = JSON.stringify([a.headRevision, a.headDigest, a.playerRevision, a.playerDigest, a.chestRevision, a.chestDigest, a.hintRevision, a.originDigest??null,a.originKind??null,a.calendarDigest??null]);
        if (next !== stamp) {cache = null; snapshot = null; stamp = next; needsPage = true; phase = 'loading';}
        else if (cache) {snapshot = cache; phase = cache.reason === 'CONTINUATION_REQUIRED' ? 'loading' : 'ready'; metrics.cacheHits++;}
        anchors = {headDigest: a.headDigest, playerDigest: a.playerDigest,originDigest:a.originDigest??null,originKind:a.originKind??null,calendarDigest:a.calendarDigest??null}; unboundPage = false;
        needsGuard = false; nextGuard = now() + 2000; nextPage = now() + 20;
      } else {
        const result = requireJournalSnapshot(value);
        if (!unboundPage && result.binding && (!anchors || result.binding.headDigest !== anchors.headDigest || result.binding.playerDigest !== anchors.playerDigest || (anchors.originKind==='INIT'?Object.hasOwn(result.binding,'originDigest'):(result.binding.originDigest??null)!==anchors.originDigest) || (result.binding.calendarDigest??null)!==anchors.calendarDigest)) {
          invalidate(); nextGuard = now() + 20; return;
        }
        snapshot = result; cache = result; errors = 0;
        needsPage = result.reason === 'CONTINUATION_REQUIRED'; nextPage = now() + 30;
        phase = needsPage ? 'loading' : 'ready';
        if (unboundPage && !needsPage) {unboundPage = false; errors = 3; needsGuard = false; nextGuard = Infinity;}
      }
    }).catch(error => failed(operation, error, kind)).finally(() => {if (pending === operation) pending = null;});
  }
  function tick(scene, isCurrent) {
    enter(scene, isCurrent);
    if (closed || !owner || !owns() || pending) return output();
    if (needsPage && !needsGuard && (anchors || unboundPage) && errors <= 2 && now() >= nextPage) launch('page');
    else if ((needsGuard || now() >= nextGuard) && (errors <= 2 || needsGuard) && now() >= nextGuard) launch('guard');
    return output();
  }
  function wake() {
    if (closed) return;
    cancel(); snapshot = null; phase = 'loading'; needsGuard = true; errors = 0; nextGuard = 0; refreshAlias();
  }
  function recheck() {if (closed) return; cancel(); invalidate(); errors = 0; nextGuard = 0; refreshAlias();}
  function saveAlias(scene, value) {
    if (closed || scene !== owner || !owns()) return Object.freeze({aliasSchemaVersion: 1, ok: false, displayName: null, reason: 'STORAGE_WRITE_FAILED'});
    const result = alias.saveAlias(value); refreshAlias(); return result;
  }
  return Object.freeze({tick, enter, leave, wake, recheck, refreshAlias, saveAlias, view: output,
    diagnostics: () => Object.freeze({...metrics}), async close() {
      if (closed) return; closed = true; cancel(); owner = null; snapshot = null; cache = null;
      await Promise.all([reader.close?.(), guard.close?.()]);
    }});
}
