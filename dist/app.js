import {createLaunchSimulator} from './launch.js';
import {createStoryControls,bindStoryVisibility} from './story-controls.js';
import {roverGuideOpacity} from './story-training.js';
import {createStorySound} from './story-sound.js';
import {truthBadge,esc} from './outpost-presentation.js';
import {TRAINING_MILESTONES,earnedStoryTraining,mergeStoryTraining,storyStartScene,storyDoneText,storyBadgeBanner} from './journey.js';
import {teamCreditHTML} from './flags.js';
import {tr,t,copy,localizeStatic} from './strings.js';
import {readyVoices,registerOffline,accessPreferences,makeUtterances} from './compat.js';
import { SCENES, LINES, PATCHES } from './story.js';
import { createGame, enter, advanceStory, interact, connect, matchCable, restoreStory, nearbyDustyPanel, useRoverControls, say, setTarget, skipFilm, goal, distance } from './story-engine.js';
import { drawScene, toWorld, AVATARS, setAvatar, currentAvatar } from './art.js';
import {resourcesHTML} from './resources.js';
const $=id=>document.getElementById(id);
const icon=id=>tr("text001", [id]);
const KEY='astro-kitty-story-v2';
const validPatches=new Set(PATCHES.map(p=>p.id));
let book={scene:null,trainingScene:null,patches:[],voice:true,subtitles:true,reduceMotion:false,introSeen:false,simulatorSeen:false,tripPlanner:false};
let storageAvailable=true;
try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data){book.scene=Object.hasOwn(SCENES,data.scene)?data.scene:null;book.patches=Array.isArray(data.patches)?data.patches.filter(x=>validPatches.has(x)):[];book.voice=data.voice!==false;book.subtitles=data.subtitles!==false;book.reduceMotion=data.reduceMotion===true;book.introSeen=data.introSeen===true;book.simulatorSeen=data.simulatorSeen===true;book.tripPlanner=data.tripPlanner===true;book.trainingScene=Object.hasOwn(SCENES,data.trainingScene)&&!['approach','landing','choose'].includes(data.trainingScene)?data.trainingScene:book.scene&&!['approach','landing','choose'].includes(book.scene)?book.scene:null;}}catch{}
book.voice=accessPreferences().voice??book.voice;
book.subtitles=accessPreferences().captions??book.subtitles;
book.reduceMotion=accessPreferences().reduceMotion??book.reduceMotion;
document.body.classList.toggle('reduce-motion',book.reduceMotion);
function save(){try{localStorage.setItem(KEY,JSON.stringify(book));}catch{storageAvailable=false;}}
function saveSharedSettings(patch){try{localStorage.setItem('astro-kitty-profile-v1',JSON.stringify({...accessPreferences(),...patch}));}catch{storageAvailable=false;}}
function setText(el,str){if(el.textContent!==str)el.textContent=str;}
function show(el,on=true){if(el.classList.contains('hidden')===on)el.classList.toggle('hidden',!on);}
function disabled(el,value){if(el.disabled!==value)el.disabled=value;}
const canvas=$('scene'),game=$('game'),keys=new Set();
let state=null,paused=false,lastFrame=0,visualTime=0,lastScene='',lastSpeech=-1,lastCheckpoint=-1;
let lastFeedback=-1,subtitleLife=0,voiceUnavailable=false,previousSpeech='';
let badgeNotice=null,badgeNoticeLife=0;
const sound=createStorySound();sound.setEnabled(book.voice);
const storyLook=accessPreferences();
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const isReduced=()=>book.reduceMotion||motionQuery.matches;
const newWiringSeed=()=>Math.floor(Math.random()*2**32);
function unlockAudio(){sound.unlock();}
function chime(win=false){if(win)sound.finish();else sound.chime();}
const synth='speechSynthesis'in window?window.speechSynthesis:null;
let utterance=null,narrating=false,narrationStarted=0,voiceTicket=0;
const voiceReady=readyVoices(synth);
function stopVoice(){voiceTicket++;if(synth)synth.cancel();narrating=false;utterance=null;}
function speak(key,praise=''){
 previousSpeech=key;const [speaker,baseLine]=LINES[key]||LINES.welcome,line=praise?praise+' '+baseLine:baseLine;
 setText($('speaker'),speaker);setText($('spokenLine'),line);subtitleLife=10;
 show($('subtitle'),!!state&&(book.subtitles||!book.voice||voiceUnavailable)&&state.scene!=='complete');
 speakLine(line);
}
function revealCaptions(){
 voiceUnavailable=true;
 if(state&&state.scene!=='complete')show($('subtitle'));
}
async function speakLine(line){
 stopVoice();if(!book.voice||paused)return;
 if(!synth||!('SpeechSynthesisUtterance'in window)){revealCaptions();return;}
 const ticket=voiceTicket;const available=await voiceReady;if(ticket!==voiceTicket||paused||!book.voice)return;
 try{
  const list=makeUtterances(line,synth.getVoices().length?synth.getVoices():available),u=list[list.length-1];utterance=u;
  list[0].onstart=()=>{if(utterance===u){narrating=true;narrationStarted=performance.now();voiceUnavailable=false;}};
  u.onend=()=>{if(utterance===u)narrating=false;};
  for(const part of list)part.onerror=e=>{if(utterance===u){narrating=false;if(!['interrupted','canceled'].includes(e.error))revealCaptions();}};
  synth.resume();for(const part of list)synth.speak(part);
 }catch{revealCaptions();}
}
function updateVoice(){
 $('voiceButton').innerHTML=icon(book.voice?'sound':'mute');$('voiceButton').setAttribute('aria-label',t(book.voice?'upgradeMuteAction':'upgradeUnmuteAction'));$('voiceButton').setAttribute('aria-pressed',String(book.voice));
}
function clearInput(){keys.clear();controls?.cancel();if(state){state.target=null;state.auto=false;state.player.vx=state.player.vy=0;}}
const launchCopy=copy('launch');
const simulator=createLaunchSimulator($('launchSimulator'),{
 speak:speakLine,stopVoice,unlock:unlockAudio,
 celebrate:()=>{book.tripPlanner=true;save();sound.finish();},
 arrive:()=>startStory('approach'),
 isReduced,showCaptions:()=>book.subtitles||!book.voice||voiceUnavailable
});
function leaveTitle(){
 show($('titleScreen'),false);show($('ending'),false);show($('episodeLabel'),false);
 show($('pauseButton'));unlockAudio();
}
function startStory(scene){
 stopVoice();game.classList.remove('simulating');canvas.inert=false;
 state=restoreStory({scene,patches:book.patches},newWiringSeed());
 paused=false;lastScene='';lastSpeech=-1;lastCheckpoint=-1;lastFeedback=-1;lastFrame=0;
 badgeNotice=null;badgeNoticeLife=0;
 clearInput();leaveTitle();show($('chapter'));show($('actionArea'));
 sync();canvas.focus({preventScroll:true});chime();
}
function startSimulator(fresh=false){
 stopVoice();state=null;paused=false;lastFrame=0;keys.clear();
 if(fresh){book.patches=[];book.trainingScene=null;book.scene=null;book.introSeen=false;}
 book.simulatorSeen=true;save();
 leaveTitle();game.classList.add('simulating');canvas.inert=true;
 for(const id of ['actionArea','touchControls','subtitle','sceneBanner','happyBubble','routeChoice','trainingScience','monitorControl','airlockReadout','puzzle'])show($(id),false);
 simulator.start(newWiringSeed());
}
$('beginButton').addEventListener('click',()=>{
 const scene=storyStartScene(book);
 if(scene==='approach')startSimulator(book.scene==='complete');
 else startStory(scene);
});
$('newButton').addEventListener('click',()=>startSimulator(true));
$('skipMars').textContent=launchCopy.skipMars;
show($('skipMars'),book.simulatorSeen||book.introSeen);
$('skipMars').addEventListener('click',()=>startStory(storyStartScene(book)));
if(book.introSeen&&book.scene&&book.scene!=='complete'){show($('newButton'));}

function avatarFace(a){return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 30 8 8l16 10h16L56 8l-2 22a22 22 0 1 1-44 0Z" fill="${a.ear}"/><ellipse cx="32" cy="38" rx="21" ry="18" fill="${a.face}"/><ellipse cx="24" cy="36" rx="2.6" ry="3.6" fill="#343d50"/><ellipse cx="40" cy="36" rx="2.6" ry="3.6" fill="#343d50"/><path d="m29 44 3 3 3-3Z" fill="#9d6c70"/><rect x="20" y="56" width="24" height="6" rx="3" fill="${a.suit}"/></svg>`;}
function renderAvatars(){
 $('avatarChoices').innerHTML=Object.entries(AVATARS).map(([id,a])=>`<button type="button" role="radio" class="avatar-card" data-avatar="${id}" aria-checked="${id===currentAvatar()}">${avatarFace(a)}<span>${a.name}</span></button>`).join('');
}
renderAvatars();
$('avatarChoices').addEventListener('click',e=>{const b=e.target.closest('[data-avatar]');if(!b)return;setAvatar(b.dataset.avatar);renderAvatars();unlockAudio();sound.kitty?.();$('avatarChoices').querySelector('[aria-checked="true"]')?.focus();});
function journeyState(){let base=false;try{base=!!localStorage.getItem('astro-kitty-outpost-v1')||!!localStorage.getItem('astro-kitty-outpost');}catch{}
 return[{id:'fly',label:t('stepFly'),icon:'🚀',done:!!(book.tripPlanner||book.introSeen)},{id:'train',label:t('stepTrain'),icon:'🐾',done:book.trainingScene==='complete'||book.scene==='complete'},{id:'base',label:t('stepBase'),icon:'🏠',done:false,started:base}];}
function renderJourney(){const steps=journeyState();const next=steps.findIndex(x=>!x.done);
 $('journeySteps').innerHTML=steps.map((x,i)=>`<li><button type="button" class="journey-step${x.done?' done':''}${i===next?' next':''}" data-step="${x.id}"><span class="step-icon" aria-hidden="true">${x.done?'✓':x.icon}</span><span class="step-num">${i+1}</span><strong>${x.label}</strong><span class="sr-only">${x.done?t('stepDone'):i===next?t('stepNext'):''}</span></button></li>`).join('');}
renderJourney();
function goStep(id){if(id==='fly')startSimulator(false);else if(id==='train'){book.introSeen=true;save();startStory(book.trainingScene&&book.trainingScene!=='complete'?book.trainingScene:'walk');}else{stopVoice();book.introSeen=true;save();location.href='./outpost.html?arrival=1';}}
$('journeySteps').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)goStep(b.dataset.step);});
$('voiceButton').addEventListener('click',()=>{
 book.voice=!book.voice;sound.setEnabled(book.voice);save();saveSharedSettings({voice:book.voice});updateVoice();unlockAudio();
 if(book.voice&&simulator.active)simulator.repeat();
 else if(book.voice&&state)speak(state.speech);
 else{stopVoice();if(state){subtitleLife=10;show($('subtitle'),state.scene!=='complete');}}
});
$('repeatButton').addEventListener('click',()=>{if(!paused&&state){unlockAudio();speak(state.speech);}});
$('skipButton').addEventListener('click',()=>{if(!paused&&state){stopVoice();skipFilm(state);sync();}});
$('interactButton').addEventListener('click',()=>{
 if(paused||!state)return;
 const startingRover=state.scene==='rover'&&state.rover.inputAt===null;
 interact(state);sync();
 if(startingRover)canvas.focus({preventScroll:true});
});

const controls=createStoryControls({element:$('puzzle'),canvas,getState:()=>state,isPaused:()=>paused||document.hidden,reduced:isReduced,onAttempt:(from,to)=>{
 const ok=state.scene==='connect'?matchCable(state,from,to):connect(state,to,from);sync();return ok;
},onHint:(key,spoken)=>{setText($('srStatus'),t(key));if(spoken&&state){say(state,key==='upgradeSelectCable'?'selectCable':'selectBattery');sync();}}});
function scienceUI(){
 if(!state)return;const id=({connect:'connectors',power:'veggie',airlock:'pressure',monitor:'rad'})[state.scene],box=$('trainingScience');show(box,!!id);
 if(!id)return;const f=id==='rad'?copy('facts').rad:copy('trainingScience')[id],line=id==='rad'?f.text:t(f.textKey);
 const signature=state.scene;if(box.dataset.scene===signature)return;box.dataset.scene=signature;box.open=false;
 box.innerHTML=`<summary>${truthBadge('real')}</summary><div><p>${esc(line)}</p><a href="${esc(f.url)}" target="_blank" rel="noopener">${t('source')}</a>${id==='connectors'?`<p>${t('upgradeConnectorTip')}</p>`:''}<button class="text-button" data-science-close>${t('close')}</button></div>`;
 box.querySelector('[data-science-close]').onclick=()=>{box.open=false;box.querySelector('summary').focus();};
}
$('trainingScience').addEventListener('toggle',()=>{const open=$('trainingScience').open;if(open){paused=true;clearInput();stopVoice();sound.stopAll();}else if(!$('menuDialog').open){paused=false;lastFrame=0;}});
const monitorScale=$('monitorScale');
const graphScales=['monitorWide','monitorNormal','monitorClose'];
function updateMonitorScale(){
 if(state?.scene!=='monitor')return;
 state.monitor.scale=Number(monitorScale.value);
 monitorScale.setAttribute('aria-valuetext',t(graphScales[state.monitor.scale]));
}
monitorScale.addEventListener('input',updateMonitorScale);
function actionUI(){
 const s=state,def=SCENES[s.scene];let task='',action='',progress=null,enabled=true;
 const g=goal(s),near=g?distance(s.player,g)<88:false;
 show($('skipButton'),def.kind==='film');disabled($('skipButton'),s.sceneTime<1.2);
 const moving=['walk','drive'].includes(def.kind),pad=$('touchControls');
 show(pad,moving);
 game.classList.toggle('playing',moving);
 setText($('movementVerb'),t(s.scene==='rover'?'storyDrive':'storyMove'));
 const guide=roverGuideOpacity(s,isReduced());
 const glow=(guide*(isReduced()?.32:.32+Math.sin(visualTime*3)*.12)).toFixed(2);
 if(pad.style.getPropertyValue('--rover-glow')!==glow)pad.style.setProperty('--rover-glow',glow);
 for(const button of pad.querySelectorAll('button'))disabled(button,s.transition>0);
 const readout=$('airlockReadout');
 show(readout,s.scene==='airlock');
 if(s.scene==='airlock')setText(readout,t('upgradePressureGauge',{n:Math.round(s.airlock.pressure)}));
 if(def.kind==='film')task=s.scene==='warning'?tr("text033"):s.scene==='landing'?tr("text034"):'';
 if(s.scene==='walk')task=window.innerWidth<700?tr("text035"):tr("text036");
 if(s.scene==='choose'){show($('actionArea'),false);show($('touchControls'),false);return;}
 if(s.scene==='clean'){
  const p=nearbyDustyPanel(s);
  task=tr("text037", [s.panels.filter(p=>p.clean>=100).length]);
  if(s.panels.some(p=>p.clean<100)){
   action=s.auto?t(s.target?'storyWalkToPanel':'storyBrushing'):tr("text038");
   enabled=!s.auto;
   if(p)progress=p.clean;
  }
 }
 if(s.scene==='connect')task=t('upgradeCableCount',{n:Object.values(s.cables).filter(Boolean).length})+' · '+t('upgradeConnect');
 if(s.scene==='return')task=tr("text041");
 if(s.scene==='airlock'){
  const a=s.airlock;
  if(a.phase==='outer'){task=tr("text042");action=tr("text043");}
  if(a.phase==='closing')task=tr("text044");
  if(a.phase==='sealed'){task=tr("text045");action=tr("text046");}
  if(a.phase==='pressurizing'){task=tr("text047");progress=a.pressure;}
  if(a.phase==='ready'){task=tr("text048");action=tr("text049");}
  if(a.phase==='opening')task=tr("text050");
 }
 if(s.scene==='shelter'){task=s.shelter.phase==='closing'?t('upgradeGateWorking'):tr("text051");if(near&&s.shelter.phase==='open')action=t('upgradeGateAction');}
 if(s.scene==='power')task=t(s.power.air?'upgradeRadioQuestion':'upgradeAirQuestion');
 if(s.scene==='monitor'){
  const m=s.monitor;task=m.reading===3?tr("text054"):m.cooldown>0?tr("text055"):m.reading===2?tr("text056"):tr("text057");
  if(m.reading<3){action=m.cooldown>0?tr("text058"):tr("text059");enabled=m.cooldown<=0;}
 }
 if(s.scene==='rover'){
  task=g?tr("text060", [g.label]):tr("text061");
  if(near){action=s.auto?t('storyScanning'):tr("text062");enabled=!s.auto;progress=s.rover.progress*100;}
  else if(s.rover.inputAt===null)action=t('storyDrive');
 }
 if(s.transition>0){action='';progress=null;task=storyDoneText(s.scene);}
 setText($('objective'),task);show($('objective'),!!task);
 setText($('interactButton'),action);show($('interactButton'),!!action);disabled($('interactButton'),!enabled);
 show($('actionProgress'),progress!==null);{const label=t(s.scene==='airlock'?'storyAirlockPressure':s.scene==='clean'?'upgradeBrushProgress':s.scene==='rover'?'upgradeScanProgress':'upgradeTaskProgress');if($('actionProgress').getAttribute('aria-label')!==label)$('actionProgress').setAttribute('aria-label',label);}if(progress!==null){$('actionProgress').firstElementChild.style.width=`${Math.max(0,Math.min(100,progress))}%`;$('actionProgress').setAttribute('aria-valuenow',String(Math.round(progress)));}
 show($('actionArea'),s.scene!=='complete');
}
function readTraining(){try{return JSON.parse(localStorage.getItem('astro-kitty-training-v1')||'{}')||{};}catch{return{};}}
function awardTraining(){
 const saved=readTraining(),earned=earnedStoryTraining(state),fresh=earned.filter(id=>!saved.best?.[id]?.success);
 if(!earned.length)return;
 try{localStorage.setItem('astro-kitty-training-v1',JSON.stringify(mergeStoryTraining(saved,state)));}catch{storageAvailable=false;}
 if(fresh.length){
  const milestone=TRAINING_MILESTONES.find(m=>m.id===fresh.at(-1));
  badgeNotice={id:milestone.id,text:t('trainingBadgeEarned',{badge:t(milestone.title)})};
  badgeNoticeLife=6;
 }
}
function choosePath(){
 $('routeChoice').innerHTML=`<h2 id="routeTitle">${t('chooseTitle')}</h2><div class="route-options"><button id="chooseTraining" class="route-card"><span class="route-icon">${icon('paw')}</span><span><strong>${t('chooseTraining')}</strong><small>${t('chooseTrainingText')}</small></span>${icon('arrow')}</button><button id="chooseBase" class="route-card"><span class="route-icon">${icon('shield')}</span><span><strong>${t('chooseBase')}</strong><small>${t('chooseBaseText')}</small></span>${icon('arrow')}</button></div>`;
 show($('routeChoice'));book.introSeen=true;save();
 $('chooseTraining').onclick=()=>{
  stopVoice();state=restoreStory({scene:book.trainingScene&&book.trainingScene!=='complete'?book.trainingScene:'walk',patches:book.trainingScene==='complete'?[]:book.patches},newWiringSeed());lastFeedback=-1;lastScene='';lastSpeech=-1;lastCheckpoint=-1;sync();canvas.focus({preventScroll:true});chime();
 };
 $('chooseBase').onclick=()=>{stopVoice();book.introSeen=true;save();location.href='./outpost.html?arrival=1';};
 $('chooseTraining').focus({preventScroll:true});
}
function switchAdventure(){
 stopVoice();clearInput();if($('menuDialog').open)$('menuDialog').close();state=createGame('choose',book.patches);paused=false;lastScene='';lastSpeech=-1;lastCheckpoint=-1;
 show($('titleScreen'),false);show($('ending'),false);show($('episodeLabel'),false);show($('pauseButton'));show($('chapter'));sync();
}
function finish(){sound.finish();
 show($('ending'));show($('actionArea'),false);show($('subtitle'),false);show($('puzzle'),false);show($('touchControls'),false);
 $('ending').innerHTML=`<div class="mission-patch">${icon('cat')}</div><span class="eyebrow">${t('chooseTraining')}</span><h1>${t('trainingReady')}</h1><p>${t('trainingFinished')}</p><div class="patches">${TRAINING_MILESTONES.map(m=>`<div class="patch"><div>${icon(m.icon)}</div><span>${t(m.title)}</span></div>`).join('')}</div><div class="ending-actions"><a class="primary" href="./outpost.html?arrival=1">${t('leadBase')} ${icon('arrow')}</a><a class="text-button" href="./classic/">${t('extraTrainingLink')}</a><button class="text-button" id="chooseAgain">${t('chooseAgain')}</button></div><details class="training-facts"><summary>${t('fact')}</summary><p>${t('trainingFact')}</p>${TRAINING_MILESTONES.map(m=>`<p><strong>${t(m.title)}</strong> · ${copy('facts')[m.fact].text}<br><a href="${copy('facts')[m.fact].url}" target="_blank" rel="noopener">${t('source')}</a></p>`).join('')}</details>`;
 $('chooseAgain').onclick=switchAdventure;chime(true);$('ending').querySelector('a').focus({preventScroll:true});
}

function sync(){
 if(!state)return;
 const s=state,def=SCENES[s.scene];
 if(lastScene!==s.scene){
  lastScene=s.scene;controls.reset();keys.clear();setText($('srStatus'),'');
  show($('monitorControl'),s.scene==='monitor');
  if(s.scene==='monitor'){monitorScale.value=s.monitor.scale;updateMonitorScale();}
  game.dataset.scene=s.scene;game.classList.toggle('film-scene',['film','choice'].includes(def.kind));show($('routeChoice'),s.scene==='choose');if(s.scene==='choose')choosePath();setText($('chapter'),['approach','landing','choose'].includes(s.scene)?def.chapter:t('trainingChapter',{title:def.chapter}));canvas.setAttribute('aria-label',`${def.chapter}. ${['walk','drive'].includes(def.kind)?tr("text069"):tr("text070")}`);
  show($('puzzle'),def.kind==='puzzle');
  if(s.scene==='complete')finish();
 }
 if(s.scene==='connect'&&s.cable&&s.feedback.version!==lastFeedback)awardTraining();
 if(s.checkpointVersion!==lastCheckpoint){lastCheckpoint=s.checkpointVersion;book.scene=s.scene;book.patches=[...s.patches];if(!['approach','landing','choose'].includes(s.scene)){book.trainingScene=s.scene;awardTraining();}save();}
 let praise='';if(s.feedback.version!==lastFeedback){lastFeedback=s.feedback.version;if(s.feedback.kind==='happy'){praise=copy('trainingCheers')[s.feedback.cheer];if(s.feedback.complete)sound.finish();else{sound.play(s.feedback.cheer===2?'purr':s.feedback.cheer%2?'meow':'yay');if(s.feedback.cheer%2===0&&s.feedback.cheer!==2)setTimeout(()=>sound.kitty(),420);}if(s.feedback.target==='gauge')sound.thunk();if(s.feedback.target==='gate'||s.feedback.target==='outer')sound.click();}else if(s.feedback.kind==='check'){praise=t('storyGoodChecking');sound.chime();}else if(s.feedback.kind==='wrong')sound.buzz();}
 if(s.speechVersion!==lastSpeech){lastSpeech=s.speechVersion;speak(s.speech,praise);}
 if(def.kind==='puzzle')controls.render();scienceUI();
 actionUI();
 let banner=storyBadgeBanner(s.scene,badgeNotice,badgeNoticeLife);
 if(s.scene==='monitor'&&s.monitor.cooldown>2.5&&s.monitor.reading<3)banner=tr("text072");
 setText($('sceneBanner'),banner);show($('sceneBanner'),!!banner);
}

function openDialog(html,label=tr("text073")){
 if(state||simulator.active){paused=true;clearInput();stopVoice();sound.stopAll();}
 setText($('dialogLabel'),label);$('dialogBody').innerHTML=html;
 if(!$('menuDialog').open)$('menuDialog').showModal();
}
function menu(){
 if(simulator.active){
  if(simulator.factOpen||$('menuDialog').open)return;
  openDialog(`<h2>${launchCopy.pause}</h2>
    <button class="primary" id="resumeButton">${t('resume')}</button>
    <label class="checkbox-row"><input id="captionsToggle" type="checkbox" ${book.subtitles?'checked':''}>${t('captions')}</label>
    <label class="checkbox-row"><input id="motionToggle" type="checkbox" ${book.reduceMotion?'checked':''}>${t('reduced')}</label>`,launchCopy.title);
  $('resumeButton').onclick=()=>$('menuDialog').close();
  $('captionsToggle').onchange=e=>{book.subtitles=e.target.checked;save();saveSharedSettings({captions:book.subtitles});};
  $('motionToggle').onchange=e=>{book.reduceMotion=e.target.checked;document.body.classList.toggle('reduce-motion',book.reduceMotion);save();saveSharedSettings({reduceMotion:book.reduceMotion});};
  return;
 }
 if(!state)return;
 openDialog(tr("text074", [icon('arrow'), book.subtitles?'checked':'', book.reduceMotion?'checked':'', storageAvailable?tr("text075"):tr("text076"), voiceUnavailable?tr("text077"):tr("text078")]));
 const switchButton=document.createElement('button');switchButton.className='text-button';switchButton.textContent=t('chooseNav');switchButton.onclick=switchAdventure;$('dialogBody').querySelector('.menu-actions').prepend(switchButton);if(['connect','power'].includes(state.scene)){const help=document.createElement('p');help.textContent=t('upgradeWiringHelp');$('dialogBody').append(help);}const oldTraining=$('dialogBody').querySelector('a[href="./classic/"]');if(oldTraining)oldTraining.textContent=t('practiceChallenges');
 $('resumeButton').addEventListener('click',()=>$('menuDialog').close());
 $('chapterRestart').addEventListener('click',()=>{const patches=[...state.patches];if(state.scene==='connect')enter(state,'connect');else state=createGame(state.scene,patches,newWiringSeed());lastScene='';lastSpeech=-1;lastCheckpoint=-1;$('menuDialog').close();sync();});
 $('menuNotebook').addEventListener('click',notebook);
 $('captionsToggle').addEventListener('change',e=>{book.subtitles=e.target.checked;save();saveSharedSettings({captions:book.subtitles});show($('subtitle'),book.subtitles||!book.voice||voiceUnavailable);});
 $('motionToggle').addEventListener('change',e=>{book.reduceMotion=e.target.checked;document.body.classList.toggle('reduce-motion',book.reduceMotion);save();saveSharedSettings({reduceMotion:book.reduceMotion});});
}
function notebook(){
 openDialog(tr("text079", [icon('arrow')]),tr("text080"));
 $('dialogBody').insertAdjacentHTML('beforeend',Object.values(copy('trainingScience')).map(f=>`<article class="story-fact">${truthBadge('real')}<p>${t(f.textKey)}</p><a href="${f.url}" target="_blank" rel="noopener">${t('source')}</a></article>`).join(''));
 $('notebookBack').addEventListener('click',()=>$('menuDialog').close());
}
$('pauseButton').addEventListener('click',menu);$('closeDialog').addEventListener('click',()=>$('menuDialog').close());
$('menuDialog').addEventListener('close',()=>{paused=false;lastFrame=0;clearInput();if(simulator.active){simulator.repeat();simulator.focus();}else if(state&&state.scene!=='complete'){speak(state.speech);canvas.focus({preventScroll:true});}});
function flushMovement(){
 if(!state||paused||!['walk','drive'].includes(SCENES[state.scene].kind))return;
 const now=performance.now(),dt=lastFrame?Math.min((now-lastFrame)/1000,1):0;lastFrame=now;
 if(dt){if(!isReduced())visualTime+=dt;advanceStory(state,dt,{left:keys.has('left'),right:keys.has('right'),up:keys.has('up'),down:keys.has('down'),action:keys.has('action')});sync();}
}
const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',e:'action',E:'action',' ':'action'};
window.addEventListener('keydown',e=>{
 if(simulator.active){
  if(!e.repeat&&['p','P','Escape'].includes(e.key)&&!$('menuDialog').open&&!simulator.factOpen){e.preventDefault();menu();}
  return;
 }
 if(!state||$('menuDialog').open||[tr("text081"),tr("text082"),tr("text083")].includes(e.target.tagName))return;
 if(['p','P',tr("text084")].includes(e.key)&&!e.repeat){e.preventDefault();menu();return;}
 if(paused)return;
 if((e.key===' '||e.key===tr("text085"))&&e.target.tagName===tr("text086"))return;
 const direction=keyMap[e.key];
 if(direction){e.preventDefault();flushMovement();keys.add(direction);
  if(direction!=='action')useRoverControls(state);
  else if(!e.repeat&&SCENES[state.scene].kind!=='film'){interact(state);sync();}
 }
});
window.addEventListener('keyup',e=>{if(keyMap[e.key]){flushMovement();keys.delete(keyMap[e.key]);}});
for(const button of document.querySelectorAll('[data-dir]')){
 const direction=button.dataset.dir;
 function begin(){
  if(!state||paused||button.disabled)return false;
  flushMovement();
  useRoverControls(state);
  keys.add(direction);
  return true;
 }
 function end(){
  if(!keys.has(direction))return;
  flushMovement();
  keys.delete(direction);
 }
 button.addEventListener('pointerdown',event=>{
  if(event.button!==0||!begin())return;
  event.preventDefault();
  button.setPointerCapture(event.pointerId);
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(type,end);
 const activate=event=>event.key==='Enter'||event.key===' ';
 button.addEventListener('keydown',event=>{
  if(!activate(event))return;
  event.preventDefault();
  event.stopPropagation();
  if(!event.repeat)begin();
 });
 button.addEventListener('keyup',event=>{
  if(!activate(event))return;
  event.preventDefault();
  event.stopPropagation();
  end();
 });

 button.addEventListener('click',event=>{
  if(event.detail!==0||!begin())return;
  advanceStory(state,.12,{[direction]:true});
  keys.delete(direction);
  sync();
 });
}
canvas.addEventListener('pointerdown',e=>{
 if(!state||paused)return;const r=canvas.getBoundingClientRect(),p=toWorld(e.clientX-r.left,e.clientY-r.top);if(!p)return;
 if(state.scene==='monitor'){interact(state);sync();return;}
 if(state.scene==='airlock')return;
 setTarget(state,p.x,p.y);canvas.focus({preventScroll:true});
});
function autoPause(){if(!paused&&(simulator.active||state&&state.scene!=='complete'))menu();}
bindStoryVisibility(document,window,autoPause);
window.addEventListener('resize',()=>controls.render());

const frameSamples=[],frameIntervals=[];let lastTelemetry=0;
function frame(now){

 if(document.hidden){lastFrame=0;requestAnimationFrame(frame);return;}
 const renderStarted=performance.now(),rawFrameMs=lastFrame?now-lastFrame:0;const dt=rawFrameMs?Math.min(rawFrameMs/1000,1):0;lastFrame=now;
 if(simulator.active){
  simulator.tick(dt,paused);
  requestAnimationFrame(frame);
  return;
 }
 if(!paused){
  visualTime+=book.reduceMotion||motionQuery.matches?0:dt;if(state?.scene!=='warning')badgeNoticeLife=Math.max(0,badgeNoticeLife-dt);subtitleLife=Math.max(0,subtitleLife-dt);
  if(narrating&&now-narrationStarted>22000){stopVoice();voiceUnavailable=true;}
  if(state){
   const def=SCENES[state.scene];

   let boundary=def.seconds??Infinity;
   if(state.scene==='approach')boundary=state.speech==='welcome'?5.5:state.speech==='approachHome'?11:def.seconds;
   if(state.scene==='landing'&&state.speech==='landing')boundary=4.5;
   const waitForVoice=state.scene!=='warning'&&narrating&&((def.kind==='film'&&state.sceneTime>=boundary-.06)||(state.transition>0&&state.transition<.1));
   if(!waitForVoice){advanceStory(state,dt,{left:keys.has('left'),right:keys.has('right'),up:keys.has('up'),down:keys.has('down'),action:keys.has('action')});}
   sync();
  }
 }
 if(state){const showCaptions=state.scene!=='complete'&&(book.subtitles||!book.voice||voiceUnavailable)&&(subtitleLife>0||narrating||paused||SCENES[state.scene].kind!=='film');show($('subtitle'),showCaptions);}
 sound.hiss(!paused&&state?.scene==='airlock'&&state.airlock.phase==='pressurizing');
 const appearance=storyLook;const view=drawScene(canvas,state,{home:!state,visualTime,reduceMotion:book.reduceMotion||motionQuery.matches,suit:appearance.suit||'#b7a1e4',sticker:appearance.sticker||'',controls:controls.visual(),happy:state?.feedback?.kind==='happy'&&state.feedback.age<1.8});
 const cheer=['happy','check'].includes(state?.feedback?.kind)&&state.feedback.scene===state.scene&&state.feedback.age<1.8;show($('happyBubble'),!!cheer);if(cheer){setText($('happyBubble'),state.feedback.kind==='check'?t('storyGoodChecking'):copy('trainingCheers')[state.feedback.cheer]);const point=view.feedbackPoint??{x:canvas.clientWidth/2,y:150};$('happyBubble').style.left=Math.max(80,Math.min(canvas.clientWidth-80,point.x))+'px';$('happyBubble').style.top=Math.max(155,point.y-62)+'px';}
 if(now-lastTelemetry>500||game.dataset.paused!==String(paused)){lastTelemetry=now;game.dataset.paused=String(paused);game.dataset.sceneTime=String(state?.sceneTime.toFixed(2)??0);canvas.dataset.visualTime=visualTime.toFixed(3);}frameSamples.push(performance.now()-renderStarted);if(!paused&&rawFrameMs>0)frameIntervals.push(rawFrameMs);if(frameSamples.length===60){canvas.dataset.frameMs=(frameSamples.reduce((a,b)=>a+b,0)/60).toFixed(2);frameSamples.length=0;if(frameIntervals.length){canvas.dataset.frameIntervalMs=(frameIntervals.reduce((a,b)=>a+b,0)/frameIntervals.length).toFixed(2);frameIntervals.length=0;}}
 requestAnimationFrame(frame);
}
registerOffline();updateVoice();requestAnimationFrame(frame);

localizeStatic();

const homeCredit=document.createElement('div');homeCredit.id='homeCredit';homeCredit.innerHTML=teamCreditHTML();(document.getElementById('creditSlot')||document.getElementById('titleScreen')).append(homeCredit);{const r=document.createElement('div');r.innerHTML=resourcesHTML();(document.getElementById('creditSlot')||document.getElementById('titleScreen')).append(r);}

for(const el of document.querySelectorAll('[data-story-copy]'))el.textContent=t(el.dataset.storyCopy);$('beginButton').textContent=t(book.introSeen&&book.scene&&book.scene!=='complete'?'continueAdventure':'beginAdventure');
const routeParams=new URL(location.href).searchParams;if(routeParams.has('choose'))switchAdventure();else if(routeParams.has('training')&&book.introSeen){state=createGame(book.trainingScene&&book.trainingScene!=='complete'?book.trainingScene:'walk',book.patches,newWiringSeed());paused=false;show($('titleScreen'),false);show($('episodeLabel'),false);show($('pauseButton'));show($('chapter'));sync();}
