// Origin-local display alias only. Names are not account identities. Across tabs
// the last save wins; readback is acknowledgement, never compare-and-swap.
export const ALIAS_SCHEMA_VERSION = 1;
export const ALIAS_STORAGE_KEY = 'lockloot.d203c2-b4-1.alias.v1';
export const MAX_ALIAS_INPUT_LENGTH = 256;
export const MAX_ALIAS_DOCUMENT_LENGTH = 256;

export function createPersonalJournalAlias(options) {
  if (!options || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) throw new TypeError('INVALID_ALIAS_OPTIONS');
  const config = {};
  for (const key of Reflect.ownKeys(options)) {
    const d = Object.getOwnPropertyDescriptor(options, key);
    if (!['normalizeName', 'getStorage'].includes(key) || !d.enumerable || !Object.hasOwn(d, 'value')) throw new TypeError('INVALID_ALIAS_OPTIONS');
    config[key] = d.value;
  }
  if (typeof config.normalizeName !== 'function' ||
      config.getStorage !== undefined && typeof config.getStorage !== 'function') throw new TypeError('INVALID_ALIAS_OPTIONS');
  // Inject the unchanged journal-controller normalizeName. A storage provider
  // defers even the potentially throwing global localStorage getter until use.
  const normalizeName = config.normalizeName;
  const getStorage = config.getStorage ?? (() => globalThis.localStorage);
  const view = (status, displayName, reason) => Object.freeze({aliasSchemaVersion: ALIAS_SCHEMA_VERSION, status, displayName, reason});
  const saved = (ok, reason, displayName = null) => Object.freeze({aliasSchemaVersion: ALIAS_SCHEMA_VERSION, ok, displayName, reason});
  function normalized(value) {
    if (typeof value !== 'string' || value.length > MAX_ALIAS_INPUT_LENGTH) throw new TypeError('INVALID_NAME');
    const name = normalizeName(value);
    if (typeof name !== 'string' || name.length > MAX_ALIAS_INPUT_LENGTH) throw new TypeError('INVALID_NAME');
    return name;
  }
  function decode(raw) {
    if (raw === null) return view('MISSING', null, 'NOT_SET');
    if (typeof raw !== 'string' || raw.length > MAX_ALIAS_DOCUMENT_LENGTH) return view('INVALID', null, 'INVALID_DOCUMENT');
    try {
      const d = JSON.parse(raw);
      if (!d || Array.isArray(d) || typeof d !== 'object' || Object.keys(d).length !== 2 ||
          !Object.hasOwn(d, 'aliasSchemaVersion') || !Object.hasOwn(d, 'displayName') ||
          d.aliasSchemaVersion !== ALIAS_SCHEMA_VERSION || normalized(d.displayName) !== d.displayName) return view('INVALID', null, 'INVALID_DOCUMENT');
      return view('SET', d.displayName, null);
    } catch {return view('INVALID', null, 'INVALID_DOCUMENT');}
  }
  function readAlias() {
    try {
      const storage = getStorage();
      const get = storage?.getItem;
      if (typeof get !== 'function') return view('UNAVAILABLE', null, 'STORAGE_READ_FAILED');
      return decode(get.call(storage, ALIAS_STORAGE_KEY));
    } catch {return view('UNAVAILABLE', null, 'STORAGE_READ_FAILED');}
  }
  function saveAlias(value) {
    let name, raw;
    try {
      name = normalized(value);
      raw = JSON.stringify({aliasSchemaVersion: ALIAS_SCHEMA_VERSION, displayName: name});
      if (raw.length > MAX_ALIAS_DOCUMENT_LENGTH) return saved(false, 'INVALID_NAME');
    } catch {return saved(false, 'INVALID_NAME');}
    let storage;
    try {
      storage = getStorage();
      const set = storage?.setItem;
      if (typeof set !== 'function') return saved(false, 'STORAGE_WRITE_FAILED');
      set.call(storage, ALIAS_STORAGE_KEY, raw);
    } catch {return saved(false, 'STORAGE_WRITE_FAILED');}
    try {
      const get = storage?.getItem;
      if (typeof get !== 'function') return saved(false, 'STORAGE_READ_FAILED');
      if (get.call(storage, ALIAS_STORAGE_KEY) !== raw) return saved(false, 'WRITE_NOT_CONFIRMED');
    } catch {return saved(false, 'STORAGE_READ_FAILED');}
    return saved(true, null, name);
  }
  return Object.freeze({readAlias, saveAlias});
}
