import * as b from './personal-chest-storage-contract.mjs';
import {contracts as c,assignments as a} from './personal-chest-browser-bundle.mjs';
// Independent local contract. Hashes/CAS are not security against device owners.
// B1/B2 remain frozen. Future contract ceiling 6 writes; implemented buy uses 3.
export const ACTION_CONTRACT_VERSION=1, MAX_READS=5, MAX_WRITES=6;
export const INIT_ID='personal-player-init-v1';
export const fail=b.fail, copy=b.copy, canonical=b.canonical, digest=b.digest;
export function ref(owner,kind,id='current') {
  b.uid(owner);
  if(kind==='PLAYER'){if(id!=='current')fail('INVALID_ID');}
  else if(kind==='ACTION')b.id(id);
  else return b.ref({uid:owner,kind,id});
  return {uid:owner,kind,id};
}
export const key=r=>canonical(ref(r.uid,r.kind,r.id));
const increment=n=>{b.revision(n);if(n===Number.MAX_SAFE_INTEGER)fail('REVISION_OVERFLOW');return n+1;};
export function requireResponse(value,owner,kind,r){
  const s=b.exact(value,kind==='INIT'?['uid','wallet']:['uid','activeChestId','chest','wallet','anchors']);
  if(s.uid!==owner)fail('RESPONSE_UID_MISMATCH');
  const w=b.exact(s.wallet,['walletVersion','cookies','lockpicks','points','revision']);
  if(w.walletVersion!==1)fail('INVALID_WALLET_VERSION');
  for(const k of ['cookies','lockpicks','points'])b.revision(w[k]);b.revision(w.revision,1);
  if(kind==='INIT')return s;
  b.id(s.activeChestId,true);const chest=b.exact(s.chest,['chestId','status','selection','hintState']);
  if(chest.status!=='ACTIVE'||chest.chestId!==s.activeChestId)fail('RESPONSE_CHEST_MISMATCH');
  const selection=c.requireStartRequest({startContractVersion:1,requestId:'response',...c.selectionInput(chest.selection)}).selection;
  if(canonical(selection)!==canonical(chest.selection))fail('RESPONSE_SELECTION_MISMATCH');
  const h=b.exact(chest.hintState,['chestId','generatorVersion','codeLength','packageCount','purchasedPackageCount','revealedHintCount','revision','revealedHints']);
  b.revision(h.purchasedPackageCount);b.revision(h.revision);b.revision(h.revealedHintCount);
  if(h.chestId!==chest.chestId||h.generatorVersion!==selection.generatorVersion||h.codeLength!==selection.codeLength||h.packageCount!==selection.packageCount||h.purchasedPackageCount>h.packageCount||h.revealedHintCount!==h.purchasedPackageCount*2||!Array.isArray(h.revealedHints)||h.revealedHints.length!==h.revealedHintCount)fail('RESPONSE_HINT_STATE_MISMATCH');
  for(const [i,hint]of h.revealedHints.entries()){
    if(hint.index!==i+1||hint.packageNumber!==Math.floor(i/2)+1||hint.packagePosition!==i%2+1||!Number.isSafeInteger(hint.tier)||hint.tier<1||hint.tier>5||typeof hint.id!=='string'||!hint.id||typeof hint.text!=='string'||!hint.text||typeof hint.textByLanguage?.en!=='string'||!hint.textByLanguage.en||hint.textByLanguage.de!==hint.text||!Array.isArray(hint.visiblePositions)||hint.visiblePositions.some(n=>!Number.isSafeInteger(n)||n<1||n>h.codeLength)||!Array.isArray(hint.positionRoles)||hint.positionRoles.length!==hint.visiblePositions.length||hint.explanationData?.hintId!==hint.id||canonical(hint.explanationData?.visiblePositions)!==canonical(hint.visiblePositions)||canonical(hint.explanationData?.positionRoles)!==canonical(hint.positionRoles))fail('RESPONSE_HINT_MISMATCH');
  }
  const x=b.exact(s.anchors,['headRevision','chestRevision','hintRevision','playerRevision','chestDigest','playerDigest','headDigest']);
  for(const k of ['headRevision','chestRevision','hintRevision','playerRevision'])b.revision(x[k]);
  for(const k of ['chestDigest','playerDigest','headDigest'])if(!/^[a-f0-9]{64}$/.test(x[k]))fail('RESPONSE_DIGEST_MISMATCH');
  if(x.hintRevision!==h.revision||x.playerRevision!==w.revision)fail('RESPONSE_REVISION_MISMATCH');
  const player={documentVersion:1,...ref(owner,'PLAYER'),revision:w.revision,data:{walletVersion:1,cookies:w.cookies,lockpicks:w.lockpicks,points:w.points}};
  if(digest(player)!==x.playerDigest)fail('RESPONSE_WALLET_DIGEST_MISMATCH');
  if(r){
    if(chest.chestId!==r.chestId||x.headRevision!==r.expectedHeadRevision||x.headDigest!==r.expectedHeadDigest||x.chestRevision!==increment(r.expectedChestRevision)||x.playerRevision!==increment(r.expectedPlayerRevision)||h.revision!==increment(r.expectedHintRevision)||h.purchasedPackageCount!==increment(r.expectedPurchasedPackageCount))fail('REPLAY_REQUEST_BINDING_MISMATCH');
    player.revision=r.expectedPlayerRevision;player.data.cookies=increment(w.cookies);
    if(digest(player)!==r.expectedPlayerDigest)fail('REPLAY_PRICE_BINDING_MISMATCH');
  }
  if(a.containsInternalClientFields(s))fail('PRIVATE_PUBLIC_RESPONSE');return s;
}
export function document(value,r) {
  if(!['PLAYER','ACTION'].includes(r.kind))return b.document(value,r);
  const d=b.exact(value,['documentVersion','uid','kind','id','revision','data']);
  if(d.documentVersion!==1||['uid','kind','id'].some(k=>d[k]!==r[k]))fail('DOCUMENT_BINDING_MISMATCH');
  b.revision(d.revision,1);
  if(r.kind==='PLAYER'){
    b.exact(d.data,['walletVersion','cookies','lockpicks','points']);
    if(d.data.walletVersion!==1)fail('INVALID_WALLET_VERSION');
    for(const n of ['cookies','lockpicks','points'])b.revision(d.data[n]);
  }else{
    if(d.revision!==1)fail('IMMUTABLE_ACTION');
    b.exact(d.data,['actionVersion','kind','fingerprint','responseDigest','response']);
    if(d.data.actionVersion!==1||!['INIT','BUY_HINT_PACKAGE'].includes(d.data.kind)||! /^[a-f0-9]{64}$/.test(d.data.fingerprint))fail('INVALID_ACTION');
    if(a.containsInternalClientFields(d.data.response)||d.data.response?.uid!==r.uid)fail('PRIVATE_OR_FOREIGN_RESPONSE');
    if(d.data.responseDigest!==digest(d.data.response))fail('ACTION_RESPONSE_DIGEST_MISMATCH');
    requireResponse(d.data.response,r.uid,d.data.kind);
    if(d.data.kind==='INIT'&&(r.id!==INIT_ID||d.data.fingerprint!==digest({kind:'INIT',uid:r.uid,walletVersion:1})||canonical(d.data.response)!==canonical({uid:r.uid,wallet:{walletVersion:1,cookies:20,lockpicks:30,points:0,revision:1}})))fail('INIT_RESPONSE_BINDING_MISMATCH');
  }
  return d;
}
export function request(value){
  const r=b.exact(value,['actionContractVersion','requestId','chestId','expectedHeadRevision','expectedChestRevision','expectedHintRevision','expectedPlayerRevision','expectedPurchasedPackageCount','expectedChestDigest','expectedPlayerDigest','expectedHeadDigest']);
  if(r.actionContractVersion!==1)fail('INVALID_ACTION_VERSION');b.id(r.requestId);b.id(r.chestId,true);
  if(r.requestId===INIT_ID)fail('RESERVED_ACTION_ID');
  for(const k of ['expectedHeadRevision','expectedChestRevision','expectedHintRevision','expectedPlayerRevision','expectedPurchasedPackageCount'])b.revision(r[k],['expectedHintRevision','expectedPurchasedPackageCount'].includes(k)?0:1);
  for(const k of ['expectedChestDigest','expectedPlayerDigest','expectedHeadDigest'])if(!/^[a-f0-9]{64}$/.test(r[k]))fail('INVALID_EXPECTATION');
  return r;
}
// Frozen assignment validation/derivation is reused synchronously inside IDB.
export function publicSnapshot(owner,head,chest,start,player){
  document(player,ref(owner,'PLAYER'));
  const wallet={...player.data,revision:player.revision};
  if(!head)return {uid:owner,activeChestId:null,chest:null,wallet,anchors:null};
  document(head,ref(owner,'HEAD'));
  if(head.data.activeChestId===null)return {uid:owner,activeChestId:null,chest:null,wallet,anchors:null};
  if(!chest||!start)fail('MISSING_ACTIVE_CHEST');
  document(chest,ref(owner,'CHEST',head.data.activeChestId));
  const r=b.exact(chest.data.record,['chestId','selection','material','assignment','generationContextHash','assignmentDigest','status','closure']);
  if(r.status!=='ACTIVE'||r.closure!==null||chest.data.end!==null)fail('CHEST_NOT_ACTIVE');
  const selection=c.requireStartRequest({startContractVersion:1,requestId:'validation',...c.selectionInput(r.selection)}).selection;
  if(canonical(selection)!==canonical(r.selection)||selection.modeId!=='PERSONAL'||r.chestId!==chest.id)fail('CHEST_SELECTION_MISMATCH');
  b.exact(r.material,['solutionCode','assignmentSalt']);
  if(typeof r.material.solutionCode!=='string'||!/^\d+$/.test(r.material.solutionCode)||r.material.solutionCode.length!==selection.codeLength||! /^[a-f0-9]{64}$/.test(r.material.assignmentSalt))fail('PRIVATE_MATERIAL_MISMATCH');
  const fields=['assignmentSeedHash','generatorVersion','codeLength','packageCount','profileId','packageRewardFactor','tier5UnlockedAtAssignment','assignedHints','t504Fairness','assignmentPolicyVersion','requestedTierCounts','actualTierCounts'];
  b.exact(r.assignment,['chestId','revision','purchasedPackageCount',...fields]);
  const stored=a.requireStoredAssignment(r.assignment);b.revision(stored.revision);a.requirePurchasedPackageCount(stored.purchasedPackageCount,stored);
  const context={uid:owner,chestId:r.chestId,...r.material,generatorVersion:selection.generatorVersion,codeLength:selection.codeLength,profileId:selection.profileId,packageCount:selection.packageCount};
  const base=Object.fromEntries(fields.map(k=>[k,stored[k]]));
  if(stored.chestId!==r.chestId||stored.generatorVersion!==selection.generatorVersion||stored.assignmentPolicyVersion!==selection.hintPolicyVersion||stored.codeLength!==selection.codeLength||stored.profileId!==selection.profileId||stored.packageCount!==selection.packageCount||stored.packageRewardFactor!==selection.factors.packageCount||stored.assignmentSeedHash!==a.deriveAssignmentSeedHash(context)||r.generationContextHash!==digest(context)||r.assignmentDigest!==digest(base))fail('ASSIGNMENT_BINDING_MISMATCH');
  b.exact(chest.data.start,['requestId','operation']);document(start,ref(owner,'REQUEST',chest.data.start.requestId));
  const op=start.data;
  if(canonical(op)!==canonical(chest.data.start.operation)||op.kind!=='START'||op.chestId!==r.chestId||op.committedRevision>head.revision||op.fingerprint!==canonical({kind:'START',startContractVersion:1,selection:c.selectionInput(selection)}))fail('START_BINDING_MISMATCH');
  const safe={chestId:r.chestId,status:'ACTIVE',selection:r.selection,hintState:a.clientHintState(stored)};
  if(a.containsInternalClientFields(safe))fail('PRIVATE_PUBLIC_RESPONSE');
  return {uid:owner,activeChestId:r.chestId,chest:safe,wallet,anchors:{headRevision:head.revision,chestRevision:chest.revision,hintRevision:stored.revision,playerRevision:player.revision,chestDigest:digest(chest),playerDigest:digest(player),headDigest:digest(head)}};
}
export function makeRequest(snapshot,requestId){
  if(!snapshot?.anchors||!snapshot.chest)fail('NO_ACTIVE_CHEST');const x=snapshot.anchors;
  return request({actionContractVersion:1,requestId,chestId:snapshot.chest.chestId,expectedHeadRevision:x.headRevision,expectedChestRevision:x.chestRevision,expectedHintRevision:x.hintRevision,expectedPlayerRevision:x.playerRevision,expectedPurchasedPackageCount:snapshot.chest.hintState.purchasedPackageCount,expectedChestDigest:x.chestDigest,expectedPlayerDigest:x.playerDigest,expectedHeadDigest:x.headDigest});
}
export function initTransition(owner,player,action){
  if(player){document(player,ref(owner,'PLAYER'));if(action)document(action,ref(owner,'ACTION',INIT_ID));return {writes:[],response:{uid:owner,wallet:{...player.data,revision:player.revision}}};}
  if(action)fail('INIT_PLAYER_MISSING');
  const next={documentVersion:1,...ref(owner,'PLAYER'),revision:1,data:{walletVersion:1,cookies:20,lockpicks:30,points:0}};
  const response={uid:owner,wallet:{...next.data,revision:1}};
  return {writes:[next,{documentVersion:1,...ref(owner,'ACTION',INIT_ID),revision:1,data:{actionVersion:1,kind:'INIT',fingerprint:digest({kind:'INIT',uid:owner,walletVersion:1}),responseDigest:digest(response),response}}],response};
}
// Pure document arithmetic shared by validated purchase boundaries. No storage,
// initialization, replay, mode selection or receipt policy is performed here.
export function applyHintPurchaseDocuments({chest,player}){
  const next=a.nextPackage(chest.data.record.assignment);if(!next)fail('PACKAGE_LIMIT');if(player.data.cookies<1)fail('INSUFFICIENT_COOKIES');
  const nc=copy(chest),np=copy(player);nc.revision=increment(nc.revision);np.revision=increment(np.revision);np.data.cookies--;
  const assigned=nc.data.record.assignment;assigned.purchasedPackageCount=next.packageNumber;assigned.revision=increment(assigned.revision);
  return {chest:nc,player:np};
}
export function purchaseTransition(owner,value,{head,chest,start,player,action}){
  const r=request(value),fingerprint=digest({uid:owner,kind:'BUY_HINT_PACKAGE',request:r});
  if(action){document(action,ref(owner,'ACTION',r.requestId));if(action.data.kind!=='BUY_HINT_PACKAGE'||action.data.fingerprint!==fingerprint)fail('REQUEST_REUSED');return {writes:[],response:requireResponse(action.data.response,owner,'BUY_HINT_PACKAGE',r)};}
  if(!player)fail('PLAYER_MISSING');
  const before=publicSnapshot(owner,head,chest,start,player),x=before.anchors;
  if(before.activeChestId!==r.chestId||!x)fail('HEAD_CHEST_MISMATCH');
  for(const [field,actual]of Object.entries({expectedHeadRevision:x.headRevision,expectedChestRevision:x.chestRevision,expectedHintRevision:x.hintRevision,expectedPlayerRevision:x.playerRevision,expectedPurchasedPackageCount:before.chest.hintState.purchasedPackageCount,expectedChestDigest:x.chestDigest,expectedPlayerDigest:x.playerDigest,expectedHeadDigest:x.headDigest}))if(r[field]!==actual)fail('CAS_CONFLICT');
  const {chest:nc,player:np}=applyHintPurchaseDocuments({chest,player});
  const response=publicSnapshot(owner,head,nc,start,np);
  return {writes:[nc,np,{documentVersion:1,...ref(owner,'ACTION',r.requestId),revision:1,data:{actionVersion:1,kind:'BUY_HINT_PACKAGE',fingerprint,responseDigest:digest(response),response}}],response};
}
