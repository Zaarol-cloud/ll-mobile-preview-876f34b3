import {instanceStartRecords as startRecords,instanceStartContract as policy} from './personal-chest-crew-lifecycle-factories.mjs';
import {instance,records} from './personal-chest-instance-read-factories.mjs';
import {ref,document} from './personal-player-v3-attempt-contract.mjs';
import {evaluateLastSolutionReadSet} from './personal-player-v3-last-solution-contract.mjs';
import {createCrewInvitationBrowser} from './personal-chest-crew-invitation-browser.mjs';
import {createStorageContract} from './personal-chest-storage-contract.mjs';
export const helpers=instance.helpers,MAX_READS=10,MAX_WRITES=3;
export {ref,document};
const c=helpers,key=r=>c.canonical(ref(r));
export function options(value,allowed){if(!value||![Object.prototype,null].includes(Object.getPrototypeOf(value)))c.fail('INVALID_OPTIONS');const out={};for(const k of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,k);if(typeof k!=='string'||!allowed.includes(k)||!d.enumerable||!Object.hasOwn(d,'value'))c.fail('INVALID_OPTIONS');out[k]=d.value;}return out;}
export function witnesses(owner,entries){return c.freeze(entries.map(([r,d])=>({ref:ref(r,owner),expected:d?{exists:true,documentVersion:d.documentVersion,revision:d.revision,sha256:c.digest(d)}:{exists:false}})));}
// Capabilities never come from request fields. Only these async verifiers can
// authorize a candidate/identity gate; the adapter sees the frozen digest set.
export function createStartBoundary({uid,subtle=globalThis.crypto?.subtle}={}){
 c.uid(uid);let verified=new WeakSet();const commits=new Map(),identities=new Map(),cryptoPort=createCrewInvitationBrowser({subtle});
 const r=(kind,id='current')=>ref({uid,kind,id});
 const frameEntries=s=>[['HEAD','head'],['PLAYER','player'],['LOCAL_IDENTITY','identity'],['ARCHIVE','archive'],['REQUEST','start'],['REQUEST','end'],['ACTION','action'],['CHEST','chest']].filter(([,name])=>Object.hasOwn(s,name)&&(s[name]!==null||['head','player','identity'].includes(name))).map(([kind,name])=>[r(kind,['head','player','identity'].includes(name)?'current':s[name].id),s[name]]);
 function check(opts){if(opts.signal?.aborted)c.fail('START_ABORTED');if(opts.isCurrent&&!opts.isCurrent())c.fail('STALE_START');}
 async function verify(value,opts={}){const s=c.exact(value,['uid','head','player','identity','archive','start','end','action']);if(s.uid!==uid)c.fail('UID_MISMATCH');check(opts);startRecords.validateStartBase({uid,head:s.head,player:s.player,identity:s.identity,chest:null,start:null});const result=await evaluateLastSolutionReadSet(s,{subtle,signal:opts.signal,isCurrent:opts.isCurrent});check(opts);
  if(result.reason==='NO_CLOSED_CHEST'&&(s.head?.revision??0)!==0)c.fail('CLOSURE_PROOF_REQUIRED');const cap=c.freeze({frame:s,witnesses:witnesses(uid,frameEntries(s)),kind:'INACTIVE'});verified.add(cap);return cap;
 }
 async function verifyResume(value,opts={}){const s=c.exact(value,['uid','head','player','identity','chest','start']);if(s.uid!==uid)c.fail('UID_MISMATCH');check(opts);const snapshot=records.requireActiveReadSet(s);if(!snapshot?.chest)c.fail('NO_ACTIVE_CHEST');if(snapshot.chest.selection.modeId==='CREW'){const expected=await cryptoPort.derivePrivateMaterial({invitationCode:s.chest.data.record.instanceBinding.invitationCode,browserSaltHex:s.identity.data.browserSaltHex},{signal:opts.signal});check(opts);if(c.canonical(expected)!==c.canonical({chestId:s.chest.id,...s.chest.data.record.material}))c.fail('CREW_MATERIAL_BINDING_MISMATCH');}const cap=c.freeze({frame:s,witnesses:witnesses(uid,frameEntries(s)),kind:'ACTIVE'});verified.add(cap);return cap;}
 function requireCap(cap){if(!verified.has(cap))c.fail('VERIFIED_START_CONTEXT_REQUIRED');return cap;}
 function merge(entries){const map=new Map();for(const w of entries){const k=key(w.ref),prior=map.get(k);if(prior&&c.canonical(prior)!==c.canonical(w))c.fail('START_WITNESS_CONFLICT');map.set(k,w);}return [...map.values()];}
 function bind(candidate,cap,extra=[]){requireCap(cap);const p=c.copy(candidate);if(p.uid!==uid)c.fail('UID_MISMATCH');p.readSet=merge([...p.readSet,...cap.witnesses,...extra]);p.deltaDigest=c.digest({deltaVersion:p.deltaVersion,uid,readSet:p.readSet,writes:p.writes});storage.candidate(p);if(p.writes.length&&cap.kind!=='INACTIVE')c.fail('ACTIVE_CHEST_CONFLICT');const frozen=c.freeze(p);commits.set(p.deltaDigest,{cap,candidateDigest:c.digest(frozen)});return frozen;}
 function identityGuard(cap){requireCap(cap);if(cap.kind!=='INACTIVE'||cap.frame.identity)c.fail('INVALID_IDENTITY_GUARD');identities.set(c.canonical(cap.witnesses),cap);return cap.witnesses;}
 function validateIdentityGuard(guard){const cap=identities.get(c.canonical(guard));requireCap(cap);if(cap.kind!=='INACTIVE')c.fail('INVALID_IDENTITY_GUARD');}
 function validateObservedCandidate(p,observed){const authorization=commits.get(p.deltaDigest);if(!authorization||!verified.has(authorization.cap)||authorization.candidateDigest!==c.digest(p))c.fail('VERIFIED_START_CONTEXT_REQUIRED');for(const witness of authorization.cap.witnesses){const actual=p.readSet.find(w=>key(w.ref)===key(witness.ref));if(!actual||c.canonical(actual)!==c.canonical(witness))c.fail('MISSING_PROOF_WITNESS');}startRecords.validateObservedCandidate(p,observed);}
 const storage=createStorageContract({...startRecords,ref,document,documentVersions:[1,2,3,4,5],validateObservedCandidate,validateIdentityGuard});
 function empty(cap){requireCap(cap);if(cap.kind!=='INACTIVE')c.fail('ACTIVE_CHEST_CONFLICT');const revision=cap.frame.head?.revision??0,p={workingSetVersion:4,deltaVersion:3,uid,readSet:[],writes:[],deltaDigest:'',confirmationRequired:true,resultingHeadRevision:revision,preparedResponse:{workingSetVersion:4,committed:false,startContractVersion:3,uid,revision,activeChestId:null,replayed:true,chest:null}};return bind(p,cap);}
 return Object.freeze({storage,verify,verifyResume,bind,identityGuard,empty,reset(){verified=new WeakSet();commits.clear();identities.clear();}});
}
export function envelope(request,chestId){return policy.requireStartRequest({startContractVersion:3,requestId:request.requestId,chestId,selection:request.selection,instanceBinding:request.instanceBinding??null});}
