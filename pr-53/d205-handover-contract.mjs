import {copy,exact,canonical,digest,sha256,uid as requireUid} from './personal-chest-storage-contract.mjs';
import {SOURCE,LIMITS,requireValidatedLegacySource} from './d205-legacy-source.mjs';
export const MAX_SNAPSHOTS=LIMITS.operations+2,MAX_KEYS=MAX_SNAPSHOTS+1;
export const helpers={copy,exact,canonical,digest,sha256};
export const fail=code=>{throw Object.assign(new TypeError(code),{code});};
export function freeze(v){if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
export function ownOptions(v,keys){if(!v||![Object.prototype,null].includes(Object.getPrototypeOf(v)))fail('INVALID_OPTIONS');const r={};for(const k of Reflect.ownKeys(v)){const d=Object.getOwnPropertyDescriptor(v,k);if(typeof k!=='string'||!keys.includes(k)||!d.enumerable||!Object.hasOwn(d,'value'))fail('INVALID_OPTIONS');r[k]=d.value;}return r;}
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export function context(value){const v=exact(value,['uid','databaseName','sourceOrigin']);requireUid(v.uid);
 if(typeof v.databaseName!=='string'||!/^lockloot-d203c2-b4-[A-Za-z0-9_-]{1,80}$/.test(v.databaseName))fail('ISOLATED_DATABASE_REQUIRED');
 let url;try{url=new URL(v.sourceOrigin);}catch{fail('SOURCE_ORIGIN_INVALID');}if(!['http:','https:'].includes(url.protocol)||url.origin!==v.sourceOrigin)fail('SOURCE_ORIGIN_INVALID');
 return freeze({...v,migrationId:sha256(canonical({domain:'lockloot/teacher-demo-handover/v1',sourceOrigin:v.sourceOrigin,progressKey:SOURCE.progressKey}))});
}
export function boundContext(value){const v=exact(value,['uid','databaseName','sourceOrigin','migrationId']),ctx=context({uid:v.uid,databaseName:v.databaseName,sourceOrigin:v.sourceOrigin});if(v.migrationId!==ctx.migrationId)fail('CONTEXT_INVALID');return ctx;}
export const key=r=>canonical(exact(r,['uid','kind','id']));
export const reference=(ctx,kind,id)=>({uid:ctx.uid,kind,id});
export const manifestRef=ctx=>reference(ctx,'MIGRATION',ctx.migrationId);
const snapshotId=(ctx,status,sourceDigest)=>digest({domain:'lockloot/teacher-demo-source/v1',migrationId:ctx.migrationId,status,sourceDigest});
const observations=new WeakSet(),candidates=new WeakSet();
export function observe(raw,validator){
 if(raw===null){const o=freeze({status:'ABSENT',raw:null,proposal:null,sourceDigest:null,operationCount:null,setId:null});observations.add(o);return o;}
 if(typeof raw!=='string')fail('SOURCE_READ_TYPE');
 // Recognize a later-stage fence without ever interpreting it as absence or
 // attempting to repair it. B1 has no freeze/activation API.
 if(raw.length<=2*LIMITS.rawBytes+65536){try{if(JSON.parse(raw)?.schemaVersion===2)fail('SOURCE_FROZEN_UNSUPPORTED');}catch(e){if(e.code)throw e;}}
 const p=requireValidatedLegacySource(validator.inspect(raw));
 const o=freeze({status:'PRESENT',raw,proposal:p,sourceDigest:p.source.rawSha256,operationCount:p.evidence.operationCount,setId:p.oldState.setId});observations.add(o);return o;
}
const requireObservation=o=>{if(!observations.has(o))fail('SOURCE_OBSERVATION_REQUIRED');return o;};
export function revalidateObservation(observation,raw){const o=requireObservation(observation);if(raw!==null&&typeof raw!=='string')fail('SOURCE_READ_TYPE');if(raw!==o.raw)fail('SOURCE_CHANGED_DURING_PREPARATION');}
export function manifestDocument(value,ctx){const d=exact(value,['documentVersion','uid','kind','id','revision','data']);
 if(d.documentVersion!==1||d.uid!==ctx.uid||d.kind!=='MIGRATION'||d.id!==ctx.migrationId||!Number.isSafeInteger(d.revision)||d.revision<1)fail('MIGRATION_DOCUMENT_INVALID');
 const a=exact(d.data,['handoverVersion','phase','source','sourceOrigin','target','snapshotIds','selectedSnapshotId']);
 if(a.handoverVersion!==1||a.phase!=='PREPARED'||canonical(a.source)!==canonical(SOURCE)||a.sourceOrigin!==ctx.sourceOrigin)fail('MIGRATION_BINDING_INVALID');
 if(canonical(a.target)!==canonical({uid:ctx.uid,databaseName:ctx.databaseName}))fail('TARGET_BINDING_MISMATCH');
 if(!Array.isArray(a.snapshotIds)||a.snapshotIds.length<1||a.snapshotIds.length>MAX_SNAPSHOTS||a.snapshotIds.some(x=>!hex(x))||new Set(a.snapshotIds).size!==a.snapshotIds.length||a.selectedSnapshotId!==a.snapshotIds.at(-1)||d.revision!==a.snapshotIds.length)fail('MIGRATION_MANIFEST_INVALID');return freeze(d);
}
export function sourceDocument(value,ctx,id){const d=exact(value,['documentVersion','uid','kind','id','revision','data']);
 if(d.documentVersion!==1||d.uid!==ctx.uid||d.kind!=='LEGACY_SOURCE'||d.id!==id||d.revision!==1)fail('SOURCE_DOCUMENT_INVALID');
 const a=exact(d.data,['migrationId','source','status','sourceDigest','raw','operationCount','setId']);
 if(a.migrationId!==ctx.migrationId||canonical(a.source)!==canonical(SOURCE)||!['PRESENT','ABSENT'].includes(a.status))fail('SOURCE_DOCUMENT_BINDING');
 if(a.status==='ABSENT'){if([a.sourceDigest,a.raw,a.operationCount,a.setId].some(v=>v!==null))fail('SOURCE_ABSENCE_INVALID');}
 else if(typeof a.raw!=='string'||a.raw.length>LIMITS.rawBytes||!a.raw.isWellFormed()||new TextEncoder().encode(a.raw).length>LIMITS.rawBytes||!hex(a.sourceDigest)||sha256(a.raw)!==a.sourceDigest||!Number.isSafeInteger(a.operationCount)||a.operationCount<0||a.operationCount>LIMITS.operations||!Number.isSafeInteger(a.setId)||a.setId<0||a.setId>63)fail('SOURCE_DOCUMENT_CONTENT');
 if(id!==snapshotId(ctx,a.status,a.sourceDigest))fail('SOURCE_DOCUMENT_ID');return freeze(d);
}
export function ownedKeys(ctx,manifest){return manifest?[key(manifestRef(ctx)),...manifest.data.snapshotIds.map(id=>key(reference(ctx,'LEGACY_SOURCE',id)))].sort():[];}
export function requireKeySet(ctx,manifest,keys){if(keys.length>MAX_KEYS||canonical([...keys].sort())!==canonical(ownedKeys(ctx,manifest)))fail('TARGET_NOT_EMPTY');}
function continuation(previous,next){
 if(previous.status==='ABSENT')return;
 if(next.status==='ABSENT')fail('SOURCE_REMOVED');
 if(next.setId!==previous.setId||next.operationCount<=previous.operationCount)fail('SOURCE_NOT_ADVANCED');
 const a=JSON.parse(previous.raw),b=JSON.parse(next.raw);
 for(const [id,entry]of Object.entries(a.operations))if(!Object.hasOwn(b.operations,id)||canonical(entry)!==canonical(b.operations[id]))fail('SOURCE_PREFIX_CHANGED');
 if(a.calendar.progress>0&&(b.calendar.progress===a.calendar.progress?b.calendar.lastDay!==a.calendar.lastDay:b.calendar.lastDay<=a.calendar.lastDay))fail('SOURCE_DATE_REGRESSION');
}
export function prepareCandidate(ctx,observation,current,validator){ctx=boundContext(ctx);const next=requireObservation(observation),s=exact(current,['manifest','snapshot']);let old=null;
 if(s.manifest!==null){s.manifest=manifestDocument(s.manifest,ctx);s.snapshot=sourceDocument(s.snapshot,ctx,s.manifest.data.selectedSnapshotId);old=observe(s.snapshot.data.raw,validator);
  if(old.status!==s.snapshot.data.status||old.operationCount!==s.snapshot.data.operationCount||old.setId!==s.snapshot.data.setId)fail('SOURCE_SUMMARY_MISMATCH');
 }else if(s.snapshot!==null)fail('ORPHAN_SOURCE_DOCUMENT');
 const replay=old&&old.status===next.status&&old.raw===next.raw;
 if(old&&!replay)continuation(old,next);
 const id=snapshotId(ctx,next.status,next.sourceDigest),ids=s.manifest?[...s.manifest.data.snapshotIds]:[];
 if(!replay){if(ids.length===MAX_SNAPSHOTS||ids.includes(id))fail('SNAPSHOT_LIMIT');ids.push(id);}
 const snapshot=replay?s.snapshot:freeze({documentVersion:1,...reference(ctx,'LEGACY_SOURCE',id),revision:1,data:{migrationId:ctx.migrationId,source:SOURCE,status:next.status,sourceDigest:next.sourceDigest,raw:next.raw,operationCount:next.operationCount,setId:next.setId}});
 const manifest=replay?s.manifest:freeze({documentVersion:1,...manifestRef(ctx),revision:ids.length,data:{handoverVersion:1,phase:'PREPARED',source:SOURCE,sourceOrigin:ctx.sourceOrigin,target:{uid:ctx.uid,databaseName:ctx.databaseName},snapshotIds:ids,selectedSnapshotId:id}});
 sourceDocument(snapshot,ctx,id);manifestDocument(manifest,ctx);
 const p=freeze({ctx,expectedManifest:s.manifest?digest(s.manifest):null,expectedSnapshot:s.snapshot?digest(s.snapshot):null,manifest,snapshot,replayed:!!replay});candidates.add(p);return p;
}
export function requireCandidate(p){if(!candidates.has(p))fail('PREPARED_CANDIDATE_REQUIRED');return p;}
export function receipt(p){requireCandidate(p);return freeze({preparationVersion:1,status:'PREPARED',migrationId:p.ctx.migrationId,snapshotId:p.snapshot.id,manifestRevision:p.manifest.revision,sourceStatus:p.snapshot.data.status,operationCount:p.snapshot.data.operationCount,resourceAvailability:'NONE',replayed:p.replayed});}
