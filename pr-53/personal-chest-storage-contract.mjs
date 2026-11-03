// Browser-native persistence contract only; not a hint-truth/security validator.
export const fail = code => {throw Object.assign(new TypeError(code), {code});};
export function copy(value, depth = 0, ancestors = new Set(), budget = {left: 20000}) {
  if (--budget.left < 0 || depth > 32) fail("DATA_LIMIT");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || ancestors.has(value)) fail("INVALID_DATA");
  const array = Array.isArray(value);
  if (!array && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail("INVALID_DATA");
  ancestors.add(value); const out = array ? [] : {}, keys = Reflect.ownKeys(value);
  if (array && (!Number.isSafeInteger(value.length) || value.length > 10000 ||
      keys.length !== value.length + 1)) fail("INVALID_DATA");
  for (const key of keys) {
    if (array && key === "length") continue;
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== "string" || ["__proto__", "constructor", "prototype"].includes(key) ||
        !d.enumerable || !Object.hasOwn(d, "value") || array &&
        (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) fail("INVALID_DATA");
    out[key] = copy(d.value, depth + 1, ancestors, budget);
  }
  ancestors.delete(value); return out;
}
export function exact(value, fields) {
  const out = copy(value);
  if (!out || Array.isArray(out) || typeof out !== "object" ||
      Object.keys(out).length !== fields.length ||
      Object.keys(out).some(k => !fields.includes(k))) fail("INVALID_FIELDS");
  return out;
}
export function canonical(value) {
  const sort = v => Array.isArray(v) ? v.map(sort) : v && typeof v === "object" ?
    Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v;
  return JSON.stringify(sort(copy(value)));
}
const K = new Uint32Array([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
const rotate = (x, n) => (x >>> n) | (x << (32 - n));
// Synchronous SHA-256 prevents IndexedDB auto-commit while verifying rows.
// Digests detect stale/tampered local data; they are not signatures.
export function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const data = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
  data.set(bytes); data[bytes.length] = 0x80;
  const view = new DataView(data.buffer), bits = bytes.length * 8;
  view.setUint32(data.length - 8, Math.floor(bits / 0x100000000));
  view.setUint32(data.length - 4, bits >>> 0);
  const h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
    0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const w = new Uint32Array(64);
  for (let offset = 0; offset < data.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      w[i] = ((rotate(a,7) ^ rotate(a,18) ^ (a >>> 3)) + w[i - 16] +
        (rotate(b,17) ^ rotate(b,19) ^ (b >>> 10)) + w[i - 7]) >>> 0;
    }
    let [a,b,c,d,e,f,g,z] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (z + (rotate(e,6) ^ rotate(e,11) ^ rotate(e,25)) +
        ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotate(a,2) ^ rotate(a,13) ^ rotate(a,22)) +
        ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      z=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    [a,b,c,d,e,f,g,z].forEach((v,i) => {h[i]=(h[i]+v)>>>0;});
  }
  return [...h].map(n => n.toString(16).padStart(8,"0")).join("");
}
export const digest = value => sha256(canonical(value));
export function uid(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) fail("INVALID_UID");
  return value;
}
export function id(value, chest = false) {
  if (typeof value !== "string" || !(chest ?
    /^personal_[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/ :
    /^[A-Za-z0-9_-]{1,64}$/).test(value) ||
    ["__proto__","constructor","prototype"].includes(value)) fail("INVALID_ID");
  return value;
}
export function ref(value, owner) {
  const r = exact(value, ["uid","kind","id"]); uid(r.uid);
  if (owner !== undefined && r.uid !== owner) fail("UID_MISMATCH");
  if (r.kind === "HEAD") {if(r.id !== "current") fail("INVALID_ID");}
  else if (r.kind === "REQUEST") id(r.id);
  else if (["CHEST","ARCHIVE"].includes(r.kind)) id(r.id,true);
  else fail("INVALID_KIND");
  return r;
}
export const key = value => canonical(ref(value));
export function revision(value, min = 0) {
  if (!Number.isSafeInteger(value) || value < min) fail("INVALID_REVISION");
  return value;
}
export function document(value, reference) {
  const d = exact(value, ["documentVersion","uid","kind","id","revision","data"]);
  if (d.documentVersion !== 2 || ["uid","kind","id"].some(k => d[k] !== reference[k])) fail("DOCUMENT_BINDING_MISMATCH");
  revision(d.revision, d.kind === "HEAD" ? 0 : 1);
  if (["ARCHIVE","REQUEST"].includes(d.kind) && d.revision !== 1) fail("IMMUTABLE_REVISION");
  if (d.kind === "HEAD") {
    exact(d.data, ["activeChestId"]);
    if (d.data.activeChestId !== null) id(d.data.activeChestId,true);
  } else if (d.kind === "REQUEST") {
    exact(d.data, ["kind","fingerprint","chestId","committedRevision"]);
    // B1 uses canonical request text, not a SHA digest, as fingerprint.
    if (!["START","END"].includes(d.data.kind) || typeof d.data.fingerprint !== "string") fail("INVALID_OPERATION");
    id(d.data.chestId,true); revision(d.data.committedRevision,1);
  } else {
    exact(d.data, ["record","start","end"]);
    if (d.data.record?.chestId !== d.id || !["ACTIVE","CLOSED"].includes(d.data.record?.status)) fail("INVALID_CHEST");
    for (const anchor of [d.data.start, ...(d.data.end ? [d.data.end] : [])]) {
      exact(anchor, ["requestId","operation"]); id(anchor.requestId);
    }
    if ((d.data.record.status === "ACTIVE") !== (d.data.end === null)) fail("INVALID_END_ANCHOR");
    if (d.kind === "ARCHIVE" && d.data.record.status !== "CLOSED") fail("INVALID_ARCHIVE");
  }
  return d;
}
export function candidate(value, contract = null) {
  const extended = contract?.workingSetVersion === 4 && contract.deltaVersion === 3;
  const requireRef = contract?.ref || ref, requireDocument = contract?.document || document;
  const keyOf = value => canonical(requireRef(value));
  const p = exact(value, ["workingSetVersion","deltaVersion","uid","readSet","writes",
    "deltaDigest","confirmationRequired","resultingHeadRevision","preparedResponse"]);
  uid(p.uid); revision(p.resultingHeadRevision);
  if (p.workingSetVersion !== (contract?.workingSetVersion ?? (contract ? 3 : 2)) || p.deltaVersion !== (contract?.deltaVersion ?? (contract ? 2 : 1)) || p.confirmationRequired !== true ||
      p.preparedResponse?.committed !== false || p.preparedResponse?.uid !== p.uid ||
      p.preparedResponse?.revision !== p.resultingHeadRevision ||
      !Array.isArray(p.readSet) || p.readSet.length < 1 || p.readSet.length > (extended ? 10 : 7) ||
      !Array.isArray(p.writes) || !(extended ? [0,3] : [0,3,4]).includes(p.writes.length)) fail("INVALID_CANDIDATE");
  const reads = new Map();
  for (const r of p.readSet) {
    exact(r, ["ref","expected"]); requireRef(r.ref,p.uid); const k = keyOf(r.ref);
    if (reads.has(k)) fail("DUPLICATE_READ"); reads.set(k,r.expected);
    if (r.expected.exists === false) exact(r.expected, ["exists"]);
    else {
      exact(r.expected, ["exists","documentVersion","revision","sha256"]);
      if (r.expected.exists !== true || !(contract ? contract.documentVersions : [2]).includes(r.expected.documentVersion) ||
          !/^[a-f0-9]{64}$/.test(r.expected.sha256)) fail("INVALID_EXPECTATION");
      revision(r.expected.revision);
    }
  }
  if (!reads.has(keyOf({uid:p.uid,kind:"HEAD",id:"current"}))) fail("MISSING_HEAD_READ");
  const written = new Set();
  for (const w of p.writes) {
    exact(w, ["operation","ref","document"]); requireRef(w.ref,p.uid);
    const k = keyOf(w.ref), expected = reads.get(k); requireDocument(w.document,w.ref);
    if (!expected || written.has(k)) fail("INVALID_WRITE_SET"); written.add(k);
    if (w.operation === "INSERT") {
      if (expected.exists || w.document.revision !== 1) fail("INVALID_INSERT");
    } else if (w.operation === "REPLACE") {
      if (!expected.exists || !["HEAD","CHEST"].includes(w.ref.kind) ||
          w.document.revision !== expected.revision + 1) fail("INVALID_REPLACE");
    } else fail("INVALID_WRITE");
  }
  const kinds = p.writes.map(w => w.ref.kind).sort().join(",");
  if (p.writes.length && !(contract ? ["CHEST,HEAD,REQUEST"] : ["CHEST,HEAD,REQUEST","ARCHIVE,CHEST,HEAD,REQUEST"]).includes(kinds)) fail("INVALID_TRANSITION_WRITES");
  if (digest({deltaVersion:p.deltaVersion,uid:p.uid,readSet:p.readSet,writes:p.writes}) !== p.deltaDigest) fail("INVALID_DELTA_DIGEST");
  return p;
}
export function createStorageContract(contract) {
  if(!((contract?.workingSetVersion===3&&contract.deltaVersion===2)||(contract?.workingSetVersion===4&&contract.deltaVersion===3)))fail('INVALID_INSTANCE_CONTRACT');
  return Object.freeze({fail,copy,exact,canonical,digest,sha256,ref:contract.ref,
    key:value=>canonical(contract.ref(value)),document:contract.document,
    candidate:value=>candidate(value,contract),validateObservedCandidate:contract.validateObservedCandidate,
    identity:contract.identity,...(contract.workingSetVersion===4?{instanceStartBoundaryVersion:1,validateIdentityGuard:contract.validateIdentityGuard}:{} )});
}

