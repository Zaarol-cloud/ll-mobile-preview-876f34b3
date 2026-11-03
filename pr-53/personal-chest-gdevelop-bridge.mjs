import {contracts as c} from './personal-chest-browser-bundle.mjs';
import {createInstanceStartService} from './personal-chest-instance-start-service.mjs';
import {createWorkerGenerator} from './personal-chest-browser-service.mjs';
import {createReadonlyInstanceView} from './personal-chest-instance-view.mjs';
import {createHintPurchaseAdapter} from './personal-player-v3-purchase-indexeddb.mjs';
import {makeHintPurchaseRequest} from './personal-player-v3-purchase-contract.mjs';
import {createChestAttemptAdapter} from './personal-player-v3-attempt-indexeddb.mjs';
import {makeChestAttemptRequest} from './personal-player-v3-attempt-contract.mjs';
import {createComposedSolutionReader} from './d205-solution-reader.mjs';
import {createJournalOrigin} from './d205-journal-origin.mjs';
import {createBrowserStartup,requirePublicEnvironment,createPublicSourcePort} from './d205-browser-startup.mjs';
import {renderFeedback} from './personal-player-v2-feedback.mjs';
import {requireSelection} from './personal-chest-crew-invitation-factories.mjs';
import {createInvitation,parseInvitation,MAX_INPUT_LENGTH} from './personal-chest-crew-invitation-browser.mjs';
import {createPersonalJournalReader} from './personal-journal-indexeddb.mjs';
import {createPersonalJournalAlias,ALIAS_STORAGE_KEY} from './personal-journal-alias.mjs';
import {createPersonalJournalViewController} from './personal-journal-view-controller.mjs';
import {createPersonalCalendarContract} from './personal-calendar-contract.mjs';
import {createPersonalCalendarAdapter} from './personal-calendar-indexeddb.mjs';
import {createPersonalCalendarViewController} from './personal-calendar-view-controller.mjs';

// B4-3: explicitly authorized isolated offline demo, not production authority.
export const BRIDGE_VERSION = 3;
const profiles = ['VERY_EASY','EASY','NORMAL','HARD','VERY_HARD'];
const one = (scene,name) => scene.getObjects(name)[0];
const text = (scene,name,value) => { const o=one(scene,name); if(o)o.setString(value); };
const translate = (scene,key,params={}) => scene.getGame().__lockLootI18n.t('personal.'+key,params);
const current = scene => scene.getGame().getSceneStack().getCurrentScene()===scene;
const move = (scene,name,x,y,w,h) => {
  const o=one(scene,name);if(!o)return null;
  o.setPosition(x,y);o.setWidth(w);if(typeof o.setCharacterSize!=='function')o.setHeight(h);else o.setY(y+o.getHeight()/2);
  return o;
};
const hit = (o,x,y) => {
  if(!o||o.isHidden())return false;
  const centeredText=typeof o.setCharacterSize==='function',height=centeredText?Math.max(96,o.getHeight()):o.getHeight();
  const top=centeredText?o.getY()-height/2:o.getY(),width=centeredText?Math.max(96,o.getWidth()):o.getWidth();
  return x>=o.getX()&&x<=o.getX()+width&&y>=top&&y<=top+height;
};
const selectionInput = s => c.selectionInput(s);

export function createGDevelopBridge() {
  if(globalThis.__lockLootD2PersonalExport?.bridgeVersion!==BRIDGE_VERSION)throw Error('PERSONAL_EXPORT_REQUIRED');
  const environment={href:location.href,marker:globalThis.__lockLootD2PersonalExport};
  requirePublicEnvironment(environment);
  // Fixed isolated target. Source access is confined to the original progress key.
  const owner='d2-personal-local-v1',databaseName='lockloot-d203c2-b4-1',config={uid:owner,databaseName};
  let startup=null,rawSolutions=null,journalConfig=null,startupLoad=null,startupFailure=null,closed=false,suspended=false,lifetime=new AbortController(),bridgePhase='LOADING',bridgeFailure=null;
  let rawCalendar=null,calendarGuard=null,calendarLevels=null,calendarView=null;
  const fetchControl=new AbortController();
  function loadStartup(){if(startup)return Promise.resolve(startup);if(startupLoad)return startupLoad;
    startupLoad=fetch(new URL('./d205-legacy-fixture-v1.json',import.meta.url),{signal:fetchControl.signal}).then(r=>{if(!r.ok)throw Error('STARTUP_FIXTURE_UNAVAILABLE');return r.text();}).then(fixtureRaw=>{
      if(closed)throw Error('BRIDGE_CLOSED');const originConfig={sourceOrigin:location.origin,fixtureRaw,sourcePort:createPublicSourcePort({environment,storage:localStorage}),subtle:crypto.subtle},reader=createComposedSolutionReader({...originConfig,indexedDB});try{const origin=createJournalOrigin(originConfig),calendar={sourceOrigin:location.origin,fixtureRaw};startup=createBrowserStartup({environment,fixtureRaw,indexedDB,locks:navigator.locks,storage:localStorage,subtle:crypto.subtle});rawSolutions=reader;journalConfig={...config,indexedDB,origin,calendar};calendarLevels=createPersonalCalendarContract(calendar).configuration.levels;rawCalendar=createPersonalCalendarAdapter({...originConfig,indexedDB});calendarGuard=createPersonalJournalReader(journalConfig);}catch(e){void reader.close();throw e;}return startup;
    }).catch(e=>{startupFailure=e;startupLoad=null;throw e;});return startupLoad;
  }
  const startupState=()=>{const state=startup?.view()||{phase:startupFailure?'ERROR':'LOADING',errorCode:startupFailure?.code||null,originKind:null,journalConnected:false,legacySolutionConnected:false,calendarMode:'PRESERVE_ONLY'};const phase=closed?'CLOSED':suspended?'SUSPENDED':state.phase==='READY'?bridgePhase:state.phase;return Object.freeze({...state,phase,errorCode:bridgeFailure?.code||state.errorCode,journalConnected:phase==='READY'&&!!journalConfig});};
  const startupReady=()=>!closed&&!suspended&&bridgePhase==='READY'&&!!startup?.ready();
  const guarded=(fn,index=0)=>async(...args)=>{
    const options=args[index]??{},signal=options.signal,epoch=lifetime,control=new AbortController(),abort=()=>control.abort();
    if(signal!==undefined&&!(signal instanceof AbortSignal))throw Error('INVALID_SIGNAL');
    signal?.addEventListener('abort',abort,{once:true});epoch.signal.addEventListener('abort',abort,{once:true});if(signal?.aborted||epoch.signal.aborted)control.abort();
    let stop;const cancelled=new Promise((_,reject)=>{stop=()=>reject(Object.assign(Error('STARTUP_ABORTED'),{code:'STARTUP_ABORTED'}));control.signal.addEventListener('abort',stop,{once:true});if(control.signal.aborted)stop();});
    args[index]={...options,signal:control.signal};try{await Promise.race([ready,cancelled]);const gate=await Promise.race([loadStartup(),cancelled]);const value=await gate.run(operation=>{args[index]={...options,signal:operation.signal,isCurrent:()=>operation.isCurrent()&&(!options.isCurrent||options.isCurrent())};return fn(...args);},args[index]);if(control.signal.aborted||epoch!==lifetime)throw Error('STARTUP_ABORTED');return value;}
    finally{signal?.removeEventListener('abort',abort);epoch.signal.removeEventListener('abort',abort);control.signal.removeEventListener('abort',stop);}
  };
  const rawService=createInstanceStartService({...config,workerGenerator:createWorkerGenerator({workerURL:new URL('./personal-chest-new-demo-worker-v2.mjs',import.meta.url)})}),rawView=createReadonlyInstanceView(config),rawBuyer=createHintPurchaseAdapter(config),rawAttempts=createChestAttemptAdapter(config);
  const service={start:guarded(rawService.start,1),restore:guarded(rawService.restore),close:rawService.close},view={snapshot:guarded(rawView.snapshot),close:rawView.close},buyer={purchase:guarded(rawBuyer.purchase,1),close:rawBuyer.close},attempts={attempt:guarded(rawAttempts.attempt,1),close:rawAttempts.close},solutions={lastSolution:guarded(options=>rawSolutions.lastSolution(options)),close:()=>rawSolutions?.close()};
  let wallet=null;
  let lastSolution=null,openedSolution=null,pendingSolutionScene=null;
  let solutionQuerySerial=0,solutionHandoffScene=null;
  const menuRefresh=new WeakMap();
  let initialized,ready;
  function beginStartup(resume=false){startupFailure=null;bridgeFailure=null;bridgePhase='LOADING';const epoch=lifetime;initialized=loadStartup().then(async gate=>{if(suspended){await gate.suspend();throw Error('STARTUP_SUSPENDED');}return resume?gate.resume():gate.start();});ready=initialized.then(()=>startup.run(operation=>rawView.snapshot({signal:operation.signal}),{signal:epoch.signal})).then(s=>{if(closed||suspended||epoch!==lifetime)throw Error('STARTUP_ABORTED');wallet=s.wallet;bridgePhase='READY';return s;}).catch(e=>{if(epoch===lifetime&&!closed&&!suspended){wallet=null;bridgeFailure=e;bridgePhase='ERROR';}throw e;});void ready.catch(()=>{});return ready;}
  beginStartup();
  let journal=null;
  function tickCalendar(scene,action=''){
    visibleScene=scene;
    portrait(scene);
    if(!startupReady()||!current(scene))return {calendar:null,wallet:null,page:0,pending:false,backendAvailable:false,claimAvailable:false,retryAvailable:false,freeOnly:true,statusMessage:scene.getGame().__lockLootI18n.t('calendar.local_loading')};
    if(!calendarView)calendarView=createPersonalCalendarViewController({
      adapter:{inspect:guarded(options=>rawCalendar.inspect(options)),claim:guarded((request,options)=>rawCalendar.claim(request,options),1)},
      guard:guarded(options=>calendarGuard.guard(options)),wallet:async options=>(await view.snapshot(options)).wallet,levels:calendarLevels,
      onWallet:confirmed=>{wallet=confirmed;journal?.recheck();},onCommitted:()=>journal?.recheck()});
    const state=calendarView.tick(scene,()=>current(scene),action);
    return {...state,wallet:state.balance,statusMessage:scene.getGame().__lockLootI18n.t(state.statusKey)};
  }
  const unavailableJournal=Object.freeze({phase:'loading',snapshot:null,alias:Object.freeze({aliasSchemaVersion:1,status:'MISSING',displayName:null,reason:'NOT_SET'}),busy:false,canRecheck:false});
  function tickJournal(scene){
    visibleScene=scene;
    if(!current(scene)||!startupReady())return unavailableJournal;
    if(!startupState().journalConnected)return Object.freeze({...unavailableJournal,phase:'unavailable'});
    const normalizeName=scene.getGame().__lockLootJournalCore?.normalizeName;
    if(!journal&&typeof normalizeName==='function'){const reader=createPersonalJournalReader(journalConfig);journal=createPersonalJournalViewController({
      reader:{snapshot:guarded(reader.snapshot),close:reader.close},guard:{snapshot:guarded(reader.guard)},
      alias:createPersonalJournalAlias({normalizeName}),ready});}
    return journal?journal.tick(scene,()=>current(scene)):unavailableJournal;
  }
  function saveJournalAlias(scene,name){return startupReady()&&startupState().journalConnected&&journal?journal.saveAlias(scene,name):Object.freeze({aliasSchemaVersion:1,ok:false,displayName:null,reason:'STORAGE_WRITE_FAILED'});}
  function recheckJournal(scene){if(startupReady()&&startupState().journalConnected&&current(scene))journal?.recheck();}
  const journalStorageChanged=event=>{if(event.key===ALIAS_STORAGE_KEY)journal?.refreshAlias();};
  window.addEventListener('storage',journalStorageChanged);
  const retryRequests=new WeakMap();
  let overlay=null,releaseBarrier=0;
  function closeOverlay(){if(!overlay)return;const old=overlay;overlay=null;old.control.abort();old.root.remove();releaseBarrier=3;if(old.scene.__lockLootPersonalTraining)old.scene.getVariables().get('backendRequestPending').setBoolean(true);}
  function showCrewDialog(scene,kind){
    closeOverlay();const state=scene.__lockLootPersonalSelection,training=scene.__lockLootPersonalTraining,t=(key,p={})=>translate(scene,key,p),control=new AbortController(),root=document.createElement('div');
    if(state){state.controller?.abort();state.controller=null;state.refreshPending=false;state.nextRefresh=0;}
    root.dataset.lockLootCrewDialog=kind;Object.assign(root.style,{position:'fixed',inset:'0',zIndex:'100000',background:'rgba(9,34,44,.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',boxSizing:'border-box',touchAction:'none'});
    // Resolve registered images through the export resource table: public modules
    // are flat, while the local preview keeps modules in a subdirectory.
    const art=name=>{const resource=gdjs.projectData.resources.resources.find(r=>r.name===name&&r.kind==='image');if(!resource)throw Error('CREW_ART_RESOURCE_MISSING '+name);return new URL(resource.file,document.baseURI).href;};
    const panel=document.createElement('section'),frame=art('mainmenu_language_panel_l049.png'),buttonArt=art('chest_end_l060_ui_panel.png');
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',t('crew_title'));
    Object.assign(panel.style,{width:'min(100%,420px)',maxHeight:'calc(100dvh - 32px)',overflowY:'auto',boxSizing:'border-box',padding:'12px 12px 10px',borderStyle:'solid',borderColor:'transparent',borderWidth:'48px 20px 24px',borderImageSource:'url("'+frame+'")',borderImageSlice:'220 110 100 110 fill',borderImageWidth:'48px 20px 24px',backgroundColor:'#efd49b',backgroundClip:'padding-box',color:'#3d2514',fontFamily:'Arial,sans-serif',filter:'drop-shadow(0 12px 22px #0009)'});root.append(panel);
    const labels=[];const label=(tag,key)=>{const node=document.createElement(tag);labels.push([node,key]);panel.append(node);return node;};const title=label('h2','crew_title');Object.assign(title.style,{fontFamily:'Georgia,serif',fontSize:'clamp(22px,6vw,27px)',textAlign:'center',color:'#173c45',margin:'0 0 12px',lineHeight:'1.15',textShadow:'0 1px #fff3cb'});const body=label('p',kind==='code'?'crew_code_help':'crew_help');Object.assign(body.style,{fontSize:'16px',lineHeight:'1.4',whiteSpace:'pre-line',textAlign:'center',margin:'0 0 12px',color:'#3d2a19'});
    const error=document.createElement('p');error.setAttribute('role','alert');Object.assign(error.style,{fontSize:'14px',lineHeight:'1.35',textAlign:'center',fontWeight:'bold',color:'#8b2420',minHeight:'20px',margin:'8px 0 0'});let errorKey=null,busy=false,field=null;const modalButtons=[];
    const valid=()=>current(scene)&&overlay?.root===root&&!control.signal.aborted;
    async function canChoose(){if(!valid())return false;if(state.phase!=='ready'){errorKey='error';return false;}const latest=await service.restore({signal:control.signal,isCurrent:valid});if(!valid())return false;if(state.phase!=='ready'){errorKey='error';return false;}state.active=latest?.snapshot.chest?latest.snapshot:null;state.needsFresh=false;state.nextRefresh=Date.now()+1000;if(state.active){state.selection=state.active.chest.selection;wallet=state.active.wallet;errorKey='crew_active_conflict';return false;}return true;}
    const button=(key,action,id)=>{const node=document.createElement('button');node.type='button';node.dataset.crewAction=id;labels.push([node,key]);modalButtons.push([node,id]);Object.assign(node.style,{width:'100%',minHeight:id==='close'?'44px':'64px',marginTop:id==='close'?'4px':'10px',padding:id==='close'?'8px 20px':'18px 16%',border:'0',background:id==='close'?'transparent':'transparent url("'+buttonArt+'") center/100% 100% no-repeat',color:id==='close'?'#234955':'#fff4ce',textShadow:id==='close'?'none':'0 2px 2px #10252e',textDecoration:id==='close'?'underline':'none',textUnderlineOffset:'4px',fontSize:id==='close'?'17px':'20px',fontWeight:'bold',lineHeight:'1.2',cursor:'pointer'});node.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(busy&&id!=='close')return;if(id!=='close')busy=true;const run=id==='copy'?new Promise(resolve=>resolve(action())):Promise.resolve().then(action);if(id==='copy'&&valid())overlay.render();run.catch(()=>{if(valid())errorKey='error';}).finally(()=>{busy=false;if(valid())overlay.render();});},{signal:control.signal});panel.append(node);return node;};
    if(kind==='code'){
      error.setAttribute('role','status');error.setAttribute('aria-live','polite');
      const chest=training?.chest||state?.active?.chest,view=parseInvitation(chest.instanceBinding.invitationCode),code=document.createElement('textarea');code.dataset.crewCode='public';code.readOnly=true;code.value=view.displayCode;code.rows=3;code.setAttribute('aria-label',t('crew_code'));Object.assign(code.style,{boxSizing:'border-box',width:'100%',height:'112px',padding:'12px',resize:'none',font:'bold 17px/1.65 monospace',letterSpacing:'.02em',border:'2px solid #a7782e',borderRadius:'8px',background:'#123d49',boxShadow:'inset 0 2px 8px #001a24aa,0 1px #fff3cb',color:'#fff2cb',overflowWrap:'anywhere',whiteSpace:'pre-wrap',touchAction:'auto'});panel.append(code);const config=label('p','crew_configuration');labels.pop();Object.assign(config.style,{fontSize:'14px',lineHeight:'1.45',textAlign:'center',margin:'12px 0 4px',color:'#244b45'});config.textContent=t('crew_configuration',{length:view.selection.codeLength,profile:t('profile_'+view.selection.profileId),packages:view.selection.packageCount});labels.push([config,()=>t('crew_configuration',{length:view.selection.codeLength,profile:t('profile_'+view.selection.profileId),packages:view.selection.packageCount})]);

      button('crew_copy',async()=>{
        if(!valid())return;
        errorKey=null;
        try{
          // Invoke directly in the click handler, before any asynchronous wait.
          await navigator.clipboard.writeText(view.displayCode);
          if(valid())errorKey='crew_copied';
        }catch{
          if(!valid())return;
          errorKey='crew_copy_manual';code.focus();code.select();
          code.setSelectionRange(0,code.value.length);
        }
      },'copy');panel.append(error);
    }else{
      button('crew_create',async()=>{if(!await canChoose())return;state.invitationCode=null;state.error=false;state.errorCode=null;state.scroll=0;resetStartRequest();closeOverlay();},'create');
      const inputLabel=label('label','crew_enter');inputLabel.htmlFor='lockloot-crew-invitation';Object.assign(inputLabel.style,{display:'block',margin:'16px 0 6px',fontSize:'16px',fontWeight:'bold',color:'#173c45'});
      const input=document.createElement('textarea');input.id='lockloot-crew-invitation';input.dataset.crewInput='invitation';input.maxLength=MAX_INPUT_LENGTH;input.rows=4;input.autocomplete='off';input.spellcheck=false;input.setAttribute('autocapitalize','characters');input.setAttribute('aria-label',t('crew_enter'));input.placeholder='LLC1-…';Object.assign(input.style,{boxSizing:'border-box',width:'100%',height:'96px',marginTop:'0',padding:'12px',resize:'none',font:'17px/1.6 monospace',border:'2px solid #a7782e',borderRadius:'8px',background:'#fff5d8',boxShadow:'inset 0 2px 6px #80571830',color:'#153e4c',touchAction:'auto'});panel.append(input);
      field=input;button('crew_join',async()=>{let view;try{view=parseInvitation(input.value);}catch(e){errorKey=e.code==='INVITATION_TOO_LONG'?'crew_too_long':'crew_invalid';return;}if(!await canChoose())return;state.invitationCode=view.invitationCode;state.selection=view.selection;state.error=false;state.errorCode=null;state.scroll=0;resetStartRequest();closeOverlay();},'join');panel.append(error);
    }
    button('crew_close',closeOverlay,'close');for(const name of ['pointerdown','pointerup','mousedown','mouseup','click','touchstart','touchend'])root.addEventListener(name,e=>e.stopPropagation(),{signal:control.signal});root.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();closeOverlay();}},{signal:control.signal});
    // Keep both choices and the input visible on a small phone; preserve touch sizes.
    const compactCrew=kind==='selection'&&(innerWidth<340||innerHeight<640);
    if(compactCrew){
      root.style.padding='10px';Object.assign(panel.style,{maxHeight:'calc(100dvh - 20px)',padding:'10px',borderWidth:'36px 12px 16px',borderImageWidth:'36px 12px 16px'});
      Object.assign(title.style,{fontSize:'20px',margin:'0 0 6px'});Object.assign(body.style,{fontSize:'15px',lineHeight:'1.3',margin:'0 0 8px'});
      for(const [node,id]of modalButtons)Object.assign(node.style,{fontSize:id==='close'?'16px':'18px',minHeight:id==='close'?'44px':'52px',padding:id==='close'?'8px 12px':'10px 8%',marginTop:id==='close'?'4px':'8px'});
      const inputLabel=panel.querySelector('label');if(inputLabel)Object.assign(inputLabel.style,{fontSize:'15px',margin:'10px 0 4px'});
      if(field)Object.assign(field.style,{height:'72px',padding:'8px',lineHeight:'1.4'});Object.assign(error.style,{minHeight:'0',margin:'4px 0 0'});
    }
    overlay={scene,root,control,render(){for(const [node,key]of labels)node.textContent=typeof key==='function'?key():t(key);for(const [node,id]of modalButtons)node.disabled=busy&&id!=='close';if(field)field.disabled=busy;error.textContent=errorKey?t(errorKey):busy?t(kind==='code'?'crew_copying':'restoring'):'';error.style.color=errorKey==='crew_copied'?'#205b32':'#8b2420';if(compactCrew)error.style.display=error.textContent?'block':'none';if(training)scene.getVariables().get('backendRequestPending').setBoolean(true);}};overlay.render();document.body.append(root);if(training)scene.getVariables().get('backendRequestPending').setBoolean(true);
  }
  let visibleScene=null;
  let solutionRefresh=null,solutionNext=0;
  function clearSolutionScene(scene){openedSolution=null;if(!scene||scene.getName()!=='SolutionScene')return;delete scene.__lockLootSolutionState;for(let i=0;i<12;i++){text(scene,'SolutionDigit'+i,'—');text(scene,'SolutionPositionLabel'+i,'');}for(let i=0;i<10;i++)text(scene,'SolutionHintText'+i,'');for(let i=0;i<4;i++)text(scene,'SolutionTermLabel'+i,'');for(const name of ['SolutionDialogText','SolutionDialogCalculation','SolutionDialogResult','SolutionDialogIntermediate','SolutionDialogSplitLeft','SolutionDialogSplitRight','SolutionPageTitle','SolutionPageIndicator'])text(scene,name,'');scene.getVariables().get('availableHintCount').setNumber(0);}
  function refreshSolutionScene(scene,clear=false){if(!startupReady()||!current(scene)||scene.getName()!=='SolutionScene')return Promise.resolve();if(clear){solutionRefresh?.abort();solutionRefresh=null;clearSolutionScene(scene);}if(solutionRefresh)return Promise.resolve();const control=new AbortController(),token=++solutionQuerySerial;solutionRefresh=control;return solutions.lastSolution({signal:control.signal,isCurrent:()=>current(scene)&&token===solutionQuerySerial}).then(result=>{if(!current(scene)||token!==solutionQuerySerial)return;const snapshot=result.status==='AVAILABLE'?c.freeze(result.solution):null;if(c.canonical(snapshot)!==c.canonical(openedSolution)){clearSolutionScene(scene);openedSolution=snapshot;}}).catch(()=>{if(current(scene)&&token===solutionQuerySerial)clearSolutionScene(scene);}).finally(()=>{if(solutionRefresh===control){solutionRefresh=null;solutionNext=Date.now()+1000;}});}
  function wakeVisibleScene(){const scene=visibleScene;if(!scene||!current(scene))return;
    if(scene.getName()==='TreasureCalendarScene')calendarView?.wake();
    if(['MainMenu','JournalScene'].includes(scene.getName()))journal?.wake();
    scene.__lockLootPersonalTraining?.wake?.();const selection=scene.__lockLootPersonalSelection;if(selection?.phase==='ready'){selection.controller?.abort();selection.controller=null;selection.nextRefresh=0;selection.refreshPending=false;selection.needsFresh=true;}
    if(scene.getName()==='MainMenu'&&pendingSolutionScene!==scene){const menu=menuRefresh.get(scene),reopen=menu?.opening===true;if(menu){menu.controller?.abort();menu.pending=false;menu.next=0;}solutionQuerySerial++;if(reopen)void openLastSolution(scene);}
    if(scene.getName()==='SolutionScene')void refreshSolutionScene(scene,true);
  }
  const visibilityChanged=()=>{if(document.visibilityState==='visible')wakeVisibleScene();};
  window.addEventListener('focus',wakeVisibleScene);document.addEventListener('visibilitychange',visibilityChanged);
  function abortPersonalPurchase(scene){const decoration=scene.__lockLootPersonalSelection?.decoration;if(decoration){decoration.parent?.removeChild(decoration);decoration.destroy();scene.__lockLootPersonalSelection.decoration=null;}calendarView?.leave(scene);journal?.leave(scene);if(overlay?.scene===scene)closeOverlay();scene.__lockLootPersonalTraining?.controller?.abort();scene.__lockLootPersonalTraining?.refreshController?.abort();scene.__lockLootPersonalSelection?.controller?.abort();solutionRefresh?.abort();solutionRefresh=null;solutionNext=0;const menu=menuRefresh.get(scene);menu?.controller?.abort();if(menu){menu.pending=false;menu.opening=false;menu.next=0;}solutionQuerySerial++;pendingSolutionScene=null;lastSolution=null;if(solutionHandoffScene===scene)solutionHandoffScene=null;else openedSolution=null;}
  gdjs.callbacksRuntimeSceneUnloading.push(abortPersonalPurchase);
  function clearStartupViews(){lifetime.abort();solutionRefresh?.abort();solutionRefresh=null;solutionNext=0;bridgePhase='SUSPENDED';wallet=null;lastSolution=null;openedSolution=null;pendingSolutionScene=null;closeOverlay();const scene=visibleScene?.getGame()?.getSceneStack()?.getCurrentScene?.()||visibleScene;if(scene){abortPersonalPurchase(scene);delete scene.__lockLootPersonalTraining;delete scene.__lockLootPersonalSelection;delete scene.__lockLootSolutionState;menuRefresh.delete(scene);if(scene.getName()==='SolutionScene'){
    for(let i=0;i<12;i++){text(scene,'SolutionDigit'+i,'—');text(scene,'SolutionPositionLabel'+i,'');}
    for(let i=0;i<10;i++)text(scene,'SolutionHintText'+i,'');for(let i=0;i<4;i++)text(scene,'SolutionTermLabel'+i,'');
    for(const name of ['SolutionDialogText','SolutionDialogCalculation','SolutionDialogResult','SolutionDialogIntermediate','SolutionDialogSplitLeft','SolutionDialogSplitRight','SolutionPageTitle','SolutionPageIndicator'])text(scene,name,'');
    scene.getVariables().get('availableHintCount').setNumber(0);
  }}void journal?.close();journal=null;}
  const pageHidden=()=>{suspended=true;clearStartupViews();void startup?.suspend();};
  function retryStartup(){if(closed)return Promise.reject(Error('BRIDGE_CLOSED'));clearStartupViews();suspended=false;lifetime=new AbortController();const scene=visibleScene?.getGame()?.getSceneStack()?.getCurrentScene?.()||visibleScene;return beginStartup(true).then(async value=>{if(scene?.getName()==='SolutionScene'&&current(scene))await refreshSolutionScene(scene,true);return value;});}
  const pageShown=event=>{if(suspended||event.persisted)void retryStartup().catch(()=>{});};
  window.addEventListener('pagehide',pageHidden);window.addEventListener('pageshow',pageShown);
  let pending=null,request=null,requestKey=null,lastStartedChestId=null;
  const resetStartRequest=()=>{request=null;requestKey=null;lastStartedChestId=null;};
  const preview = input => requireSelection(input);
  async function start(input,{signal,isCurrent,invitationCode}={}) {
    if(pending)return pending;
    const safe=selectionInput(preview(input));
    const joined=invitationCode===undefined||invitationCode===null?null:parseInvitation(invitationCode);if(joined&&c.canonical(selectionInput(joined.selection))!==c.canonical(safe))throw Error('INVITATION_SELECTION_MISMATCH');
    const key=c.canonical({selection:safe,invitationCode:joined?.invitationCode??null});
    if(!request||requestKey!==key){const requestId=crypto.randomUUID().replaceAll('-','');if(safe.modeId==='CREW'){const code=joined?.invitationCode??createInvitation({nonceHex:Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join(''),selection:safe}).invitationCode;request={startContractVersion:2,requestId,invitationCode:code};}else request={startContractVersion:1,requestId,...safe};requestKey=key;}
    pending=service.start(request,{signal,isCurrent}).then(result=>{if(result.snapshot.chest?.status==='ACTIVE')lastStartedChestId=result.snapshot.chest.chestId;return result;}).finally(()=>{pending=null;});
    return pending;
  }
  function noWallet(scene) {
    visibleScene=scene;
    if(!startupReady()){wallet=null;lastSolution=null;openedSolution=null;pendingSolutionScene=null;text(scene,'ResourceHudCookiesText','—');text(scene,'ResourceHudLockpicksText','—');return;}
    if(overlay){if(overlay.scene!==scene||!current(scene))closeOverlay();else overlay.render();}
    if(pendingSolutionScene===scene&&current(scene)){pendingSolutionScene=null;solutionHandoffScene=scene;gdjs.evtTools.runtimeScene.replaceScene(scene,'SolutionScene',false);}
    if(scene.getName()==='MainMenu'){
      let state=menuRefresh.get(scene);if(!state){state={pending:false,opening:false,next:0,controller:null};menuRefresh.set(scene,state);lastSolution=null;openedSolution=null;}
      if(!state.pending&&Date.now()>=state.next){state.pending=true;state.controller=new AbortController();const token=++solutionQuerySerial,isCurrent=()=>current(scene)&&token===solutionQuerySerial;
        void ready.then(()=>view.snapshot({signal:state.controller.signal,isCurrent})).then(s=>{if(!isCurrent())return null;wallet=s.wallet;return solutions.lastSolution({signal:state.controller.signal,isCurrent});}).then(s=>{if(isCurrent())lastSolution=s?.status==='AVAILABLE'?c.freeze(s.solution):null;}).catch(()=>{if(isCurrent())lastSolution=null;}).finally(()=>{if(token===solutionQuerySerial){state.pending=false;state.next=Date.now()+1000;}});
      }
    }
    text(scene,'ResourceHudCookiesText',wallet?String(wallet.cookies):'—');
    text(scene,'ResourceHudLockpicksText',wallet?String(wallet.lockpicks):'—');
  }
  function portrait(scene) {
    const game=scene.getGame();game.setAdaptGameResolutionAtRuntime(false);game.setGameResolutionSize(720,1280);
    const canvas=game.getRenderer().getCanvas(),scale=Math.min(innerWidth/720,innerHeight/1280);
    Object.assign(canvas.style,{position:'fixed',left:Math.floor((innerWidth-720*scale)/2)+'px',top:Math.floor((innerHeight-1280*scale)/2)+'px',width:Math.floor(720*scale)+'px',height:Math.floor(1280*scale)+'px'});
  }
  function tickSelection(scene) {
    visibleScene=scene;
    if(!startupReady()){for(const object of scene.getAdhocListOfAllInstances())if(object.getName().startsWith('Personal')&&!['PersonalBackground','PersonalBackPlate'].includes(object.getName()))object.hide(true);noWallet(scene);return;}
    if(overlay?.scene===scene)overlay.render();const blocked=!!overlay||releaseBarrier>0;if(releaseBarrier>0)releaseBarrier--;
    portrait(scene);
    if(!scene.__lockLootPersonalSelection){
      const state={selection:preview({selectionPolicyVersion:1,modeId:'PERSONAL',codeLength:8,profileId:'VERY_EASY',packageCount:10}),phase:'restoring',active:null,scroll:0,error:false,controller:new AbortController(),drag:null,nextRefresh:0,refreshPending:false};
      scene.__lockLootPersonalSelection=state;
      void ready.then(()=>service.restore({signal:state.controller.signal,isCurrent:()=>current(scene)})).then(result=>{if(current(scene)){state.active=result?.snapshot.chest?result.snapshot:null;state.phase='ready';state.nextRefresh=Date.now()+1000;if(state.active){state.selection=state.active.chest.selection;lastStartedChestId=state.active.chest.chestId;wallet=state.active.wallet;}else if(lastStartedChestId)resetStartRequest();}}).catch(()=>{if(current(scene)){state.phase='error';state.error=true;}});
    }
    const state=scene.__lockLootPersonalSelection,t=(key,p={})=>translate(scene,key,p);
    // Continuing an existing chest never requires revisiting its settings.
    // Route only on the scene event tick, after the guarded restore completed.
    if(state.phase==='ready'&&state.active&&current(scene)){gdjs.evtTools.runtimeScene.replaceScene(scene,'TrainingScene',false);return;}
    if(!overlay&&state.phase==='ready'&&!state.refreshPending&&Date.now()>=state.nextRefresh){state.refreshPending=true;const controller=new AbortController();state.controller=controller;void service.restore({signal:controller.signal,isCurrent:()=>current(scene)&&state.phase==='ready'}).then(result=>{if(!current(scene)||state.phase!=='ready')return;state.active=result?.snapshot.chest?result.snapshot:null;if(state.active){state.selection=state.active.chest.selection;wallet=state.active.wallet;lastStartedChestId=state.active.chest.chestId;}else if(lastStartedChestId)resetStartRequest();}).catch(()=>{if(current(scene)&&!controller.signal.aborted){state.phase='error';state.error=true;}}).finally(()=>{if(state.controller===controller){state.refreshPending=false;state.needsFresh=false;state.nextRefresh=Date.now()+1000;}});}
    const x=gdjs.evtTools.input.getCursorX(scene,'UI',0),y=gdjs.evtTools.input.getCursorY(scene,'UI',0);
    const down=gdjs.evtTools.input.isMouseButtonPressed(scene,'Left'),released=gdjs.evtTools.input.isMouseButtonReleased(scene,'Left');
    if(down&&!state.drag)state.drag={y,start:y,moved:false};
    // All four settings stay visible. A drag cancels a tap; it never scrolls.
    if(down&&state.drag&&Math.abs(y-state.drag.start)>12)state.drag.moved=true;
    state.scroll=0;
    const dragged=state.drag?.moved;
    const place=(name,bx,by,w,h)=>{const o=move(scene,name,bx,by,w,h);if(o)o.hide(false);return o;};
    const caption=(name,value,bx,by,w,h,size=30,color='61;37;20')=>{
      const o=one(scene,name);if(!o)return null;
      o.hide(false);o.setCharacterSize(size);o.setWidth(w);o.setString(value);
      o.setColor(color);o.setPosition(bx,by+h/2);return o;
    };
    place('PersonalBackground',0,0,720,1280);
    for(const name of ['PersonalBodyPlate','PersonalTitlePlate','PersonalFooterPlate','PersonalRewardPlate'])one(scene,name)?.hide(true);
    const title=caption('PersonalTitle',t('title'),134,24,484,92,42,'255;244;206');
    const titleRenderer=title?.getRendererObject?.();if(titleRenderer?.style)titleRenderer.style.fontFamily='Georgia';
    one(scene,'PersonalBack')?.hide(true);
    const back=place('PersonalBackPlate',16,18,96,100);back?.setOpacity(0);
    const language=caption('PersonalLanguage',scene.getGame().__lockLootI18n.language.toUpperCase(),645,94,50,46,25,'255;244;206');
    // The approved illustration contains the frames, pictures and empty badges.
    // Native objects remain responsible for text and hit testing.
    const backgroundRenderer=one(scene,'PersonalBackground')?.getRendererObject?.();
    if(!state.decoration&&backgroundRenderer?.parent&&typeof PIXI!=='undefined'){
      state.decoration=new PIXI.Graphics();state.decoration.name='PersonalSelectionHighlights';backgroundRenderer.parent.addChild(state.decoration);
    }
    const decoration=state.decoration;if(decoration){decoration.clear();const parent=backgroundRenderer?.parent;if(parent&&decoration.parent===parent)parent.setChildIndex(decoration,Math.min(parent.children.length-1,parent.getChildIndex(backgroundRenderer)+1));}
    const buttons=[];
    const label=(name,key,by,params={})=>caption(name,t(key,params),50,by,620,36,27);
    const button=(name,value,labelText,factor,bx,by,w,h=80,size=29,hitY=by,hitHeight=h)=>{
      const plate=place(name+'Plate',bx,hitY,w,hitHeight);plate?.setOpacity(0);
      if(value&&decoration){decoration.lineStyle(3,0x267842,.95);if(h<150)decoration.beginFill(0x74ba60,.24);decoration.drawRoundedRect(bx+4,by+4,w-8,h-8,6);if(h<150)decoration.endFill();}
      const o=caption(name,(value?'• ':'')+labelText,bx+7,by+(h>150?9:5),w-14,34,size,value?'18;67;39':'61;37;20');if(o)o.setZOrder(20);
      const badgeWidth=h>150?126:w<120?84:108,badgeX=bx+(w-badgeWidth)/2,badgeY=by+(h>150?205:41),badgeHeight=h>150?38:31;
      const badge=place(name+'FactorPlate',badgeX,badgeY,badgeWidth,badgeHeight);badge?.setOpacity(0);
      caption(name+'Factor','×'+factor,badgeX+badgeWidth*.36,badgeY,badgeWidth*.59,badgeHeight,h>150?31:26,'255;237;173');
      buttons.push({name,plate,o});
    };
    label('PersonalModeHeading','mode',154);
    button('PersonalMode',state.selection.modeId==='PERSONAL',t('personal'),1,52,193,205,256,27);
    button('PersonalHuntMode',false,t('hunt'),2,269,193,190,256,23);
    caption('PersonalHuntPlanned',t('planned'),277,229,174,25,22,'90;80;66');
    button('PersonalCrewMode',state.selection.modeId==='CREW',t('crew'),1,473,193,196,256,27);
    const crew=state.selection.modeId==='CREW';
    const subtitleKey=crew?(state.active?'crew_code':state.invitationCode?'crew_fixed':'crew_selection_link'):state.active?'frozen':null;
    if(crew){
      if(decoration){decoration.lineStyle(3,0xc99639,1);decoration.beginFill(0x123d49,1);decoration.drawRoundedRect(479,286,184,112,12);decoration.endFill();decoration.lineStyle(1,0xf6d67e,.8);decoration.drawRoundedRect(484,291,174,102,9);}
      caption('PersonalSubtitle',t(state.active?'crew_show_action':'crew_settings_action'),485,286,172,112,26,'255;244;206');
    }else{
      if(subtitleKey&&decoration){decoration.lineStyle(1.5,0x95703d,1);decoration.beginFill(0xf0d39c,1);decoration.drawRoundedRect(46,151,628,42,10);decoration.endFill();}
      caption('PersonalSubtitle',subtitleKey?t(subtitleKey):'',50,154,620,36,22,'89;65;40');if(subtitleKey)one(scene,'PersonalModeHeading')?.setString('');
    }
    label('PersonalLengthHeading','length',464);
    [8,10,12].forEach((n,i)=>button('PersonalLength'+n,state.selection.codeLength===n,String(n),({8:1,10:2,12:4}[n]),50+i*211,501,203,80,30,490,100));
    label('PersonalProfileHeading','difficulty',594);
    profiles.forEach((p,i)=>button('PersonalProfile'+p,state.selection.profileId===p,t('profile_'+p),2**i,i<3?50+i*211:153+(i-3)*213,i<3?631:715,203,76,27,i<3?611:711,100));
    label('PersonalPackageHeading','packages',800,{count:state.selection.hintCount});
    [10,9,8,7,6,5].forEach((n,i)=>button('PersonalPackage'+n,state.selection.packageCount===n,String(n),11-n,49+i*107.4,838,100,76,30,830,100));
    const detail=state.detail||'mode';
    const descriptionKey=detail==='mode'?'explain_'+state.selection.modeId:detail==='difficulty'?'explain_'+state.selection.profileId:'explain_'+detail;
    const descriptionParams=detail==='length'?{length:state.selection.codeLength}:detail==='packages'?{packages:state.selection.packageCount,hints:state.selection.hintCount}:{};
    const closedInvitation=!state.active&&state.errorCode==='INVITATION_ALREADY_CLOSED';
    const statusKey=state.phase==='starting'?'starting':state.phase==='restoring'||state.needsFresh?'restoring':closedInvitation?'crew_closed':state.errorCode==='ACTIVE_CHEST_CONFLICT'?'crew_active_conflict':state.error?'error':null;
    caption('PersonalDescription',statusKey?t(statusKey):t(descriptionKey,descriptionParams),55,927,610,56,26,statusKey?'120;40;20':'61;37;20');
    caption('PersonalRewardHeading',t('total_label'),60,990,360,65,29,'18;67;39');
    place('PersonalTotalFactorPlate',434,989,198,56)?.setOpacity(0);
    caption('PersonalTotalFactor','×'+state.selection.factors.total,504,989,116,56,40,'255;237;173');
    caption('PersonalReward',t(state.selection.preview.points===1?'compact_reward_one':'compact_reward',state.selection.preview),50,1055,620,61,28);
    caption('PersonalStatus','',48,1108,624,40,25);
    // The new background contains the green start plaque; this transparent
    // sprite retains the original native hit target and operation guards.
    const startButton=place('PersonalStartPlate',70,1146,580,99);
    if(startButton)startButton.setOpacity(0);
    const startText=caption('PersonalStart',t(closedInvitation?'crew_closed_action':state.phase==='starting'?'starting':state.active?'continue':'start'),90,1146,540,99,38,'255;244;206');
    if(startText)startText.setColor(closedInvitation?'185;185;185':'255;244;206');
    // Hide the choices while deciding whether this is a new or existing chest.
    if(state.phase==='restoring'){for(const object of scene.getAdhocListOfAllInstances())if(object.getName().startsWith('Personal')&&!['PersonalBackground','PersonalBackPlate'].includes(object.getName()))object.hide(true);}
    if(released&&!dragged&&!blocked){
      if(hit(back,x,y)){state.controller?.abort();gdjs.evtTools.runtimeScene.replaceScene(scene,'MainMenu',false);}
      else if(hit(language,x,y))scene.getGame().__lockLootI18n.setLanguage(scene.getGame().__lockLootI18n.language==='de'?'en':'de');
      else if(hit(startButton,x,y)&&state.phase!=='restoring'&&!state.needsFresh&&!closedInvitation){
        if(state.phase==='starting'){ /* Duplicate click: the first start owns this operation. Back cancels. */ }
        else if(state.active){gdjs.evtTools.runtimeScene.replaceScene(scene,'TrainingScene',false);}
        else {
          state.controller?.abort();state.refreshPending=false;state.needsFresh=false;state.phase='starting';state.error=false;state.controller=new AbortController();
          void start(selectionInput(state.selection),{signal:state.controller.signal,isCurrent:()=>current(scene)&&state.phase==='starting',invitationCode:state.invitationCode}).then(result=>{
            if(current(scene)){wallet=result.snapshot.wallet;state.active=result.snapshot.chest?result.snapshot:null;state.phase='ready';if(state.active){state.selection=state.active.chest.selection;state.navigate='TrainingScene';}else{resetStartRequest();state.navigate='MainMenu';}}
          }).catch(error=>{if(current(scene)){state.phase='ready';state.error=true;state.errorCode=error.code;}});
        }
      }else if(hit(one(scene,'PersonalHuntModePlate'),x,y)){ /* Planned mode: preserve the selected option and its explanation. */
      }else if(crew&&x>=479&&x<=663&&y>=286&&y<=398&&state.phase==='ready'&&!state.needsFresh){showCrewDialog(scene,state.active?'code':'selection');
      }else if(state.active&&state.selection.modeId==='CREW'&&hit(one(scene,'PersonalCrewModePlate'),x,y)){showCrewDialog(scene,'code');
      }else if(!state.active&&state.phase==='ready'&&!state.needsFresh){
        const chosen=buttons.find(b=>hit(b.plate,x,y));if(chosen){const input=selectionInput(state.selection);
          if(chosen.name==='PersonalMode'){input.modeId='PERSONAL';state.detail='mode';state.invitationCode=null;resetStartRequest();}
          if(chosen.name==='PersonalCrewMode'){input.modeId='CREW';state.detail='mode';}
          if(state.invitationCode&&!['PersonalMode','PersonalCrewMode'].includes(chosen.name))return;
          if(chosen.name.startsWith('PersonalLength')){input.codeLength=Number(chosen.name.slice(14));state.detail='length';}
          if(chosen.name.startsWith('PersonalProfile')){input.profileId=chosen.name.slice(15);state.detail='difficulty';}
          if(chosen.name.startsWith('PersonalPackage')){input.packageCount=Number(chosen.name.slice(15));state.detail='packages';}
          state.selection=preview(input);if(chosen.name!=='PersonalCrewMode'){state.error=false;state.errorCode=null;}else{showCrewDialog(scene,'selection');}
        }
      }
    }
    if(released||!down)state.drag=null;
    if(state.navigate&&current(scene)){const target=state.navigate;state.navigate=null;gdjs.evtTools.runtimeScene.replaceScene(scene,target,false);}
  }
  function tickTraining(scene) {
    noWallet(scene);
    if(!startupReady()){const vars=scene.getVariables();vars.get('backendModeActive').setBoolean(true);vars.get('backendRequestPending').setBoolean(true);vars.get('backendAction').setString('');return;}
    const vars=scene.getVariables(),t=(key,p={})=>translate(scene,key,p);
    if(!scene.__lockLootPersonalTraining){
      const state={phase:'restoring',chest:null,snapshot:null,message:null,controller:new AbortController(),showFeedback:false,serial:0,refreshPending:false,refreshController:null,nextRefresh:0};scene.__lockLootPersonalTraining=state;
      vars.get('backendModeActive').setBoolean(true);vars.get('backendInitState').setString('personal-loading');
      vars.get('backendRequestPending').setBoolean(false);vars.get('backendAction').setString('');
      for(const name of ['Hinweise','HinweisMetadaten'])vars.get(name).fromJSObject([]);
      vars.get('paidHintCount').setNumber(0);vars.get('bonusHintActive').setBoolean(false);
      void ready.then(()=>view.snapshot({signal:state.controller.signal,isCurrent:()=>current(scene)})).then(result=>{
        if(!current(scene))return;
        if(!result.chest){state.navigate='PersonalSelectionScene';return;}
        const chest=result.chest;
        if(chest.status!=='ACTIVE'||chest.chestId!==result.activeChestId)throw Error('INVALID_PERSONAL_STATE');
        state.phase='ready';state.controller=null;state.nextRefresh=Date.now()+1000;state.chest=chest;state.snapshot=result;state.chestAttemptCount=result.personal.activeAttempts.bookedAttemptCount;state.showFeedback=!!result.personal?.activeAttempts?.lastFeedback;wallet=result.wallet;
        // Only safe public projection. No solution code, salt or full assignment.
        scene.__lockLootTrainingBackend={personalBridgeVersion:1,currentChest:{chestId:chest.chestId,codeLength:chest.selection.codeLength,profileId:chest.selection.profileId,packageCount:chest.selection.packageCount,hintGeneratorVersion:4},hintState:chest.hintState,endLocked:false};
        vars.get('activeCodeLength').setNumber(chest.selection.codeLength);
        vars.get('backendInitState').setString('personal-ready');
        for(let i=0;i<12;i++){vars.get('digit'+i+'Value').setNumber(0);const d=one(scene,'digit'+i);if(d)d.setString('0');}
        vars.get('enteredCode').setString('0'.repeat(chest.selection.codeLength));
      }).catch(()=>{if(current(scene)){state.phase='error';vars.get('backendInitState').setString('personal-error');}});
    }
    const state=scene.__lockLootPersonalTraining;
    if(state.navigate){const target=state.navigate;state.navigate=null;gdjs.evtTools.runtimeScene.replaceScene(scene,target,false);return;}
    for(const name of ['CrewCodeButton','CrewCodeButtonPlate'])one(scene,name)?.hide(true);
    if(state.phase==='closed'){vars.get('backendAction').setString('');for(const name of ['PersonalTrainingStatusPlate','TxtStatus'])one(scene,name)?.hide(true);return;}
    function applySnapshot(result){wallet=result.wallet;state.snapshot=result;
      if(!result.chest||result.activeChestId!==state.chest?.chestId){state.phase='closed';state.navigate='MainMenu';scene.__lockLootTrainingBackend.endLocked=true;vars.get('chestEndLocked').setBoolean(true);vars.get('backendAction').setString('');resetStartRequest();return;}
      const changedFeedback=result.personal.activeAttempts.bookedAttemptCount!==state.chestAttemptCount;state.chestAttemptCount=result.personal.activeAttempts.bookedAttemptCount;state.chest=result.chest;scene.__lockLootTrainingBackend.hintState=result.chest.hintState;if(changedFeedback&&result.personal.activeAttempts.lastFeedback)state.showFeedback=true;
    }
    // A scene never keeps spending against a chest closed in another tab.
    // One bounded reader operation per interval; actions invalidate old reads.
    function refresh(){if(state.phase!=='ready'||state.refreshPending)return;state.refreshPending=true;const token=++state.serial,controller=new AbortController();state.refreshController=controller;if(state.needsFresh)vars.get('backendRequestPending').setBoolean(true);void view.snapshot({signal:controller.signal,isCurrent:()=>current(scene)&&state.serial===token&&state.phase==='ready'}).then(result=>{if(current(scene)&&state.serial===token&&state.phase==='ready')applySnapshot(result);}).catch(()=>{if(current(scene)&&state.serial===token&&!controller.signal.aborted){state.phase='error';state.message='error';}}).finally(()=>{if(state.serial===token){state.refreshPending=false;state.refreshController=null;state.needsFresh=false;state.nextRefresh=Date.now()+1000;vars.get('backendRequestPending').setBoolean(!!overlay||releaseBarrier>0);}});}
    state.wake=()=>{if(state.phase!=='ready'||state.controller)return;state.refreshController?.abort();state.refreshPending=false;state.needsFresh=true;refresh();};
    if(state.phase==='ready'&&!state.refreshPending&&Date.now()>=state.nextRefresh)refresh();
    if(state.chest?.selection.modeId==='CREW'){const plate=move(scene,'CrewCodeButtonPlate',60,1150,430,90),caption=move(scene,'CrewCodeButton',80,1170,390,55);plate?.hide(false);caption?.hide(false);if(caption){caption.setCharacterSize(32);caption.setColor('255;244;206');caption.setY(1195);}text(scene,'CrewCodeButton',t('crew_code'));if(!overlay&&releaseBarrier===0&&state.phase==='ready'&&!state.needsFresh&&gdjs.evtTools.input.isMouseButtonReleased(scene,'Left')&&hit(plate,gdjs.evtTools.input.getCursorX(scene,'UI',0),gdjs.evtTools.input.getCursorY(scene,'UI',0)))showCrewDialog(scene,'code');}
    if(overlay?.scene===scene||releaseBarrier>0){vars.get('backendAction').setString('');vars.get('backendRequestPending').setBoolean(true);if(releaseBarrier>0)releaseBarrier--;return;}
    if(state.phase==='ready'&&!state.controller&&!state.needsFresh)vars.get('backendRequestPending').setBoolean(false);
    const action=vars.get('backendAction').getAsString();vars.get('backendAction').setString('');
    if(gdjs.evtTools.input.isMouseButtonReleased(scene,'Left')){
      const x=gdjs.evtTools.input.getCursorX(scene,'UI',0),y=gdjs.evtTools.input.getCursorY(scene,'UI',0);
      if(['HintPrevButton','HintNextButton'].some(n=>hit(one(scene,n),x,y)))state.showFeedback=false;
    }
    if(['hint','attempt'].includes(action)&&state.phase==='ready'&&!state.needsFresh&&state.chest){
      const kind=action==='hint'?'BUY_HINT_PACKAGE':'ATTEMPT_CHEST',retry=retryRequests.get(state);
      if(retry&&retry.kind!==kind)state.message='action_retry';
      else if(action==='hint'&&state.chest.hintState.purchasedPackageCount>=state.chest.selection.packageCount){state.message='all_bought';state.showFeedback=false;}
      else if(action==='hint'&&wallet.cookies<1)state.message='not_enough';
      else if(action==='attempt'&&wallet.lockpicks<1)state.message='no_lockpick';
      else{
        state.refreshController?.abort();state.refreshController=null;state.refreshPending=false;const token=++state.serial;
        state.phase=action==='hint'?'buying':'attempting';state.message=action==='hint'?'purchase_pending':'checking';state.controller=new AbortController();
        vars.get('backendRequestPending').setBoolean(true);
        let request=retry;
        try{
          if(!request){const id=crypto.randomUUID().replaceAll('-','');request=action==='hint'?makeHintPurchaseRequest(state.snapshot,id):makeChestAttemptRequest(state.snapshot,id,vars.get('enteredCode').getAsString());retryRequests.set(state,request);}
          const operation=action==='hint'?buyer.purchase:attempts.attempt;
          void operation(request,{signal:state.controller.signal,isCurrent:()=>current(scene)&&state.serial===token}).then(result=>{
            if(!current(scene)||state.serial!==token)return;
            const snapshot=result.currentSnapshot;if(!result.committed||snapshot?.snapshotVersion!==3||snapshot.uid!==owner)throw Error('INVALID_INSTANCE_RESPONSE');
            wallet=snapshot.wallet;retryRequests.delete(state);state.message=null;state.nextRefresh=Date.now()+1000;
            if(action==='attempt'&&result.receipt.outcome==='SUCCESS'){
              // The verified receipt supplies the closed presentation. Its
              // current snapshot intentionally has no newly invented chest.
              resetStartRequest();lastSolution=null;openedSolution=null;state.snapshot=snapshot;state.phase='closed';state.showFeedback=false;scene.__lockLootTrainingBackend.chestEnd=c.freeze(result.receipt.summary);scene.__lockLootTrainingBackend.endLocked=true;vars.get('chestEndLocked').setBoolean(true);vars.get('backendAction').setString('');
            }else{state.phase='ready';state.showFeedback=action==='attempt';applySnapshot(snapshot);if(action==='hint'&&snapshot.chest)vars.get('displayedHintIndex').setNumber((snapshot.chest.hintState.purchasedPackageCount-1)*2);}
          }).catch(async error=>{
            if(!current(scene)||state.serial!==token)return;
            if(['CAS_CONFLICT','HEAD_CHEST_MISMATCH','READSET_CHANGED'].includes(error.code)){
              retryRequests.delete(state);
              try{const fresh=await view.snapshot({isCurrent:()=>current(scene)&&state.serial===token});if(current(scene)&&state.serial===token){state.showFeedback=false;state.message='stale_retry';state.phase='ready';applySnapshot(fresh);}}
              catch{if(current(scene)){state.phase='error';state.message='error';}}
            }else if(current(scene)){
              const permanent=['INSUFFICIENT_COOKIES','INSUFFICIENT_LOCKPICKS','INVALID_ATTEMPT_CODE','SUCCESS_PENDING_B','HEAD_CHEST_MISMATCH'].includes(error.code);
              if(permanent)retryRequests.delete(state);
              state.phase='ready';state.showFeedback=false;state.message=error.code==='INSUFFICIENT_COOKIES'?'not_enough':error.code==='INSUFFICIENT_LOCKPICKS'?'no_lockpick':error.code==='SUCCESS_PENDING_B'?'success_pending':error.code==='INVALID_ATTEMPT_CODE'?'invalid_code':action==='attempt'?'attempt_retry':'action_retry';
            }
          }).finally(()=>{if(state.serial===token){state.controller=null;if(current(scene))vars.get('backendRequestPending').setBoolean(!!overlay||releaseBarrier>0);}});
        }catch{retryRequests.delete(state);state.controller=null;state.phase='ready';state.message='invalid_code';vars.get('backendRequestPending').setBoolean(false);}
      }
    }
    // Back cancels a queued transaction; oncomplete remains the commit boundary.
    if(state.controller&&gdjs.evtTools.input.isMouseButtonReleased(scene,'Left')){
      const b=one(scene,'bt_Back'),x=gdjs.evtTools.input.getCursorX(scene,'UI',0),y=gdjs.evtTools.input.getCursorY(scene,'UI',0);
      if(hit(b,x,y))state.controller.abort();
    }
    const hints=state.chest?.hintState.revealedHints||[],language=scene.getGame().__lockLootI18n.language;
    const texts=hints.map(h=>h.textByLanguage[language]);
    vars.get('Hinweise').fromJSObject(texts);vars.get('HinweisMetadaten').fromJSObject(hints);
    vars.get('paidHintCount').setNumber(state.chest?.hintState.purchasedPackageCount||0);vars.get('hintIndex').setNumber(hints.length);
    vars.get('hintPresentationActive').setBoolean(false);vars.get('bonusHintActive').setBoolean(false);
    const index=hints.length?Math.max(0,Math.min(hints.length-1,Math.floor(vars.get('displayedHintIndex').getAsNumber()))):0;
    vars.get('displayedHintIndex').setNumber(index);
    const feedback=state.snapshot?.personal?.activeAttempts?.lastFeedback;
    const feedbackText=feedback?renderFeedback(feedback,state.chest.selection.codeLength,(key,p)=>scene.getGame().__lockLootI18n.t(key,p)):'';
    const value=state.showFeedback&&feedback?feedbackText:texts[index]||t('buy_prompt');vars.get('normalHintText').setString(value);text(scene,'txtHint',value);
    if(state.showFeedback&&feedback&&hints.length)text(scene,'txtHintCounter',t('last_attempt'));
    if(!hints.length)text(scene,'txtHintCounter',t('zero_hints'));
    const configuration=state.chest?t('configuration',{length:state.chest.selection.codeLength,profile:t('profile_'+state.chest.selection.profileId),packages:state.chest.selection.packageCount}):t(state.phase==='error'?'error':'restoring');
    text(scene,'TxtStatus',state.message?t(state.message):state.showFeedback&&feedback?t('last_attempt'):configuration);
    noWallet(scene);
    const status=one(scene,'TxtStatus');
    move(scene,'PersonalTrainingStatusPlate',60,995,600,140);
    if(status){status.setCharacterSize(32);status.setPosition(80,1065);status.setWidth(560);status.hide(false);}
    for(const name of ['Debug_CorrectCode','Debug_EnteredCode','Debug_digitValue','Debug_digit','TxtCode_richtig','TxtCode_falsch'])for(const o of scene.getObjects(name)){if(o.setString)o.setString('');o.hide();}
  }
  async function openLastSolution(scene){if(!current(scene))return;const menu=menuRefresh.get(scene);menu?.controller?.abort();if(menu){menu.pending=true;menu.opening=true;menu.next=Infinity;}const token=++solutionQuerySerial;lastSolution=null;openedSolution=null;pendingSolutionScene=null;try{const s=await solutions.lastSolution({isCurrent:()=>current(scene)&&token===solutionQuerySerial});if(current(scene)&&token===solutionQuerySerial&&s.status==='AVAILABLE'){lastSolution=c.freeze(s.solution);openedSolution=lastSolution;pendingSolutionScene=scene;}}catch{if(current(scene)&&token===solutionQuerySerial)lastSolution=null;}finally{if(menu&&token===solutionQuerySerial){menu.pending=!!pendingSolutionScene;menu.opening=false;menu.next=Date.now()+1000;}}}
  return Object.freeze({bridgeVersion:BRIDGE_VERSION,get ready(){return ready;},observeScene:scene=>{visibleScene=scene;if(scene.getName()==='SolutionScene'&&Date.now()>=solutionNext)void refreshSolutionScene(scene);},startupState:()=>Object.freeze({...startupState(),legacySolutionConnected:startupReady()&&!!rawSolutions,calendarMode:startupReady()&&rawCalendar?'FREE_LOCAL':'PRESERVE_ONLY'}),retryStartup,preservedAssets:()=>startupReady()?startup.assets():null,preview,start,restore:service.restore,tickSelection,tickTraining,noWallet,tickCalendar,tickJournal,saveJournalAlias,recheckJournal,lastSolutionAvailable:()=>startupReady()&&!!lastSolution,openLastSolution,solutionController:Object.freeze({currentSnapshot:()=>startupReady()?openedSolution:null}),async close(){closed=true;fetchControl.abort();clearStartupViews();window.removeEventListener('storage',journalStorageChanged);window.removeEventListener('focus',wakeVisibleScene);window.removeEventListener('pagehide',pageHidden);window.removeEventListener('pageshow',pageShown);document.removeEventListener('visibilitychange',visibilityChanged);const i=gdjs.callbacksRuntimeSceneUnloading.indexOf(abortPersonalPurchase);if(i>=0)gdjs.callbacksRuntimeSceneUnloading.splice(i,1);await Promise.all([startup?.close(),journal?.close(),calendarView?.close(),calendarGuard?.close(),rawCalendar?.close(),view.close(),buyer.close(),attempts.close(),solutions.close(),service.close()]);}});
}
