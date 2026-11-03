import * as c from './d205-activation-contract.mjs';
import * as b from './d205-handover-contract.mjs';
import * as normal from './personal-player-v3-last-solution-contract.mjs';
import {INIT_ID,initTransition} from './personal-player-action-contract.mjs';
import {createPersonalCalendarContract,LEVEL_COUNT,MAX_DOCUMENT_BYTES as MAX_CALENDAR_DOCUMENT_BYTES,MAX_EVIDENCE_BYTES} from './personal-calendar-contract.mjs';
const {exact,canonical,copy,sha256}=c.helpers;
export const MAX_ORIGIN_READS=13,MAX_ORIGIN_KEYS=32768;
export const MAX_CALENDAR_READS=LEVEL_COUNT+1,MAX_CALENDAR_READ_BYTES=MAX_EVIDENCE_BYTES+MAX_CALENDAR_DOCUMENT_BYTES;
const error=code=>Object.assign(Error(code),{code});
// This reader owns no writer, upgrade, preparation or recovery path. The final
// transaction rechecks normal closure anchors and every migration witness together.
export function createOriginReadonly(value){
 const cfg=c.ownOptions(value,['sourceOrigin','fixtureRaw','indexedDB','sourcePort','subtle']),ctx=c.context(b.context({...c.TARGET,sourceOrigin:cfg.sourceOrigin})),validate=c.validator(cfg.fixtureRaw),idb=cfg.indexedDB,subtle=cfg.subtle??globalThis.crypto?.subtle;
 const calendar=createPersonalCalendarContract({sourceOrigin:cfg.sourceOrigin,fixtureRaw:cfg.fixtureRaw});
 const url=new URL(ctx.sourceOrigin);if(url.origin!=='https://zaarol-cloud.github.io')c.fail('ORIGIN_LOCAL_ENVIRONMENT_REQUIRED');
 if(typeof idb?.open!=='function'||typeof idb.databases!=='function'||typeof cfg.sourcePort?.read!=='function'||typeof subtle?.digest!=='function')c.fail('ORIGIN_PLATFORM_REQUIRED');
 let closed=false,generation=0;const controls=new Set(),handles=new Set(),metrics={readRequests:0,transactions:0,maxReadsPerPhase:0,keyReads:0,maxCalendarReadsPerPhase:0};
 const ref=c.reference;
 function operation(value){const opts=c.ownOptions(value??{},['signal','isCurrent']);if(opts.signal!==undefined&&!(opts.signal instanceof AbortSignal)||opts.isCurrent!==undefined&&typeof opts.isCurrent!=='function')c.fail('ORIGIN_OPTIONS_INVALID');if(closed)c.fail('ORIGIN_CLOSED');const token=++generation,control=new AbortController(),abort=()=>control.abort();controls.add(control);opts.signal?.addEventListener('abort',abort,{once:true});if(opts.signal?.aborted)abort();return {control,check(){if(closed)c.fail('ORIGIN_CLOSED');if(control.signal.aborted)c.fail('READ_ABORTED');if(token!==generation||opts.isCurrent&&!opts.isCurrent())c.fail('STALE_READ');},async wait(promise){this.check();let stop;try{return await Promise.race([promise,new Promise((_,reject)=>{stop=()=>reject(error('READ_ABORTED'));control.signal.addEventListener('abort',stop,{once:true});if(control.signal.aborted)stop();})]);}finally{control.signal.removeEventListener('abort',stop);}},done(){controls.delete(control);opts.signal?.removeEventListener('abort',abort);}};}
 async function open(op){const list=await op.wait(idb.databases());op.check();if(!Array.isArray(list)||!list.some(d=>d.name===ctx.databaseName))c.fail('DATABASE_NOT_FOUND');return op.wait(new Promise((resolve,reject)=>{
  let done=false;const finish=(e,db)=>{if(done){db?.close();return;}done=true;op.control.signal.removeEventListener('abort',stop);e?reject(e):resolve(db);},stop=()=>finish(error('READ_ABORTED'));op.control.signal.addEventListener('abort',stop,{once:true});if(op.control.signal.aborted){stop();return;}
  const q=idb.open(ctx.databaseName,1);q.onupgradeneeded=()=>q.transaction.abort();q.onerror=()=>finish(error('READONLY_OPEN_FAILED'));q.onblocked=()=>finish(error('DB_BLOCKED'));q.onsuccess=()=>{const db=q.result;if(done||closed||op.control.signal.aborted){db.close();finish(error('READ_ABORTED'));return;}try{op.check();if(db.version!==1||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents'))c.fail('DB_SCHEMA_MISMATCH');handles.add(db);db.onversionchange=()=>{for(const control of controls)control.abort();db.close();handles.delete(db);};finish(null,db);}catch(e){db.close();finish(e);}};
 }));}
 function phase(db,op,expected,sourceRaw,calendarRefs){op.check();return new Promise((resolve,reject)=>{
  let tx,failure,reads=0,calendarReads=0,calendarBytes=0,finished=false,keyCount=0,keyDigest=sha256('lockloot/origin-keys/v1');const calendarKeys=[],witnesses=[],frame={uid:ctx.uid,head:null,player:null,identity:null,archive:null,start:null,end:null,action:null},migration={manifest:null,source:null,player:null,origin:null,assets:null,learning:null,init:null};
  const abort=e=>{failure ||= e;try{tx.abort();}catch{}},stop=()=>abort(error('READ_ABORTED'));
  try{tx=db.transaction('documents','readonly');metrics.transactions++;
   const cleanup=()=>{op.control.signal.removeEventListener('abort',stop);metrics.maxReadsPerPhase=Math.max(metrics.maxReadsPerPhase,reads);metrics.maxCalendarReadsPerPhase=Math.max(metrics.maxCalendarReadsPerPhase,calendarReads);};
   tx.onerror=()=>{};tx.onabort=()=>{finished=true;cleanup();reject(failure||tx.error||error('READ_ABORTED'));};tx.oncomplete=()=>{finished=true;cleanup();try{op.check();if(expected){if(c.readSource(cfg.sourcePort)!==sourceRaw)c.fail('SOURCE_CHANGED');if(keyCount!==expected.keyCount||keyDigest!==expected.keyDigest)c.fail('READSET_CHANGED');}resolve({frame,migration,witnesses,calendarKeys,keyCount,keyDigest});}catch(e){reject(e);}};
   const store=tx.objectStore('documents');if(store.keyPath!=='key'||store.autoIncrement||store.indexNames.length)c.fail('DB_SCHEMA_MISMATCH');op.control.signal.addEventListener('abort',stop,{once:true});op.check();
   function get(reference,done){const isCalendar=reference.kind==='CALENDAR_ASSETS'||reference.kind==='CALENDAR_CLAIM';if(isCalendar?++calendarReads>MAX_CALENDAR_READS:++reads>MAX_ORIGIN_READS)c.fail('ORIGIN_READ_LIMIT');metrics.readRequests++;const key=b.key(reference),q=store.get(key);q.onsuccess=()=>{if(finished||failure)return;try{op.check();let doc=null;if(q.result!==undefined){const row=exact(q.result,['key','document']);if(row.key!==key)c.fail('STORED_KEY_MISMATCH');doc=row.document;if(isCalendar&&(!doc||b.key({uid:doc.uid,kind:doc.kind,id:doc.id})!==key))c.fail('STORED_KEY_MISMATCH');const limit=isCalendar?MAX_CALENDAR_DOCUMENT_BYTES:reference.kind==='LEGACY_SOURCE'?2*8*1024*1024+65536:2*1024*1024;const raw=JSON.stringify(doc);if(typeof raw!=='string'||raw.length>limit)c.fail('ORIGIN_DOCUMENT_LIMIT');const bytes=new TextEncoder().encode(raw).length;if(bytes>limit)c.fail('ORIGIN_DOCUMENT_LIMIT');if(isCalendar&&(calendarBytes+=bytes)>MAX_CALENDAR_READ_BYTES)c.fail('ORIGIN_CALENDAR_RESOURCE_LIMIT');}witnesses.push({ref:reference,document:doc});done(doc);}catch(e){abort(e);}};}
   function scan(){const q=store.openKeyCursor();q.onsuccess=()=>{if(finished||failure)return;try{op.check();const row=q.result;if(!row)return;if(++keyCount>MAX_ORIGIN_KEYS)c.fail('ORIGIN_KEY_LIMIT');metrics.keyReads++;if(typeof row.key!=='string'||row.key.length>1024)c.fail('ORIGIN_TARGET_CONFLICT');const r=exact(JSON.parse(row.key),['uid','kind','id']);if(b.key(r)!==row.key||r.uid!==ctx.uid)c.fail('ORIGIN_TARGET_CONFLICT');
    const isCalendar=r.kind==='CALENDAR_ASSETS'||r.kind==='CALENDAR_CLAIM';if(isCalendar){if(calendarKeys.length>=MAX_CALENDAR_READS)c.fail('ORIGIN_CALENDAR_KEY_LIMIT');calendarKeys.push(row.key);if(expected&&!expected.calendarKeys.has(row.key))c.fail('ORIGIN_ORPHAN_CALENDAR');}
    else if(!['PLAYER','HEAD','LOCAL_IDENTITY','CHEST','ARCHIVE','REQUEST','ACTION','MIGRATION','LEGACY_SOURCE','IMPORT_ORIGIN','LEGACY_ASSETS','LEGACY_LEARNING'].includes(r.kind))c.fail('ORIGIN_ORPHAN_EVIDENCE');
    if(expected&&!expected.hasMigration&&['MIGRATION','LEGACY_SOURCE','IMPORT_ORIGIN','LEGACY_ASSETS','LEGACY_LEARNING'].includes(r.kind))c.fail('ORIGIN_ORPHAN_EVIDENCE');
    keyDigest=sha256(canonical({previous:keyDigest,key:row.key}));row.continue();}catch(e){abort(e);}};}
   if(expected){for(const witness of expected.witnesses)get(witness.ref,doc=>{if(canonical(doc)!==canonical(witness.document))c.fail('READSET_CHANGED');if(c.readSource(cfg.sourcePort)!==sourceRaw)c.fail('SOURCE_CHANGED');});scan();return;}
   if(calendarRefs){for(const reference of calendarRefs)get(reference,()=>{});return;}
   scan();
   get(ref('HEAD'),head=>{frame.head=head;get(ref('PLAYER'),player=>{frame.player=player;migration.player=player;get(ref('LOCAL_IDENTITY'),identity=>{frame.identity=identity;const base=normal.validateLastSolutionBase({uid:ctx.uid,head,player,identity});
    if(!player)c.fail('PLAYER_MISSING');
    for(const [name,reference]of [['init',ref('ACTION',INIT_ID)],['origin',ref('IMPORT_ORIGIN')],['assets',ref('LEGACY_ASSETS')],['learning',ref('LEGACY_LEARNING',ctx.migrationId)]])get(reference,d=>{migration[name]=d;});
    get(b.manifestRef(ctx),manifest=>{migration.manifest=manifest;if(manifest){const m=c.committedHeader(manifest,ctx);get(ref('LEGACY_SOURCE',m.data.preparedManifest.data.selectedSnapshotId),d=>{migration.source=d;});}});
    if(base.lastClosedChestId!==null)get(ref('ARCHIVE',base.lastClosedChestId),archive=>{frame.archive=archive;if(!archive)c.fail('MISSING_CLOSURE_PROOF');normal.document(archive,normal.ref(ref('ARCHIVE',base.lastClosedChestId)));get(ref('REQUEST',archive.data.start.requestId),d=>{frame.start=d;});get(ref('REQUEST',base.lastClosedActionId),d=>{frame.end=d;});get(ref('ACTION',base.lastClosedActionId),d=>{frame.action=d;});});
   });});});
  }catch(e){if(tx&&!finished)abort(e);else reject(e);}
 });}
 async function read(normalResult,options={},inspectOnly=false){const op=operation(options);let db;try{
  op.check();const sourceRaw=c.readSource(cfg.sourcePort);if(sourceRaw!==null)c.parseFence(sourceRaw);db=await open(op);op.check();const first=await phase(db,op);op.check();
  const current=await op.wait(normal.evaluateLastSolutionReadSet(first.frame,{subtle,signal:op.control.signal,isCurrent:()=>{op.check();return true;}}));op.check();if(!inspectOnly&&canonical(current)!==canonical(normalResult))c.fail('NORMAL_SOLUTION_CHANGED');
  let legacy=null,verified=null;if(first.migration.manifest){verified=c.verifyCommitted(ctx,first.migration,validate);if(sourceRaw!==verified.plan.fenceRaw)c.fail('COMMITTED_SOURCE_CONFLICT');
   const bytes=await op.wait(subtle.digest('SHA-256',new TextEncoder().encode(sourceRaw)));op.check();const hash=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==verified.plan.committed.data.fenceDigest)c.fail('FENCE_DIGEST_MISMATCH');legacy=verified.proof.legacySolution;
  }else{if(sourceRaw!==null)c.fail('COMMITTED_EVIDENCE_MISSING');const initial=initTransition(ctx.uid,null,null);if(canonical(first.migration.init)!==canonical(initial.writes[1])||first.migration.origin||first.migration.assets||first.migration.learning)c.fail('REGULAR_ORIGIN_UNPROVEN');if(first.frame.player.revision===1&&canonical(first.frame.player)!==canonical(initial.writes[0]))c.fail('REGULAR_BASE_CONFLICT');}
  if(c.readSource(cfg.sourcePort)!==sourceRaw)c.fail('SOURCE_CHANGED');
  // Finite calendar-chain evidence is sufficient for reading. It is not the
  // complete resource-history capability required by the separate writer.
  let calendarWitnesses=[];const allowedCalendarKeys=new Set();
  // A calendarless older save keeps the existing origin rules. The final key
  // digest proves continued absence; later legacy assets are not reinterpreted
  // as the immutable base of a newly invented calendar.
  if(first.calendarKeys.length){
   const base=calendar.verifyBase({frame:first.migration,sourceRaw}),calendarRefs=[ref('CALENDAR_ASSETS')];
   for(let level=1;level<=LEVEL_COUNT;level++)calendarRefs.push(calendar.claimReference(base,level));
   for(const reference of calendarRefs)allowedCalendarKeys.add(b.key(reference));if(first.calendarKeys.some(key=>!allowedCalendarKeys.has(key)))c.fail('ORIGIN_ORPHAN_CALENDAR');
   const observed=await phase(db,op,null,sourceRaw,calendarRefs);op.check();calendarWitnesses=observed.witnesses;
   const documents=new Map(calendarWitnesses.map(w=>[b.key(w.ref),w.document])),assets=documents.get(b.key(calendarRefs[0])),claims=calendarRefs.slice(1).map(r=>documents.get(b.key(r))).filter(d=>d!==null);
   calendar.verifyPlayerEvidence({base,player:first.frame.player,assets,claims});
  }
  // Construct privately, then publish only after the common native snapshot.
  let output=current;if(current.status==='DISABLED'&&current.reason==='NO_CLOSED_CHEST'&&legacy){output=c.freeze({legacyReadVersion:1,uid:ctx.uid,status:legacy.status,reason:legacy.reason,wasSolved:legacy.wasSolved,binding:{normal:copy(current.binding),identityDigest:sha256(canonical(first.frame.identity)),migrationId:ctx.migrationId,planDigest:verified.plan.planDigest},solution:legacy.snapshot?{...copy(legacy.snapshot),solutionOrigin:'LEGACY_IMPORT',wasSolved:legacy.wasSolved}:null});}
  await phase(db,op,{witnesses:[...first.witnesses,...calendarWitnesses],keyCount:first.keyCount,keyDigest:first.keyDigest,calendarKeys:allowedCalendarKeys,hasMigration:!!first.migration.manifest},sourceRaw);op.check();if(c.readSource(cfg.sourcePort)!==sourceRaw)c.fail('SOURCE_CHANGED');
  return c.freeze(inspectOnly?{originKind:verified?verified.proof.kind==='LEGACY_IMPORT'?'LEGACY_IMPORT':'REGULAR_INIT':'REGULAR_EXISTING',sourceRaw,preserved:{calendar:copy(first.migration.assets?.data.calendar??null),boosters:copy(first.migration.assets?.data.boosters??null)}}:output);
 }finally{db?.close();if(db)handles.delete(db);op.done();}}
 return Object.freeze({read:(normalResult,options)=>read(normalResult,options),inspect:options=>read(null,options,true),diagnostics:()=>c.freeze(copy(metrics)),async close(){closed=true;generation++;for(const control of controls)control.abort();for(const db of handles)db.close();handles.clear();}});
}
