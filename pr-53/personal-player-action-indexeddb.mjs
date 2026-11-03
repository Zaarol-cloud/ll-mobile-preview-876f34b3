import * as c from './personal-player-action-contract.mjs';
// Same version-1 document store, independently versioned action boundary.
export function createPersonalActionAdapter({databaseName,indexedDB=globalThis.indexedDB}={}){
  if(typeof databaseName!=='string'||!/^lockloot-d203c2-b4-[A-Za-z0-9_-]{1,80}$/.test(databaseName)||!indexedDB?.open)c.fail('ISOLATED_DATABASE_REQUIRED');
  let opened,closed=false;const metrics={reads:0,writes:0,completed:0,aborted:0,maxReads:0,maxWrites:0};
  function open(){if(closed)return Promise.reject(Error('DB_CLOSED'));if(opened)return opened;return opened=new Promise((resolve,reject)=>{let settled=false;const rejectOnce=e=>{if(!settled){settled=true;reject(e);}};const r=indexedDB.open(databaseName,1);r.onblocked=()=>rejectOnce(Error('DB_BLOCKED'));r.onerror=()=>rejectOnce(r.error);r.onupgradeneeded=e=>{if(e.oldVersion!==0){r.transaction.abort();return;}r.result.createObjectStore('documents',{keyPath:'key'});};r.onsuccess=()=>{const db=r.result;if(settled){db.close();return;}if(closed||db.objectStoreNames.length!==1||!db.objectStoreNames.contains('documents')){db.close();rejectOnce(Error('DB_SCHEMA_MISMATCH'));return;}const s=db.transaction('documents').objectStore('documents');if(s.keyPath!=='key'||s.autoIncrement||s.indexNames.length){db.close();rejectOnce(Error('DB_SCHEMA_MISMATCH'));return;}db.onversionchange=()=>{closed=true;db.close();};settled=true;resolve(db);};});}
  async function transact(owner,kind,value,{signal}={}){
    c.ref(owner,'PLAYER');const req=kind==='BUY_HINT_PACKAGE'?c.request(value):null;
    if(!['INIT','SNAPSHOT','BUY_HINT_PACKAGE'].includes(kind))c.fail('UNSUPPORTED_ACTION');
    const db=await open();if(signal?.aborted)c.fail('ACTION_ABORTED');
    return new Promise((resolve,reject)=>{
      let tx,failure,result,finished=false,reads=0,writes=0;const docs=new Map();
      const abort=e=>{failure ||= e;try{tx.abort();}catch{}};const onSignal=()=>abort(Object.assign(Error('ACTION_ABORTED'),{code:'ACTION_ABORTED'}));
      const cleanup=()=>signal?.removeEventListener('abort',onSignal);
      try{tx=db.transaction('documents',kind==='SNAPSHOT'?'readonly':'readwrite');const store=tx.objectStore('documents');
        tx.oncomplete=()=>{finished=true;cleanup();metrics.completed++;metrics.maxReads=Math.max(metrics.maxReads,reads);metrics.maxWrites=Math.max(metrics.maxWrites,writes);resolve(c.copy(result));};
        tx.onabort=()=>{finished=true;cleanup();metrics.aborted++;reject(failure||tx.error||Error('TRANSACTION_ABORTED'));};tx.onerror=()=>{};
        signal?.addEventListener('abort',onSignal,{once:true});if(signal?.aborted){onSignal();return;}
        function get(r,done){if(++reads>c.MAX_READS)c.fail('READ_LIMIT');metrics.reads++;const q=store.get(c.key(r));q.onsuccess=()=>{if(failure||finished)return;try{const row=q.result;if(row&&row.key!==c.key(r))c.fail('STORED_KEY_MISMATCH');const d=row?c.document(row.document,r):null;docs.set(c.key(r),d);done(d);}catch(e){abort(e);}};}
        function commit(plan){result=plan.response;if(plan.writes.length>3)c.fail('IMPLEMENTED_WRITE_LIMIT');for(const d of plan.writes){const r=c.ref(owner,d.kind,d.id);c.document(d,r);const old=docs.get(c.key(r));if(old?.kind==='ACTION')c.fail('IMMUTABLE_ACTION');if(d.revision!==(old?old.revision+1:1))c.fail('INVALID_WRITE_REVISION');const q=old?store.put({key:c.key(r),document:d}):store.add({key:c.key(r),document:d});q.onerror=()=>{};writes++;metrics.writes++;}}
        const pr=c.ref(owner,'PLAYER');
        if(kind==='INIT'){get(pr,player=>get(c.ref(owner,'ACTION',c.INIT_ID),action=>commit(c.initTransition(owner,player,action))));return;}
        function load(){get(c.ref(owner,'HEAD'),head=>get(pr,player=>{
          if(!player)c.fail('PLAYER_MISSING');
          if(!head?.data.activeChestId){if(kind==='BUY_HINT_PACKAGE')c.fail('HEAD_CHEST_MISMATCH');result=c.publicSnapshot(owner,head,null,null,player);return;}
          const chestId=req?.chestId||head.data.activeChestId;
          get(c.ref(owner,'CHEST',chestId),chest=>{if(!chest)c.fail('MISSING_ACTIVE_CHEST');get(c.ref(owner,'REQUEST',chest.data.start.requestId),start=>{
            if(kind==='SNAPSHOT')result=c.publicSnapshot(owner,head,chest,start,player);
            else commit(c.purchaseTransition(owner,req,{head,chest,start,player,action:null}));
          });});
        }));}
        if(kind==='BUY_HINT_PACKAGE')get(c.ref(owner,'ACTION',req.requestId),action=>{if(action)commit(c.purchaseTransition(owner,req,{action}));else load();});else load();
      }catch(e){if(tx&&!finished)abort(e);else{cleanup();reject(e);}}
    });
  }
  return Object.freeze({initialize:(uid,options)=>transact(uid,'INIT',null,options),snapshot:uid=>transact(uid,'SNAPSHOT'),purchase:(uid,request,options)=>transact(uid,'BUY_HINT_PACKAGE',request,options),diagnostics:()=>({...metrics}),async close(){closed=true;if(opened){try{(await opened).close();}catch{}}}});
}
