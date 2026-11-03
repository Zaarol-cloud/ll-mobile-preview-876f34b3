import * as c from './d205-activation-contract.mjs';
import * as b from './d205-handover-contract.mjs';
import {SOURCE} from './d205-legacy-source.mjs';
import {createActivationService} from './d205-activation-service.mjs';
import {createActivationAdapter} from './d205-activation-indexeddb.mjs';
import {createReadonlyInstanceView} from './personal-chest-instance-view.mjs';
import {initTransition,INIT_ID} from './personal-player-action-contract.mjs';
import {createOriginReadonly} from './d205-origin-readonly.mjs';

export const STARTUP_VERSION=1;
export const MAX_TARGET_KEYS=32768;
const {exact,canonical,digest,copy}=c.helpers;
const error=code=>Object.assign(Error(code),{code});
export function requirePublicEnvironment(value){
 const v=c.ownOptions(value,['href','marker']),m=c.ownOptions(v.marker,['bridgeVersion','startupVersion','sourceOrigin','deliveryProfile']);let url;
 try{url=new URL(v.href);}catch{c.fail('STARTUP_ENVIRONMENT_REQUIRED');}
 if(url.origin!=='https://zaarol-cloud.github.io'||!['/ll-mobile-preview-876f34b3/pr-53/','/ll-mobile-preview-876f34b3/pr-53/index.html'].includes(url.pathname)||url.username||url.password||m.deliveryProfile!=='TEACHER_DEMO_V2_PR53'||
   m.bridgeVersion!==3||m.startupVersion!==STARTUP_VERSION||m.sourceOrigin!==url.origin)c.fail('STARTUP_ENVIRONMENT_REQUIRED');
 return c.freeze({sourceOrigin:url.origin,bridgeVersion:3,startupVersion:STARTUP_VERSION});
}
// Conditional same-context read/write/read, never a native CAS or a cache flush.
// The approved one-time browser shutdown is an external operating condition.
export function createPublicSourcePort(value){
 const cfg=c.ownOptions(value,['environment','storage']),env=requirePublicEnvironment(cfg.environment),storage=cfg.storage;
 if(typeof storage?.getItem!=='function'||typeof storage?.setItem!=='function')c.fail('SOURCE_STORAGE_REQUIRED');
 const port={read(key){if(key!==SOURCE.progressKey)c.fail('SOURCE_KEY_MISMATCH');return storage.getItem(key);},replace(value){
  const a=exact(value,['key','expectedRaw','fenceRaw']);if(a.key!==SOURCE.progressKey)c.fail('SOURCE_KEY_MISMATCH');
  const f=c.parseFence(a.fenceRaw);if(f.sourceOrigin!==env.sourceOrigin)c.fail('FENCE_SOURCE_ORIGIN_MISMATCH');
  if(c.readSource(port)!==a.expectedRaw)c.fail('SOURCE_CHANGED_AT_PORT');storage.setItem(a.key,a.fenceRaw);return c.readSource(port);
 }};return Object.freeze(port);
}
export function createBrowserStartup(value){
 const cfg=c.ownOptions(value,['environment','fixtureRaw','indexedDB','locks','storage','subtle']),env=requirePublicEnvironment(cfg.environment),ctx=b.context({...c.TARGET,sourceOrigin:env.sourceOrigin}),validate=c.validator(cfg.fixtureRaw),port=createPublicSourcePort({environment:cfg.environment,storage:cfg.storage}),idb=cfg.indexedDB;
 if(typeof idb?.open!=='function'||typeof idb.databases!=='function'||typeof cfg.locks?.request!=='function')c.fail('STARTUP_PLATFORM_REQUIRED');
 let closed=false,generation=0,pending=null,phase='NEW',failure=null,result=null,sourceGuard,control=null,preserved=null;
 const owned=new Set(),transactions=new Set(),operations=new Set(),metrics={starts:0,regularPreserved:0,activations:0,replays:0,suspends:0,sourceChecks:0};
 const check=(token,signal)=>{if(closed)c.fail('STARTUP_CLOSED');if(signal?.aborted||token!==generation)c.fail('STARTUP_ABORTED');};
 const view=()=>c.freeze({startupVersion:STARTUP_VERSION,phase,errorCode:failure?.code??null,originKind:result?.originKind??null,
  journalConnected:phase==='READY'&&result?.originKind!=='LEGACY_IMPORT',legacySolutionConnected:false,calendarMode:'PRESERVE_ONLY'});
 function checkSource(){metrics.sourceChecks++;try{if(c.readSource(port)!==sourceGuard)c.fail('SOURCE_CHANGED_AFTER_STARTUP');}catch(e){if(phase==='READY'){failure=e;phase='ERROR';result=null;for(const op of operations)op.abort();}throw e;}}
 async function target(token,signal){
  check(token,signal);const empty={databaseExists:false,manifest:null,player:null,init:null,assets:null,origin:null,learning:null,hasD205:false,foreignKeys:false,keyCount:0,calendarKeyCount:0};
  const databases=await idb.databases();check(token,signal);if(!Array.isArray(databases))c.fail('DATABASE_LIST_INVALID');
  if(!databases.some(d=>d.name===ctx.databaseName))return empty;
  let db;try{
   db=await new Promise((resolve,reject)=>{let done=false;const stop=()=>finish(error('STARTUP_ABORTED')),finish=(e,value)=>{if(done)return;done=true;signal.removeEventListener('abort',stop);e?reject(e):resolve(value);};signal.addEventListener('abort',stop,{once:true});if(signal.aborted){stop();return;}
    let q;try{q=idb.open(ctx.databaseName,1);}catch(e){finish(e);return;}q.onupgradeneeded=()=>q.transaction.abort();q.onerror=()=>finish(q.error||error('DB_OPEN_FAILED'));q.onblocked=()=>finish(error('DB_BLOCKED'));
    q.onsuccess=()=>{if(done||closed||signal.aborted){q.result.close();finish(error('STARTUP_ABORTED'));return;}finish(null,q.result);};
   });check(token,signal);
   if(db.version!==1||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents'))c.fail('DB_SCHEMA_MISMATCH');
   const handle={close:async()=>db.close()};owned.add(handle);db.onversionchange=()=>{control?.abort();db.close();};
   try{return await new Promise((resolve,reject)=>{let tx,e,output={...empty,databaseExists:true},left=7;
    const stop=()=>{e ||= error('STARTUP_ABORTED');try{tx.abort();}catch{}};
    try{tx=db.transaction('documents','readonly');transactions.add(tx);
     const cleanup=()=>{transactions.delete(tx);signal.removeEventListener('abort',stop);};tx.onerror=()=>{};tx.onabort=()=>{cleanup();reject(e||tx.error||error('STARTUP_ABORTED'));};tx.oncomplete=()=>{cleanup();try{check(token,signal);if(left)c.fail('TARGET_READ_INCOMPLETE');resolve(output);}catch(e){reject(e);}};
     const store=tx.objectStore('documents');if(store.keyPath!=='key'||store.autoIncrement||store.indexNames.length)c.fail('DB_SCHEMA_MISMATCH');
     signal.addEventListener('abort',stop,{once:true});if(signal.aborted){stop();return;}
     const cursor=store.openKeyCursor(),normal=new Set(['PLAYER','HEAD','LOCAL_IDENTITY','CHEST','ARCHIVE','REQUEST','ACTION']),migration=new Set(['MIGRATION','LEGACY_SOURCE','IMPORT_ORIGIN','LEGACY_ASSETS','LEGACY_LEARNING']);
     cursor.onsuccess=()=>{if(e)return;try{check(token,signal);const row=cursor.result;if(!row){left--;return;}if(++output.keyCount>MAX_TARGET_KEYS)c.fail('STARTUP_TARGET_LIMIT');let r;try{if(typeof row.key!=='string'||row.key.length>1024)throw Error();r=exact(JSON.parse(row.key),['uid','kind','id']);const calendar=r.kind==='CALENDAR_ASSETS'||r.kind==='CALENDAR_CLAIM';if(b.key(r)!==row.key||r.uid!==ctx.uid||!normal.has(r.kind)&&!migration.has(r.kind)&&!calendar)throw Error();if(calendar&&++output.calendarKeyCount>31)throw Error();}catch{output.foreignKeys=true;}if(r&&migration.has(r.kind))output.hasD205=true;row.continue();}catch(cause){e=cause;try{tx.abort();}catch{}}};
     for(const [name,ref]of [['manifest',b.manifestRef(ctx)],['player',c.reference('PLAYER')],['init',c.reference('ACTION',INIT_ID)],['assets',c.reference('LEGACY_ASSETS')],['origin',c.reference('IMPORT_ORIGIN')],['learning',c.reference('LEGACY_LEARNING',ctx.migrationId)]]){
      const key=b.key(ref),q=store.get(key);q.onsuccess=()=>{if(e)return;try{check(token,signal);if(q.result!==undefined){const row=exact(q.result,['key','document']);if(row.key!==key)c.fail('STORED_KEY_MISMATCH');output[name]=row.document;}left--;}catch(cause){e=cause;try{tx.abort();}catch{}}};
     }
    }catch(cause){e=cause;if(tx){try{tx.abort();}catch{transactions.delete(tx);}reject(e);}else reject(e);}
   });}finally{owned.delete(handle);}
  }finally{db?.close();}
 }
 async function classify(token,signal){
  return cfg.locks.request(SOURCE.progressKey,{mode:'exclusive',signal},async()=>{
   check(token,signal);const raw=c.readSource(port),first=await target(token,signal);check(token,signal);
   if(first.foreignKeys)c.fail('STARTUP_TARGET_CONFLICT');
   // These are only candidates. Committed origins and exact calendar addresses
   // are verified together by the readonly origin reader before READY.
   if(first.calendarKeyCount&&(first.player===null||first.manifest&&first.manifest.documentVersion!==2))c.fail('STARTUP_ORPHAN_CALENDAR');
   if(first.manifest!==null)return {activate:true};
   if(first.player===null){if(first.init||first.assets||first.origin||first.learning)c.fail('STARTUP_TARGET_PARTIAL');return {activate:true};}
   if(raw!==null)c.fail('SOURCE_TARGET_CONFLICT');
   const initial=initTransition(ctx.uid,null,null);if(canonical(first.init)!==canonical(initial.writes[1])||first.hasD205)c.fail('REGULAR_ORIGIN_UNPROVEN');
   if(first.player.revision===1&&canonical(first.player)!==canonical(initial.writes[0]))c.fail('REGULAR_BASE_CONFLICT');
   const reader=createReadonlyInstanceView({...c.TARGET,indexedDB:idb,...(cfg.subtle?{subtle:cfg.subtle}:{})});owned.add(reader);
   let snapshot;try{snapshot=await reader.snapshot({signal});}finally{owned.delete(reader);await reader.close();}
   check(token,signal);if(!snapshot||snapshot.anchors.playerDigest!==digest(first.player))c.fail('STARTUP_TARGET_CHANGED');
   const last=await target(token,signal);check(token,signal);if(canonical(first)!==canonical(last))c.fail('STARTUP_TARGET_CHANGED');
   if(c.readSource(port)!==raw)c.fail('SOURCE_CHANGED_DURING_STARTUP');return {activate:false,originKind:'REGULAR_EXISTING',guard:null};
  });
 }
 async function activateOrPreserve(token,signal){
  const route=await classify(token,signal);check(token,signal);
  if(!route.activate){metrics.regularPreserved++;sourceGuard=route.guard;preserved=c.freeze({calendar:null,boosters:null});return c.freeze({startupVersion:1,status:'READY',originKind:route.originKind});}
  const activation=createActivationService({sourceOrigin:env.sourceOrigin,fixtureRaw:cfg.fixtureRaw,indexedDB:idb,locks:cfg.locks,sourcePort:port});owned.add(activation);
  try{
   const receipt=await activation.activate({signal});check(token,signal);
   const reader=createActivationAdapter({context:ctx,fixtureRaw:cfg.fixtureRaw,indexedDB:idb,sourcePort:port});owned.add(reader);
   try{const frame=await reader.read({signal}),verified=c.verifyCommitted(ctx,frame,validate);check(token,signal);sourceGuard=verified.plan.fenceRaw;checkSource();
    if(receipt.planDigest!==verified.plan.planDigest)c.fail('STARTUP_PLAN_CHANGED');preserved=c.freeze({calendar:copy(frame.assets.data.calendar),boosters:copy(frame.assets.data.boosters)});metrics.activations++;if(receipt.replayed)metrics.replays++;
    return c.freeze({startupVersion:1,status:'READY',originKind:receipt.originKind});
   }finally{owned.delete(reader);await reader.close();}
  }finally{owned.delete(activation);await activation.close();}
 }
 async function execute(token,signal){
  const activated=await activateOrPreserve(token,signal);check(token,signal);
  const reader=createOriginReadonly({sourceOrigin:env.sourceOrigin,fixtureRaw:cfg.fixtureRaw,indexedDB:idb,sourcePort:port,...(cfg.subtle?{subtle:cfg.subtle}:{})});owned.add(reader);
  try{const verified=await reader.inspect({signal,isCurrent:()=>{check(token,signal);return true;}});check(token,signal);
   if(verified.originKind!==activated.originKind||verified.sourceRaw!==sourceGuard)c.fail('STARTUP_TARGET_CHANGED');
   preserved=verified.preserved;checkSource();return activated;
  }finally{owned.delete(reader);await reader.close();}
 }
 function start({signal}={}){
  if(signal!==undefined&&!(signal instanceof AbortSignal))return Promise.reject(error('INVALID_SIGNAL'));
  if(closed)return Promise.reject(error('STARTUP_CLOSED'));if(phase==='SUSPENDED')return Promise.reject(error('STARTUP_SUSPENDED'));if(failure)return Promise.reject(failure);
  if(phase==='READY'){try{checkSource();return Promise.resolve(result);}catch(e){failure=e;phase='ERROR';return Promise.reject(e);}}
  if(pending)return pending;
  const token=++generation,own=new AbortController();control=own;phase='LOADING';metrics.starts++;
  const forward=()=>own.abort();signal?.addEventListener('abort',forward,{once:true});if(signal?.aborted)own.abort();
  const work=execute(token,own.signal).then(value=>{check(token,own.signal);result=value;phase='READY';return value;}).catch(e=>{if(token===generation&&!closed){failure=e;phase='ERROR';result=null;}throw e;}).finally(()=>{signal?.removeEventListener('abort',forward);if(pending===work)pending=null;if(control===own)control=null;});pending=work;return work;
 }
 async function run(work,options={}){
  const o=c.ownOptions(options,['signal','isCurrent']);if(typeof work!=='function'||o.signal!==undefined&&!(o.signal instanceof AbortSignal)||o.isCurrent!==undefined&&typeof o.isCurrent!=='function')c.fail('STARTUP_OPERATION_INVALID');
  if(o.signal?.aborted)c.fail('STARTUP_ABORTED');if(o.isCurrent&&!o.isCurrent())c.fail('STARTUP_STALE');
  const own=new AbortController(),forward=()=>own.abort();operations.add(own);o.signal?.addEventListener('abort',forward,{once:true});if(o.signal?.aborted)own.abort();let stop;
  try{const cancelled=new Promise((_,reject)=>{stop=()=>reject(error('STARTUP_ABORTED'));own.signal.addEventListener('abort',stop,{once:true});if(own.signal.aborted)stop();});
   // An individual waiting call cancels independently of the shared startup.
   await Promise.race([start(),cancelled]);const token=generation;check(token,own.signal);if(o.isCurrent&&!o.isCurrent())c.fail('STARTUP_STALE');checkSource();
   const output=await Promise.race([Promise.resolve().then(()=>{check(token,own.signal);return work(Object.freeze({signal:own.signal,isCurrent:()=>!closed&&token===generation&&phase==='READY'&&!own.signal.aborted}));}),cancelled]);
   check(token,own.signal);if(o.isCurrent&&!o.isCurrent())c.fail('STARTUP_STALE');checkSource();return output;
  }finally{operations.delete(own);o.signal?.removeEventListener('abort',forward);own.signal.removeEventListener('abort',stop);}
 }
 async function suspend(){if(closed)return;metrics.suspends++;generation++;phase='SUSPENDED';failure=null;result=null;sourceGuard=undefined;preserved=null;control?.abort();for(const op of operations)op.abort();for(const tx of transactions){try{tx.abort();}catch{}}await Promise.all([...owned].map(o=>o.close()));}
 async function resume(){if(closed)c.fail('STARTUP_CLOSED');const previous=pending;await suspend();if(previous)await previous.catch(()=>{});if(closed)c.fail('STARTUP_CLOSED');phase='NEW';return start();}
 return Object.freeze({start,run,view,ready:()=>phase==='READY'&&!closed,assets(){if(phase!=='READY'||closed)c.fail('STARTUP_NOT_READY');checkSource();return preserved;},async retry(){if(closed)c.fail('STARTUP_CLOSED');return resume();},suspend,resume,
  diagnostics:()=>copy(metrics),async close(){await suspend();closed=true;phase='CLOSED';generation++;}});
}
