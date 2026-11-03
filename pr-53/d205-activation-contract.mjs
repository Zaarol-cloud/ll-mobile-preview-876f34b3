import * as b from './d205-handover-contract.mjs';
import {SOURCE,LIMITS,createLegacySourceValidator,requireValidatedLegacySource} from './d205-legacy-source.mjs';
import {createLegacySolution} from './d205-legacy-solution.mjs';
import {initTransition,document as actionDocument,ref as actionRef,INIT_ID} from './personal-player-action-contract.mjs';
import {records} from './personal-chest-instance-read-factories.mjs';
export const TARGET=Object.freeze({uid:'d2-personal-local-v1',databaseName:'lockloot-d203c2-b4-1'});
export const PROFILE='PRESERVE_LOCAL_DEMO_V1',MAX_FENCE_BYTES=2*LIMITS.rawBytes+16384,MAX_WRITES=5;
export const {fail,freeze,ownOptions}=b;export const helpers=b.helpers;
const {copy,exact,canonical,digest,sha256}=helpers,plans=new WeakSet();
const eq=(a,z,code)=>{if(canonical(a)!==canonical(z))fail(code);};
const integer=(n,min=0)=>{if(!Number.isSafeInteger(n)||n<min)fail('ACTIVATION_INTEGER_INVALID');return n;};
function date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))fail('ASSETS_DATE_INVALID');const [y,m,d]=value.split('-').map(Number),leap=y%4===0&&(y%100!==0||y%400===0);if(m<1||m>12||d<1||d>[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][m-1])fail('ASSETS_DATE_INVALID');}
export function context(value){const c=b.boundContext(value);if(c.uid!==TARGET.uid||c.databaseName!==TARGET.databaseName)fail('ACTIVATION_TARGET_REQUIRED');if(c.sourceOrigin.length>512)fail('SOURCE_ORIGIN_TOO_LONG');return c;}
export const reference=(kind,id='current')=>({uid:TARGET.uid,kind,id});
export const key=b.key;
const row=(kind,id,data)=>freeze({documentVersion:1,...reference(kind,id),revision:1,data});
export function sourcePort(value){const p=ownOptions(value,['read','replace']);if(typeof p.read!=='function'||typeof p.replace!=='function')fail('SYNC_SOURCE_PORT_REQUIRED');return Object.freeze(p);}
export function readSource(port){let raw;try{raw=port.read(SOURCE.progressKey);}catch{fail('SOURCE_READ_FAILED');}if(raw!==null&&typeof raw!=='string')fail('SYNC_SOURCE_READ_REQUIRED');if(raw!==null&&(raw.length>MAX_FENCE_BYTES||!raw.isWellFormed()||new TextEncoder().encode(raw).length>MAX_FENCE_BYTES))fail('SOURCE_SIZE_INVALID');return raw;}
export function parseFence(raw){
 if(typeof raw!=='string'||raw.length>MAX_FENCE_BYTES||!raw.isWellFormed()||new TextEncoder().encode(raw).length>MAX_FENCE_BYTES)fail('FENCE_SIZE_INVALID');
 let f;try{f=JSON.parse(raw);}catch{fail('FENCE_JSON_INVALID');}
 f=exact(f,['schemaVersion','kind','migrationId','snapshotId','source','sourceOrigin','target','sourcePresence','legacyRaw','legacyRawSha256','activationContractVersion','preservationProfile','preparedManifestDigest','planDigest']);
 if(f.schemaVersion!==2||f.kind!=='LOCKLOOT_D205_FENCE'||f.activationContractVersion!==1||f.preservationProfile!==PROFILE)fail('FENCE_VERSION_INVALID');
 eq(f.source,SOURCE,'FENCE_SOURCE_INVALID');eq(f.target,TARGET,'FENCE_TARGET_INVALID');
 const bound=context(b.context({...TARGET,sourceOrigin:f.sourceOrigin}));if(bound.migrationId!==f.migrationId)fail('FENCE_BINDING_INVALID');
 for(const field of ['migrationId','snapshotId','preparedManifestDigest','planDigest'])if(typeof f[field]!=='string'||!/^[a-f0-9]{64}$/.test(f[field]))fail('FENCE_BINDING_INVALID');
 if(f.sourcePresence==='ABSENT'){if(f.legacyRaw!==null||f.legacyRawSha256!==null)fail('FENCE_ABSENCE_INVALID');}
 else if(f.sourcePresence!=='PRESENT'||typeof f.legacyRaw!=='string'||f.legacyRaw.length>LIMITS.rawBytes||!f.legacyRaw.isWellFormed()||new TextEncoder().encode(f.legacyRaw).length>LIMITS.rawBytes||sha256(f.legacyRaw)!==f.legacyRawSha256)fail('FENCE_CONTENT_INVALID');
 return freeze(f);
}
export function makePlan(value,current,validator){const ctx=context(value),pair=exact(current,['manifest','source']);
 const m=b.manifestDocument(pair.manifest,ctx),s=b.sourceDocument(pair.source,ctx,m.data.selectedSnapshotId);
 const observation=b.observe(s.data.raw,validator);if(observation.status!==s.data.status||observation.operationCount!==s.data.operationCount||observation.setId!==s.data.setId)fail('SOURCE_SUMMARY_MISMATCH');
 const p=observation.proposal===null?null:requireValidatedLegacySource(observation.proposal),legacy=!!p;
 const basePlayer=legacy?row('PLAYER','current',{walletVersion:1,cookies:p.oldState.wallet.cookies,lockpicks:p.oldState.wallet.lockpicks,points:0}):initTransition(ctx.uid,null,null).writes[0];
 actionDocument(basePlayer,actionRef(ctx.uid,'PLAYER'));
 const assets=row('LEGACY_ASSETS','current',{assetsVersion:1,profile:PROFILE,migrationId:ctx.migrationId,snapshotId:s.id,sourceDigest:s.data.sourceDigest,sourcePresence:s.data.status,
  calendar:legacy?copy(p.oldState.calendar):null,boosters:legacy?Object.fromEntries(['booster5','booster10','booster25','totalBoost'].map(k=>[k,p.oldState.wallet[k]])):null});
 const origin=legacy?row('IMPORT_ORIGIN','current',{originVersion:1,kind:'TEACHER_DEMO_IMPORT',profile:PROFILE,migrationId:ctx.migrationId,snapshotId:s.id,sourceDigest:s.data.sourceDigest,basePlayer:copy(basePlayer),
  statistics:{openedChests:Number(p.oldState.wasSolved),cookiesConsumed:p.oldState.purchasedPackageCount,lockpicksConsumed:p.oldState.attempts},wasSolved:p.oldState.wasSolved}):null;
 const learning=legacy?row('LEGACY_LEARNING',ctx.migrationId,{learningVersion:1,profile:PROFILE,migrationId:ctx.migrationId,snapshotId:s.id,sourceDigest:s.data.sourceDigest,view:createLegacySolution(p)}):null;
 const init=legacy?null:initTransition(ctx.uid,null,null).writes[1];
 const documents=[basePlayer,...(origin?[origin]:[init]),assets,...(learning?[learning]:[])];
 const descriptor=freeze({activationContractVersion:1,profile:PROFILE,context:ctx,preparedManifestDigest:digest(m),sourceSnapshotDigest:digest(s),snapshotId:s.id,sourcePresence:s.data.status,sourceDigest:s.data.sourceDigest,
  documents:documents.map(d=>({key:key(reference(d.kind,d.id)),digest:digest(d)}))});
 const planDigest=digest(descriptor),fence=freeze({schemaVersion:2,kind:'LOCKLOOT_D205_FENCE',migrationId:ctx.migrationId,snapshotId:s.id,source:SOURCE,sourceOrigin:ctx.sourceOrigin,target:TARGET,
  sourcePresence:s.data.status,legacyRaw:s.data.raw,legacyRawSha256:s.data.sourceDigest,activationContractVersion:1,preservationProfile:PROFILE,preparedManifestDigest:digest(m),planDigest});
 const fenceRaw=JSON.stringify(fence);parseFence(fenceRaw);
 const committed=freeze({documentVersion:2,...b.manifestRef(ctx),revision:m.revision+1,data:{activationVersion:1,phase:'COMMITTED',profile:PROFILE,preparedManifest:m,plan:descriptor,planDigest,
  fenceDigest:sha256(fenceRaw),basePlayer:copy(basePlayer),baseAssets:copy(assets),originRef:origin?reference('IMPORT_ORIGIN'):reference('ACTION',INIT_ID),learningRef:learning?reference('LEGACY_LEARNING',ctx.migrationId):null}});
 const plan=freeze({ctx,prepared:m,source:s,descriptor,planDigest,fence,fenceRaw,committed,documents,basePlayer,assets,origin,learning,init});plans.add(plan);return plan;
}
export function requirePlan(value){if(!plans.has(value))fail('ACTIVATION_PLAN_REQUIRED');return value;}
export function validator(fixtureRaw){return createLegacySourceValidator({fixtureRaw,source:SOURCE});}
export function committedHeader(value,ctx){const d=exact(value,['documentVersion','uid','kind','id','revision','data']);
 if(d.documentVersion!==2||d.uid!==ctx.uid||d.kind!=='MIGRATION'||d.id!==ctx.migrationId)fail('COMMITTED_DOCUMENT_INVALID');integer(d.revision,2);
 const a=exact(d.data,['activationVersion','phase','profile','preparedManifest','plan','planDigest','fenceDigest','basePlayer','baseAssets','originRef','learningRef']);
 if(a.activationVersion!==1||a.phase!=='COMMITTED'||a.profile!==PROFILE)fail('COMMITTED_VERSION_INVALID');b.manifestDocument(a.preparedManifest,ctx);if(d.revision!==a.preparedManifest.revision+1)fail('COMMITTED_REVISION_INVALID');return freeze(d);
}
function currentAssets(value,base){const d=exact(value,['documentVersion','uid','kind','id','revision','data']);
 if(d.documentVersion!==1||d.uid!==TARGET.uid||d.kind!=='LEGACY_ASSETS'||d.id!=='current')fail('ASSETS_DOCUMENT_INVALID');integer(d.revision,1);
 const a=exact(d.data,['assetsVersion','profile','migrationId','snapshotId','sourceDigest','sourcePresence','calendar','boosters']);
 for(const k of ['assetsVersion','profile','migrationId','snapshotId','sourceDigest','sourcePresence'])if(a[k]!==base.data[k])fail('ASSETS_BINDING_INVALID');
 if(base.data.calendar!==null&&a.calendar===null||base.data.boosters!==null&&a.boosters===null)fail('ASSETS_STATE_MISSING');
 if(a.calendar!==null){const cal=exact(a.calendar,['progress','lastDay','revision']);integer(cal.progress);integer(cal.revision);if(cal.progress>30||(cal.progress===0?cal.lastDay!==null:cal.lastDay===null))fail('ASSETS_CALENDAR_INVALID');if(cal.lastDay!==null)date(cal.lastDay);const prior=base.data.calendar;if(prior&&(cal.progress<prior.progress||cal.revision<prior.revision||cal.progress===prior.progress&&cal.lastDay!==prior.lastDay||cal.progress>prior.progress&&prior.lastDay!==null&&cal.lastDay<=prior.lastDay))fail('ASSETS_CALENDAR_REGRESSION');}
 if(a.boosters!==null){const boosts=exact(a.boosters,['booster5','booster10','booster25','totalBoost']);for(const n of Object.values(boosts))integer(n);const sum=BigInt(boosts.booster5)*5n+BigInt(boosts.booster10)*10n+BigInt(boosts.booster25)*25n;if(sum!==BigInt(boosts.totalBoost))fail('ASSETS_BOOSTERS_INVALID');}
 if(d.revision===1)eq(d,base,'ASSETS_BASE_CONFLICT');return freeze(d);
}
export function verifyCommitted(value,frame,validate){const ctx=context(value),f=exact(frame,['manifest','source','player','origin','assets','learning','init']);
 if(!f.manifest||!f.source||!f.player||!f.assets)fail('COMMITTED_EVIDENCE_MISSING');const m=committedHeader(f.manifest,ctx),plan=makePlan(ctx,{manifest:m.data.preparedManifest,source:f.source},validate);
 eq(m,plan.committed,'COMMITTED_PLAN_MISMATCH');
 for(const k of ['origin','learning','init'])eq(f[k],plan[k],'COMMITTED_'+k.toUpperCase()+'_MISMATCH');
 const player=records.requirePlayerReadDocument(f.player,{uid:ctx.uid});if(player.revision<plan.basePlayer.revision)fail('PLAYER_BEFORE_IMPORT');if(player.revision===plan.basePlayer.revision)eq(player,plan.basePlayer,'PLAYER_BASE_CONFLICT');
 currentAssets(f.assets,plan.assets);
 return freeze({plan,proof:{originProofVersion:1,scope:'HISTORICAL_ORIGIN',currentStateProof:'STRUCTURAL_ONLY',migrationId:ctx.migrationId,planDigest:plan.planDigest,
  kind:plan.origin?'LEGACY_IMPORT':'REGULAR_INIT',basePlayer:copy(plan.basePlayer),baseAssets:copy(plan.assets),statistics:plan.origin?copy(plan.origin.data.statistics):{openedChests:0,cookiesConsumed:0,lockpicksConsumed:0},legacySolution:plan.learning?copy(plan.learning.data.view):null}});
}
export function receipt(value,replayed=false){const p=requirePlan(value);return freeze({activationReceiptVersion:1,status:'COMMITTED',migrationId:p.ctx.migrationId,sourcePresence:p.source.data.status,preservationProfile:PROFILE,
 originKind:p.origin?'LEGACY_IMPORT':'REGULAR_INIT',planDigest:p.planDigest,replayed});}
// Conditional synchronous transition under the original Web Lock. This is not
// a native localStorage CAS and not a cross-process freshness guarantee.
export function fenceStep(value,port,replayOnly=false){const p=requirePlan(value),raw=readSource(port);
 if(raw===p.fenceRaw)return;
 if(replayOnly)fail('COMMITTED_SOURCE_CONFLICT');
 if(raw!==p.source.data.raw)fail('SOURCE_CHANGED_AT_FENCE');
 const confirmed=port.replace(freeze({key:SOURCE.progressKey,expectedRaw:raw,fenceRaw:p.fenceRaw}));
 if(typeof confirmed!=='string')fail('SYNC_FENCE_PORT_REQUIRED');if(confirmed!==p.fenceRaw||readSource(port)!==p.fenceRaw)fail('FENCE_READBACK_FAILED');
}
