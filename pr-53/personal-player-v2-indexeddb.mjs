import * as c from './personal-player-v2-contract.mjs';
import {lastSolution} from './personal-player-v2-end.mjs';
// Same version-1 document store, independently versioned action boundary.
export function createPersonalV2Adapter({databaseName,indexedDB=globalThis.indexedDB,instanceBootstrap=false}={}){
  if(typeof databaseName!=='string'||!/^lockloot-d203c2-b4-[A-Za-z0-9_-]{1,80}$/.test(databaseName)||!indexedDB?.open||typeof instanceBootstrap!=='boolean')c.fail('ISOLATED_DATABASE_REQUIRED');
  let opened,closed=false;const metrics={reads:0,writes:0,completed:0,aborted:0,maxReads:0,maxWrites:0};
  function open(){if(closed)return Promise.reject(Error('DB_CLOSED'));if(opened)return opened;return opened=new Promise((resolve,reject)=>{let settled=false;const rejectOnce=e=>{if(!settled){settled=true;reject(e);}};const r=indexedDB.open(databaseName,1);r.onblocked=()=>rejectOnce(Error('DB_BLOCKED'));r.onerror=()=>rejectOnce(r.error);r.onupgradeneeded=e=>{if(e.oldVersion!==0){r.transaction.abort();return;}r.result.createObjectStore('documents',{keyPath:'key'});};r.onsuccess=()=>{const db=r.result;if(settled){db.close();return;}if(closed||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents')){db.close();rejectOnce(Error('DB_SCHEMA_MISMATCH'));return;}const s=db.transaction('documents').objectStore('documents');if(s.keyPath!=='key'||s.autoIncrement||s.indexNames.length){db.close();rejectOnce(Error('DB_SCHEMA_MISMATCH'));return;}db.onversionchange=()=>{closed=true;db.close();};settled=true;resolve(db);};});}
  async function transact(owner,kind,value,{signal,prepared}={}){
    c.ref(owner,'PLAYER');const req=['BUY_HINT_PACKAGE','ATTEMPT_CHEST','PREPARE_ATTEMPT'].includes(kind)?c.request(value,kind==='PREPARE_ATTEMPT'?'ATTEMPT_CHEST':kind):null;
    if(!['INIT','SNAPSHOT','LAST_SOLUTION','BUY_HINT_PACKAGE','ATTEMPT_CHEST','PREPARE_ATTEMPT'].includes(kind))c.fail('UNSUPPORTED_ACTION');
    // Only the new opt-in bootstrap loads the shared validator. Historical
    // standalone exports keep their original import graph and default behavior.
    const initRecords=kind==='INIT'&&instanceBootstrap?(await import('./personal-chest-instance-read-factories.mjs')).records:null;
    if(signal?.aborted)c.fail('ACTION_ABORTED');const db=await open();if(signal?.aborted)c.fail('ACTION_ABORTED');
    return new Promise((resolve,reject)=>{
      let tx,failure,result,finished=false,reads=0,writes=0;const docs=new Map();
      const abort=e=>{failure ||= e;try{tx.abort();}catch{}};const onSignal=()=>abort(Object.assign(Error('ACTION_ABORTED'),{code:'ACTION_ABORTED'}));
      const cleanup=()=>signal?.removeEventListener('abort',onSignal);
      try{tx=db.transaction('documents',['SNAPSHOT','LAST_SOLUTION','PREPARE_ATTEMPT'].includes(kind)?'readonly':'readwrite');const store=tx.objectStore('documents');
        tx.oncomplete=()=>{finished=true;cleanup();metrics.completed++;metrics.maxReads=Math.max(metrics.maxReads,reads);metrics.maxWrites=Math.max(metrics.maxWrites,writes);resolve(c.copy(result));};
        tx.onabort=()=>{finished=true;cleanup();metrics.aborted++;reject(failure||tx.error||Error('TRANSACTION_ABORTED'));};tx.onerror=()=>{};
        signal?.addEventListener('abort',onSignal,{once:true});if(signal?.aborted){onSignal();return;}
        function get(r,done){if(++reads>c.MAX_READS)c.fail('READ_LIMIT');metrics.reads++;const q=store.get(c.key(r));q.onsuccess=()=>{if(failure||finished)return;try{const row=q.result;if(row&&row.key!==c.key(r))c.fail('STORED_KEY_MISMATCH');const d=row?(initRecords&&r.kind==='PLAYER'?initRecords.requirePlayerReadDocument(row.document,{uid:owner}):c.document(row.document,r)):null;docs.set(c.key(r),d);done(d);}catch(e){abort(e);}};}
        function commit(plan){result=plan.response;if(plan.writes.length>c.MAX_WRITES)c.fail('IMPLEMENTED_WRITE_LIMIT');for(const d of plan.writes){const r=c.ref(owner,d.kind,d.id);c.document(d,r);if(!docs.has(c.key(r)))c.fail('WRITE_WITHOUT_READ');const old=docs.get(c.key(r));if(old&&['ACTION','ARCHIVE','REQUEST'].includes(old.kind))c.fail('IMMUTABLE_DOCUMENT');if(d.revision!==(old?old.revision+1:1))c.fail('INVALID_WRITE_REVISION');const q=old?store.put({key:c.key(r),document:d}):store.add({key:c.key(r),document:d});q.onerror=()=>{};writes++;metrics.writes++;}}
        const pr=c.ref(owner,'PLAYER');
        if(kind==='INIT'){get(pr,player=>get(c.ref(owner,'ACTION',c.INIT_ID),action=>{
          if(!initRecords){commit(c.initTransition(owner,player,action));return;}
          if(player){commit(c.initTransition(owner,c.walletDocument(player),action));return;}
          if(action)c.fail('INIT_PLAYER_MISSING');
          // Scalar empty-store guard shares this original INIT write lock.
          // Reuse its exact two documents; never repair any nonempty store.
          reads++;metrics.reads++;const q=store.count();q.onsuccess=()=>{if(failure||finished)return;try{if(q.result!==0)c.fail('INITIALIZATION_STATE_NOT_EMPTY');commit(c.initTransition(owner,null,null));}catch(e){abort(e);}};
        }));return;}
        if(kind==='LAST_SOLUTION'){get(c.ref(owner,'HEAD'),head=>get(pr,player=>{if(!player)c.fail('PLAYER_MISSING');const p=player.data.personal;if(!p?.lastClosedChestId){result=null;return;}get(c.ref(owner,'ARCHIVE',p.lastClosedChestId),archive=>{if(!archive)c.fail('MISSING_CLOSURE_PROOF');get(c.ref(owner,'REQUEST',archive.data.start.requestId),start=>get(c.ref(owner,'REQUEST',p.lastClosedActionId),end=>get(c.ref(owner,'ACTION',p.lastClosedActionId),action=>{result=lastSolution(owner,{head,player,archive,start,end,action});})));});}));return;}
        function load(){get(c.ref(owner,'HEAD'),head=>get(pr,player=>{
          if(!player)c.fail('PLAYER_MISSING');
          if(!head?.data.activeChestId){if(req)c.fail('HEAD_CHEST_MISMATCH');result=c.snapshot(owner,head,null,null,player);return;}
          const chestId=req?.chestId||head.data.activeChestId;
          get(c.ref(owner,'CHEST',chestId),chest=>{if(!chest)c.fail('MISSING_ACTIVE_CHEST');get(c.ref(owner,'REQUEST',chest.data.start.requestId),start=>{
            const finish=(archive=null,end=null)=>{if(kind==='SNAPSHOT')result=c.snapshot(owner,head,chest,start,player);else if(kind==='PREPARE_ATTEMPT')result={docs:{head,chest,start,player,archive,end}};else commit(c.transition(owner,req,kind,{head,chest,start,player,archive,end,action:null},prepared));};
            if((kind==='PREPARE_ATTEMPT'&&req.enteredCode===chest.data.record.material.solutionCode)||(kind==='ATTEMPT_CHEST'&&prepared?.success))get(c.ref(owner,'ARCHIVE',chestId),archive=>get(c.ref(owner,'REQUEST',req.requestId),end=>finish(archive,end)));else finish();
          });});
        }));}
        if(req)get(c.ref(owner,'ACTION',req.requestId),action=>{if(action){if(kind==='PREPARE_ATTEMPT')result={replay:c.replay(owner,req,'ATTEMPT_CHEST',action).response};else commit(c.replay(owner,req,kind,action));}else load();});else load();
      }catch(e){if(tx&&!finished)abort(e);else{cleanup();reject(e);}}
    });
  }
  return Object.freeze({initialize:(uid,options)=>transact(uid,'INIT',null,options),snapshot:uid=>transact(uid,'SNAPSHOT'),lastSolution:uid=>transact(uid,'LAST_SOLUTION'),purchase:(uid,request,options)=>transact(uid,'BUY_HINT_PACKAGE',request,options),async attempt(uid,request,options={}){const trusted=c.request(request,'ATTEMPT_CHEST'),signal=options.signal;const pre=await transact(uid,'PREPARE_ATTEMPT',trusted,{signal});if(pre.replay)return pre.replay;const prepared=await c.prepareAttempt(uid,trusted,pre.docs);return transact(uid,'ATTEMPT_CHEST',trusted,{signal,prepared});},diagnostics:()=>({...metrics}),async close(){closed=true;if(opened){try{(await opened).close();}catch{}}}});
}
