import * as c from './personal-player-v2-contract.mjs';
import * as old from './personal-player-action-contract.mjs';
import * as b from './personal-chest-storage-contract.mjs';
import {workingSet,contracts,assignments} from './personal-chest-browser-bundle.mjs';
const inc=n=>add(n,1);
function add(a,z){if(!Number.isSafeInteger(a)||a<0||!Number.isSafeInteger(z)||!Number.isSafeInteger(a+z)||a+z<0)c.fail('RESOURCE_OVERFLOW');return a+z;}
const endRequest=(r)=>({endContractVersion:1,requestId:r.requestId,chestId:r.chestId,expectedRevision:r.expectedHeadRevision});
export const binding=(owner,r,docs)=>c.digest({uid:owner,kind:'ATTEMPT_CHEST',request:r,head:docs.head,chest:docs.chest,start:docs.start,player:docs.player,archive:docs.archive??null,end:docs.end??null});
export function applyConfirmedClosureDocuments({uid:owner,request:r,head:beforeHead,chest:beforeChest,archive,end},{makeRef=(uid,kind,id)=>c.ref(uid,kind,id),recordDocumentVersion=2,endContractVersion=1}={}){
  if(!((recordDocumentVersion===2&&endContractVersion===1)||(recordDocumentVersion===3&&endContractVersion===2))||typeof makeRef!=='function')c.fail('INVALID_CLOSURE_POLICY');
  const docs={head:beforeHead,chest:beforeChest,archive,end};
  if(docs.archive||docs.end)c.fail('CLOSURE_ALREADY_EXISTS');
  const head=c.copy(docs.head),chest=c.copy(docs.chest);head.revision=inc(head.revision);head.data.activeChestId=null;chest.revision=inc(chest.revision);
  const operation={kind:'END',fingerprint:c.canonical({kind:'END',endContractVersion,chestId:r.chestId,expectedRevision:r.expectedHeadRevision}),chestId:r.chestId,committedRevision:head.revision,...(endContractVersion===2?{endContractVersion:2}:{})};
  chest.data.record.status='CLOSED';chest.data.record.closure={endContractVersion,requestId:r.requestId,confirmedRevision:head.revision};chest.data.end={requestId:r.requestId,operation};
  return [head,chest,{documentVersion:recordDocumentVersion,...makeRef(owner,'ARCHIVE',r.chestId),revision:1,data:c.copy(chest.data)},{documentVersion:recordDocumentVersion,...makeRef(owner,'REQUEST',r.requestId),revision:1,data:operation}];
}
function closedDocuments(owner,r,docs){return applyConfirmedClosureDocuments({uid:owner,request:r,...docs});}
export async function prepare(owner,r,docs){
  const byKey=new Map([docs.head,docs.chest,docs.start].map(x=>[c.key(x),x]));
  const runtime=workingSet.createRuntime({readDocument:async ref=>{const doc=byKey.get(c.key(ref));return doc?{lookupVersion:1,status:'PRESENT',document:doc}:{lookupVersion:1,status:'ABSENT'};}});
  const candidate=await runtime.prepareConfirmedEnd({uid:owner,confirmation:endRequest(r)});b.candidate(candidate);
  if(c.canonical(candidate.writes.map(x=>x.document))!==c.canonical(closedDocuments(owner,r,docs)))c.fail('B1_CLOSURE_MISMATCH');
  return {binding:binding(owner,r,docs),success:true,candidate};
}
export function applySuccessfulAttemptResources({player:before,chestId,requestId,factor,bookedAttemptCount,purchasedPackageCount},{playerDocumentVersion=2,personalStateVersion=1,rewardStrategy='PERSONAL_FROZEN_FACTOR_V1'}={}){
  if(!((playerDocumentVersion===2&&personalStateVersion===1)||(playerDocumentVersion===3&&personalStateVersion===2))||!['PERSONAL_FROZEN_FACTOR_V1','INSTANCE_FROZEN_FACTOR_V1'].includes(rewardStrategy))c.fail('INVALID_SUCCESS_POLICY');
  const player=c.copy(before);
  if(!Number.isSafeInteger(factor)||factor<1||factor>384)c.fail('INVALID_REWARD_FACTOR');
  const reward={cookies:2*factor,lockpicks:3*factor,points:factor,strategy:rewardStrategy};
  const count=inc(bookedAttemptCount),consumption={cookies:purchasedPackageCount,lockpicks:count};
  player.revision=inc(before.revision);player.documentVersion=playerDocumentVersion;
  player.data.cookies=add(before.data.cookies,reward.cookies);player.data.lockpicks=add(before.data.lockpicks-1,reward.lockpicks);player.data.points=add(before.data.points,reward.points);
  player.data.personal={personalStateVersion,activeAttempts:null,lastClosedChestId:chestId,lastClosedActionId:requestId};
  return {player,reward,consumption};
}
function response(owner,r,docs,player,closed){
  const prior=c.snapshot(owner,docs.head,docs.chest,docs.start,docs.player),applied=applySuccessfulAttemptResources({player:docs.player,chestId:r.chestId,requestId:r.requestId,factor:prior.chest.selection.factors.total,bookedAttemptCount:prior.personal.activeAttempts.bookedAttemptCount,purchasedPackageCount:prior.chest.hintState.purchasedPackageCount}),{reward,consumption}=applied;Object.assign(player,applied.player);
  const summary={schemaVersion:2,closedChestId:r.chestId,activeChestId:null,rotation:closed[0].revision,closedContentVersion:closed[1].revision,outcome:'self',winner:{displayName:null,rank:null,xpEarned:null},reward,consumption,hintGeneratorVersion:4,codeLength:prior.chest.selection.codeLength,packageCount:prior.chest.selection.packageCount};
  return {...prior,activeChestId:null,chest:{...prior.chest,status:'CLOSED'},wallet:{...c.walletDocument(player).data,revision:player.revision},personal:c.copy(player.data.personal),anchors:{...prior.anchors,headRevision:closed[0].revision,chestRevision:closed[1].revision,playerRevision:player.revision,headDigest:c.digest(closed[0]),chestDigest:c.digest(closed[1]),playerDigest:c.digest(player)},actionResult:{kind:'ATTEMPT_CHEST',outcome:'SUCCESS',summary}};
}
export function validateReceipt(value,ref){
  const d=b.exact(value,['documentVersion','uid','kind','id','revision','data']);
  if(d.documentVersion!==3||d.revision!==1||['uid','kind','id'].some(k=>d[k]!==ref[k]))c.fail('IMMUTABLE_ACTION');
  const a=b.exact(d.data,['actionVersion','kind','request','fingerprint','beforeHead','beforeChest','beforeStart','beforePlayer','responseDigest','response']);
  if(a.actionVersion!==3||a.kind!=='ATTEMPT_CHEST')c.fail('INVALID_ACTION');
  const r=c.request(a.request,'ATTEMPT_CHEST'),docs={head:a.beforeHead,chest:a.beforeChest,start:a.beforeStart,player:a.beforePlayer,archive:null,end:null};
  if(r.requestId!==d.id||c.digest({uid:ref.uid,kind:a.kind,request:r})!==a.fingerprint||c.digest(a.response)!==a.responseDigest)c.fail('ACTION_RESPONSE_DIGEST_MISMATCH');
  const s=c.snapshot(ref.uid,docs.head,docs.chest,docs.start,docs.player);
  for(const [k,v]of Object.entries(s.anchors))if(r['expected'+k[0].toUpperCase()+k.slice(1)]!==v)c.fail('ACTION_PRIOR_ANCHOR_MISMATCH');
  if(r.expectedPurchasedPackageCount!==s.chest.hintState.purchasedPackageCount||r.enteredCode!==docs.chest.data.record.material.solutionCode||docs.player.data.lockpicks<1)c.fail('REPLAY_SUCCESS_BINDING_MISMATCH');
  const computed=response(ref.uid,r,docs,c.copy(docs.player),closedDocuments(ref.uid,r,docs));
  if(c.canonical(computed)!==c.canonical(a.response)||assignments.containsInternalClientFields(a.response))c.fail('REPLAY_SUCCESS_RESPONSE_MISMATCH');
  return d;
}
export function transition(owner,r,docs,prepared){
  if(docs.player.data.lockpicks<1)c.fail('INSUFFICIENT_LOCKPICKS');
  if(!prepared?.success||prepared.binding!==binding(owner,r,docs))c.fail('CAS_CONFLICT');
  b.candidate(prepared.candidate);const closed=closedDocuments(owner,r,docs);
  if(c.canonical(closed)!==c.canonical(prepared.candidate.writes.map(x=>x.document)))c.fail('B1_CLOSURE_MISMATCH');
  const player=c.copy(docs.player),result=response(owner,r,docs,player,closed);
  const action={documentVersion:3,...c.ref(owner,'ACTION',r.requestId),revision:1,data:{actionVersion:3,kind:'ATTEMPT_CHEST',request:r,fingerprint:c.digest({uid:owner,kind:'ATTEMPT_CHEST',request:r}),beforeHead:c.copy(docs.head),beforeChest:c.copy(docs.chest),beforeStart:c.copy(docs.start),beforePlayer:c.copy(docs.player),responseDigest:c.digest(result),response:result}};
  validateReceipt(action,c.ref(owner,'ACTION',r.requestId));return {writes:[...closed,player,action],response:result};
}
export function lastSolution(owner,{head,player,archive,start,end,action}){
  c.document(player,c.ref(owner,'PLAYER'));if(head)c.document(head,c.ref(owner,'HEAD'));
  const p=player.documentVersion===2?player.data.personal:null;if(!p?.lastClosedChestId)return null;
  const cid=p.lastClosedChestId;if(head?.data.activeChestId===cid)c.fail('ACTIVE_SOLUTION_FORBIDDEN');
  if(!archive||!start||!end||!action)c.fail('MISSING_CLOSURE_PROOF');
  c.document(archive,c.ref(owner,'ARCHIVE',cid));c.document(start,c.ref(owner,'REQUEST',archive.data.start.requestId));c.document(end,c.ref(owner,'REQUEST',p.lastClosedActionId));validateReceipt(action,c.ref(owner,'ACTION',p.lastClosedActionId));
  const a=action.data,r=a.request,closed=closedDocuments(owner,r,{head:a.beforeHead,chest:a.beforeChest,start:a.beforeStart,player:a.beforePlayer,archive:null,end:null});
  if(r.chestId!==cid||c.canonical(archive)!==c.canonical(closed[2])||c.canonical(end)!==c.canonical(closed[3])||c.canonical(start)!==c.canonical(a.beforeStart)||player.revision<a.response.wallet.revision)c.fail('ARCHIVE_CLOSURE_BINDING_MISMATCH');
  const h=a.response.chest.hintState;if(h.purchasedPackageCount===0)return null;
  // Sole intentional disclosure: closed solution plus personally paid prefix.
  return contracts.freeze(c.copy({chestId:cid,closedCode:archive.data.record.material.solutionCode,hintGeneratorVersion:4,codeLength:archive.data.record.selection.codeLength,packageCount:archive.data.record.selection.packageCount,revealedHintCount:h.revealedHints.length,revealedHints:h.revealedHints}));
}
