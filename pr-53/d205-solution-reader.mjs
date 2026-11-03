import {createLastSolutionReader} from './personal-player-v3-last-solution-indexeddb.mjs';
import {createOriginReadonly} from './d205-origin-readonly.mjs';
import * as c from './d205-activation-contract.mjs';
// Normal closure has priority, including a closed chest with zero paid hints.
// An exception at either reader is terminal; it is never a legacy fallback.
export function createComposedSolutionReader(value){
 const cfg=c.ownOptions(value,['sourceOrigin','fixtureRaw','indexedDB','sourcePort','subtle']);
 const origin=createOriginReadonly(cfg);let normalMetrics=null;
 let closed=false,generation=0;const controls=new Set(),readers=new Set();
 async function lastSolution(value={}){const opts=c.ownOptions(value,['signal','isCurrent']);if(opts.signal!==undefined&&!(opts.signal instanceof AbortSignal)||opts.isCurrent!==undefined&&typeof opts.isCurrent!=='function')c.fail('ORIGIN_OPTIONS_INVALID');if(closed)c.fail('SOLUTION_READER_CLOSED');const control=new AbortController(),token=++generation,abort=()=>control.abort();controls.add(control);opts.signal?.addEventListener('abort',abort,{once:true});if(opts.signal?.aborted)abort();const check=()=>{if(closed)c.fail('SOLUTION_READER_CLOSED');if(control.signal.aborted)c.fail('READ_ABORTED');if(token!==generation||opts.isCurrent&&!opts.isCurrent())c.fail('STALE_READ');return true;};
  async function wait(promise){check();let stop;try{return await Promise.race([promise,new Promise((_,reject)=>{stop=()=>reject(Object.assign(Error('READ_ABORTED'),{code:'READ_ABORTED'}));control.signal.addEventListener('abort',stop,{once:true});if(control.signal.aborted)stop();})]);}finally{control.signal.removeEventListener('abort',stop);}}
  let normal;try{check();
   // Per-call platform facade makes the frozen reader's initial database-list
   // await cancellable. A late list result cannot open a database after abort.
   function open(...args){check();const request=cfg.indexedDB.open(...args);let stopped=false,settled=false;
    const facade={get result(){return request.result;},get error(){return request.error;},get transaction(){return request.transaction;},onsuccess:null,onerror:null,onblocked:null,onupgradeneeded:null};
    const cleanup=()=>control.signal.removeEventListener('abort',cancel);
    const cancel=()=>{if(settled)return;stopped=true;cleanup();queueMicrotask(()=>{if(!settled){settled=true;facade.onerror?.();}});};
    request.onsuccess=event=>{if(stopped||closed||control.signal.aborted){request.result.close();cleanup();return;}settled=true;cleanup();facade.onsuccess?.(event);};
    request.onerror=event=>{event?.preventDefault?.();cleanup();if(stopped)return;stopped=true;settled=true;facade.onerror?.(event);};
    request.onblocked=event=>{cleanup();if(stopped)return;stopped=true;settled=true;facade.onblocked?.(event);};
    request.onupgradeneeded=event=>{if(stopped||control.signal.aborted){request.transaction?.abort();return;}facade.onupgradeneeded?.(event);};
    control.signal.addEventListener('abort',cancel,{once:true});if(control.signal.aborted)cancel();return facade;
   }
   const platform={databases:()=>wait(cfg.indexedDB.databases()),open};
   normal=createLastSolutionReader({...c.TARGET,indexedDB:platform,...(cfg.subtle?{subtle:cfg.subtle}:{})});readers.add(normal);
   const options={signal:control.signal,isCurrent:check},result=await wait(normal.lastSolution(options));check();const output=await origin.read(result,options);check();return output;
  }finally{if(normal){normalMetrics=normal.diagnostics();await normal.close();readers.delete(normal);}controls.delete(control);opts.signal?.removeEventListener('abort',abort);}}
 return Object.freeze({lastSolution,diagnostics:()=>c.freeze({normal:normalMetrics,origin:origin.diagnostics()}),async close(){closed=true;generation++;for(const control of controls)control.abort();await Promise.all([...readers].map(r=>r.close()));await origin.close();}});
}
