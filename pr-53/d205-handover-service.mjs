import {SOURCE,createLegacySourceValidator} from './d205-legacy-source.mjs';
import * as c from './d205-handover-contract.mjs';
import {createPreparedAdapter} from './d205-handover-indexeddb.mjs';
export function createPreparationService(value){const cfg=c.ownOptions(value,['uid','databaseName','sourceOrigin','fixtureRaw','indexedDB','locks','readSource']);
 const ctx=c.context({uid:cfg.uid,databaseName:cfg.databaseName,sourceOrigin:cfg.sourceOrigin});
 if(typeof cfg.locks?.request!=='function'||typeof cfg.readSource!=='function')c.fail('SOURCE_LOCK_AND_READER_REQUIRED');
 const validator=createLegacySourceValidator({fixtureRaw:cfg.fixtureRaw,source:SOURCE}),adapter=createPreparedAdapter({context:ctx,indexedDB:cfg.indexedDB});
 let closed=false;const controls=new Set();
 async function prepare(value={}){const options=c.ownOptions(value,['signal']),signal=options.signal;if(signal!==undefined&&!(signal instanceof AbortSignal))c.fail('INVALID_SIGNAL');if(closed)c.fail('SERVICE_CLOSED');
  const control=new AbortController(),forward=()=>control.abort();controls.add(control);signal?.addEventListener('abort',forward,{once:true});if(signal?.aborted)control.abort();
  const check=()=>{if(closed||control.signal.aborted)c.fail('PREPARATION_ABORTED');};
  try{check();return await cfg.locks.request(SOURCE.progressKey,{mode:'exclusive',signal:control.signal},async()=>{
    // A published legacy writer can release its Web Lock from a microtask.
    // Let its browser task finish propagating localStorage changes before the
    // new owner reads. The original lock remains held throughout this turn.
    await new Promise(resolve=>setTimeout(resolve,0));check();let raw;try{raw=await cfg.readSource(SOURCE.progressKey);}catch{c.fail('SOURCE_READ_FAILED');}check();const observation=c.observe(raw,validator);
    // Exactly the selected old source is revalidated, never all raw backups.
    const current=await adapter.read({signal:control.signal});check();const candidate=c.prepareCandidate(ctx,observation,current,validator);check();
    // A timer is not a cross-process consistency proof. Sample again after
    // the asynchronous target read, under the same original lock. Divergence
    // is an explicit retryable failure, never a stale snapshot commit.
    let confirmed;try{confirmed=await cfg.readSource(SOURCE.progressKey);}catch{c.fail('SOURCE_READ_FAILED');}check();c.revalidateObservation(observation,confirmed);return adapter.commit(candidate,{signal:control.signal});
   });
  }finally{controls.delete(control);signal?.removeEventListener('abort',forward);}
 }
 return Object.freeze({prepare,diagnostics:adapter.diagnostics,async close(){closed=true;for(const c of controls)c.abort();await adapter.close();}});
}
