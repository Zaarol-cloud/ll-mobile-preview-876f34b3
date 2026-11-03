// Versioned local policy. No security claim against the owner of the device.
import {fail,exact,id} from './personal-chest-storage-contract.mjs';
export const FEEDBACK_POLICY_VERSION=1,SALT_DERIVATION_VERSION=1;
const hex=b=>[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');
const bytes=h=>Uint8Array.from(h.match(/../g),x=>parseInt(x,16));
async function hmac(key,message,subtle){const k=await subtle.importKey('raw',bytes(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await subtle.sign('HMAC',k,new TextEncoder().encode(message)));}
export function truth(enteredCode,solutionCode){
  if(![8,10,12].includes(solutionCode?.length)||typeof enteredCode!=='string'||enteredCode.length!==solutionCode.length||!/^\d+$/.test(enteredCode)||!/^\d+$/.test(solutionCode))fail('INVALID_ATTEMPT_CODE');
  const ec=Array(10).fill(0),sc=Array(10).fill(0);let positions=0;
  for(let i=0;i<solutionCode.length;i++){ec[Number(enteredCode[i])]++;sc[Number(solutionCode[i])]++;if(enteredCode[i]===solutionCode[i])positions++;}
  return {matchingDigits:ec.reduce((n,v,i)=>n+Math.min(v,sc[i]),0),exactPositions:positions,correct:positions===solutionCode.length};
}
export function validateFeedback(value,length){
  const f=exact(value,['schemaVersion','policyVersion','saltDerivationVersion','exactDimension','value']);
  if(f.schemaVersion!==2||f.policyVersion!==1||f.saltDerivationVersion!==1||!['matchingDigits','exactPositions'].includes(f.exactDimension)||!Number.isSafeInteger(f.value)||f.value<0||f.value>(f.exactDimension==='matchingDigits'?length:length-1)||![8,10,12].includes(length))fail('INVALID_FEEDBACK');return f;
}
export function renderFeedback(value,length,translate){
  const f=validateFeedback(value,length),suffix=f.value===0?'zero':f.value===1?'one':'many';
  return translate('personal.feedback_'+(f.exactDimension==='matchingDigits'?'matching':'positions')+'_exact_'+suffix,suffix==='many'?{count:f.value}:{});
}
const personalChestId=value=>id(value,true);
async function deriveSaltWith({assignmentSalt,chestId},subtle,validateChestId){
  validateChestId(chestId);if(!/^[a-f0-9]{64}$/.test(assignmentSalt)||!subtle)fail('INVALID_FEEDBACK_MATERIAL');
  return hex(await hmac(assignmentSalt,JSON.stringify(['lock-loot/personal/feedback-salt/v1',chestId]),subtle));
}
export async function deriveFeedbackSalt(input,subtle=globalThis.crypto?.subtle){return deriveSaltWith(input,subtle,personalChestId);}
async function createFeedbackWith({enteredCode,solutionCode,assignmentSalt,chestId},subtle,validateChestId){
  const counts=truth(enteredCode,solutionCode);if(counts.correct)fail('SUCCESS_PENDING_B');
  const salt=await deriveSaltWith({assignmentSalt,chestId},subtle,validateChestId);
  // Exact L&L-058 policy-v1 byte encoding; requestId/attempt number do not enter it.
  const d=await hmac(salt,JSON.stringify(['lock-loot/l058/failed-feedback/v1',1,chestId,enteredCode]),subtle);
  const exactDimension=['matchingDigits','exactPositions'][d[0]&1];
  return validateFeedback({schemaVersion:2,policyVersion:1,saltDerivationVersion:1,exactDimension,value:counts[exactDimension]},solutionCode.length);
}
export async function createFeedback(input,subtle=globalThis.crypto?.subtle){return createFeedbackWith(input,subtle,personalChestId);}
// Trusted composition only. The original public defaults retain PERSONAL IDs.
export function createFeedbackProvider(value){
  if(!value||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==1)fail('INVALID_FEEDBACK_PROVIDER');
  const d=Object.getOwnPropertyDescriptor(value,'validateChestId');if(!d?.enumerable||!Object.hasOwn(d,'value')||typeof d.value!=='function')fail('INVALID_FEEDBACK_PROVIDER');const validator=d.value;
  return Object.freeze({deriveFeedbackSalt:(input,subtle=globalThis.crypto?.subtle)=>deriveSaltWith(input,subtle,validator),createFeedback:(input,subtle=globalThis.crypto?.subtle)=>createFeedbackWith(input,subtle,validator)});
}
