import * as c from './d205-activation-contract.mjs';
import * as b from './d205-handover-contract.mjs';
import {initTransition} from './personal-player-action-contract.mjs';
const {canonical,digest,copy}=c.helpers,ports=new WeakSet(),proofs=new WeakSet();
export const MAX_ORIGIN_READS=5,MAX_ORIGIN_DOCUMENT_BYTES=2*1024*1024,MAX_SOURCE_DOCUMENT_BYTES=2*8*1024*1024+65536;
export const MAX_ORIGIN_READ_BYTES=MAX_SOURCE_DOCUMENT_BYTES+4*MAX_ORIGIN_DOCUMENT_BYTES;
export function requireJournalOrigin(value){if(!proofs.has(value))c.fail('JOURNAL_ORIGIN_PROOF_REQUIRED');return value;}
export function requireJournalOriginPort(value){if(!ports.has(value))c.fail('JOURNAL_ORIGIN_PORT_REQUIRED');return value;}
// The branded result is made only by unchanged B2 verification. It is not a
// validated:true option, a writer, or a second implementation of the journal.
export function createJournalOrigin(value){
 const cfg=c.ownOptions(value,['sourceOrigin','fixtureRaw','sourcePort','subtle']),ctx=c.context(b.context({...c.TARGET,sourceOrigin:cfg.sourceOrigin})),validate=c.validator(cfg.fixtureRaw),subtle=cfg.subtle??globalThis.crypto?.subtle,url=new URL(ctx.sourceOrigin);
 if(url.origin!=='https://zaarol-cloud.github.io'||typeof cfg.sourcePort?.read!=='function'||typeof subtle?.digest!=='function')c.fail('JOURNAL_ORIGIN_CONFIGURATION');
 const source=()=>c.readSource(cfg.sourcePort),ref=c.reference;
 const profile=r=>r?.uid===ctx.uid&&(['MIGRATION','LEGACY_LEARNING'].includes(r.kind)?r.id===ctx.migrationId:['IMPORT_ORIGIN','LEGACY_ASSETS'].includes(r.kind)?r.id==='current':r.kind==='LEGACY_SOURCE'&&typeof r.id==='string'&&/^[a-f0-9]{64}$/.test(r.id));
 function read(get,current,finish){let left=4;const frame={manifest:null,source:null,player:current.player,origin:null,assets:null,learning:null,init:current.init};const done=()=>{if(--left===0)finish(frame);};
  get(b.manifestRef(ctx),manifest=>{frame.manifest=manifest;if(manifest){const m=c.committedHeader(manifest,ctx);left++;get(ref('LEGACY_SOURCE',m.data.preparedManifest.data.selectedSnapshotId),d=>{frame.source=d;done();});}done();});
  for(const [name,reference]of [['origin',ref('IMPORT_ORIGIN')],['assets',ref('LEGACY_ASSETS')],['learning',ref('LEGACY_LEARNING',ctx.migrationId)]])get(reference,d=>{frame[name]=d;done();});
 }
 async function verify(frame,expectedRaw,options={}){const check=()=>{if(options.signal?.aborted)c.fail('READ_ABORTED');if(options.isCurrent&&!options.isCurrent())c.fail('STALE_READ');};check();if(source()!==expectedRaw)c.fail('JOURNAL_SOURCE_CHANGED');let basePlayer,statistics,kind,init;
  if(frame.manifest){const verified=c.verifyCommitted(ctx,frame,validate);if(expectedRaw!==verified.plan.fenceRaw)c.fail('COMMITTED_SOURCE_CONFLICT');
   const bytes=await subtle.digest('SHA-256',new TextEncoder().encode(expectedRaw));check();const sha=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');if(sha!==verified.plan.committed.data.fenceDigest)c.fail('FENCE_DIGEST_MISMATCH');
   basePlayer=verified.proof.basePlayer;statistics=verified.proof.statistics;kind=verified.proof.kind==='LEGACY_IMPORT'?'IMPORT':'INIT';init=verified.plan.init;
  }else{if(expectedRaw!==null||frame.source||frame.origin||frame.assets||frame.learning)c.fail('JOURNAL_ORIGIN_CONFLICT');const initial=initTransition(ctx.uid,null,null);if(canonical(frame.init)!==canonical(initial.writes[1]))c.fail('JOURNAL_ORIGIN_UNPROVEN');basePlayer=initial.writes[0];statistics={openedChests:0,cookiesConsumed:0,lockpicksConsumed:0};kind='INIT';init=initial.writes[1];}
  check();if(source()!==expectedRaw)c.fail('JOURNAL_SOURCE_CHANGED');
  const provenanceDigest=digest({domain:'lockloot/journal-origin/v1',context:ctx,manifest:frame.manifest,source:frame.source,origin:frame.origin,assets:frame.assets,learning:frame.learning,init:frame.init,sourceRawDigest:expectedRaw===null?null:c.helpers.sha256(expectedRaw)});
  const proof=c.freeze({kind,basePlayer:copy(basePlayer),statistics:copy(statistics),init:copy(init),provenanceDigest,publicDigest:kind==='IMPORT'?provenanceDigest:null});proofs.add(proof);return proof;
 }
 const port=Object.freeze({uid:ctx.uid,databaseName:ctx.databaseName,source,profile,read,verify});ports.add(port);return port;
}
