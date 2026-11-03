import {instance,records} from './personal-chest-instance-read-factories.mjs';
import * as old from './personal-player-action-contract.mjs';
import * as legacyV2 from './personal-player-v2-contract.mjs';
const c=instance.helpers;
export const PURCHASE_CONTRACT_VERSION=3,MAX_READS=6,MAX_WRITES=3;
export const helpers=c;
const fields=['actionContractVersion','kind','requestId','chestId','modeId','expectedInstanceDigest','expectedHeadRevision','expectedChestRevision','expectedHintRevision','expectedPlayerRevision','expectedPurchasedPackageCount','expectedHeadDigest','expectedChestDigest','expectedPlayerDigest'];
const hex=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const isCrew=value=>typeof value==='string'&&/^crew_[a-f0-9]{56}$/.test(value);
export function requireHintPurchaseRequest(value){
 const raw=c.copy(value);
 if(raw?.actionContractVersion===1)return c.freeze(old.request(raw));
 if(raw?.actionContractVersion===2)return c.freeze(legacyV2.request(raw,'BUY_HINT_PACKAGE'));
 const r=c.exact(raw,fields);if(r.actionContractVersion!==3||r.kind!=='BUY_HINT_PACKAGE')c.fail('INVALID_PURCHASE_VERSION');c.id(r.requestId);c.id(r.chestId,true);if(r.requestId===old.INIT_ID)c.fail('RESERVED_ACTION_ID');
 if(!['PERSONAL','CREW'].includes(r.modeId)||isCrew(r.chestId)!==(r.modeId==='CREW')||(r.modeId==='CREW'?!hex(r.expectedInstanceDigest):r.expectedInstanceDigest!==null))c.fail('INSTANCE_REQUEST_MISMATCH');
 for(const key of ['expectedHeadRevision','expectedChestRevision','expectedHintRevision','expectedPlayerRevision','expectedPurchasedPackageCount'])c.revision(r[key],['expectedHintRevision','expectedPurchasedPackageCount'].includes(key)?0:1);
 for(const key of ['expectedHeadDigest','expectedChestDigest','expectedPlayerDigest'])if(!hex(r[key]))c.fail('INVALID_EXPECTATION');return c.freeze(r);
}
export function makeHintPurchaseRequest(value,requestId){
 const s=c.exact(value,['snapshotVersion','uid','activeChestId','chest','wallet','personal','sourceVersions','anchors']);if(s.snapshotVersion!==3||!s.chest||s.chest.status!=='ACTIVE'||s.activeChestId!==s.chest.chestId)c.fail('NO_ACTIVE_CHEST');c.uid(s.uid);const x=s.anchors;
 return requireHintPurchaseRequest({actionContractVersion:3,kind:'BUY_HINT_PACKAGE',requestId,chestId:s.chest.chestId,modeId:s.chest.selection.modeId,expectedInstanceDigest:s.chest.selection.modeId==='CREW'?s.chest.instanceBinding.instanceDigest:null,expectedHeadRevision:x.headRevision,expectedChestRevision:x.chestRevision,expectedHintRevision:x.hintRevision,expectedPlayerRevision:x.playerRevision,expectedPurchasedPackageCount:s.chest.hintState.purchasedPackageCount,expectedHeadDigest:x.headDigest,expectedChestDigest:x.chestDigest,expectedPlayerDigest:x.playerDigest});
}
export function ref(value,owner){const r=c.exact(value,['uid','kind','id']);c.uid(r.uid);if(owner!==undefined&&r.uid!==owner)c.fail('UID_MISMATCH');if(r.kind==='ACTION'){c.id(r.id);return c.freeze(r);}return records.ref(r,owner);}
export const key=value=>c.canonical(ref(value));
const fingerprint=(uid,request)=>c.digest({uid,kind:'BUY_HINT_PACKAGE',request});
const actionFields=['actionVersion','kind','request','fingerprint','beforeHead','beforeChest','beforeStart','beforePlayer','identityDigest','responseDigest','response'];
export function document(value,reference){
 const r=ref(reference);if(r.kind!=='ACTION')return records.document(value,r);
 const d=c.exact(value,['documentVersion','uid','kind','id','revision','data']);if(['uid','kind','id'].some(k=>d[k]!==r[k])||d.revision!==1)c.fail('IMMUTABLE_ACTION');
 if(d.documentVersion===1)return c.freeze(old.document(d,r));
 if(d.documentVersion===2)return c.freeze(legacyV2.document(d,r));
 if(d.documentVersion!==4)c.fail('UNSUPPORTED_ACTION_VERSION');const a=c.exact(d.data,actionFields),request=requireHintPurchaseRequest(a.request);
 if(a.actionVersion!==4||a.kind!=='BUY_HINT_PACKAGE'||request.actionContractVersion!==3||request.requestId!==d.id||fingerprint(r.uid,request)!==a.fingerprint||c.digest(a.response)!==a.responseDigest||a.identityDigest!==null&&!hex(a.identityDigest))c.fail('ACTION_BINDING_MISMATCH');return c.freeze(d);
}
function readFrame(uid,value){const s=c.exact(value,['head','identity','player','chest','start','action']);c.uid(uid);
 for(const [name,kind]of [['head','HEAD'],['identity','LOCAL_IDENTITY'],['player','PLAYER'],['chest','CHEST'],['start','REQUEST'],['action','ACTION']])if(s[name]!==null)s[name]=document(s[name],ref({uid,kind,id:['HEAD','PLAYER','LOCAL_IDENTITY'].includes(kind)?'current':s[name].id}));
 if(!s.player)c.fail('PLAYER_MISSING');const snapshot=records.requireActiveReadSet({uid,head:s.head,identity:s.identity,player:s.player,chest:s.chest,start:s.start});return {docs:s,snapshot};
}
function calculate(uid,r,docs){
 const {snapshot:before}=readFrame(uid,{...docs,action:null});if(!before.chest||before.activeChestId!==r.chestId)c.fail('HEAD_CHEST_MISMATCH');
 if(before.chest.selection.modeId!==r.modeId||(before.chest.instanceBinding?.instanceDigest??null)!==r.expectedInstanceDigest)c.fail('INSTANCE_REQUEST_MISMATCH');
 const expected={expectedHeadRevision:before.anchors.headRevision,expectedChestRevision:before.anchors.chestRevision,expectedHintRevision:before.anchors.hintRevision,expectedPlayerRevision:before.anchors.playerRevision,expectedPurchasedPackageCount:before.chest.hintState.purchasedPackageCount,expectedHeadDigest:before.anchors.headDigest,expectedChestDigest:before.anchors.chestDigest,expectedPlayerDigest:before.anchors.playerDigest};for(const [field,actual]of Object.entries(expected))if(r[field]!==actual)c.fail('CAS_CONFLICT');
 const updated=old.applyHintPurchaseDocuments({chest:docs.chest,player:docs.player}),player=updated.player;
 // Promotion is part of this real purchase, not initialization or a repair.
 player.documentVersion=3;player.data.personal=docs.player.documentVersion===1?{personalStateVersion:2,activeAttempts:null,lastClosedChestId:null,lastClosedActionId:null}:{...c.copy(docs.player.data.personal),personalStateVersion:2};
 const after=records.requireActiveReadSet({uid,head:docs.head,identity:docs.identity,player,chest:updated.chest,start:docs.start});
 return {chest:updated.chest,player,response:{...after,actionResult:{kind:'BUY_HINT_PACKAGE',packageNumber:updated.chest.data.record.assignment.purchasedPackageCount,price:{cookies:1}}}};
}
export function requirePurchaseAction(value,options){
 const raw=c.copy(value),{uid,identity}=c.exact(options,['uid','identity']);const d=document(raw,ref({uid,kind:'ACTION',id:raw?.id}));if(d.documentVersion!==4)c.fail('INVALID_PURCHASE_ACTION_VERSION');const a=d.data;
 let beforeIdentity=null;if(a.identityDigest!==null){if(!identity||c.digest(identity)!==a.identityDigest)c.fail('CREW_IDENTITY_MISMATCH');beforeIdentity=records.document(identity,ref({uid,kind:'LOCAL_IDENTITY',id:'current'}));}
 if(a.beforeHead?.documentVersion===3&&a.identityDigest===null)c.fail('CREW_IDENTITY_MISSING');
 const docs={head:a.beforeHead,identity:beforeIdentity,chest:a.beforeChest,start:a.beforeStart,player:a.beforePlayer,action:null};
 const recomputed=calculate(uid,a.request,docs);if(c.canonical(recomputed.response)!==c.canonical(a.response))c.fail('ACTION_RESPONSE_BINDING_MISMATCH');return d;
}
function receipt(uid,r,action,response){return c.freeze({purchaseReceiptVersion:1,uid,requestId:r.requestId,actionContractVersion:r.actionContractVersion,chestId:r.chestId,modeId:r.actionContractVersion===3?r.modeId:'PERSONAL',packageNumber:response.chest.hintState.purchasedPackageCount,price:{cookies:1},actionDigest:c.digest(action)});}
function currentAfterReceipt(docs,response){
 const x=response.anchors;if(!docs.head||docs.head.revision<x.headRevision||docs.player.revision<x.playerRevision)c.fail('RECEIPT_AHEAD_OF_STATE');
 if(docs.head.revision===x.headRevision&&c.digest(docs.head)!==x.headDigest||docs.player.revision===x.playerRevision&&c.digest(docs.player)!==x.playerDigest)c.fail('RECEIPT_STATE_CONFLICT');
 if(docs.head.data.activeChestId===response.chest.chestId){if(!docs.chest||docs.chest.revision<x.chestRevision||docs.chest.data.record.assignment.revision<x.hintRevision||docs.chest.data.record.assignment.purchasedPackageCount<response.chest.hintState.purchasedPackageCount)c.fail('RECEIPT_AHEAD_OF_STATE');if(docs.chest.revision===x.chestRevision&&c.digest(docs.chest)!==x.chestDigest)c.fail('RECEIPT_STATE_CONFLICT');}
}
export function preparePurchase(uid,value,frame){
 c.uid(uid);const r=requireHintPurchaseRequest(value),{docs}=readFrame(uid,frame);
 if(docs.action){const a=docs.action;let response;
  if(a.documentVersion===4&&r.actionContractVersion===3){requirePurchaseAction(a,{uid,identity:docs.identity});if(c.canonical(a.data.request)!==c.canonical(r))c.fail('REQUEST_REUSED');response=a.data.response;}
  else if(a.documentVersion===1&&r.actionContractVersion===1)response=old.purchaseTransition(uid,r,{action:a}).response;
  else if(a.documentVersion===2&&r.actionContractVersion===2)response=legacyV2.replay(uid,r,'BUY_HINT_PACKAGE',a).response;
  else c.fail('REQUEST_REUSED');
  if(a.id!==r.requestId||a.data.kind!=='BUY_HINT_PACKAGE')c.fail('REQUEST_REUSED');currentAfterReceipt(docs,response);return c.freeze({writes:[],action:a,receipt:receipt(uid,r,a,response),replayed:true});
 }
 if(r.actionContractVersion!==3)c.fail('LEGACY_REPLAY_MISSING');const plan=calculate(uid,r,docs);
 const action={documentVersion:4,uid,kind:'ACTION',id:r.requestId,revision:1,data:{actionVersion:4,kind:'BUY_HINT_PACKAGE',request:r,fingerprint:fingerprint(uid,r),beforeHead:c.copy(docs.head),beforeChest:c.copy(docs.chest),beforeStart:c.copy(docs.start),beforePlayer:c.copy(docs.player),identityDigest:docs.identity?c.digest(docs.identity):null,responseDigest:c.digest(plan.response),response:plan.response}};
 requirePurchaseAction(action,{uid,identity:docs.identity});return c.freeze({writes:[plan.chest,plan.player,action],action,receipt:receipt(uid,r,action,plan.response),replayed:false});
}
