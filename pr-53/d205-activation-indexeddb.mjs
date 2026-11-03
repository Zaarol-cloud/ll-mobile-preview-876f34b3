import * as c from './d205-activation-contract.mjs';
import * as b from './d205-handover-contract.mjs';
import {INIT_ID} from './personal-player-action-contract.mjs';
const {copy,exact,digest,canonical}=c.helpers;
export function createActivationAdapter(value){const cfg=c.ownOptions(value,['context','fixtureRaw','indexedDB','sourcePort']),ctx=c.context(cfg.context),validate=c.validator(cfg.fixtureRaw),port=c.sourcePort(cfg.sourcePort),idb=cfg.indexedDB;
 if(typeof idb?.open!=='function')c.fail('INDEXEDDB_REQUIRED');let opened,handle,closed=false;
 const life=new AbortController(),transactions=new Set(),metrics={reads:0,keyReads:0,writes:0,sourceTransitions:0,completed:0,aborted:0,maxWrites:0};
 function open(){if(closed)return Promise.reject(Object.assign(Error('ADAPTER_CLOSED'),{code:'ADAPTER_CLOSED'}));if(opened)return opened;
  opened=new Promise((resolve,reject)=>{let settled=false;const rejectOnce=e=>{if(!settled){settled=true;reject(e);}},r=idb.open(ctx.databaseName,1);
   r.onblocked=()=>rejectOnce(Object.assign(Error('DB_BLOCKED'),{code:'DB_BLOCKED'}));r.onerror=()=>rejectOnce(r.error||Error('DB_OPEN_FAILED'));
   // B1 owns creation. B2 never creates a database as a missing-state repair.
   r.onupgradeneeded=()=>{r.transaction.abort();};
   r.onsuccess=()=>{const db=r.result;if(settled||closed){db.close();rejectOnce(Error('ADAPTER_CLOSED'));return;}try{if(db.version!==1||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents'))c.fail('DB_SCHEMA_MISMATCH');const s=db.transaction('documents').objectStore('documents');if(s.keyPath!=='key'||s.autoIncrement||s.indexNames.length)c.fail('DB_SCHEMA_MISMATCH');db.onversionchange=()=>{closed=true;life.abort();for(const t of transactions){try{t.abort();}catch{}}db.close();};handle=db;settled=true;resolve(db);}catch(e){db.close();rejectOnce(e);}};
  });return opened;
 }
 async function run(plan,signal){if(closed)c.fail('ADAPTER_CLOSED');if(signal?.aborted)c.fail('ACTIVATION_ABORTED');let stop,stopClose;
  const cancel=new Promise((_,reject)=>{stop=()=>reject(Object.assign(Error('ACTIVATION_ABORTED'),{code:'ACTIVATION_ABORTED'}));stopClose=()=>reject(Object.assign(Error('ADAPTER_CLOSED'),{code:'ADAPTER_CLOSED'}));signal?.addEventListener('abort',stop,{once:true});life.signal.addEventListener('abort',stopClose,{once:true});});
  let db;try{db=await Promise.race([open(),cancel]);}finally{signal?.removeEventListener('abort',stop);life.signal.removeEventListener('abort',stopClose);}if(closed||signal?.aborted)c.fail('ACTIVATION_ABORTED');
  return new Promise((resolve,reject)=>{let tx,error,result,finished=false,writes=0;const abort=e=>{error ||= e;try{tx.abort();}catch{}};const onAbort=()=>abort(Object.assign(Error('ACTIVATION_ABORTED'),{code:'ACTIVATION_ABORTED'}));const cleanup=()=>{transactions.delete(tx);signal?.removeEventListener('abort',onAbort);};
   try{tx=db.transaction('documents',plan?'readwrite':'readonly');transactions.add(tx);const store=tx.objectStore('documents');
    tx.oncomplete=()=>{finished=true;cleanup();metrics.completed++;metrics.maxWrites=Math.max(metrics.maxWrites,writes);resolve(copy(result));};tx.onabort=()=>{finished=true;cleanup();metrics.aborted++;reject(error||tx.error||Error('ACTIVATION_ABORTED'));};tx.onerror=()=>{};
    signal?.addEventListener('abort',onAbort,{once:true});if(signal?.aborted){onAbort();return;}
    function get(ref,done){metrics.reads++;const k=b.key(ref),r=store.get(k);r.onsuccess=()=>{if(error||finished)return;try{let d=null;if(r.result!==undefined){const row=exact(r.result,['key','document']);if(row.key!==k)c.fail('STORED_KEY_MISMATCH');d=row.document;}done(d);}catch(e){abort(e);}};}
    function finish(frame){
     if(!plan){result=frame;return;}
     if(signal?.aborted||closed)c.fail('ACTIVATION_ABORTED');
     if(frame.manifest.documentVersion===2){const verified=c.verifyCommitted(ctx,frame,validate);if(verified.plan.planDigest!==plan.planDigest)c.fail('COMMITTED_PLAN_CONFLICT');c.fenceStep(verified.plan,port,true);result=c.receipt(verified.plan,true);return;}
     if(digest(frame.manifest)!==plan.descriptor.preparedManifestDigest||digest(frame.source)!==plan.descriptor.sourceSnapshotDigest)c.fail('CAS_CONFLICT');
     // All absence witnesses and the full allowed PREPARED key set have been
     // checked in this active RW transaction before the synchronous fence.
     c.fenceStep(plan,port);metrics.sourceTransitions++;
     if(signal?.aborted||closed)c.fail('ACTIVATION_ABORTED');
     if(plan.documents.length+1>c.MAX_WRITES)c.fail('WRITE_LIMIT');
     for(const d of plan.documents){store.add({key:b.key(c.reference(d.kind,d.id)),document:d});metrics.writes++;writes++;}
     store.put({key:b.key(b.manifestRef(ctx)),document:plan.committed});metrics.writes++;writes++;result=c.receipt(plan,false);
    }
    function loadRest(manifest,source){const f={manifest,source,player:null,origin:null,assets:null,learning:null,init:null},refs=[['player',c.reference('PLAYER')],['origin',c.reference('IMPORT_ORIGIN')],['assets',c.reference('LEGACY_ASSETS')],['learning',c.reference('LEGACY_LEARNING',ctx.migrationId)],['init',c.reference('ACTION',INIT_ID)]];let index=0;
     const next=()=>{if(index<refs.length){const [name,ref]=refs[index++];get(ref,d=>{f[name]=d;next();});return;}
      if(manifest.documentVersion===2){finish(f);return;}
      if(refs.some(([name])=>f[name]!==null))c.fail('TARGET_NOT_EMPTY');
      const keys=[],r=store.openKeyCursor();r.onsuccess=()=>{if(error||finished)return;try{if(r.result){if(keys.length===b.MAX_KEYS)c.fail('TARGET_KEY_LIMIT');keys.push(r.result.key);metrics.keyReads++;r.result.continue();return;}b.requireKeySet(ctx,manifest,keys);finish(f);}catch(e){abort(e);}};
     };next();
    }
    get(b.manifestRef(ctx),raw=>{if(raw===null)c.fail('PREPARED_REQUIRED');const manifest=raw.documentVersion===2?c.committedHeader(raw,ctx):b.manifestDocument(raw,ctx),prepared=manifest.documentVersion===2?manifest.data.preparedManifest:manifest;
     get(b.reference(ctx,'LEGACY_SOURCE',prepared.data.selectedSnapshotId),raw=>{if(raw===null)c.fail('SELECTED_SOURCE_MISSING');loadRest(manifest,b.sourceDocument(raw,ctx,prepared.data.selectedSnapshotId));});});
   }catch(e){if(tx&&!finished)abort(e);else{cleanup();reject(e);}}
  });
 }
 return Object.freeze({read:({signal}={})=>run(null,signal),commit:(value,{signal}={})=>{const p=c.requirePlan(value);if(canonical(p.ctx)!==canonical(ctx))c.fail('TARGET_BINDING_MISMATCH');return run(p,signal);},diagnostics:()=>({...metrics}),async close(){closed=true;life.abort();for(const tx of transactions){try{tx.abort();}catch{}}handle?.close();}});
}
