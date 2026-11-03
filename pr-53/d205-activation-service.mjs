import * as c from './d205-activation-contract.mjs';
import * as b from './d205-handover-contract.mjs';
import {createPreparedAdapter} from './d205-handover-indexeddb.mjs';
import {createActivationAdapter} from './d205-activation-indexeddb.mjs';
import {SOURCE} from './d205-legacy-source.mjs';
export function createActivationService(value){const cfg=c.ownOptions(value,['sourceOrigin','fixtureRaw','indexedDB','locks','sourcePort']),ctx=c.context(b.context({...c.TARGET,sourceOrigin:cfg.sourceOrigin})),port=c.sourcePort(cfg.sourcePort),validate=c.validator(cfg.fixtureRaw);
 if(typeof cfg.locks?.request!=='function')c.fail('SOURCE_LOCK_REQUIRED');
 const prepared=createPreparedAdapter({context:ctx,indexedDB:cfg.indexedDB}),adapter=createActivationAdapter({context:ctx,fixtureRaw:cfg.fixtureRaw,indexedDB:cfg.indexedDB,sourcePort:port});
 let closed=false;const controls=new Set();
 async function operation(options,work){const opts=c.ownOptions(options??{},['signal']);if(opts.signal!==undefined&&!(opts.signal instanceof AbortSignal))c.fail('INVALID_SIGNAL');if(closed)c.fail('SERVICE_CLOSED');const control=new AbortController(),forward=()=>control.abort();controls.add(control);opts.signal?.addEventListener('abort',forward,{once:true});if(opts.signal?.aborted)control.abort();
  const check=()=>{if(closed||control.signal.aborted)c.fail('ACTIVATION_ABORTED');};try{check();return await work(control.signal,check);}finally{controls.delete(control);opts.signal?.removeEventListener('abort',forward);}}
 async function activate(options={}){return operation(options,(signal,check)=>cfg.locks.request(SOURCE.progressKey,{mode:'exclusive',signal},async()=>{
   // No timer or agreement of two samples is claimed as a cross-process proof.
   check();let raw=c.readSource(port),isFence=false;try{isFence=typeof raw==='string'&&JSON.parse(raw)?.schemaVersion===2;}catch{}
   if(!isFence){
    // Reuse B1's candidate and native reservation, without nesting its lock.
    let current;try{current=await prepared.read({signal});}catch(e){
     // B1 intentionally rejects COMMITTED. Only the B2 reader can authorize a
     // historical replay; no failure is converted to an empty target.
     let f;try{f=await adapter.read({signal});}catch{throw e;}
     if(f.manifest.documentVersion!==2)throw e;const v=c.verifyCommitted(ctx,f,validate);check();return adapter.commit(v.plan,{signal});
    }
    check();const observation=b.observe(raw,validate),candidate=b.prepareCandidate(ctx,observation,current,validate);b.revalidateObservation(observation,c.readSource(port));await prepared.commit(candidate,{signal});check();
   }
   const frame=await adapter.read({signal});check();let plan;
   if(frame.manifest.documentVersion===2)plan=c.verifyCommitted(ctx,frame,validate).plan;
   else {plan=c.makePlan(ctx,{manifest:frame.manifest,source:frame.source},validate);raw=c.readSource(port);if(isFence){c.parseFence(raw);if(raw!==plan.fenceRaw)c.fail('FENCE_PLAN_MISMATCH');}else if(raw!==plan.source.data.raw)c.fail('SOURCE_CHANGED_BEFORE_ACTIVATION');}
   check();return adapter.commit(plan,{signal});
  }));}
 async function inspectOrigin(options={}){return operation(options,async(signal,check)=>{const frame=await adapter.read({signal});check();if(frame.manifest.documentVersion!==2)c.fail('ORIGIN_NOT_COMMITTED');return c.verifyCommitted(ctx,frame,validate).proof;});}
 return Object.freeze({activate,inspectOrigin,diagnostics:()=>({preparation:prepared.diagnostics(),activation:adapter.diagnostics()}),async close(){closed=true;for(const control of controls)control.abort();await Promise.all([prepared.close(),adapter.close()]);}});
}
