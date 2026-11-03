import {helpers as c,ref,document,verifySuccessfulAttemptProof} from './personal-player-v3-attempt-contract.mjs';
import {records} from './personal-chest-instance-read-factories.mjs';
import {recordContract as crewRecords} from './personal-chest-crew-lifecycle-factories.mjs';
import {assignments} from './personal-chest-browser-bundle.mjs';
export const helpers=c,LAST_SOLUTION_VERSION=2,MAX_READS=7;
export {ref,document};
const crewId=value=>typeof value==='string'&&/^crew_[a-f0-9]{56}$/.test(value);
export function validateLastSolutionBase(value){const s=c.exact(value,['uid','head','player','identity']);c.uid(s.uid);
 for(const [name,kind]of [['head','HEAD'],['player','PLAYER'],['identity','LOCAL_IDENTITY']])if(s[name]!==null)s[name]=document(s[name],ref({uid:s.uid,kind,id:'current'}));
 crewRecords.identity.bind(s.head,s.identity,s.uid);if(!s.player){if(s.head)c.fail('PLAYER_MISSING');return c.freeze({...s,lastClosedChestId:null,lastClosedActionId:null});}
 const meta=s.player.documentVersion===1?{activeAttempts:null,lastClosedChestId:null,lastClosedActionId:null}:s.player.data.personal;
 if(!s.head&&(meta.activeAttempts||meta.lastClosedChestId))c.fail('MISSING_HEAD');
 if(meta.activeAttempts&&(!s.head?.data.activeChestId||meta.activeAttempts.chestId!==s.head.data.activeChestId))c.fail('ATTEMPT_CHEST_BINDING_MISMATCH');
 if((crewId(s.head?.data.activeChestId)||crewId(meta.activeAttempts?.chestId)||crewId(meta.lastClosedChestId))&&(!s.head||s.head.documentVersion!==3||!s.identity))c.fail('CREW_ANCHOR_REQUIRED');
 if(meta.lastClosedChestId!==null&&meta.lastClosedChestId===s.head?.data.activeChestId)c.fail('ACTIVE_SOLUTION_FORBIDDEN');
 return c.freeze({...s,lastClosedChestId:meta.lastClosedChestId,lastClosedActionId:meta.lastClosedActionId});
}
function result(base,archive,action,solution,reason){return c.freeze({lastSolutionVersion:2,uid:base.uid,status:solution?'AVAILABLE':'DISABLED',reason:solution?null:reason,binding:{headRevision:base.head?.revision??0,headDigest:base.head?c.digest(base.head):null,activeChestId:base.head?.data.activeChestId??null,playerRevision:base.player?.revision??0,playerDigest:base.player?c.digest(base.player):null,closedChestId:base.lastClosedChestId,closedContentVersion:archive?action.data.response.anchors.chestRevision:null,lastClosedActionId:base.lastClosedActionId,archiveDigest:archive?c.digest(archive):null,actionDigest:action?c.digest(action):null},solution});}
export async function evaluateLastSolutionReadSet(value,options={}){
 const s=c.exact(value,['uid','head','player','identity','archive','start','end','action']),base=validateLastSolutionBase({uid:s.uid,head:s.head,player:s.player,identity:s.identity});
 if(base.lastClosedChestId===null){if(s.archive||s.start||s.end||s.action)c.fail('UNEXPECTED_CLOSURE_EVIDENCE');return result(base,null,null,null,'NO_CLOSED_CHEST');}
 if(!s.archive||!s.start||!s.end||!s.action)c.fail('MISSING_CLOSURE_PROOF');const uid=base.uid,cid=base.lastClosedChestId,endId=base.lastClosedActionId;
 const archive=document(s.archive,ref({uid,kind:'ARCHIVE',id:cid})),start=document(s.start,ref({uid,kind:'REQUEST',id:archive.data.start.requestId})),end=document(s.end,ref({uid,kind:'REQUEST',id:endId})),action=document(s.action,ref({uid,kind:'ACTION',id:endId}));
 const proof=await verifySuccessfulAttemptProof({uid,identity:base.identity,action},options);
 if(proof.request.chestId!==cid||proof.request.requestId!==endId||proof.afterPlayer.data.personal.lastClosedChestId!==cid||proof.afterPlayer.data.personal.lastClosedActionId!==endId)c.fail('PLAYER_CLOSURE_POINTER_MISMATCH');
 if(c.canonical(archive)!==c.canonical(proof.closed[2])||c.canonical(end)!==c.canonical(proof.closed[3])||c.canonical(start)!==c.canonical(proof.start))c.fail('ARCHIVE_CLOSURE_BINDING_MISMATCH');
 records.requireClosedReadSet({uid,head:base.head,identity:base.identity,archive,start,end});
 const closedHead=proof.closed[0],player=base.player;
 if(player.documentVersion<proof.afterPlayer.documentVersion||player.revision<proof.afterPlayer.revision)c.fail('RECEIPT_AHEAD_OF_PLAYER');
 if(player.revision===proof.afterPlayer.revision&&c.digest(player)!==c.digest(proof.afterPlayer))c.fail('RECEIPT_PLAYER_DIGEST_MISMATCH');
 if(base.head.documentVersion<closedHead.documentVersion)c.fail('HEAD_VERSION_DOWNGRADE');
 if(base.head.revision===closedHead.revision){if(c.canonical(base.head)!==c.canonical(closedHead))c.fail('CLOSURE_HEAD_MISMATCH');}
 else if(base.head.revision!==closedHead.revision+1||base.head.data.activeChestId===null||base.head.data.activeChestId===cid)c.fail('CLOSURE_HEAD_CHRONOLOGY');
 const count=archive.data.record.assignment.purchasedPackageCount,summary=action.documentVersion===5?proof.response.summary:proof.response.actionResult.summary;
 if(count!==proof.request.expectedPurchasedPackageCount||count!==summary.consumption.cookies)c.fail('PAID_PREFIX_BINDING_MISMATCH');
 if(count===0)return result(base,archive,action,null,'NO_PAID_HINTS');
 const hints=assignments.clientHintState(archive.data.record.assignment);if(hints.revealedHintCount!==count*2||hints.revealedHints.length!==count*2)c.fail('PAID_PREFIX_BINDING_MISMATCH');
 return result(base,archive,action,{chestId:cid,modeId:archive.data.record.selection.modeId,closedCode:archive.data.record.material.solutionCode,hintGeneratorVersion:4,codeLength:archive.data.record.selection.codeLength,packageCount:archive.data.record.selection.packageCount,purchasedPackageCount:count,revealedHintCount:hints.revealedHintCount,revealedHints:hints.revealedHints},null);
}
