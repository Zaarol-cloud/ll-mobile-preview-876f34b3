import * as activation from './d205-activation-contract.mjs';
import * as handover from './d205-handover-contract.mjs';
import {SOURCE,createLegacySourceValidator,FIXTURE_PROJECTION_SHA256} from './d205-legacy-source.mjs';
import {initTransition,INIT_ID} from './personal-player-action-contract.mjs';
import {records} from './personal-chest-instance-read-factories.mjs';
import * as data from './personal-chest-storage-contract.mjs';

// Pure local consistency contract. No clock read, storage, DB, booking or UI.
// A PREPARED result is private transaction input, never proof of a DB commit.
export const CALENDAR_CONTRACT_VERSION=1,LEVEL_COUNT=30,MAX_CLAIMS=30,MAX_WRITES=3;
export const MAX_DOCUMENT_BYTES=1024*1024,MAX_EVIDENCE_BYTES=16*1024*1024;
const freeze=activation.freeze,fail=data.fail,{copy,exact,canonical,digest,sha256}=data;
const fields=['cookies','lockpicks','booster5','booster10','booster25'];
const zeroBoosters=()=>({booster5:0,booster10:0,booster25:0,totalBoost:0});
const eq=(a,b,code)=>{if(canonical(a)!==canonical(b))fail(code);};
const integer=(n,min=0)=>{data.revision(n,min);return n;};
const add=(a,b)=>{integer(a);integer(b);if(a>Number.MAX_SAFE_INTEGER-b)fail('CALENDAR_OVERFLOW');return a+b;};
const hex=(v,code)=>{if(typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v))fail(code);return v;};
function own(value,keys){const out=activation.ownOptions(value,keys);if(Object.keys(out).length!==keys.length)fail('INVALID_FIELDS');return out;}
export function requireUtcDay(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))fail('CALENDAR_DAY_INVALID');
 const parsed=new Date(value+'T00:00:00.000Z');if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==value)fail('CALENDAR_DAY_INVALID');return value;
}
export function utcDayFromMillis(value){if(typeof value!=='number'||!Number.isFinite(value))fail('CALENDAR_CLOCK_INVALID');const d=new Date(value);if(!Number.isFinite(d.getTime()))fail('CALENDAR_CLOCK_INVALID');return requireUtcDay(d.toISOString().slice(0,10));}
function bounded(value){const out=copy(value),stack=[out];let chars=0;while(stack.length){const v=stack.pop();if(typeof v==='string'){chars+=v.length;if(chars>MAX_DOCUMENT_BYTES)fail('CALENDAR_DOCUMENT_LIMIT');}else if(v&&typeof v==='object')stack.push(...Object.values(v));}if(new TextEncoder().encode(canonical(out)).length>MAX_DOCUMENT_BYTES)fail('CALENDAR_DOCUMENT_LIMIT');return out;}
function boosters(value){const v=exact(value,['booster5','booster10','booster25','totalBoost']);for(const n of Object.values(v))integer(n);const sum=BigInt(v.booster5)*5n+BigInt(v.booster10)*10n+BigInt(v.booster25)*25n;if(sum>BigInt(Number.MAX_SAFE_INTEGER)||sum!==BigInt(v.totalBoost))fail('CALENDAR_BOOSTERS_INVALID');return v;}
function addBoosters(before,reward){const out={};for(const k of ['booster5','booster10','booster25'])out[k]=add(before[k],reward[k]);const total=BigInt(out.booster5)*5n+BigInt(out.booster10)*10n+BigInt(out.booster25)*25n;if(total>BigInt(Number.MAX_SAFE_INTEGER))fail('CALENDAR_OVERFLOW');return {...out,totalBoost:Number(total)};}
const claimFields=['calendarClaimVersion','calendarId','originDigest','configDigest','request','fingerprint','beforePlayer','beforeContext','beforeAssetsDigest','reward','afterPlayerDigest'];
const requestFields=['calendarRequestVersion','uid','calendarId','originDigest','configDigest','requestId','level','dayKey','expectedPlayerRevision','expectedPlayerDigest','expectedAssetsRevision','expectedAssetsDigest','expectedContextDigest'];

export function createPersonalCalendarContract(value){
 const cfg=own(value,['sourceOrigin','fixtureRaw']),ctx=activation.context(handover.context({...activation.TARGET,sourceOrigin:cfg.sourceOrigin}));
 // The frozen validator checks exact fixture bytes. No caller-defined rewards.
 const validator=createLegacySourceValidator({fixtureRaw:cfg.fixtureRaw,source:SOURCE}),fixture=JSON.parse(cfg.fixtureRaw);
 const levels=freeze(fixture.calendarLevels.map((entry,index)=>{if(entry.level!==index+1)fail('CALENDAR_CONFIG_INVALID');const free=exact(entry.free,fields);for(const n of Object.values(free))integer(n);return {level:entry.level,free};}));
 if(levels.length!==LEVEL_COUNT)fail('CALENDAR_CONFIG_INVALID');
 // One fixed release boundary for the first public V2 demo. Never rotate this
 // token on rebuild: stored V2 claims must keep the same calendar identity.
 // Existing localhost test histories retain their exact previous configuration.
 const restartLegacyCalendar=ctx.sourceOrigin==='https://zaarol-cloud.github.io';
 const configuration=freeze({calendarContractVersion:CALENDAR_CONTRACT_VERSION,dayBoundary:'UTC',levelCount:LEVEL_COUNT,fixtureSha256:FIXTURE_PROJECTION_SHA256,levels,...(restartLegacyCalendar?{legacyCalendarPolicy:'teacher-demo-v2-20261103'}:{})});
 const configDigest=digest(configuration),bases=new WeakMap();
 const reference=(kind,id='current')=>{if(kind==='PLAYER')return {uid:ctx.uid,kind,id:'current'};if(kind==='CALENDAR_ASSETS'){if(id!=='current')fail('CALENDAR_ID_INVALID');}else if(kind==='CALENDAR_CLAIM')hex(id,'CALENDAR_ID_INVALID');else fail('CALENDAR_KIND_INVALID');return {uid:ctx.uid,kind,id};};
 const claimId=(base,level)=>digest({domain:'lockloot/free-calendar-claim/v1',calendarId:base.calendarId,level});
 function baseProof(value){if(!bases.has(value))fail('CALENDAR_BASE_PROOF_REQUIRED');return value;}
 function player(value,base){const p=records.requirePlayerReadDocument(bounded(value),{uid:ctx.uid});if(!p||p.revision<base.basePlayer.revision||p.documentVersion<base.basePlayer.documentVersion)fail('CALENDAR_PLAYER_BEFORE_BASE');if(p.revision===base.basePlayer.revision)eq(p,base.basePlayer,'CALENDAR_PLAYER_BASE_CONFLICT');return p;}
 function context(value,p){const v=exact(bounded(value),['head','identity','chest','start']);records.requireActiveReadSet({uid:ctx.uid,...v,player:p});return v;}
 function source(base,raw){baseProof(base);if(raw!==bases.get(base).sourceRaw)fail('CALENDAR_SOURCE_CHANGED');}
 function verifyBase(value){
  const v=own(value,['frame','sourceRaw']),f=own(v.frame,['manifest','source','player','origin','assets','learning','init']);let kind,basePlayer,historicalAssets;
  if(f.manifest!==null){const verified=activation.verifyCommitted(ctx,f,validator);if(v.sourceRaw!==verified.plan.fenceRaw)fail('CALENDAR_SOURCE_CONFLICT');
   // No adoption of an unproved later LEGACY_ASSETS advance as a new origin.
   eq(f.assets,verified.plan.assets,'CALENDAR_HISTORICAL_ASSETS_CHANGED');kind=verified.plan.origin?'IMPORT':'INIT';basePlayer=copy(verified.plan.basePlayer);historicalAssets=copy(f.assets);
  }else{if(v.sourceRaw!==null||f.source!==null||f.origin!==null||f.assets!==null||f.learning!==null)fail('CALENDAR_ORIGIN_CONFLICT');const initial=initTransition(ctx.uid,null,null);eq(f.init,initial.writes[1],'CALENDAR_INIT_UNPROVEN');basePlayer=copy(initial.writes[0]);historicalAssets=null;kind='INIT';}
  const p=records.requirePlayerReadDocument(f.player,{uid:ctx.uid});if(!p||p.revision<basePlayer.revision)fail('CALENDAR_PLAYER_BEFORE_BASE');if(p.revision===basePlayer.revision)eq(p,basePlayer,'CALENDAR_PLAYER_BASE_CONFLICT');
  const cal=historicalAssets?.data.calendar??{progress:0,lastDay:null,revision:0},boost=boosters(historicalAssets?.data.boosters??zeroBoosters());
  // Keep historical origin evidence and previously awarded assets untouched.
  // Only the initial calendar position changes; reading this basis never pays a reward.
  const baseline={progress:restartLegacyCalendar?0:cal.progress,lastDay:restartLegacyCalendar?null:cal.lastDay,calendarRevision:restartLegacyCalendar?0:cal.revision,boosters:boost};integer(baseline.progress);integer(baseline.calendarRevision);if(baseline.progress>LEVEL_COUNT||(baseline.progress===0?baseline.lastDay!==null:baseline.lastDay===null))fail('CALENDAR_BASE_INVALID');if(baseline.lastDay!==null)requireUtcDay(baseline.lastDay);
  const evidence=[['manifest',handover.manifestRef(ctx)],['source',f.source?activation.reference('LEGACY_SOURCE',f.source.id):null],['origin',activation.reference('IMPORT_ORIGIN')],['assets',activation.reference('LEGACY_ASSETS')],['learning',activation.reference('LEGACY_LEARNING',ctx.migrationId)],['init',activation.reference('ACTION',INIT_ID)]].filter(([,r])=>r).map(([name,ref])=>({ref,documentDigest:digest(f[name])}));
  const originDigest=digest({domain:'lockloot/free-calendar-origin/v1',context:ctx,kind,basePlayer,historicalAssets,evidence,sourceRawDigest:v.sourceRaw===null?null:sha256(v.sourceRaw)}),calendarId=digest({domain:'lockloot/free-calendar/v1',uid:ctx.uid,originDigest,configDigest});
  const proof=freeze({calendarBaseVersion:1,uid:ctx.uid,kind,sourceOrigin:ctx.sourceOrigin,databaseName:ctx.databaseName,calendarId,originDigest,configDigest,basePlayer,baseline,historicalAssets});bases.set(proof,{evidence,sourceRaw:v.sourceRaw});return proof;
 }
 function requireRequest(value,base){baseProof(base);const r=exact(value,requestFields);if(r.calendarRequestVersion!==1||r.uid!==ctx.uid||r.calendarId!==base.calendarId||r.originDigest!==base.originDigest||r.configDigest!==configDigest)fail('CALENDAR_REQUEST_BINDING');data.id(r.requestId);if(r.requestId===INIT_ID)fail('CALENDAR_RESERVED_REQUEST');integer(r.level,1);if(r.level>LEVEL_COUNT)fail('CALENDAR_LEVEL_INVALID');requireUtcDay(r.dayKey);integer(r.expectedPlayerRevision,1);integer(r.expectedAssetsRevision);if(r.expectedAssetsRevision>MAX_CLAIMS)fail('CALENDAR_REVISION_INVALID');for(const k of ['expectedPlayerDigest','expectedAssetsDigest','expectedContextDigest'])hex(r[k],'CALENDAR_EXPECTATION_INVALID');return freeze(r);}
 const state=(base,assets)=>assets?copy(assets.data):{calendarAssetsVersion:1,calendarId:base.calendarId,originDigest:base.originDigest,configDigest,baseProgress:base.baseline.progress,progress:base.baseline.progress,lastDay:base.baseline.lastDay,calendarRevision:base.baseline.calendarRevision,boosters:copy(base.baseline.boosters),claims:[]};
 function requestMatches(r,p,assets,frame){if(r.expectedPlayerRevision!==p.revision||r.expectedPlayerDigest!==digest(p)||r.expectedAssetsRevision!==(assets?.revision??0)||r.expectedAssetsDigest!==digest(assets)||r.expectedContextDigest!==digest(frame))fail('CALENDAR_STALE_READSET');}
 function eligibility(s,day){requireUtcDay(day);if(s.progress===LEVEL_COUNT)fail('CALENDAR_CYCLE_COMPLETED');if(s.lastDay===day)fail('CALENDAR_ALREADY_CLAIMED_TODAY');if(s.lastDay!==null&&s.lastDay>day)fail('CALENDAR_DAY_NOT_ADVANCED');}
 function next(base,r,p,frame,assets){
  const s=state(base,assets);requestMatches(r,p,assets,frame);eligibility(s,r.dayKey);if(r.level!==s.progress+1)fail('CALENDAR_LEVEL_STALE');if(s.claims.some(c=>c.requestId===r.requestId))fail('CALENDAR_REQUEST_COLLISION');
  const reward=copy(levels[r.level-1].free),afterPlayer=copy(p);afterPlayer.revision=add(p.revision,1);afterPlayer.data.cookies=add(p.data.cookies,reward.cookies);afterPlayer.data.lockpicks=add(p.data.lockpicks,reward.lockpicks);records.requirePlayerReadDocument(afterPlayer,{uid:ctx.uid});
  const doc={documentVersion:1,...reference('CALENDAR_CLAIM',claimId(base,r.level)),revision:1,data:{calendarClaimVersion:1,calendarId:base.calendarId,originDigest:base.originDigest,configDigest,request:r,fingerprint:digest({uid:ctx.uid,kind:'FREE_CALENDAR_CLAIM',request:r}),beforePlayer:copy(p),beforeContext:copy(frame),beforeAssetsDigest:digest(assets),reward,afterPlayerDigest:digest(afterPlayer)}};
  const entry={level:r.level,requestId:r.requestId,claimId:doc.id,claimDigest:digest(doc)},afterAssets={documentVersion:1,...reference('CALENDAR_ASSETS'),revision:add(assets?.revision??0,1),data:{...s,progress:r.level,lastDay:r.dayKey,calendarRevision:add(s.calendarRevision,1),boosters:addBoosters(s.boosters,reward),claims:[...s.claims,entry]}};
  bounded(doc);bounded(afterAssets);return freeze({claim:doc,player:afterPlayer,assets:afterAssets});
 }
 function verifyEvidence(value){
  const v=own(value,['base','assets','claims']),base=baseProof(v.base);if(!Array.isArray(v.claims)||v.claims.length>MAX_CLAIMS)fail('CALENDAR_CLAIM_LIMIT');let assets=null,lastPlayer=base.basePlayer,totalBytes=0;const claims=[];
  for(const raw of v.claims){const claim=exact(bounded(raw),['documentVersion','uid','kind','id','revision','data']);totalBytes+=new TextEncoder().encode(canonical(claim)).length;if(totalBytes>MAX_EVIDENCE_BYTES)fail('CALENDAR_EVIDENCE_LIMIT');
   if(claim.documentVersion!==1||claim.uid!==ctx.uid||claim.kind!=='CALENDAR_CLAIM'||claim.revision!==1)fail('CALENDAR_CLAIM_DOCUMENT');const a=exact(claim.data,claimFields);if(a.calendarClaimVersion!==1||a.calendarId!==base.calendarId||a.originDigest!==base.originDigest||a.configDigest!==configDigest)fail('CALENDAR_CLAIM_BINDING');
   const r=requireRequest(a.request,base),p=player(a.beforePlayer,base),frame=context(a.beforeContext,p);if(p.revision<lastPlayer.revision||p.documentVersion<lastPlayer.documentVersion||p.data.points<lastPlayer.data.points)fail('CALENDAR_PLAYER_REGRESSION');if(p.revision===lastPlayer.revision)eq(p,lastPlayer,'CALENDAR_PLAYER_LINK_CONFLICT');
   const computed=next(base,r,p,frame,assets);eq(claim,computed.claim,'CALENDAR_CLAIM_CHANGED');assets=computed.assets;lastPlayer=computed.player;claims.push(claim);
  }
  eq(v.assets,assets,'CALENDAR_ASSETS_EVIDENCE_MISMATCH');return freeze({scope:'CALENDAR_CHAIN_ONLY',resourceHistoryVerified:false,base,assets,claims,lastPlayer,state:state(base,assets)});
 }
 function verifyPlayerEvidence(value){const v=own(value,['base','player','assets','claims']),history=verifyEvidence({base:v.base,assets:v.assets,claims:v.claims}),p=player(v.player,history.base);if(p.revision<history.lastPlayer.revision||p.documentVersion<history.lastPlayer.documentVersion||p.data.points<history.lastPlayer.data.points)fail('CALENDAR_PLAYER_REGRESSION');if(p.revision===history.lastPlayer.revision)eq(p,history.lastPlayer,'CALENDAR_CURRENT_PLAYER_CHANGED');return freeze({...history,player:p});}
 function current(value){const v=own(value,['base','player','context','assets','claims']),history=verifyPlayerEvidence({base:v.base,player:v.player,assets:v.assets,claims:v.claims});return {...history,context:context(v.context,history.player)};}
 function makeRequest(value){const v=own(value,['base','current','requestId','dayKey']),s=current({base:v.base,...own(v.current,['player','context','assets','claims'])});if(s.state.progress===LEVEL_COUNT)fail('CALENDAR_CYCLE_COMPLETED');return requireRequest({calendarRequestVersion:1,uid:ctx.uid,calendarId:s.base.calendarId,originDigest:s.base.originDigest,configDigest,requestId:v.requestId,level:s.state.progress+1,dayKey:v.dayKey,expectedPlayerRevision:s.player.revision,expectedPlayerDigest:digest(s.player),expectedAssetsRevision:s.assets?.revision??0,expectedAssetsDigest:digest(s.assets),expectedContextDigest:digest(s.context)},s.base);}
 function readSet(base,s,claim){const map=new Map(),addWitness=(ref,hash)=>{const key=canonical(ref),prior=map.get(key);if(prior&&prior.documentDigest!==hash)fail('CALENDAR_WITNESS_CONFLICT');map.set(key,{ref,documentDigest:hash});};for(const w of bases.get(base).evidence)addWitness(w.ref,w.documentDigest);addWitness(reference('PLAYER'),digest(s.player));addWitness(reference('CALENDAR_ASSETS'),digest(s.assets));for(const c of s.claims)addWitness(reference('CALENDAR_CLAIM',c.id),digest(c));for(const [name,kind]of [['head','HEAD'],['identity','LOCAL_IDENTITY']])addWitness({uid:ctx.uid,kind,id:'current'},digest(s.context[name]));for(const [name,kind]of [['chest','CHEST'],['start','REQUEST']])if(s.context[name])addWitness({uid:ctx.uid,kind,id:s.context[name].id},digest(s.context[name]));addWitness(reference('CALENDAR_CLAIM',claim.id),claim.digest);return [...map.values()];}
 function prepareClaim(value){
  const v=own(value,['base','current','request','currentDay','sourceRaw','addressedClaim']),base=baseProof(v.base);source(base,v.sourceRaw);requireUtcDay(v.currentDay);const s=current({base,...own(v.current,['player','context','assets','claims'])}),r=requireRequest(v.request,base),known=s.claims.find(c=>c.data.request.requestId===r.requestId);let writes,claim,replayed;
  if(known){eq(known.data.request,r,'CALENDAR_REQUEST_COLLISION');eq(v.addressedClaim,known,'CALENDAR_REPLAY_EVIDENCE_MISSING');claim=known;writes=[];replayed=true;}
  else{if(v.addressedClaim!==null)fail('CALENDAR_UNREFERENCED_CLAIM');if(r.dayKey!==v.currentDay)fail('CALENDAR_REQUEST_DAY_STALE');eligibility(s.state,v.currentDay);const plan=next(base,r,s.player,s.context,s.assets);claim=plan.claim;writes=[plan.player,plan.assets,plan.claim];replayed=false;}
  const witnesses=readSet(base,s,{id:claim.id,digest:replayed?digest(claim):digest(null)});
  return freeze({calendarPlanVersion:1,status:replayed?'REPLAY':'PREPARED',committed:false,resourceHistoryVerified:false,replayed,uid:ctx.uid,calendarId:base.calendarId,requestId:r.requestId,readSet:witnesses,writes,receipt:{calendarReceiptVersion:1,uid:ctx.uid,calendarId:base.calendarId,requestId:r.requestId,level:r.level,dayKey:r.dayKey,reward:copy(claim.data.reward),claimDigest:digest(claim)},sourceBinding:{sourceOrigin:ctx.sourceOrigin,key:SOURCE.progressKey,rawDigest:v.sourceRaw===null?null:sha256(v.sourceRaw)},requiredExternalChecks:['NATIVE_ATOMIC_READSET_COMMIT','CURRENT_RESOURCE_HISTORY_CONTINUITY','SOURCE_FENCE_RECHECK','CURRENT_UTC_DAY_AT_COMMIT']});
 }
 function inspect(value){const v=own(value,['base','current','currentDay']),s=current({base:v.base,...own(v.current,['player','context','assets','claims'])});requireUtcDay(v.currentDay);let reason=null;try{eligibility(s.state,v.currentDay);}catch(e){reason=e.code;}return freeze({calendarViewVersion:1,calendarId:s.base.calendarId,originDigest:s.base.originDigest,configDigest,progress:s.state.progress,lastDay:s.state.lastDay,revision:s.state.calendarRevision,boosters:copy(s.state.boosters),premiumEntitled:false,cycleCompleted:s.state.progress===LEVEL_COUNT,nextLevel:s.state.progress===LEVEL_COUNT?null:s.state.progress+1,nextReward:s.state.progress===LEVEL_COUNT?null:copy(levels[s.state.progress].free),todayClaimed:s.state.lastDay===v.currentDay,claimAvailable:reason===null,reason});}
 // The finite native reader can address every possible receipt, including
 // absence witnesses, without scanning the store or inventing a second ID rule.
 function claimReference(base,level){baseProof(base);integer(level,1);if(level>LEVEL_COUNT)fail('CALENDAR_LEVEL_INVALID');return freeze(reference('CALENDAR_CLAIM',claimId(base,level)));}
 return Object.freeze({configuration,configDigest,verifyBase,requireBase:baseProof,requireSource:source,requireRequest,verifyEvidence,verifyPlayerEvidence,makeRequest,prepareClaim,inspect,claimReference});
}
