import * as old from './personal-player-action-contract.mjs';
import {assignments} from './personal-chest-browser-bundle.mjs';
import {truth,validateFeedback,createFeedback} from './personal-player-v2-feedback.mjs';
import * as end from './personal-player-v2-end.mjs';
export const ACTION_CONTRACT_VERSION=2,MAX_READS=7,MAX_WRITES=6;
export const {fail,copy,canonical,digest,ref,key,INIT_ID}=old;
const inc=n=>{if(!Number.isSafeInteger(n)||n<0||n===Number.MAX_SAFE_INTEGER)fail('REVISION_OVERFLOW');return n+1;};
const exact=(v,k)=>{const x=copy(v);if(!x||Array.isArray(x)||typeof x!=='object'||Object.keys(x).length!==k.length||Object.keys(x).some(n=>!k.includes(n)))fail('INVALID_FIELDS');return x;};
const empty=()=>({personalStateVersion:1,activeAttempts:null,lastClosedChestId:null,lastClosedActionId:null});
function metadata(value){
  const p=exact(value,['personalStateVersion','activeAttempts','lastClosedChestId','lastClosedActionId']);
  if(p.personalStateVersion!==1)fail('INVALID_PERSONAL_VERSION');
  if((p.lastClosedChestId===null)!==(p.lastClosedActionId===null))fail('INVALID_CLOSURE_POINTERS');
  if(p.lastClosedChestId!==null){ref('validation','CHEST',p.lastClosedChestId);ref('validation','ACTION',p.lastClosedActionId);}
  if(p.activeAttempts!==null){const a=exact(p.activeAttempts,['chestId','codeLength','bookedAttemptCount','lastFeedback']);old.ref('validation','CHEST',a.chestId);if(![8,10,12].includes(a.codeLength)||!Number.isSafeInteger(a.bookedAttemptCount)||a.bookedAttemptCount<0)fail('INVALID_ATTEMPT_COUNT');if((a.bookedAttemptCount===0)!==(a.lastFeedback===null))fail('INVALID_ATTEMPT_FEEDBACK');if(a.lastFeedback!==null)validateFeedback(a.lastFeedback,a.codeLength);}
  return p;
}
function forChest(p,chest){const next=metadata(p);if(!chest)return next;
  if(next.activeAttempts&&next.activeAttempts.chestId!==chest.chestId)fail('ATTEMPT_CHEST_BINDING_MISMATCH');
  if(next.activeAttempts?.codeLength!==undefined&&next.activeAttempts.codeLength!==chest.selection.codeLength)fail('ATTEMPT_LENGTH_BINDING_MISMATCH');
  next.activeAttempts ||= {chestId:chest.chestId,codeLength:chest.selection.codeLength,bookedAttemptCount:0,lastFeedback:null};return next;}
export function walletDocument(player){return {documentVersion:1,...ref(player.uid,'PLAYER'),revision:player.revision,data:Object.fromEntries(['walletVersion','cookies','lockpicks','points'].map(k=>[k,player.data[k]]))};}
export function document(value,r){
  if(r.kind==='ACTION'&&value?.documentVersion===3)return end.validateReceipt(value,r);
  if(r.kind==='PLAYER'&&value?.documentVersion===2){const d=exact(value,['documentVersion','uid','kind','id','revision','data']);if(['uid','kind','id'].some(k=>d[k]!==r[k]))fail('DOCUMENT_BINDING_MISMATCH');exact(d.data,['walletVersion','cookies','lockpicks','points','personal']);old.document(walletDocument(d),r);metadata(d.data.personal);return d;}
  if(r.kind==='ACTION'&&value?.documentVersion===2){const d=exact(value,['documentVersion','uid','kind','id','revision','data']);if(d.revision!==1||['uid','kind','id'].some(k=>d[k]!==r[k]))fail('IMMUTABLE_ACTION');const a=exact(d.data,['actionVersion','kind','request','fingerprint','beforePlayer','responseDigest','response']);if(a.actionVersion!==2||!['BUY_HINT_PACKAGE','ATTEMPT_CHEST'].includes(a.kind))fail('INVALID_ACTION');const req=request(a.request,a.kind);if(req.requestId!==d.id||digest({uid:r.uid,kind:a.kind,request:req})!==a.fingerprint||digest(a.response)!==a.responseDigest)fail('ACTION_RESPONSE_DIGEST_MISMATCH');const before=document(a.beforePlayer,ref(r.uid,'PLAYER'));if(digest(before)!==req.expectedPlayerDigest||before.revision!==req.expectedPlayerRevision)fail('ACTION_PRIOR_PLAYER_MISMATCH');requireResponse(a.response,r.uid,req,a.kind,before);return d;}
  return old.document(value,r);
}
export function request(value,kind=value?.kind){
  if(value?.actionContractVersion===1){if(kind!=='BUY_HINT_PACKAGE')fail('INVALID_ACTION_VERSION');return old.request(value);}
  const fields=['actionContractVersion','kind','requestId','chestId','expectedHeadRevision','expectedChestRevision','expectedHintRevision','expectedPlayerRevision','expectedPurchasedPackageCount','expectedChestDigest','expectedPlayerDigest','expectedHeadDigest'];if(kind==='ATTEMPT_CHEST')fields.push('enteredCode','expectedFeedbackPolicyVersion','saltDerivationVersion');
  const r=exact(value,fields);if(r.actionContractVersion!==2||r.kind!==kind||!['BUY_HINT_PACKAGE','ATTEMPT_CHEST'].includes(kind))fail('INVALID_ACTION_VERSION');
  old.request(Object.fromEntries(Object.entries(r).filter(([k])=>!['kind','enteredCode','expectedFeedbackPolicyVersion','saltDerivationVersion'].includes(k)).map(([k,v])=>[k,k==='actionContractVersion'?1:v])));
  if(kind==='ATTEMPT_CHEST'&&(typeof r.enteredCode!=='string'||!/^\d+$/.test(r.enteredCode)||![8,10,12].includes(r.enteredCode.length)||r.expectedFeedbackPolicyVersion!==1||r.saltDerivationVersion!==1))fail('INVALID_ATTEMPT_CODE');return r;
}
export function snapshot(owner,head,chest,start,player){
  document(player,ref(owner,'PLAYER'));const s=old.publicSnapshot(owner,head,chest,start,walletDocument(player));s.anchors&&(s.anchors.playerDigest=digest(player));s.personal=forChest(player.documentVersion===2?player.data.personal:empty(),s.chest);return s;
}
export function makeRequest(s,requestId,kind='BUY_HINT_PACKAGE',enteredCode){const r={...old.makeRequest(s,requestId),actionContractVersion:2,kind};if(kind==='ATTEMPT_CHEST')Object.assign(r,{enteredCode,expectedFeedbackPolicyVersion:1,saltDerivationVersion:1});return request(r,kind);}
function requireResponse(value,owner,r,kind,beforePlayer){
  const s=exact(value,['uid','activeChestId','chest','wallet','anchors','personal','actionResult']);const reduced=copy(s);delete reduced.personal;delete reduced.actionResult;
  if(s.uid!==owner||!s.chest||s.activeChestId!==r.chestId)fail('RESPONSE_CHEST_MISMATCH');
  const after={documentVersion:2,...ref(owner,'PLAYER'),revision:s.wallet.revision,data:{walletVersion:1,cookies:s.wallet.cookies,lockpicks:s.wallet.lockpicks,points:s.wallet.points,personal:metadata(s.personal)}};document(after,ref(owner,'PLAYER'));
  reduced.anchors.playerDigest=digest(walletDocument(after));old.requireResponse(reduced,owner,'BUY_HINT_PACKAGE');
  const x=s.anchors,prev=walletDocument(beforePlayer).data;
  if(x.playerDigest!==digest(after)||x.playerRevision!==inc(r.expectedPlayerRevision)||x.headRevision!==r.expectedHeadRevision||x.headDigest!==r.expectedHeadDigest||s.wallet.points!==prev.points)fail('RESPONSE_REVISION_MISMATCH');
  const prior=forChest(beforePlayer.documentVersion===2?beforePlayer.data.personal:empty(),s.chest);
  if(kind==='BUY_HINT_PACKAGE'){
    exact(s.actionResult,['kind']);if(s.actionResult.kind!==kind||s.wallet.cookies!==prev.cookies-1||s.wallet.lockpicks!==prev.lockpicks||canonical(s.personal)!==canonical(prior)||x.chestRevision!==inc(r.expectedChestRevision)||x.hintRevision!==inc(r.expectedHintRevision)||s.chest.hintState.purchasedPackageCount!==inc(r.expectedPurchasedPackageCount))fail('REPLAY_BUY_BINDING_MISMATCH');
  }else{
    const result=exact(s.actionResult,['kind','outcome','feedback']);const feedback=validateFeedback(result.feedback,s.chest.selection.codeLength);
    if(result.kind!==kind||result.outcome!=='FAILED'||r.enteredCode.length!==s.chest.selection.codeLength||s.wallet.lockpicks!==prev.lockpicks-1||s.wallet.cookies!==prev.cookies||x.chestRevision!==r.expectedChestRevision||x.chestDigest!==r.expectedChestDigest||x.hintRevision!==r.expectedHintRevision||s.chest.hintState.purchasedPackageCount!==r.expectedPurchasedPackageCount)fail('REPLAY_ATTEMPT_BINDING_MISMATCH');
    prior.activeAttempts.bookedAttemptCount=inc(prior.activeAttempts.bookedAttemptCount);prior.activeAttempts.lastFeedback=feedback;if(canonical(prior)!==canonical(s.personal))fail('REPLAY_COUNTER_BINDING_MISMATCH');
  }
  if(assignments.containsInternalClientFields(s)||JSON.stringify(s).includes('feedbackSalt')||Object.hasOwn(s,'enteredCode'))fail('PRIVATE_PUBLIC_RESPONSE');return s;
}
function matched(owner,r,docs){const s=snapshot(owner,docs.head,docs.chest,docs.start,docs.player);if(s.activeChestId!==r.chestId||!s.anchors)fail('HEAD_CHEST_MISMATCH');for(const [k,v]of Object.entries({...Object.fromEntries(Object.entries(s.anchors).map(([k,v])=>['expected'+k[0].toUpperCase()+k.slice(1),v])),expectedPurchasedPackageCount:s.chest.hintState.purchasedPackageCount}))if(r[k]!==v)fail('CAS_CONFLICT');return s;}
export function replay(owner,r,kind,action){
  document(action,ref(owner,'ACTION',r.requestId));if(action.documentVersion===1){if(r.actionContractVersion!==1||kind!=='BUY_HINT_PACKAGE')fail('REQUEST_REUSED');return old.purchaseTransition(owner,r,{action});}
  if(action.documentVersion===3){if(kind!=='ATTEMPT_CHEST'||canonical(action.data.request)!==canonical(r))fail('REQUEST_REUSED');return {writes:[],response:copy(action.data.response)};}
  if(action.data.kind!==kind||canonical(action.data.request)!==canonical(r))fail('REQUEST_REUSED');return {writes:[],response:requireResponse(action.data.response,owner,r,kind,action.data.beforePlayer)};
}
const preparedBinding=end.binding;
export async function prepareAttempt(owner,value,docs){const r=request(value,'ATTEMPT_CHEST'),stable=copy(docs);matched(owner,r,stable);const counts=truth(r.enteredCode,stable.chest.data.record.material.solutionCode);if(stable.player.data.lockpicks<1)fail('INSUFFICIENT_LOCKPICKS');if(counts.correct)return end.prepare(owner,r,stable);const feedback=await createFeedback({enteredCode:r.enteredCode,...stable.chest.data.record.material,chestId:r.chestId});return {binding:preparedBinding(owner,r,stable),feedback};}
// Pure shared player operations; callers bind and validate the instance first.
export function preparePlayerForAction({player,personal},{playerDocumentVersion=2,personalStateVersion=1}={}){
  if(!((playerDocumentVersion===2&&personalStateVersion===1)||(playerDocumentVersion===3&&personalStateVersion===2)))fail('INVALID_PLAYER_TARGET_VERSION');
  const next=copy(player);next.documentVersion=playerDocumentVersion;next.data.personal={...copy(personal),personalStateVersion};next.revision=inc(next.revision);return next;
}
export function applyFailedAttemptDebit({player,feedback}){
  const next=copy(player);if(next.data.lockpicks<1)fail('INSUFFICIENT_LOCKPICKS');next.data.lockpicks--;next.data.personal.activeAttempts.bookedAttemptCount=inc(next.data.personal.activeAttempts.bookedAttemptCount);next.data.personal.activeAttempts.lastFeedback=copy(feedback);return next;
}
export function transition(owner,value,kind,docs,prepared){
  const r=request(value,kind);if(docs.action)return replay(owner,r,kind,docs.action);const s=matched(owner,r,docs);let np=preparePlayerForAction({player:docs.player,personal:s.personal}),nc=docs.chest,result;
  if(kind==='BUY_HINT_PACKAGE'){
    if(r.actionContractVersion!==2)fail('V1_WRITE_UNSUPPORTED');
    const reduced={...r,actionContractVersion:1,expectedPlayerDigest:digest(walletDocument(docs.player))};delete reduced.kind;
    const oldPlan=old.purchaseTransition(owner,reduced,{...docs,player:walletDocument(docs.player)});nc=oldPlan.writes.find(d=>d.kind==='CHEST');np.data.cookies--;result={kind};
  }else{
    const counts=truth(r.enteredCode,docs.chest.data.record.material.solutionCode);if(counts.correct)return end.transition(owner,r,docs,prepared);if(np.data.lockpicks<1)fail('INSUFFICIENT_LOCKPICKS');
    if(!prepared||prepared.binding!==preparedBinding(owner,r,docs))fail('CAS_CONFLICT');
    const feedback=validateFeedback(prepared.feedback,s.chest.selection.codeLength);if(feedback.value!==counts[feedback.exactDimension])fail('FEEDBACK_TRUTH_MISMATCH');
    np=applyFailedAttemptDebit({player:np,feedback});result={kind,outcome:'FAILED',feedback};
  }
  const response={...snapshot(owner,docs.head,nc,docs.start,np),actionResult:result};requireResponse(response,owner,r,kind,docs.player);
  const action={documentVersion:2,...ref(owner,'ACTION',r.requestId),revision:1,data:{actionVersion:2,kind,request:r,fingerprint:digest({uid:owner,kind,request:r}),beforePlayer:copy(docs.player),responseDigest:digest(response),response}};document(action,ref(owner,'ACTION',r.requestId));
  return {writes:[...(kind==='BUY_HINT_PACKAGE'?[nc]:[]),np,action],response};
}
export function initTransition(owner,player,action){if(player){document(player,ref(owner,'PLAYER'));if(action)old.document(action,ref(owner,'ACTION',INIT_ID));return {writes:[],response:{uid:owner,wallet:{...walletDocument(player).data,revision:player.revision}}};}return old.initTransition(owner,player,action);}
