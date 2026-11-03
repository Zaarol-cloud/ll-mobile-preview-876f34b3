import * as legacyContract from "./personal-chest-storage-contract.mjs";
const STORE = "documents", DB_VERSION = 1;
export function createIndexedDbAdapter({databaseName, indexedDB = globalThis.indexedDB, documentContract = legacyContract, requireExistingDatabase = false} = {}) {
  const c = documentContract;
  if (typeof databaseName !== "string" || !/^lockloot-d203c2-[A-Za-z0-9_-]{1,100}$/.test(databaseName) ||
      !indexedDB?.open || typeof requireExistingDatabase !== 'boolean' || requireExistingDatabase && typeof indexedDB.databases !== 'function') c.fail("INVALID_DATABASE_CONFIGURATION");
  let opened, closed = false, versionChanged = false;
  const metrics = {readRequests:0,writeRequests:0,completedTransactions:0,abortedTransactions:0};
  let maxReads = 0, maxWrites = 0;
  const error = code => Object.assign(new Error(code),{code});
  function open() {
    if (closed || versionChanged) return Promise.reject(error(versionChanged ? "DB_VERSION_CHANGED" : "DB_CLOSED"));
    if (opened) return opened;
    const openRequest = () => new Promise((resolve,reject) => {
      const request = indexedDB.open(databaseName,DB_VERSION);
      let settled = false;
      const fail = e => {if(!settled){settled=true;reject(e);}};
      request.onblocked = () => fail(error("DB_BLOCKED"));
      request.onerror = () => fail(request.error || error("DB_OPEN_FAILED"));
      request.onupgradeneeded = event => {
        if(requireExistingDatabase){request.transaction.abort();return;}
        if (event.oldVersion !== 0) {request.transaction.abort(); return;}
        request.result.createObjectStore(STORE,{keyPath:"key"});
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled || closed || versionChanged) {db.close();fail(error("DB_CLOSED"));return;}
        if (db.objectStoreNames.length !== 1 || !db.objectStoreNames.contains(STORE)) {
          db.close();fail(error("DB_SCHEMA_MISMATCH"));return;
        }
        const metadata = db.transaction(STORE,"readonly").objectStore(STORE);
        if (metadata.keyPath !== "key" || metadata.autoIncrement || metadata.indexNames.length !== 0) {
          db.close();fail(error("DB_SCHEMA_MISMATCH"));return;
        }
        db.onversionchange = () => {versionChanged=true;db.close();};
        settled=true;resolve(db);
      };
    });
    opened = requireExistingDatabase ? indexedDB.databases().then(list=>{if(!list.some(row=>row.name===databaseName))c.fail('DATABASE_NOT_FOUND');return openRequest();}) : openRequest();
    return opened;
  }
  async function readDocument(reference) {
    const r = c.ref(reference), k = c.key(r), db = await open();
    return new Promise((resolve,reject) => {
      let tx, result, failure;
      try {
        tx = db.transaction(STORE,"readonly");
        const request = tx.objectStore(STORE).get(k); metrics.readRequests++;
        request.onsuccess = () => {
          try {result = request.result === undefined ? {lookupVersion:1,status:"ABSENT"} :
            {lookupVersion:1,status:"PRESENT",document:c.document(request.result.document,r)};}
          catch(e){failure=e;tx.abort();}
        };
        tx.oncomplete = () => {metrics.completedTransactions++;resolve(result);};
        tx.onabort = () => {metrics.abortedTransactions++;reject(failure || tx.error || error("READ_ABORTED"));};
        tx.onerror = () => {};
      } catch(e) {reject(e);}
    });
  }
  async function runDelta(value,{signal,isCurrent} = {},readOnly = false) {
    // Isolated synchronously before opening/waiting. No promises/crypto awaits
    // occur inside the readwrite transaction.
    const p = c.candidate(value);
    if(readOnly&&p.writes.length)c.fail('READONLY_DELTA_REQUIRED');
    const db = await open();
    if (signal?.aborted || isCurrent && !isCurrent()) throw error("COMMIT_ABORTED");
    maxReads=Math.max(maxReads,p.readSet.length);maxWrites=Math.max(maxWrites,p.writes.length);
    return new Promise((resolve,reject) => {
      let tx, failure, finished = false;
      const abort = e => {
        failure ||= e;
        try {tx.abort();} catch {}
      };
      const onSignal = () => abort(error("COMMIT_ABORTED"));
      const cleanup = () => signal?.removeEventListener("abort",onSignal);
      try {
        tx = db.transaction(STORE,readOnly?"readonly":"readwrite");
        const store = tx.objectStore(STORE), observed = new Map();
        let remaining = p.readSet.length;
        tx.onabort = () => {finished=true;cleanup();metrics.abortedTransactions++;
          reject(failure || tx.error || error("COMMIT_ABORTED"));};
        tx.onerror = () => {};
        tx.oncomplete = () => {finished=true;cleanup();metrics.completedTransactions++;
          resolve({receiptVersion:1,status:"COMMITTED",uid:p.uid,
            deltaDigest:p.deltaDigest,headRevision:p.resultingHeadRevision});};
        signal?.addEventListener("abort",onSignal,{once:true});
        if (signal?.aborted) {onSignal();return;}
        for (const read of p.readSet) {
          const k = c.key(read.ref), request = store.get(k); metrics.readRequests++;
          request.onsuccess = () => {
            if (failure || finished) return;
            try {
              const row = request.result, d = row === undefined ? null : c.document(row.document,read.ref);
              if (row && row.key !== k) c.fail("STORED_KEY_MISMATCH");
              if (read.expected.exists ? !d || d.revision !== read.expected.revision ||
                  d.documentVersion !== read.expected.documentVersion ||
                  c.digest(d) !== read.expected.sha256 : d !== null) c.fail("CAS_CONFLICT");
              observed.set(k,d);
              if (--remaining !== 0) return;
              if(isCurrent&&!isCurrent())c.fail('STALE_GENERATION');
              c.validateObservedCandidate?.(p,observed);
              const headKey = c.key({uid:p.uid,kind:"HEAD",id:"current"});
              const headWrite = p.writes.find(w => w.ref.kind === "HEAD");
              const head = headWrite?.document || observed.get(headKey);
              if ((head?.revision ?? 0) !== p.resultingHeadRevision ||
                  (head?.data.activeChestId ?? null) !== p.preparedResponse.activeChestId) c.fail("INVALID_HEAD_RESULT");
              // Queue all writes synchronously from an active IndexedDB event.
              for (const write of p.writes) {
                const row = {key:c.key(write.ref),document:write.document};
                if (write.operation === "INSERT") store.add(row); else store.put(row);
                metrics.writeRequests++;
              }
            } catch(e) {abort(e);}
          };
        }
      } catch(e) {
        if (tx && !finished) abort(e); else {cleanup();reject(e);}
      }
    });
  }
  async function ensureCrewLocalIdentity(uid,{candidateSaltHex,signal,isCurrent,guardReadSet}={}) {
    if(!c.identity)c.fail('CREW_IDENTITY_NOT_SUPPORTED');
    const proposed=c.identity.create(uid,candidateSaltHex),ir=c.ref({uid,kind:'LOCAL_IDENTITY',id:'current'}),hr=c.ref({uid,kind:'HEAD',id:'current'}),db=await open();
    const guarded=c.instanceStartBoundaryVersion===1;
    if(guardReadSet!==undefined&&!guarded)c.fail('IDENTITY_GUARD_NOT_SUPPORTED');
    const guards=guarded?c.copy(guardReadSet):null;
    if(guarded&&(!Array.isArray(guards)||![3,7].includes(guards.length)))c.fail('IDENTITY_GUARD_REQUIRED');
    if(guarded)c.validateIdentityGuard(guards);
    const references=guarded?guards.map(g=>c.ref(g.ref,uid)):[hr,ir];
    if(guarded&&(new Set(references.map(c.key)).size!==references.length||![hr,ir,c.ref({uid,kind:'PLAYER',id:'current'})].every(r=>references.some(v=>c.key(v)===c.key(r)))))c.fail('INVALID_IDENTITY_GUARD');
    if(signal?.aborted||isCurrent&&!isCurrent())throw error('IDENTITY_ABORTED');maxReads=Math.max(maxReads,references.length);
    return new Promise((resolve,reject)=>{let tx,failure,result,left=references.length,finished=false;const rows=new Map();
      const abort=e=>{failure ||= e;try{tx.abort();}catch{}};const onSignal=()=>abort(error('IDENTITY_ABORTED'));const cleanup=()=>signal?.removeEventListener('abort',onSignal);
      try{tx=db.transaction(STORE,'readwrite');const store=tx.objectStore(STORE);
        tx.oncomplete=()=>{finished=true;cleanup();metrics.completedTransactions++;resolve(c.copy(result));};
        tx.onabort=()=>{finished=true;cleanup();metrics.abortedTransactions++;reject(failure||tx.error||error('IDENTITY_ABORTED'));};tx.onerror=()=>{};
        signal?.addEventListener('abort',onSignal,{once:true});if(signal?.aborted){onSignal();return;}
        for(const r of references){const k=c.key(r),q=store.get(k);metrics.readRequests++;q.onsuccess=()=>{if(failure||finished)return;try{if(q.result&&q.result.key!==k)c.fail('STORED_KEY_MISMATCH');const doc=q.result?c.document(q.result.document,r):null;if(guarded){const g=guards.find(g=>c.key(g.ref)===k),e=g.expected;if(e.exists?!doc||doc.documentVersion!==e.documentVersion||doc.revision!==e.revision||c.digest(doc)!==e.sha256:doc!==null)c.fail('CAS_CONFLICT');}rows.set(k,doc);if(--left)return;if(signal?.aborted||isCurrent&&!isCurrent())c.fail('IDENTITY_ABORTED');const head=rows.get(c.key(hr)),existing=rows.get(c.key(ir));c.identity.bind(head,existing,uid);if(guarded&&head?.data.activeChestId)c.fail('ACTIVE_CHEST_CONFLICT');result=existing||proposed;if(!existing){store.add({key:c.key(ir),document:proposed});metrics.writeRequests++;maxWrites=Math.max(maxWrites,1);}}catch(e){abort(e);}};}
      }catch(e){if(tx&&!finished)abort(e);else{cleanup();reject(e);}}
    });
  }
  async function commitDelta(value,options={}){return runDelta(value,options);}
  async function verifyReadSet(value,options={}){return runDelta(value,options,true);}
  return Object.freeze({readDocument,commitDelta,...(c.identity?{ensureCrewLocalIdentity,verifyReadSet}:{}),
    async close(){closed=true;if(opened){try{(await opened).close();}catch{}}},
    diagnostics:() => ({...metrics,...(c.identity?{maxReadRequestsPerTransaction:maxReads,maxWriteRequestsPerTransaction:maxWrites}:{})}), databaseName});
}

