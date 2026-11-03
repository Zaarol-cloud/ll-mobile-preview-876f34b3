import {createCrewInvitationCore,requireSelection} from './personal-chest-crew-invitation-factories.mjs';
import {sha256} from './personal-chest-storage-contract.mjs';
const core=createCrewInvitationCore({requireSelection,sha256Utf8:sha256});
const error=code=>Object.assign(new TypeError(code),{code});
export function createCrewInvitationBrowser({subtle=globalThis.crypto?.subtle}={}){
 return Object.freeze({INVITATION_CONTRACT_VERSION:core.INVITATION_CONTRACT_VERSION,MAX_INPUT_LENGTH:core.MAX_INPUT_LENGTH,RULE_SET:core.RULE_SET,createInvitation:core.createInvitation,parseInvitation:core.parseInvitation,async derivePrivateMaterial(input,{signal}={}){
  const plan=core.preparePrivateMaterial(input),h=core.hmacInput(plan);
  const abort=()=>{if(signal?.aborted)throw error('DERIVATION_ABORTED');};abort();
  if(!subtle?.importKey||!subtle?.sign)throw error('SUBTLE_CRYPTO_REQUIRED');
  // Private copies only; no caller byte-array reference survives an await.
  const keyBytes=Uint8Array.from(h.keyHex.match(/../g).map(x=>parseInt(x,16))),messageBytes=new TextEncoder().encode(h.messageText);
  const key=await subtle.importKey('raw',keyBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);abort();
  const result=await subtle.sign('HMAC',key,messageBytes);abort();
  if(!(result instanceof ArrayBuffer)||result.byteLength!==32)throw error('INVALID_HMAC_RESULT');
  return core.finishPrivateMaterial(plan,Array.from(new Uint8Array(result),x=>x.toString(16).padStart(2,'0')).join(''));
 }});
}
const api=createCrewInvitationBrowser();
export const {INVITATION_CONTRACT_VERSION,MAX_INPUT_LENGTH,RULE_SET,createInvitation,parseInvitation,derivePrivateMaterial}=api;
