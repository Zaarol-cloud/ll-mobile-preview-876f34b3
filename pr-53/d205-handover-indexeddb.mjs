import * as c from './d205-handover-contract.mjs';
const {copy,exact,digest}=c.helpers;
// Only PREPARED/source rows are implemented. No PLAYER, INIT, source writer,
// freeze, activation, delete or migration-to-another-database method exists.
export function createPreparedAdapter(value){const cfg=c.ownOptions(value,['context','indexedDB']),ctx=c.boundContext(cfg.context),idb=cfg.indexedDB;
 if(!idb||typeof idb.open!=='function')c.fail('INDEXEDDB_REQUIRED');
 let opened,handle,closed=false;const lifetime=new AbortController(),transactions=new Set(),metrics={selectedSourceReads:0,keyReads:0,writes:0,completed:0,aborted:0,maxSelectedSourcesPerTransaction:0};
 function open(){if(closed)return Promise.reject(Object.assign(Error('ADAPTER_CLOSED'),{code:'ADAPTER_CLOSED'}));if(opened)return opened;
  opened=new Promise((resolve,reject)=>{let settled=false;const rejectOnce=e=>{if(!settled){settled=true;reject(e);}},r=idb.open(ctx.databaseName,1);
   r.onerror=()=>rejectOnce(r.error||Error('DB_OPEN_FAILED'));r.onblocked=()=>rejectOnce(Object.assign(Error('DB_BLOCKED'),{code:'DB_BLOCKED'}));
   r.onupgradeneeded=e=>{if(e.oldVersion!==0){r.transaction.abort();return;}r.result.createObjectStore('documents',{keyPath:'key'});};
   r.onsuccess=()=>{const db=r.result;if(settled||closed){db.close();rejectOnce(Error('ADAPTER_CLOSED'));return;}try{if(db.version!==1||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents'))c.fail('DB_SCHEMA_MISMATCH');const s=db.transaction('documents').objectStore('documents');if(s.keyPath!=='key'||s.autoIncrement||s.indexNames.length)c.fail('DB_SCHEMA_MISMATCH');db.onversionchange=()=>{closed=true;for(const tx of transactions){try{tx.abort();}catch{}}db.close();};handle=db;settled=true;resolve(db);}catch(e){db.close();rejectOnce(e);}};
  });return opened;
 }
 async function run(candidate,signal){if(closed)c.fail('ADAPTER_CLOSED');if(signal?.aborted)c.fail('PREPARATION_ABORTED');let stop,stopClosed;
  const aborted=new Promise((_,reject)=>{stop=()=>reject(Object.assign(Error('PREPARATION_ABORTED'),{code:'PREPARATION_ABORTED'}));stopClosed=()=>reject(Object.assign(Error('ADAPTER_CLOSED'),{code:'ADAPTER_CLOSED'}));signal?.addEventListener('abort',stop,{once:true});lifetime.signal.addEventListener('abort',stopClosed,{once:true});});
  let db;try{db=await Promise.race([open(),aborted]);}finally{signal?.removeEventListener('abort',stop);lifetime.signal.removeEventListener('abort',stopClosed);}if(signal?.aborted||closed)c.fail('PREPARATION_ABORTED');
  return new Promise((resolve,reject)=>{let tx,error,result,finished=false,sourceReads=0;
   const abort=e=>{error ||= e;try{tx.abort();}catch{}};const onAbort=()=>abort(Object.assign(Error('PREPARATION_ABORTED'),{code:'PREPARATION_ABORTED'}));const cleanup=()=>{transactions.delete(tx);signal?.removeEventListener('abort',onAbort);};
   try{tx=db.transaction('documents',candidate?'readwrite':'readonly');transactions.add(tx);const store=tx.objectStore('documents');
    tx.oncomplete=()=>{finished=true;cleanup();metrics.completed++;metrics.maxSelectedSourcesPerTransaction=Math.max(metrics.maxSelectedSourcesPerTransaction,sourceReads);resolve(copy(result));};
    tx.onabort=()=>{finished=true;cleanup();metrics.aborted++;reject(error||tx.error||Error('PREPARATION_ABORTED'));};tx.onerror=()=>{};
    signal?.addEventListener('abort',onAbort,{once:true});if(signal?.aborted){onAbort();return;}
    function get(ref,done){const k=c.key(ref),r=store.get(k);r.onsuccess=()=>{if(error||finished)return;try{let d=null;if(r.result!==undefined){const row=exact(r.result,['key','document']);if(row.key!==k)c.fail('STORED_KEY_MISMATCH');d=row.document;}done(d);}catch(e){abort(e);}};}
    function scan(manifest,snapshot){const keys=[],q=store.openKeyCursor();q.onsuccess=()=>{if(error||finished)return;try{if(q.result){metrics.keyReads++;if(keys.length===c.MAX_KEYS)c.fail('TARGET_KEY_LIMIT');keys.push(q.result.key);q.result.continue();return;}c.requireKeySet(ctx,manifest,keys);
      if(!candidate){result={manifest,snapshot};return;}
      if((manifest?digest(manifest):null)!==candidate.expectedManifest||(snapshot?digest(snapshot):null)!==candidate.expectedSnapshot)c.fail('CAS_CONFLICT');
      if(signal?.aborted||closed)c.fail('PREPARATION_ABORTED');result=c.receipt(candidate);
      if(candidate.replayed)return;
      // All checks and both writes are in this same active write transaction.
      store.add({key:c.key(c.reference(ctx,'LEGACY_SOURCE',candidate.snapshot.id)),document:candidate.snapshot});metrics.writes++;
      const row={key:c.key(c.manifestRef(ctx)),document:candidate.manifest};if(manifest)store.put(row);else store.add(row);metrics.writes++;
     }catch(e){abort(e);}};}
    get(c.manifestRef(ctx),value=>{const manifest=value===null?null:c.manifestDocument(value,ctx);if(!manifest){scan(null,null);return;}
      get(c.reference(ctx,'LEGACY_SOURCE',manifest.data.selectedSnapshotId),value=>{if(value===null)c.fail('SELECTED_SOURCE_MISSING');sourceReads++;metrics.selectedSourceReads++;scan(manifest,c.sourceDocument(value,ctx,manifest.data.selectedSnapshotId));});});
   }catch(e){if(tx&&!finished)abort(e);else{cleanup();reject(e);}}
  });
 }
 return Object.freeze({read:({signal}={})=>run(null,signal),commit:(value,{signal}={})=>{const p=c.requireCandidate(value);if(digest(p.ctx)!==digest(ctx))c.fail('TARGET_BINDING_MISMATCH');return run(p,signal);},diagnostics:()=>({...metrics}),async close(){closed=true;lifetime.abort();for(const tx of transactions){try{tx.abort();}catch{}}handle?.close();}});
}
