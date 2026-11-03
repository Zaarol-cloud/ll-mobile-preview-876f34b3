import {copy, exact, canonical, sha256} from './personal-chest-storage-contract.mjs';

// Pure evidence inspection. This module owns no storage, clock, initialization,
// booking or generator. Historical arithmetic below checks recorded evidence;
// it is never returned as an instruction to credit resources.
export const SOURCE = Object.freeze({
  sourceCommit: '931caa58329f5aba3071cfadfea430aca877b64f',
  fixtureSha256: '04ceb6f210051e7ee7babf11579148d96910d3a5ec0e6559d11c4a2b55c47561',
  runtimeSha256: 'bdb3a52e1d6355b5609928132a1eaa01d660b3fcc4ead7b432e33b30308bc5d9',
  poolDigest: 'dad6f6df3851058ed7ba116fe226a04b2234030c6fccfd0e0db8ebf482587633',
  progressKey: 'lockloot.teacher-demo.v1.dad6f6df3851058ed7ba116fe226a04b2234030c6fccfd0e0db8ebf482587633.progress',
});
export const FIXTURE_PROJECTION_SHA256 = '50d07198b2bd4b90913b93e792034e16f92c902633e0fa5acc3ccb76b28eb7ef';
export const LIMITS = Object.freeze({rawBytes: 8 * 1024 * 1024, jsonNodes: 524288,
  jsonDepth: 48, fixtureBytes: 1024 * 1024, operations: 516});
const uid = 'teacher_demo_local', chestId = 'teacher_demo_chest_v1';
const completedId = 'teacher_demo_complete_v1';
const walletFields = ['cookies','lockpicks','booster5','booster10','booster25','totalBoost','revision','schemaVersion'];
const rewardFields = ['cookies','lockpicks','booster5','booster10','booster25'];
const topFields = ['schemaVersion','poolDigest','setId','uid','wallet','purchasedPackageCount','attempts','solved','calendar','completion','operations'];
const proposals = new WeakSet();
const fail = code => {throw Object.assign(new TypeError(code), {code});};
const integer = value => {if (!Number.isSafeInteger(value) || value < 0) fail('LEGACY_INTEGER_INVALID'); return value;};
const add = (a,b) => integer(integer(a) + integer(b));
const equal = (a,b,reason) => {if (canonical(a) !== canonical(b)) fail(reason);};
const freeze = value => {if (value && typeof value === 'object') {
  for (const child of Object.values(value)) freeze(child); Object.freeze(value);
} return value;};
const zeroReward = () => ({cookies:0,lockpicks:0,booster5:0,booster10:0,booster25:0});
const initialWallet = () => ({cookies:20,lockpicks:30,booster5:0,booster10:0,booster25:0,totalBoost:0,revision:0,schemaVersion:1});
function json(raw, budget) {
  let value; try {value = JSON.parse(raw);} catch {fail('LEGACY_JSON_INVALID');}
  const stack = [[value,0]];
  while (stack.length) {
    const [item,depth] = stack.pop();
    if (--budget.left < 0 || depth > LIMITS.jsonDepth) fail('LEGACY_WORK_LIMIT');
    if (typeof item === 'number' && !Number.isFinite(item)) fail('LEGACY_INTEGER_INVALID');
    if (item && typeof item === 'object') for (const child of Object.values(item)) stack.push([child,depth+1]);
  }
  return value;
}
function textSize(raw, maximum, reason) {
  if (typeof raw !== 'string') fail(reason);
  // Original JSON.stringify produces well-formed UTF-16, including escaped
  // lone surrogates. Reject ambiguous replacement-character hash inputs.
  if (raw.length > maximum || !raw.isWellFormed() || new TextEncoder().encode(raw).length > maximum) fail('LEGACY_SIZE_LIMIT');
}
function calendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('LEGACY_DATE_INVALID');
  const [y,m,d] = value.split('-').map(Number), leap = y%4===0 && (y%100!==0 || y%400===0);
  const days = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if (m<1 || m>12 || d<1 || d>days[m-1]) fail('LEGACY_DATE_INVALID');
}
function wallet(value) {
  const w = exact(value,walletFields);
  for (const k of walletFields) integer(w[k]);
  if (w.schemaVersion!==1 || w.totalBoost!==w.booster5*5+w.booster10*10+w.booster25*25) fail('LEGACY_WALLET_INVALID');
  return w;
}
function economy(solved) {
  const rational = (numerator,denominator='1') => ({numerator,denominator});
  return {economyVersion:1,activeChestId:solved?completedId:chestId,rotation:solved?1:0,
    activeBaseValue:rational('299','100'),activeChestBoosters:{booster5:0,booster10:0,booster25:0},
    futureChests:['B','C','D'].map(slot=>({slot,chestId:`teacher_demo_unused_${slot}`,value:rational('0'),maximumValue:rational('10')}))};
}
function hintState(s,hints) {
  return {chestId,generatorVersion:1,purchasedPackageCount:s.purchasedPackageCount,
    revealedHintCount:s.purchasedPackageCount*2,revision:s.purchasedPackageCount+s.attempts,
    revealedHints:hints.slice(0,s.purchasedPackageCount*2)};
}
function calendarSnapshot(s,levels,todayClaimed) {
  const p=s.calendarProgress, free=p===30?null:levels[p].free;
  return {calendarVersion:1,cycleId:'teacher_demo_calendar_v1',progress:p,levelCount:30,
    todayClaimed,nextLevel:p===30?null:p+1,cycleCompleted:p===30,premiumEntitled:false,
    freeClaimedLevels:Array.from({length:p},(_,i)=>i+1),premiumClaimedLevels:[],revision:p,
    nextReward:free?{free,premium:zeroReward(),total:free}:null,rewardOverview:levels};
}
function feedback(code,solution) {
  const entered=Array(10).fill(0), target=Array(10).fill(0); let exactPositions=0;
  for(let i=0;i<11;i++){entered[Number(code[i])]++;target[Number(solution[i])]++;if(code[i]===solution[i])exactPositions++;}
  const matchingDigits=entered.reduce((sum,n,i)=>sum+Math.min(n,target[i]),0);
  const axis=parseInt(sha256(`teacher-demo-feedback-v1|${SOURCE.poolDigest}|${code}`).slice(0,2),16)&1?'matchingDigits':'exactPositions';
  const band=n=>n<=3?'low':n<=7?'medium':'high';
  return {schemaVersion:1,policyVersion:1,exactDimension:axis,
    matchingDigits:axis==='matchingDigits'?{precision:'exact',value:matchingDigits}:{precision:'vague',band:band(matchingDigits)},
    exactPositions:axis==='exactPositions'?{precision:'exact',value:exactPositions}:{precision:'vague',band:band(exactPositions)}};
}
function inspectOperation(s,entry,fixture,hints,budget) {
  const [id,rawEntry]=entry, e=exact(rawEntry,['fingerprint','result']);
  if(!/^[A-Za-z0-9_-]{1,64}$/.test(id) || typeof e.fingerprint!=='string')fail('LEGACY_OPERATION_INVALID');
  // The original writer checks operations[id] before inserting. Its inherited
  // Object.prototype entries therefore always take the REQUEST_REUSED path.
  if(Object.hasOwn(Object.prototype,id))fail('LEGACY_UNREACHABLE_REQUEST_ID');
  const fp=json(e.fingerprint,budget);
  if(!Array.isArray(fp)||fp.length!==2||!fp[1]||Array.isArray(fp[1])||typeof fp[1]!=='object'||
    !Object.hasOwn(fp[1],'requestId')||fp[1].requestId!==id||JSON.stringify(fp)!==e.fingerprint)fail('LEGACY_FINGERPRINT_INVALID');
  // Unknown request payload fields are legal in the published runtime. They
  // remain only in raw evidence; never forward them into another contract.
  const [endpoint,q]=fp, priorRevision=s.wallet.revision;
  if(endpoint==='teacher-demo/buy-hint') {
    if(s.solved||q.chestId!==chestId||q.expectedContentVersion!==1||q.expectedWalletRevision!==priorRevision||s.purchasedPackageCount===5||s.wallet.cookies<1)fail('LEGACY_BUY_EVIDENCE_INVALID');
    s.purchasedPackageCount++;s.wallet.cookies--;s.wallet.revision++;
    equal(e.result,{chestId,packageNumber:s.purchasedPackageCount,newlyRevealedHints:hints.slice((s.purchasedPackageCount-1)*2,s.purchasedPackageCount*2),wallet:s.wallet,hintState:hintState(s,hints),economy:economy(false)},'LEGACY_BUY_RESULT_INVALID');
  } else if(endpoint==='teacher-demo/attempt') {
    if(s.solved||q.chestId!==chestId||q.expectedRevision!==priorRevision||q.expectedFeedbackPolicyVersion!==1||typeof q.enteredCode!=='string'||!/^\d{11}$/.test(q.enteredCode)||s.wallet.lockpicks<1)fail('LEGACY_ATTEMPT_EVIDENCE_INVALID');
    const correct=q.enteredCode===fixture.code;
    s.attempts++;s.wallet.lockpicks--;s.wallet.revision++;
    if(correct){
      const consumedBoosters={booster5:s.wallet.booster5,booster10:s.wallet.booster10,booster25:s.wallet.booster25}, boost=s.wallet.totalBoost;
      // Exact published L041 floor strategy, solely to verify the old receipt.
      const reward={cookies:Math.floor(299*(100+boost)*49/(200*99)),lockpicks:Math.floor(299*(100+boost)*79/(200*99)),strategy:'L041_TEST_EQUAL_NOMINAL_SPLIT_FLOOR'};
      s.wallet.cookies=add(s.wallet.cookies,reward.cookies);s.wallet.lockpicks=add(s.wallet.lockpicks,reward.lockpicks);
      Object.assign(s.wallet,{booster5:0,booster10:0,booster25:0,totalBoost:0});s.solved=true;
      s.completion={reward,consumedPersonalBoost:boost,consumedBoosters};
    }
    const expected={success:correct,lockpickCost:1,chestId,attempts:s.attempts,lockpicksRemaining:s.wallet.lockpicks,
      walletRevision:s.wallet.revision,chestRevision:s.purchasedPackageCount+s.attempts,wallet:s.wallet,economy:economy(s.solved)};
    if(!correct)expected.feedback=feedback(q.enteredCode,fixture.code);
    else {
      const boosters={booster5:0,booster10:0,booster25:0};
      Object.assign(expected,{winner:true,reward:s.completion.reward,consumedPersonalBoost:s.completion.consumedPersonalBoost,
        consumedBoosters:s.completion.consumedBoosters,chestBoosters:boosters,boosterOnBooster:boosters,boosterRolls:{},
        newCurrentChest:{chestId:completedId,status:'active',schemaVersion:1,contentVersion:2,hintGeneratorVersion:1,economyVersion:1},
        chestEnd:{schemaVersion:1,closedChestId:chestId,activeChestId:completedId,rotation:1,closedContentVersion:1,outcome:'self',winner:{displayName:null,rank:'Schatzjäger',xpEarned:null},reward:s.completion.reward,consumption:{cookies:s.purchasedPackageCount,lockpicks:s.attempts}}});
    }
    equal(e.result,expected,'LEGACY_ATTEMPT_RESULT_INVALID');
  } else if(endpoint==='teacher-demo/claim') {
    if(s.calendarProgress===30)fail('LEGACY_CALENDAR_EVIDENCE_INVALID');
    // The published writer samples UTC twice: lastDay, then calendarState.
    // Midnight (or a changed device clock) can make todayClaimed false. The
    // historical second date is absent, so only its boolean type is provable.
    if(typeof e.result?.calendar?.todayClaimed!=='boolean')fail('LEGACY_CALENDAR_RESULT_INVALID');
    const free=fixture.calendarLevels[s.calendarProgress++].free;
    for(const k of rewardFields)s.wallet[k]=add(s.wallet[k],free[k]);
    s.wallet.totalBoost=s.wallet.booster5*5+s.wallet.booster10*10+s.wallet.booster25*25;s.wallet.revision++;
    equal(e.result,{dayBoundary:'UTC',progressLevel:s.calendarProgress,rewards:{free,premium:zeroReward(),total:free},wallet:s.wallet,calendar:calendarSnapshot(s,fixture.calendarLevels,e.result.calendar.todayClaimed)},'LEGACY_CALENDAR_RESULT_INVALID');
  } else fail('LEGACY_ENDPOINT_INVALID');
}
export function requireValidatedLegacySource(value) {
  if(!proposals.has(value))fail('VALIDATED_LEGACY_SOURCE_REQUIRED');return value;
}
export function createLegacySourceValidator(value) {
  const options=exact(value,['fixtureRaw','source']);
  equal(exact(options.source,Object.keys(SOURCE)),SOURCE,'LEGACY_SOURCE_BINDING_MISMATCH');
  textSize(options.fixtureRaw,LIMITS.fixtureBytes,'LEGACY_FIXTURE_MISSING');
  if(sha256(options.fixtureRaw)!==FIXTURE_PROJECTION_SHA256)fail('LEGACY_FIXTURE_HASH_MISMATCH');
  const fixture=JSON.parse(options.fixtureRaw);
  // At most 30 + 451 dietriche can ever be spent before the sole old win;
  // afterwards attempts are blocked. 5 purchases + 30 claims + 481 attempts.
  const maxAttempts=30+fixture.calendarLevels.reduce((n,l)=>n+l.free.lockpicks,0);
  if(maxAttempts+5+30!==LIMITS.operations)fail('LEGACY_FIXTURE_LIMIT_MISMATCH');
  return Object.freeze({inspect(raw) {
    if(raw===null||raw===undefined)fail('LEGACY_SOURCE_MISSING');
    textSize(raw,LIMITS.rawBytes,'LEGACY_SOURCE_TYPE');
    const budget={left:LIMITS.jsonNodes}, state=json(raw,budget);
    // Check top fields without copying the potentially large raw evidence tree.
    if(!state||Array.isArray(state)||typeof state!=='object'||Object.keys(state).length!==topFields.length||Object.keys(state).some(k=>!topFields.includes(k)))fail('LEGACY_STATE_FIELDS');
    if(state.schemaVersion!==1||state.poolDigest!==SOURCE.poolDigest||state.uid!==uid)fail('LEGACY_STATE_BINDING_MISMATCH');
    integer(state.setId);integer(state.purchasedPackageCount);integer(state.attempts);
    if(state.setId>=64||state.purchasedPackageCount>5||state.attempts>maxAttempts||typeof state.solved!=='boolean')fail('LEGACY_STATE_COUNTER_INVALID');
    wallet(state.wallet);const calendar=exact(state.calendar,['progress','lastDay','revision']);integer(calendar.progress);integer(calendar.revision);
    if(calendar.progress>30||calendar.revision!==calendar.progress||(calendar.progress===0?calendar.lastDay!==null:calendar.lastDay===null))fail('LEGACY_CALENDAR_INVALID');
    if(calendar.lastDay!==null)calendarDate(calendar.lastDay);
    if(!state.operations||Array.isArray(state.operations)||typeof state.operations!=='object')fail('LEGACY_OPERATIONS_INVALID');
    const entries=Object.entries(state.operations);
    if(entries.length>LIMITS.operations)fail('LEGACY_OPERATION_LIMIT');
    for(const [,e]of entries)integer(e?.result?.wallet?.revision);
    entries.sort((a,b)=>a[1].result.wallet.revision-b[1].result.wallet.revision);
    for(const [i,entry]of entries.entries())if(entry[1].result.wallet.revision!==i+1)fail('LEGACY_REVISION_CHAIN_INVALID');
    const s={wallet:initialWallet(),purchasedPackageCount:0,attempts:0,solved:false,calendarProgress:0,completion:null},hints=fixture.sets[state.setId].hints;
    for(const entry of entries)inspectOperation(s,entry,fixture,hints,budget);
    equal(state.wallet,s.wallet,'LEGACY_FINAL_WALLET_MISMATCH');
    if(state.purchasedPackageCount!==s.purchasedPackageCount||state.attempts!==s.attempts||state.solved!==s.solved||calendar.progress!==s.calendarProgress)fail('LEGACY_FINAL_COUNTER_MISMATCH');
    equal(state.completion,s.completion,'LEGACY_COMPLETION_MISMATCH');
    const proposal=freeze({legacyImportVersion:1,kind:'TEACHER_DEMO_IMPORT_PROPOSAL',
      source:{...SOURCE,raw,rawSha256:sha256(raw),rawEncoding:'UTF-8',fixtureProjectionSha256:FIXTURE_PROJECTION_SHA256},
      oldState:{uid,setId:state.setId,wallet:copy(state.wallet),purchasedPackageCount:state.purchasedPackageCount,attempts:state.attempts,
        wasSolved:state.solved,calendar,completion:copy(state.completion)},
      evidence:{operationCount:entries.length,finalWalletRevision:s.wallet.revision,calendarClaimCount:s.calendarProgress,successfulAttemptCount:s.solved?1:0},
      closedCode:fixture.code,paidHints:copy(hints.slice(0,state.purchasedPackageCount*2))});
    proposals.add(proposal);return proposal;
  }});
}
