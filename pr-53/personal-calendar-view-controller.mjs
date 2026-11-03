import {utcDayFromMillis} from './personal-calendar-contract.mjs';
import {canonical,copy} from './personal-chest-storage-contract.mjs';

// Coordinates the existing readers/writer and one visible scene. This module
// never grants resources, persists a second wallet, or authorizes a claim.
export function createPersonalCalendarViewController({adapter,guard,wallet,levels,
  now=()=>Date.now(),requestId=()=>crypto.randomUUID().replaceAll('-',''),onWallet=()=>{},onCommitted=()=>{}}={}) {
  if(typeof adapter?.inspect!=='function'||typeof adapter?.claim!=='function'||typeof guard!=='function'||typeof wallet!=='function'||
    !Array.isArray(levels)||levels.length!==30||typeof now!=='function'||typeof requestId!=='function')throw Error('CALENDAR_VIEW_DEPENDENCIES');
  const overview=copy(levels);let closed=false,owner=null,owns=()=>false,generation=0,operation=null;
  let phase='loading',calendar=null,balance=null,stamp=null,nextCheck=0,page=0,pageChosen=false,queuedClaim=false,request=null;
  let lastTick=null,lastDay=null;
  const metrics={refreshes:0,guards:0,claims:0,commits:0,stale:0};
  const day=()=>utcDayFromMillis(now());
  const guardStamp=value=>{if(!value?.anchors?.playerDigest||!value.anchors.calendarDigest)throw Error('CALENDAR_VIEW_GUARD_REQUIRED');return canonical({anchors:value.anchors,day:day()});};
  const valid=op=>!closed&&operation===op&&generation===op.token&&owner===op.scene&&owns()&&!op.control.signal.aborted;
  function clear(){calendar=null;balance=null;stamp=null;phase='loading';nextCheck=0;}
  function cancel(){generation++;operation?.control.abort();operation=null;queuedClaim=false;}
  function view(){return Object.freeze({phase,calendar,balance,page,freeOnly:true,pending:operation?.kind==='claim'||phase==='loading',
    backendAvailable:phase==='ready',claimAvailable:phase==='ready'&&operation?.kind!=='claim'&&!!calendar?.claimAvailable,
    retryAvailable:phase==='error'&&!operation,statusKey:phase==='error'?'calendar.local_error':phase==='loading'?'calendar.local_loading':calendar?.cycleCompleted?'calendar.cycle_complete':calendar?.todayClaimed?'calendar.claimed_today':calendar?.reason?'calendar.local_clock':'calendar.local_ready'});}
  async function readGuard(options){metrics.guards++;return guardStamp(await guard(options));}
  async function refresh(op,options){
    phase='loading';calendar=null;balance=null;metrics.refreshes++;
    const before=await readGuard(options);if(!valid(op))return;
    const inspected=await adapter.inspect(options);if(!valid(op))return;
    const actual=await wallet(options);if(!valid(op))return;
    const after=await readGuard(options);if(!valid(op))return;
    if(before!==after){nextCheck=0;return;}
    if(inspected.calendarViewVersion!==1||!Number.isSafeInteger(inspected.progress)||inspected.progress<0||inspected.progress>30||!actual)throw Error('CALENDAR_VIEW_INVALID');
    calendar=Object.freeze({...copy(inspected),calendarVersion:1,levelCount:30,freeClaimedLevels:Array.from({length:inspected.progress},(_,i)=>i+1),premiumClaimedLevels:[],rewardOverview:overview});
    balance=Object.freeze(copy(actual));stamp=after;phase='ready';nextCheck=now()+2000;
    if(!pageChosen)page=Math.min(5,Math.floor(((inspected.nextLevel??30)-1)/5));
    if(request&&(request.calendarId!==inspected.calendarId||inspected.progress>=request.level))request=null;
    onWallet(balance);
  }
  function launch(kind){
    const op={kind,scene:owner,token:generation,control:new AbortController()};operation=op;
    const options={signal:op.control.signal,isCurrent:()=>valid(op)};
    op.promise=Promise.resolve().then(async()=>{
      if(!valid(op))return;
      if(kind==='claim'){
        if(!calendar?.claimAvailable)return;
        if(!request||request.calendarId!==calendar.calendarId||request.level!==calendar.nextLevel)request={requestId:requestId(),calendarId:calendar.calendarId,level:calendar.nextLevel};
        metrics.claims++;let receipt;
        try{receipt=await adapter.claim({requestId:request.requestId},options);}
        catch(error){
          if(!valid(op))throw error;
          // A competing tab or a lost reply is resolved by authoritative reads.
          // The same request ID remains available until observed progress proves it.
          await refresh(op,options);if(phase!=='ready'||calendar?.claimAvailable)throw error;return;
        }
        if(receipt?.committed!==true)throw Error('CALENDAR_COMMIT_UNCONFIRMED');
        metrics.commits++;onCommitted();if(!valid(op))return;
        await refresh(op,options);return;
      }
      if(kind==='guard'){
        const next=await readGuard(options);if(!valid(op))return;
        if(next===stamp){nextCheck=now()+2000;return;}
      }
      await refresh(op,options);
    }).catch(()=>{if(valid(op)){clear();phase='error';nextCheck=Infinity;}}).finally(()=>{
      if(operation!==op){metrics.stale++;return;}operation=null;
      if(queuedClaim){queuedClaim=false;if(!closed&&owner&&owns()&&phase==='ready'&&calendar?.claimAvailable)launch('claim');}
    });
  }
  function tick(scene,isCurrent,action=''){
    if(closed)return view();if(!scene||typeof isCurrent!=='function')throw Error('CALENDAR_VIEW_OWNER');
    if(owner!==scene){cancel();owner=scene;owns=isCurrent;pageChosen=false;clear();}
    if(!owns())return view();
    const tickTime=now(),tickDay=utcDayFromMillis(tickTime);
    if(lastTick!==null&&(tickTime<lastTick||tickDay!==lastDay)&&operation?.kind!=='claim')wake();
    lastTick=tickTime;lastDay=tickDay;
    if(action==='page-next'||action==='page-prev'){page=Math.max(0,Math.min(5,page+(action==='page-next'?1:-1)));pageChosen=true;}
    if(action==='claim'){
      if(phase==='error'){clear();}
      else if(calendar?.claimAvailable){if(operation?.kind==='guard')queuedClaim=true;else if(!operation)launch('claim');}
    }
    if(!operation&&now()>=nextCheck&&phase!=='error')launch(stamp?'guard':'refresh');
    return view();
  }
  function leave(scene){if(owner!==scene)return;cancel();owner=null;owns=()=>false;clear();}
  function wake(){if(closed)return;cancel();clear();}
  return Object.freeze({tick,view,leave,wake,diagnostics:()=>Object.freeze({...metrics}),
    async settled(){while(operation)await operation.promise;return view();},
    async close(){closed=true;cancel();owner=null;clear();}});
}
