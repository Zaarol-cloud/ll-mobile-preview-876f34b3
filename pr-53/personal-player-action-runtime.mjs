import * as c from './personal-player-action-contract.mjs';
import {createPersonalActionAdapter} from './personal-player-action-indexeddb.mjs';
export function createPersonalPlayerRuntime({uid,databaseName,isolatedDemo=false,adapter=createPersonalActionAdapter({databaseName})}={}){
  c.ref(uid,'PLAYER');if(isolatedDemo!==true)c.fail('EXPLICIT_ISOLATED_DEMO_REQUIRED');
  let closed=false;const controllers=new Set();
  async function run(fn,signal){if(closed)c.fail('RUNTIME_CLOSED');const own=new AbortController(),forward=()=>own.abort();controllers.add(own);signal?.addEventListener('abort',forward,{once:true});if(signal?.aborted)own.abort();try{return await fn(own.signal);}finally{controllers.delete(own);signal?.removeEventListener('abort',forward);}}
  return Object.freeze({initialize:({signal}={})=>run(s=>adapter.initialize(uid,{signal:s}),signal),snapshot:()=>{if(closed)c.fail('RUNTIME_CLOSED');return adapter.snapshot(uid);},makeRequest:c.makeRequest,purchase:(request,{signal}={})=>run(s=>adapter.purchase(uid,request,{signal:s}),signal),diagnostics:adapter.diagnostics,async close(){closed=true;for(const x of controllers)x.abort();await adapter.close();}});
}
