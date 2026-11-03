import {instance,records} from './personal-chest-instance-read-factories.mjs';
import {createCrewInvitationBrowser} from './personal-chest-crew-invitation-browser.mjs';
const c=instance.helpers;
// Only own data options are accepted. Platform handles and callbacks are trusted
// constructor dependencies, never request data or persistent documents.
function options(value,allowed){if(!value||![Object.prototype,null].includes(Object.getPrototypeOf(value)))c.fail('INVALID_OPTIONS');const result={};for(const key of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,key);if(typeof key!=='string'||!allowed.includes(key)||!d.enumerable||!Object.hasOwn(d,'value'))c.fail('INVALID_OPTIONS');result[key]=d.value;}return result;}
export function createReadonlyInstanceView(value={}){
 const config=options(value,['uid','databaseName','indexedDB','subtle']);
 const owner=c.uid(config.uid),databaseName=config.databaseName,idb=config.indexedDB??globalThis.indexedDB,subtle=config.subtle??globalThis.crypto?.subtle;
 if(typeof databaseName!=='string'||!/^lockloot-d203c2-[A-Za-z0-9_-]{1,100}$/.test(databaseName)||!idb?.open||typeof idb.databases!=='function')c.fail('READONLY_DATABASE_CONFIGURATION');
 const cryptoPort=createCrewInvitationBrowser({subtle});let opened,closed=false,generation=0;
 const controls=new Set(),metrics={readRequests:0,completedTransactions:0,abortedTransactions:0,metadataTransactions:0,maxReadsPerPhase:0,phases:[]};
 const ref=(kind,id='current')=>records.ref({uid:owner,kind,id});
 function begin(value){const opts=options(value??{},['signal','isCurrent']),signal=opts.signal,isCurrent=opts.isCurrent;if(signal!==undefined&&!(signal instanceof AbortSignal))c.fail('INVALID_SIGNAL');if(isCurrent!==undefined&&typeof isCurrent!=='function')c.fail('INVALID_GENERATION_CALLBACK');if(closed)c.fail('VIEW_CLOSED');const token=++generation,control=new AbortController(),forward=()=>control.abort();controls.add(control);signal?.addEventListener('abort',forward,{once:true});if(signal?.aborted)control.abort();return {control,check(){if(closed)c.fail('VIEW_CLOSED');if(control.signal.aborted)c.fail('READ_ABORTED');if(token!==generation||isCurrent&&!isCurrent())c.fail('STALE_READ');},done(){controls.delete(control);signal?.removeEventListener('abort',forward);}};}
 function open(){if(closed)return Promise.reject(Object.assign(Error('VIEW_CLOSED'),{code:'VIEW_CLOSED'}));if(opened)return opened;
  opened=(async()=>{const list=await idb.databases();if(!list.some(row=>row.name===databaseName))c.fail('DATABASE_NOT_FOUND');
   return await new Promise((resolve,reject)=>{let settled=false;const fail=error=>{if(!settled){settled=true;reject(error);}};const request=idb.open(databaseName);
    request.onupgradeneeded=()=>{request.transaction.abort();}; // Never create/upgrade a store.
    request.onerror=()=>fail(Object.assign(Error('READONLY_OPEN_FAILED'),{code:'READONLY_OPEN_FAILED'}));request.onblocked=()=>fail(Object.assign(Error('DB_BLOCKED'),{code:'DB_BLOCKED'}));
    request.onsuccess=()=>{const db=request.result;if(settled||closed){db.close();fail(Object.assign(Error('VIEW_CLOSED'),{code:'VIEW_CLOSED'}));return;}
     try{if(db.version!==1||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents'))c.fail('DB_SCHEMA_MISMATCH');const tx=db.transaction('documents','readonly');metrics.metadataTransactions++;const store=tx.objectStore('documents');if(store.keyPath!=='key'||store.autoIncrement||store.indexNames.length)c.fail('DB_SCHEMA_MISMATCH');db.onversionchange=()=>{closed=true;generation++;for(const control of controls)control.abort();db.close();};settled=true;resolve(db);}catch(error){db.close();fail(error);}
    };
   });})();return opened;
 }
 function phase(db,op,kind,id,expected=null){op.check();return new Promise((resolve,reject)=>{
  let tx,failure,result,finished=false,reads=0;const observed=[],documents={uid:owner,head:null,identity:null,...(kind==='SNAPSHOT'?{player:null,chest:null,start:null}:{archive:null,start:null,end:null})};
  const abort=error=>{failure ||= error;try{tx.abort();}catch{}};const onSignal=()=>abort(Object.assign(Error('READ_ABORTED'),{code:'READ_ABORTED'}));const cleanup=()=>op.control.signal.removeEventListener('abort',onSignal);
  const recordPhase=status=>{metrics.maxReadsPerPhase=Math.max(metrics.maxReadsPerPhase,reads);metrics.phases.push({operation:kind,phase:expected?'REVALIDATE':'READ',reads,status});if(metrics.phases.length>64)metrics.phases.shift();};
  try{tx=db.transaction('documents','readonly');const store=tx.objectStore('documents');tx.onerror=()=>{};
   tx.onabort=()=>{finished=true;cleanup();metrics.abortedTransactions++;recordPhase('ABORTED');reject(failure||tx.error||Error('READ_ABORTED'));};
   tx.oncomplete=()=>{finished=true;cleanup();metrics.completedTransactions++;recordPhase('COMPLETE');try{op.check();resolve(c.freeze(result));}catch(error){reject(error);}};
   op.control.signal.addEventListener('abort',onSignal,{once:true});op.check();
   function get(reference,done){if(++reads>5)c.fail('READ_LIMIT');metrics.readRequests++;const key=c.canonical(reference),request=store.get(key);request.onsuccess=()=>{if(finished||failure)return;try{op.check();let doc=null;if(request.result!==undefined){const row=c.exact(request.result,['key','document']);if(row.key!==key)c.fail('STORED_KEY_MISMATCH');doc=records.document(row.document,reference);}observed.push({ref:reference,document:doc});done(doc);}catch(error){abort(error);}};}
   if(expected){let remaining=expected.length;for(const witness of expected)get(witness.ref,doc=>{if(c.canonical(doc)!==c.canonical(witness.document))c.fail('READSET_CHANGED');if(--remaining===0)result=true;});return;}
   const finish=()=>{const output=kind==='SNAPSHOT'?records.requireActiveReadSet(documents):records.requireClosedReadSet(documents);result={output,documents,witnesses:observed};};
   if(kind==='SNAPSHOT')get(ref('HEAD'),head=>{documents.head=head;get(ref('PLAYER'),player=>{documents.player=player;get(ref('LOCAL_IDENTITY'),identity=>{documents.identity=identity;if(!head?.data.activeChestId){finish();return;}get(ref('CHEST',head.data.activeChestId),chest=>{if(!chest)c.fail('MISSING_ACTIVE_CHEST');documents.chest=chest;get(ref('REQUEST',chest.data.start.requestId),start=>{documents.start=start;finish();});});});});});
   else get(ref('HEAD'),head=>{documents.head=head;get(ref('LOCAL_IDENTITY'),identity=>{documents.identity=identity;get(ref('ARCHIVE',id),archive=>{if(!archive)c.fail('MISSING_CLOSED_EVIDENCE');documents.archive=archive;get(ref('REQUEST',archive.data.start.requestId),start=>{documents.start=start;if(!archive.data.end)c.fail('MISSING_CLOSED_EVIDENCE');get(ref('REQUEST',archive.data.end.requestId),end=>{documents.end=end;finish();});});});});});
  }catch(error){if(tx&&!finished)abort(error);else{cleanup();reject(error);}}
 });}
 async function verifyCrypto(documents,op){const record=(documents.chest||documents.archive)?.data.record;if(record?.selection.modeId!=='CREW')return;
  const material=await cryptoPort.derivePrivateMaterial({invitationCode:record.instanceBinding.invitationCode,browserSaltHex:documents.identity.data.browserSaltHex},{signal:op.control.signal});op.check();if(c.canonical(material)!==c.canonical({chestId:record.chestId,...record.material}))c.fail('CREW_MATERIAL_BINDING_MISMATCH');
 }
 async function run(kind,id,opts){const op=begin(opts);try{op.check();const db=await open();op.check();const first=await phase(db,op,kind,id);op.check();await verifyCrypto(first.documents,op);op.check();await phase(db,op,kind,id,first.witnesses);op.check();return first.output;}finally{op.done();}}
 return Object.freeze({snapshot:(opts={})=>run('SNAPSHOT',null,opts),inspectClosedRecord:(chestId,opts={})=>{const stable=c.id(chestId,true);return run('CLOSED',stable,opts);},diagnostics:()=>c.freeze(c.copy(metrics)),async close(){closed=true;generation++;for(const control of controls)control.abort();if(opened){try{(await opened).close();}catch{}}}});
}
