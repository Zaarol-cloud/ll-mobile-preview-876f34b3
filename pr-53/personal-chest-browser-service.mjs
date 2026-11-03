import {workingSet,contracts as c} from "./personal-chest-browser-bundle.mjs";
import {createIndexedDbAdapter} from "./personal-chest-indexeddb-adapter.mjs";
const error=code=>Object.assign(new Error(code),{code});
const productionWorkerURL=new URL("./personal-chest-generation-worker.mjs",import.meta.url);
export function createWorkerGenerator({workerFactory=url=>new Worker(url,{type:"module"}),
  workerURL=productionWorkerURL,timeoutMs=15000}={}) {
  if(typeof workerFactory!=="function" || !Number.isSafeInteger(timeoutMs) ||
    timeoutMs<50 || timeoutMs>30000)throw error("INVALID_WORKER_CONFIGURATION");
  let active=0,created=0,terminated=0;
  async function generate(context,{signal}={}) {
    const snapshot=c.freeze(c.dataCopy(context));
    if(signal?.aborted)throw error("GENERATOR_ABORTED");
    return await new Promise((resolve,reject)=>{
      let worker,timer,finished=false;
      const cleanup=()=>{
        clearTimeout(timer);signal?.removeEventListener("abort",onAbort);
        if(worker){worker.terminate();active--;terminated++;}
      };
      const finish=(failure,result)=>{if(finished)return;finished=true;cleanup();
        failure?reject(failure):resolve(result);};
      const onAbort=()=>finish(error("GENERATOR_ABORTED"));
      try {
        const jobId=crypto.randomUUID().replaceAll("-","");
        worker=workerFactory(workerURL);created++;active++;
        worker.onmessage=event=>{
          try{
            const message=c.dataCopy(event.data);
            if(message.jobId!==jobId)throw error("FOREIGN_WORKER_RESULT");
            if(message.status!=="SUCCESS")throw error("GENERATOR_FAILED");
            c.exact(message,["jobId","status","result"]);finish(null,c.freeze(message.result));
          }catch(e){finish(e);}
        };
        worker.onerror=event=>{event.preventDefault();finish(error("GENERATOR_FAILED"));};
        worker.onmessageerror=()=>finish(error("GENERATOR_MESSAGE_ERROR"));
        signal?.addEventListener("abort",onAbort,{once:true});
        if(signal?.aborted){onAbort();return;}
        timer=setTimeout(()=>finish(error("GENERATOR_TIMEOUT")),timeoutMs);
        worker.postMessage({jobId,context:snapshot});
      }catch(e){finish(e);}
    });
  }
  return Object.freeze({generate,diagnostics:()=>({active,created,terminated})});
}
export function defaultMaterial({selection}) {
  const digits=[];
  while(digits.length<selection.codeLength) {
    const bytes=crypto.getRandomValues(new Uint8Array(32));
    for(const byte of bytes)if(byte<250 && digits.length<selection.codeLength)digits.push(byte%10);
  }
  return {chestId:"personal_"+crypto.randomUUID(),solutionCode:digits.join(""),
    assignmentSalt:[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,"0")).join("")};
}
// Constructor dependencies are private demo/test composition, never player
// request fields. The player supplies exactly the frozen C1/C2A selection request.
export function createPersonalChestService({uid,databaseName,
  privateMaterialProvider=defaultMaterial,workerGenerator=createWorkerGenerator(),
  adapter=createIndexedDbAdapter({databaseName})}={}) {
  c.requireUid(uid);
  if(typeof privateMaterialProvider!=="function" || typeof workerGenerator.generate!=="function")
    throw error("INVALID_SERVICE_CONFIGURATION");
  const activeControllers=new Set();let closed=false;
  const reference=(kind,id="current")=>({uid,kind,id});
  function controller(signal) {
    if(closed)throw error("SERVICE_CLOSED");
    const own=new AbortController(),forward=()=>own.abort();
    signal?.addEventListener("abort",forward,{once:true});
    if(signal?.aborted)own.abort();activeControllers.add(own);
    return {own,cleanup(){activeControllers.delete(own);signal?.removeEventListener("abort",forward);}};
  }
  async function run(request,privateMaterial,signal) {
    if(signal.aborted)throw error("START_ABORTED");
    const runtime=workingSet.createRuntime({readDocument:adapter.readDocument,
      generateAssignment:context=>workerGenerator.generate(context,{signal})});
    const candidate=await runtime.prepareStart({uid,request,privateMaterial});
    if(signal.aborted)throw error("START_ABORTED");
    const receipt=await adapter.commitDelta(candidate,{signal});
    return workingSet.acknowledgeCommit(candidate,receipt);
  }
  async function restore({signal}={}) {
    const operation=controller(signal);
    try{
      if(operation.own.signal.aborted)throw error("START_ABORTED");
      for(let attempt=0;attempt<3;attempt++){
        const head=await adapter.readDocument(reference("HEAD"));
        if(head.status==="ABSENT" || head.document.data.activeChestId===null)return null;
        const stored=await adapter.readDocument(reference("CHEST",head.document.data.activeChestId));
        if(stored.status!=="PRESENT")throw error("MISSING_ACTIVE_CHEST");
        const data=stored.document.data;
        try{
          const result=await run({startContractVersion:1,requestId:data.start.requestId,
            ...c.selectionInput(data.record.selection)},undefined,operation.own.signal);
          if(result.chest?.status==="ACTIVE" && result.chest.chestId===result.activeChestId)return result;
        }catch(e){if(e.code!=="CAS_CONFLICT")throw e;}
      }
      throw error("ACTIVE_STATE_CHANGED");
    }finally{operation.cleanup();}
  }
  async function start(value,{signal}={}) {
    const validated=c.requireStartRequest(value);
    const request=c.freeze({startContractVersion:validated.startContractVersion,
      requestId:validated.requestId,...c.selectionInput(validated.selection)});
    const operation=controller(signal);
    try{
      if(operation.own.signal.aborted)throw error("START_ABORTED");
      const previous=await adapter.readDocument(reference("REQUEST",request.requestId));
      if(previous.status==="PRESENT")return await run(request,undefined,operation.own.signal);
      const head=await adapter.readDocument(reference("HEAD"));
      if(head.status==="PRESENT" && head.document.data.activeChestId!==null) {
        const existing=await restore({signal:operation.own.signal});
        if(!existing)throw error("ACTIVE_STATE_CHANGED");
        return c.freeze({...existing,loadedExisting:true});
      }
      if(operation.own.signal.aborted)throw error("START_ABORTED");
      const privateMaterial=c.freeze(c.exact(await privateMaterialProvider(c.freeze({
        uid,selection:validated.selection})),["chestId","solutionCode","assignmentSalt"]));
      return await run(request,privateMaterial,operation.own.signal);
    }finally{operation.cleanup();}
  }
  return Object.freeze({start,restore,async close(){
    closed=true;for(const controller of activeControllers)controller.abort();await adapter.close();
  },diagnostics:()=>({worker:workerGenerator.diagnostics(),storage:adapter.diagnostics()})});
}

