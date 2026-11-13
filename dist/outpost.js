import {archiveStormForCode} from './solar-archive.js';
import {truthBadge,eventDate,stormPlayLabel,visualMeter,panelDustHTML,oddsHTML,wallStatusHTML,REFLECTION_ANSWERS,saveReflectionAnswer,learnedHTML,learnedIdeas} from './outpost-presentation.js';
import {directedOutpostScene} from './journey.js';
import {FLAGS,validateFlag,flagSVG,teamCreditHTML,drawBangladeshFlag} from './flags.js';
import {copy,t,setLanguage,LANGUAGES} from './strings.js';
import {METERS,SYSTEMS,tomorrowWeather,stormGoal,weatherToday,moraleCells,normalizeMissionCode,codeForSeed,missionStars,createOutpost,restoreOutpost,cellsAvailable,defaultPlan,previewPlan,confirmPlan,choiceEffects,choiceAllowed,choose,tickReply,showSummary,nextSol,collectRock,createDodge,tickDodge,clamp} from './outpost-engine.js';
import {createGame} from './story-engine.js';
import {surfaceObstacles,moveOnGround,groundRoute,nearestFreeGround,KITTY_RADIUS,OUTPOST_START} from './surface-world.js';
import {drawScene,toWorld,cat} from './art.js';
import {readyVoices,registerOffline,containPoint,makeUtterances} from './compat.js';
import {createStorySound} from './story-sound.js';
import {resourcesHTML} from './resources.js';
import {loadSpaceWeather,flareStrength,FALLBACK_EVENT} from './nasa-data.js';
import {MODULES,GRID,PIP_LAYOUT,validLayout,normalizeLayout,layoutEffects,placeModule,encodeLayout} from './base-design.js';
import {defaultSite,normalizeSite,siteRules} from './landing-sites.js';
import {parseMissionLink,missionLink} from './mission-link.js';
import {siteMapHTML,siteCardsHTML,baseGridHTML,designEditorHTML,designEffectsHTML,layoutHint,moduleName} from './outpost-setup.js';

const $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='astro-kitty-outpost-v1',PROFILE='astro-kitty-profile-v1',TRAINING='astro-kitty-training-v1';
const symbols={power:'⚡',air:'💨',water:'💧',food:'🌱',shielding:'🛡️',spirit:'💛'};
const colours={power:'#f0d29b',air:'#ace3d0',water:'#9acddd',food:'#b1d6a7',shielding:'#bca8e2',spirit:'#efbe9d'};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)??'null')??fallback;}catch{return fallback;}}
let storageOK=true,offlineReady=false,offlineChecked=false;
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{storageOK=false;}}
const training=read(TRAINING,{});
let profile={name:training.name||t('defaultName'),suit:'#b7a1e4',sticker:'',voice:true,captions:true,bigText:false,reduceMotion:false,language:'en',patches:0,...read(PROFILE,{})};
profile.flag=validateFlag(profile.flag);
profile.missionStars=profile.missionStars&&typeof profile.missionStars==='object'?profile.missionStars:{};
const SUITS=[['#b7a1e4','suitLavender',0],['#ace3d0','suitMint',3],['#efd18d','suitGold',6],['#e9aa9e','suitCoral',9]];
const STICKERS=[['','stickerNone',0],['★','stickerStar',3],['♥','stickerHeart',6],['☾','stickerMoon',-1]];
const trainingStars=()=>Object.values(read(TRAINING,{}).best??{}).reduce((sum,b)=>sum+(b?.success?clamp(Number(b.stars)||0,0,3):0),0);
const totalStars=()=>trainingStars()+Object.values(profile.missionStars).reduce((n,v)=>n+clamp(Number(v)||0,0,3),0);
function unlocked(cost){return cost<0?profile.patches>0:totalStars()>=cost;}
if(!SUITS.some(x=>x[0]===profile.suit&&unlocked(x[2])))profile.suit=SUITS[0][0];
if(!STICKERS.some(x=>x[0]===profile.sticker&&unlocked(x[2])))profile.sticker='';
profile.name=String(profile.name).slice(0,22);profile.patches=Math.max(0,Number(profile.patches)||0);
setLanguage(profile.language);document.documentElement.lang=profile.language;
for(const el of document.querySelectorAll('[data-copy]'))el.textContent=t(el.dataset.copy);
$('outpostCanvas').setAttribute('aria-label',t('exploreHint'));
$('panelClose').setAttribute('aria-label',t('close'));$('bonusClose').setAttribute('aria-label',t('close'));
const sharedSettings=parseMissionLink(location.href);
let draft=null,selectedModule='shelter',gridCursor=GRID.habitat;
let weatherState={event:{...FALLBACK_EVENT,mode:'archive'},latest:{...FALLBACK_EVENT,mode:'archive'},quiet:false,replacement:false},weatherPending=true,weatherPromise=null;
let nextCode=normalizeMissionCode(new URL(location.href).searchParams.get('code'))||codeForSeed(Date.now());
let mission=restoreOutpost(read(KEY,null)),active=false,plan=null,lastPhase='',lastSol=0,lastTick=0,visualTime=0,spinUntil=0,purrTaps=[],jokeIndex=-1,idleTime=0,savedAt=0;
let reflectionShown=false;
let filmShot=null,filmDone=null,filmTime=0,arrivalPending=false;
const fromStory=new URL(location.href).searchParams.has('arrival');
let exploringTarget=null,exploringRoute=[],obstacles=[],keys=new Set(),paused=false,dialogKind='',lastLine='',speechId=0,latestEvent={...FALLBACK_EVENT,mode:'archive'},bonus=null,bonusTarget=null,photoPose=false,rockGuide=null;
const canvas=$('outpostCanvas'),dialog=$('missionDialog'),panel=$('panelBody'),visual=createGame('walk'),motion=matchMedia('(prefers-reduced-motion: reduce)');
function clearRoute(){exploringTarget=null;exploringRoute=[];}
function aimOutpost(point){
 exploringRoute=groundRoute(visual.player,point,obstacles,KITTY_RADIUS,300);
 exploringTarget=exploringRoute.at(-1)??null;
}
function updateGround(position){
 obstacles=surfaceObstacles({layout:mission.layout});
 Object.assign(visual.player,nearestFreeGround(position,obstacles,KITTY_RADIUS,300));
 visual.buddy={x:visual.player.x+65,y:visual.player.y-10};
 for(const rock of mission.rocks){
  if(!rock.found)Object.assign(rock,nearestFreeGround(rock,obstacles,KITTY_RADIUS,300));
 }
}
const missionEnded=()=>mission&&['complete','failed'].includes(mission.phase);
const synth=globalThis.speechSynthesis,voices=readyVoices(synth);
let audioContext=null;
const sfx=createStorySound();
let happyUntil=0;
function sound(kind='win'){
  if(kind!=='purr')happyUntil=visualTime+2.4;
  if(!profile.voice)return;
  try{sfx.unlock();if(kind==='purr')sfx.purr();else if(kind==='cheer')sfx.finish();else if(kind==='meow')sfx.kitty();else{sfx.chime();setTimeout(()=>sfx.kitty(),260);}}catch{}
}
function settings(){document.body.classList.toggle('big-text',!!profile.bigText);document.body.classList.toggle('reduce-motion',!!profile.reduceMotion);$('voiceToggle').textContent=profile.voice?'🔊':'🔇';$('voiceToggle').setAttribute('aria-label',t('voice'));$('voiceToggle').setAttribute('aria-pressed',String(profile.voice));$('menuToggle').textContent='☰';$('menuToggle').setAttribute('aria-label',t('menu'));}
function save(){if(mission)write(KEY,mission);write(PROFILE,profile);}
function stopVoice(){speechId++;try{synth?.cancel();}catch{}}
async function speak(line){
  lastLine=line;idleTime=0;$('pipLine').textContent=line;$('pipCaption').classList.toggle('hidden',profile.captions===false&&profile.voice===true&&!!synth);stopVoice();const id=speechId;
  if(!profile.voice||!synth||!globalThis.SpeechSynthesisUtterance)return;
  const available=await voices;if(id!==speechId||!profile.voice||paused||document.hidden)return;
  try{const list=makeUtterances(line,synth.getVoices().length?synth.getVoices():available);
    for(const u of list)u.onerror=()=>{$('pipCaption').classList.remove('hidden');};synth.resume();for(const u of list)synth.speak(u);
  }catch{$('pipCaption').classList.remove('hidden');}
}
function announce(line){$('worldNote').textContent=line;speak(line);}
const facts=()=>copy('facts'),cards=()=>copy('cards');
function factHTML(id){const f=facts()[id];return f?`<details class="fact-box fact-fold"><summary>${truthBadge('real')} <span>${esc(f.title||t('realFact'))}</span></summary><p>${esc(f.text)}</p><a href="${esc(f.url)}" target="_blank" rel="noopener">${t('source')}</a></details>`:'';}
function changeHTML(changes,all=false){if(!all&&!METERS.some(k=>changes[k]))return `<p class="simple-note">${t('noChange')}</p>`;return `<div class="preview-chips">${METERS.filter(k=>all||changes[k]).map(k=>`<span class="delta-chip ${changes[k]>0?'up':changes[k]<0?'down':''}">${symbols[k]} ${esc(t(k))} ${changes[k]>0?'↑ +':changes[k]<0?'↓ ':''}${Math.round(changes[k]||0)}</span>`).join('')}</div>`;}
function eventHTML(event){if(!event)return'';const mode={live:'eventModeLive',archive:'eventModeArchive',cache:'eventModeCache'}[event.mode]??'eventModeArchive';return `<div class="event-box">${truthBadge('real')} ${esc(t('eventLabel',{date:eventDate(event)}))}<small>${esc(t(mode))} · ${esc(event.classType??'')} · <a href="${esc(event.source)}" target="_blank" rel="noopener">${esc(event.flrID)}</a></small><p>${esc(t('flareDirection'))}</p><p>${esc(t('eventDisclaimer'))}</p></div>`;}
function openPanel(html,kicker,kind='info',line=null){
  if(kind!=='film'){filmShot=null;filmDone=null;}
  keys.clear();clearRoute();visual.player.vx=visual.player.vy=0;dialogKind=kind;document.body.classList.toggle('panel-open',kind!=='film');dialog.dataset.kind=kind;dialog.classList.toggle('setup-dialog',['home','sites','design'].includes(kind));dialog.classList.toggle('storm-decision',kind==='decision'&&mission?.deck[mission.sol-1]==='storm');dialog.classList.toggle('cinematic-dialog',['film','brief','decision','result','summary'].includes(kind));document.body.classList.toggle('cinema-sequence',kind==='film');$('panelClose').setAttribute('aria-label',t(kind==='film'?'cutContinue':'close'));dialog.classList.toggle('planning-dialog',kind==='plan');panel.innerHTML=html;$('panelKicker').textContent=kicker;
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  const focus=kind==='decision'?panel.querySelector('.choices button:not(:disabled)'):panel.querySelector('button:not(:disabled),input,a,select');focus?.focus({preventScroll:true});if(line)speak(line);
}

const VIGNETTES={
 landing:['surface',[['🚀','land',18,8,44],['🐾','pop',58,58,26],['✨','twinkle',76,20,18]]],
 storm:['storm',[['☀️','flare',10,10,48],['✨','streak',30,20,18],['✨','streak s2',34,48,16],['✨','streak s3',28,70,14],['🏠','still',76,44,40],['🛡️','pop',70,22,24]],['🛡️','up']],
 dust:['dusty',[['☁️','drift',10,22,40],['☁️','drift s2',40,50,34],['☀️','dim',74,8,36],['🔋','still',76,56,28]],['⚡','down']],
 leak:['lab',[['🚰','still',16,6,40],['💧','drip',24,44,20],['💧','drip s2',24,44,20],['💧','drip s3',24,44,20],['🔧','swing',62,40,34]],['💧','down']],
 greenhouse:['green',[['🌱','droop',16,40,38],['🌿','droop s2',40,44,34],['💡','twinkle',68,8,34],['💧','drip',72,50,18]],['🌱','down']],
 homesick:['room',[['🌍','float',14,14,44],['💌','fly',40,50,28],['😿','still',74,40,36]],['💛','down']],
 sick:['room',[['🤒','wobble',18,30,42],['🩹','pop',52,22,28],['🍵','float',74,46,30]],['💛','down']],
 dustdevil:['dusty',[['🌪️','sweep',0,22,50],['☀️','dim',78,8,30],['🔋','still',70,60,26]]],
 filter:['lab',[['🌀','spin',16,24,46],['💨','drift',48,30,30],['💨','float',76,50,24]],['💨','down']],
 freeze:['night',[['❄️','fall',14,0,24],['❄️','fall s2',40,0,20],['❄️','fall s3',66,0,26],['🏠','still',40,50,40],['🧊','pop',78,58,24]],['⚡','down']],
 cargo:['surface',[['🪂','land',22,0,40],['📦','bounce',60,54,34],['✨','twinkle',80,24,18]]],
 ice:['surface',[['⛏️','swing',14,28,40],['🧊','pop',44,52,36],['✨','twinkle',60,30,20],['✨','twinkle s2',74,54,16]],['💧','up']],
 sand:['surface',[['🚙','wobble',30,44,46],['💨','drift',6,54,24],['〰️','still',34,74,30]]],
 pebbles:['surface',[['🌑','pop',16,50,34],['🌑','pop s2',40,58,26],['🔍','scan',52,26,40],['✨','twinkle',78,30,18]]],
 birthday:['room',[['🎂','pop',38,40,42],['🎈','float',14,10,34],['🎈','float s2',72,6,30],['🎉','twinkle',64,50,24]],['💛','up']],
 drawings:['room',[['🖍️','swing',16,40,34],['🖼️','pop',44,14,42],['😺','still',74,44,34]],['💛','up']],
 help:['lab',[['📡','pulse',14,26,44],['〰️','streak',36,36,20],['🌍','float',72,14,40]]],
 clear:['surface',[['☀️','pulse',12,8,44],['🔋','still',50,56,28],['🔋','still',64,56,28],['⚡','pop',78,28,24]]],
 hazy:['dusty',[['🌤️','float',12,8,44],['🔋','still',50,56,28],['🔋','still',64,56,28]]],
 dusty:['dusty',[['☁️','drift',6,14,40],['☁️','drift s2',40,40,34],['🔋','still',64,56,28]]],
 night:['night',[['🌙','float',12,8,38],['✨','twinkle',40,14,16],['✨','twinkle s2',62,30,14],['🏠','still',44,48,40],['😺','still',72,54,26],['💤','float',80,30,20]]],
};
function vignetteHTML(id,done=false){const v=VIGNETTES[id];if(!v)return'';const [place,actors,tank]=v;return `<div class="vignette v-${place}${done?' v-done':''}" aria-hidden="true">${actors.map(([e,a,x,y,z])=>`<span class="va ${a}" style="left:${x}%;top:${y}%;font-size:${z}px">${e}</span>`).join('')}${tank?`<span class="v-tank ${tank[1]}"><b>${tank[0]}</b><i></i></span>`:''}</div>`;}
function closePanel(){if(dialogKind==='film'){finishCut();return;}dialog.close();document.body.classList.remove('panel-open');document.body.classList.remove('cinema-sequence');paused=false;dialogKind='';canvas.focus({preventScroll:true});}
function perkHTML(){const perks=active&&mission?mission.perks:createOutpost({training:read(TRAINING,{})}).perks;return `<h3>${t('trainingPerks')}</h3>${[['maintenance','perkSolar','🧹'],['navigation','perkRover','🚙'],['planning','perkPower','⚡'],['warning','perkShelter','🛡️'],['forecast','perkCommands','📡'],['fieldwork','perkGeology','🌑']].map(([id,label,sym])=>`<div class="perk-row"><span>${sym}</span><span>${esc(t(label))}<small>${t(perks[id]?'earned':'locked')}</small></span></div>`).join('')}<p class="simple-note">${t('perkNote')}</p>`;}
function sceneCut(scene,title,line,done){
 filmShot={scene};filmTime=0;filmDone=done;
 openPanel(`<div class="story-cut"><h2>${esc(title)}</h2><p>${esc(line)}</p>${forecastHTML()}<div class="panel-actions"><button class="primary" data-action="cut-next">${t('cutContinue')}</button><button class="chip-button" data-action="cut-repeat">${t('cutRepeat')}</button></div></div>`,t('filmChapter',{n:mission?.sol??1}),'film',line);
}
function finishCut(){const done=filmDone;filmShot=null;filmDone=null;document.body.classList.remove('cinema-sequence');if(done)done();}
function baseOpening(){
 arrivalPending=false;
 sceneCut('shelter',t('baseArrivalTitle'),t('baseArrivalLine',{name:mission.callsign}),()=>sceneCut('power',t('baseIntroTitle'),t('baseIntroLine'),briefing));
}
function eventCut(){const id=mission.deck[mission.sol-1],shot=copy('eventScenes')[id];sceneCut(directedOutpostScene(mission),shot.title,shot.line,decision);}
function codeHTML(){return `<p class="mission-code">${t('missionCode')}: <strong>${esc(mission?.code??nextCode)}</strong></p>`;}
function weatherHTML(){const event=weatherState.latest,strength=flareStrength(event);return `<section class="weather-card compact" aria-labelledby="weatherTitle"><div class="weather-line"><span class="weather-sun" aria-hidden="true">☀️</span><div><h2 id="weatherTitle">${t('weatherShort')}</h2><p>${t('flareReadout',{date:eventDate(event),class:esc(event.classType)})}</p></div>${truthBadge('real')}</div><meter class="flare-meter" min="0" max="5" value="${strength.level}" aria-label="${t('flareStrength',{class:esc(event.classType)})}">${esc(event.classType)}</meter><details class="learn-more"><summary>${t('learnMore')}</summary><small>${t(event.mode==='live'?'weatherLive':event.mode==='cache'?'weatherCache':'weatherArchive')}</small>${weatherState.quiet?`<p>${t('weatherQuiet')}</p>`:''}${strength.level?'':`<p>${t('flareUnknown')}</p>`}<p class="simple-note">${t('flareClasses')}</p><p>${t('flareHonesty')}</p><p class="simple-note">${t('flareDirection')}</p><p>${truthBadge('game')} ${t('flareGameRule',{strength:t('storm'+strength.tier[0].toUpperCase()+strength.tier.slice(1)),goal:strength.goal})}</p><a href="${esc(event.source)}" target="_blank" rel="noopener">${t('source')}</a>${event.mode==='archive'?`<p class="simple-note">${t('weatherNoQuietClaim')}</p>`:''}</details>${weatherPending?`<p class="simple-note" role="status">${t('weatherChecking')}</p>`:''}</section>`;}
function marsDataHTML(){return `<section class="mars-data" aria-label="${t('marsDataTitle')}"><h2>${t('marsDataTitle')} ${truthBadge('real')}</h2><div class="mars-tiles">${[['🌗','marsDay','marsDayLabel'],['🪶','marsGravity','marsGravityLabel'],['❄️','marsTemp','marsTempLabel']].map(([i,v,l])=>`<div class="mars-tile"><span aria-hidden="true">${i}</span><strong>${t(v)}</strong><small>${t(l)}</small></div>`).join('')}</div><details class="learn-more"><summary>${t('learnMore')}</summary><p class="simple-note">${t('marsDataNote')}</p><a href="https://science.nasa.gov/mars/facts/" target="_blank" rel="noopener">${t('source')}</a></details></section>`;}
function sharedNotice(){return (weatherState.replacement?`<p class="event-box">${t('sharedReplacement',{id:esc(weatherState.event.flrID),date:weatherState.event.startTime.slice(0,10)})}</p>`:'')+(sharedSettings.invalid?`<p class="simple-note">${t('sharedRepair')}</p>`:'');}
function home(){active=false;draft=null;const ended=missionEnded(),running=mission&&!ended;openPanel(`<h1>${t('baseHomeTitle')}</h1><label for="newCallsign">${t('callsign')}</label><input id="newCallsign" type="text" maxlength="22" value="${esc(profile.name)}" autocomplete="off"><div class="panel-actions home-actions">${running?`<button class="primary big" data-action="continue">${t('continue')}</button>`:''}<button class="${running?'chip-button':'primary big'}" data-action="new">${t(mission?'newMission':'setupNext')}</button>${ended?`<button class="chip-button" data-action="last-report">${t('seeLastReport')}</button>`:''}</div><div id="spaceWeather">${weatherHTML()}</div>${marsDataHTML()}<div id="sharedNotice">${sharedNotice()}</div><details class="rules-detail more-options"><summary>${t('moreOptions')}</summary><button class="chip-button" data-action="today">${stormPlayLabel(weatherState.latest)}</button><label class="wall-label" for="missionCodeInput">${t('enterCode')}</label><input id="missionCodeInput" type="text" maxlength="23" value="${esc(nextCode)}" autocomplete="off" spellcheck="false" aria-describedby="codeHint codeError"><p id="codeHint" class="simple-note">${t('codeHint')}</p><p id="codeError" class="plan-error" role="status"></p><button class="chip-button" data-action="pip-setup">${t('pipChoice')}</button><nav class="menu-grid"><a class="chip-button" href="./?training=1">${t('train')}</a><a class="chip-button" href="./teacher.html">${t('teacher')}</a></nav><button class="chip-button" data-action="wardrobe">${t('wardrobe')}</button><details class="rules-detail"><summary>${t('trainingPerks')}</summary>${perkHTML()}</details>${resourcesHTML()}<p class="simple-note">${t('noEndorsement')}</p>${teamCreditHTML()}</details>`,t('setupStep1'),'home');updateMeters();$('taskButton').textContent=t(ended?'newMission':'start');$('rockCounter').textContent=t('rocks',{n:0});}
async function beginSetup(today=false){
 const code=normalizeMissionCode($('missionCodeInput')?.value??nextCode);if(!code){const d=$('missionCodeInput').closest('details');if(d)d.open=true;$('codeError').textContent=t('codeInvalid');$('missionCodeInput').focus();return;}
 const name=($('newCallsign')?.value||profile.name).trim().slice(0,22)||t('defaultName');
 const button=panel.querySelector('[data-action="today"]');if(button)button.disabled=true;
 if((today||sharedSettings.eventId)&&weatherPromise)await weatherPromise;
 profile.name=name;nextCode=code;
 draft={code,callsign:name,site:sharedSettings.site??defaultSite(code),layout:normalizeLayout(sharedSettings.layout),event:today?weatherState.latest:sharedSettings.eventId?weatherState.event:archiveStormForCode(code),replacement:!today&&!!sharedSettings.eventId&&weatherState.replacement};
 landingStep();
}
function landingStep(){if(!draft)return home();openPanel(`<h2>${t('siteTitle')}</h2>${siteMapHTML(draft.site)}${siteCardsHTML(draft.site)}<footer class="setup-footer"><button class="primary" data-action="design">${t('siteContinue')}</button><button class="chip-button" data-action="pip-site">${t('pipChoice')}</button><button class="text-button" data-action="setup-home">${t('setupBack')}</button></footer>`,t('setupStep2'),'sites',t('siteIntro'));}
function designStep(focusTile=null){if(!draft)return home();openPanel(designEditorHTML(draft.layout,selectedModule,gridCursor),t('setupStep3'),'design');if(focusTile!==null)panel.querySelector(`[data-tile="${focusTile}"]`)?.focus({preventScroll:true});}
function putModule(tile){if(!draft)return;const l=placeModule(draft.layout,selectedModule,tile);if(!l){$('designStatus').textContent=t('designInvalid');return;}draft.layout=l;gridCursor=tile;designStep(tile);$('designStatus').textContent=t('designPlaced',{module:moduleName(selectedModule),hint:layoutHint(l,selectedModule)});}
function startNew(){
 if(!draft||!validLayout(draft.layout))return;
 reflectionShown=false;mission=createOutpost({code:draft.code,site:draft.site,layout:draft.layout,stormEvent:draft.event,training:read(TRAINING,{}),callsign:draft.callsign});mission.stormEvent={...draft.event};mission.eventReplacement=!!draft.replacement;active=true;arrivalPending=true;plan=null;lastPhase='';lastSol=0;
 history.replaceState(null,'',missionLink(location.href,mission));nextCode=mission.code;draft=null;
 updateGround(OUTPOST_START);mission.player={x:visual.player.x,y:visual.player.y};save();closePanel();syncPhase(true);sound();
}
function baseMap(){if(!mission)return;openPanel(`<h2>${t('baseDesign')}</h2><p>${t('siteLabel',{site:esc(copy('sites')[mission.site].name)})}</p>${baseGridHTML(mission.layout)}${mission.legacyRules?`<p>${t('designLegacy')}</p>`:designEffectsHTML(mission.layout)}<p class="simple-note">${truthBadge('game')} ${t('designGame')}</p><button class="primary" data-action="resume">${t('resume')}</button>`,t('baseMap'),'base-map');}
function missionDesignHTML(){const site=copy('sites')[mission.site];return `<section class="report-design"><h3>${t('siteLabel',{site:esc(site.name)})}</h3>${truthBadge('real')}<p>${esc(site.fact)}</p><a href="${esc(site.url)}" target="_blank" rel="noopener">${t('source')}</a><h3>${t('baseDesign')}</h3>${baseGridHTML(mission.layout)}${mission.legacyRules?`<p>${t('designLegacy')}</p>`:designEffectsHTML(mission.layout)}</section>`;}
function stormTargetText(soon=false){const goal=stormGoal(mission);return t(soon?'stormSoonDynamic':'stormTargetDynamic',{goal,strength:t(goal===50?'stormHuge':goal===30?'stormSmall':'stormStrong')});}
function stormRuleText(){return t('stormRuleDynamic',{goal:stormGoal(mission),below:stormGoal(mission)-1});}
function goalText(){const id=mission.bonusGoal.id;return t('goal'+id[0].toUpperCase()+id.slice(1));}
function forecastHTML(){const weather=tomorrowWeather(mission);return weather?`<p class="simple-note">${t('forecastTomorrow',{icon:({clear:'☀️',hazy:'🌤️',dusty:'☁️'})[weather],weather:t('weather'+weather[0].toUpperCase()+weather.slice(1))})}</p>`:'';}
function briefing(){const line=t('morningBudget',{cells:cellsAvailable(mission)}),early=mission.perks.warning&&mission.sol===mission.stormSol-1,w=weatherToday(mission),mood=moraleCells(mission);
  openPanel(`${vignetteHTML(mission.weather[mission.sol-1])}<span class="eyebrow">${t('sol',{n:mission.sol})}</span><h2>${t('solTitle'+mission.sol)}</h2>${mission.eventReplacement?`<p class="event-box">${t('sharedReplacement',{id:esc(mission.stormEvent.flrID),date:mission.stormEvent.startTime.slice(0,10)})}</p>`:''}<p class="story-line">${t('solStory'+mission.sol,{name:esc(mission.callsign)})}</p><p class="brief-weather">${w.icon} ${t('weatherBrief',{weather:t('weather'+mission.weather[mission.sol-1][0].toUpperCase()+mission.weather[mission.sol-1].slice(1)),cells:w.cells})}</p>${early?`<div class="event-box">${t('early')}</div>`:''}<details class="learn-more"><summary>${t('todayDetails')}</summary><p>${esc(line)}</p>${forecastHTML()}${codeHTML()}<p class="simple-note">${t(mood>0?'moraleHigh':mood<0?'moraleLow':'moraleNormal')}</p>${visualMeter(t('sunlight'),w.sunlight)}${panelDustHTML(mission.cleanliness)}${mission.sol===1?`<p class="simple-note">${t('shieldingHelp')}</p>`:''}<p>${t('bonusGoal',{goal:goalText()})}</p></details><div class="panel-actions"><button class="primary" data-action="plan">${t('plan')}</button><button class="chip-button" data-action="explore">${t('explore')}</button><button class="chip-button" data-action="share">${t('shareMission')}</button></div>`,t('brief'),'brief',t('solStory'+mission.sol,{name:mission.callsign})+' '+line+(early?' '+t('early'):''));}
function planHTML(){plan??=defaultPlan(mission);const p=previewPlan(mission,plan);return `<div class="plan-content"><h2>${t('planning')}</h2>${forecastHTML()}${truthBadge('game')}${wallStatusHTML(mission,stormGoal(mission))}<p class="simple-note">${mission.sol>mission.stormSol?t('stormFinished'):stormTargetText(mission.sol===mission.stormSol||(mission.perks.warning&&mission.sol===mission.stormSol-1))}</p><div class="allocation-rows">${SYSTEMS.map(k=>`<div class="allocation-row"><span>${k==='shield'?'🛡️':symbols[k]} ${t(k+'System')}</span><div class="stepper"><button class="chip-button" data-alloc="${k}" data-step="-1" aria-label="− ${t(k+'System')}">−</button><output id="alloc-${k}">${plan[k]}</output><button class="chip-button" data-alloc="${k}" data-step="1" aria-label="+ ${t(k+'System')}">+</button></div></div>`).join('')}</div><label class="wall-label" for="wallPlan">${t('wall')}</label><select id="wallPlan">${[[0,'wallNone'],[1,'wallOne'],[2,'wallTwo'],[-1,'wallReturn']].map(([v,label])=>`<option value="${v}" ${plan.wall===v?'selected':''} ${v===-1&&mission.wallWater<10?'disabled':''}>${t(label)}</option>`).join('')}</select><p class="simple-note">${t('wallStored',{n:mission.wallWater})}</p><strong>${t('preview')}</strong><div id="planPreview">${changeHTML(p.changes,true)}</div><details class="rules-detail"><summary>${t('howItWorks')}</summary><p>${t('wallHint')}</p>${SYSTEMS.map(k=>`<p>${t(k+'Hint')}</p>`).join('')}<p>${t('previewNote')}</p><p>${stormRuleText()}</p></details></div><footer class="plan-footer"><div class="plan-status"><b id="cellBudget">${t('cellBudget',{used:p.used,total:p.total})}</b><span>⚡</span></div><p id="planError" class="plan-error" role="status">${p.error?t(p.error):''}</p><button class="primary" data-action="confirm" id="confirmPlan" ${p.valid?'':'disabled'}>${t('confirm')}</button></footer>`;}
function planning(){openPanel(planHTML(),t('plan'),'plan',t('wallHint'));}
function updatePreview(){const p=previewPlan(mission,plan);$('cellBudget').textContent=t('cellBudget',{used:p.used,total:p.total});for(const k of SYSTEMS)$('alloc-'+k).textContent=plan[k];$('planPreview').innerHTML=changeHTML(p.changes,true);$('planError').textContent=p.error?t(p.error):'';$('confirmPlan').disabled=!p.valid;}
function decision(){const id=mission.deck[mission.sol-1],card=cards()[id];let html=`${vignetteHTML(id)}<h2>${esc(card.title)}</h2><p>${esc(card.question)}</p>`;
 if(id==='storm')html+=wallStatusHTML(mission,stormGoal(mission));
 html+=`<div class="choices">${card.choices.map(c=>{const allowed=choiceAllowed(mission,id,c.id),effects=choiceEffects(mission,id,c.id),risk=(id==='dustdevil'&&c.id==='risk')||(id==='filter'&&c.id==='shake');const hint=id==='storm'?Object.entries(effects).map(([k,v])=>`${t(k)} ${v>0?'+':''}${v}`).join(' · ')+(c.id==='radio'?' · '+t('replyDelayShort'):''):risk?t(id==='dustdevil'?'devilRisk':'filterRisk'):id==='sand'&&c.id==='route'?`${t('power')} ${effects.power} · ${t('spirit')} +3`:id==='dust'&&c.id==='rover'?`${t('power')} ${effects.power} · ${t('clean')}`:c.hint;return `<button class="decision-choice" data-choice="${c.id}" ${allowed?'':'disabled'}><span class="choice-icon" aria-hidden="true">${c.icon}</span><span><strong>${esc(c.label)}${risk?' · '+t('risky'):''}</strong><small>${esc(allowed?hint:id==='sick'&&c.id==='kit'?t('kitNeed'):t('batteryNeed'))}</small>${risk?oddsHTML(id==='dustdevil'?.6:.65):''}</span></button>`;}).join('')}</div>`;
 if(id==='storm')html+=`<details class="storm-data rules-detail"><summary>${t('howItWorks')}</summary><div class="storm-data-body">${truthBadge('game')}<p>${stormRuleText()}</p>${eventHTML(mission.stormEvent)}<p>${t('flareHonesty')}</p><p>${t('delayFact')}</p>${mission.site==='gale'?`<p>${t('galeStormRAD')}</p>`:''}${factHTML('marsStorm')}</div></details>`;
 else if(['dustdevil','filter'].includes(id))html+=`<details class="rules-detail"><summary>${t('howItWorks')}</summary>${truthBadge('game')}<p>${t(id==='dustdevil'?'devilRules':'filterRules')}</p></details>`;
 else html+=`${truthBadge('game')}${id==='sick'?`<p class="simple-note">${t('medicalStock',{n:mission.kits})}</p>`:''}`;
 openPanel(html,t('surprise'),'decision',card.question);
}
function waiting(){openPanel(`<h2 id="replyTimer">${t('waiting',{n:Math.ceil(mission.pending.seconds)})}</h2><div class="waiting-track"><i id="replyBar"></i></div><p>${t('delayFact')}</p><p class="simple-note">${t('delayNote')}</p>${factHTML('delay')}`,t('pipName'),'waiting',t('delayFact'));}
function panelDeltaHTML(row){return row.panelAfter!==undefined?`<div class="panel-comparison">${visualMeter(t('panelBefore'),100-row.panelBefore)}${visualMeter(t('panelAfter'),100-row.panelAfter)}</div>`:'';}
function outcomeText(row){return row.outcomeKey?t(row.outcomeKey):cards()[row.id].choices.find(c=>c.id===row.choice).outcome;}
function result(){const row=mission.lastChoice,card=cards()[row.id],c=card.choices.find(c=>c.id===row.choice);
  openPanel(`${vignetteHTML(row.id,true)}<h2>${t('result')}</h2><p>${esc(outcomeText(row))}</p>${changeHTML(row.changes)}${panelDeltaHTML(row)}${factHTML(card.fact)}${row.id==='storm'?factHTML('walls'):''}<button class="primary" data-action="summary">${t('next')}</button>`,card.title,'result',outcomeText(row));sound();spinUntil=visualTime+1.4;}
function reflection(answer=null){
 if(answer&&!REFLECTION_ANSWERS.includes(answer))return;
 if(answer){reflectionShown=true;try{if(!saveReflectionAnswer(localStorage,answer))storageOK=false;}catch{storageOK=false;}}
 openPanel(`<h2>${t('reflectTitle')}</h2><p>${t('reflectQuestion')}</p>${answer?`<p role="status">${t(answer==='water'?'reflectCorrect':'reflectTry')}</p><button class="primary" data-action="reflection-next">${t('next')}</button>`:`<div class="choices">${REFLECTION_ANSWERS.map(id=>`<button class="decision-choice" data-reflection="${id}">${t('reflect'+id[0].toUpperCase()+id.slice(1))}</button>`).join('')}</div>`}<p class="simple-note">${t('reflectNote')}</p>`,t('pipName'),'reflection',answer?t(answer==='water'?'reflectCorrect':'reflectTry'):t('reflectQuestion'));
}
function summary(){sound('meow');const rows=mission.log.filter(r=>r.sol===mission.sol),before=mission.solStart??mission.meters,changes=Object.fromEntries(METERS.map(k=>[k,mission.meters[k]-before[k]]));
  openPanel(`${vignetteHTML('night')}<p class="praise-line" aria-hidden="true">${['Shabbash! (Good job!)','Oshadharon! (Amazing!)','Purr-fect!'][mission.sol%3]} 🐾</p><h2>${t('summary',{n:mission.sol})}</h2><p>${t('solEvening'+mission.sol)}</p>${changeHTML(changes,true)}<p class="simple-note">${t('wallStored',{n:mission.wallWater})}</p>${panelDustHTML(mission.cleanliness)}<div class="panel-actions"><button class="primary" data-action="nextsol">${mission.sol===5?t('finish'):t('nextSol',{n:mission.sol+1})}</button><button class="chip-button" data-action="explore">${t('explore')}</button></div><button class="text-button" data-action="report">${t('report')}</button>`,t('sol',{n:mission.sol}),'summary',t('solEvening'+mission.sol));}
function reportRows(){return mission.log.map((row,index)=>{if(row.type==='plan')return `<article class="report-row" id="choice-${index}"><h3>${t('sol',{n:row.sol})} · ${t('planLog')}</h3><p>${t('reportPlan',row.plan)}</p>${changeHTML(row.changes)}${truthBadge('real')}<p>${t('planReal')}</p><a target="_blank" rel="noopener" href="${facts().oxygen.url}">${t('source')}</a></article>`;const card=cards()[row.id],choice=card.choices.find(c=>c.id===row.choice);return `<article class="report-row" id="choice-${index}"><h3>${t('sol',{n:row.sol})} · ${esc(card.title)}</h3><p><strong>${esc(choice.label)}</strong></p><p>${esc(outcomeText(row))}</p>${changeHTML(row.changes)}${panelDeltaHTML(row)}${factHTML(card.fact)}${row.id==='storm'?eventHTML(row.event)+factHTML('walls'):''}</article>`;}).join('');}
function starHTML(){const stars=missionStars(mission);return `<section class="star-report"><h3>${t('missionStars',{n:stars.filter(x=>x.earned).length})}</h3>${stars.map(x=>`<p><span aria-hidden="true">${x.earned?'★':'☆'}</span> <strong>${x.id==='storm'?t('starStormDynamic',{goal:stormGoal(mission)}):t('star'+x.id[0].toUpperCase()+x.id.slice(1))}</strong>${x.id==='bonus'?` · ${goalText()}`:''}<small>${x.earned?t('starEarned'):t(x.reason,{value:x.value,target:x.target})}</small></p>`).join('')}</section>`;}
function crewReport(){
  if(!mission)return;const complete=mission.phase==='complete',failed=mission.phase==='failed';
  if(complete||failed){profile.missionStars[mission.code]=Math.max(profile.missionStars[mission.code]||0,missionStars(mission).filter(x=>x.earned).length);save();}
  if(complete&&!mission.patchAwarded){profile.patches++;mission.patchAwarded=true;sound('cheer');save();sound();spinUntil=visualTime+2;}
  openPanel(`<div class="patch-medal">${complete?'🐾':failed?'🏡':'📋'}</div>${complete?`<p class="praise-line" aria-hidden="true">Oshadharon! (Amazing!) 🎉</p>`:''}<h2>${t(complete?'success':failed?'safeHome':'report')}</h2><p>${failed?t('failed'+mission.failedMeter[0].toUpperCase()+mission.failedMeter.slice(1)):t(complete?'successLine':'reportIntro')}</p>${starHTML()}<div class="panel-actions"><button class="primary big" data-action="${complete||failed?'restart':'resume'}">${t(complete||failed?'newPlan':'resume')}</button></div>${learnedHTML(mission)}<details class="rules-detail more-options" id="missionDiary"><summary>${t('missionDiary')}</summary>${codeHTML()}${mission.legacy?`<p class="simple-note">${t('codeLegacy')}</p>`:''}<p class="simple-note">${t('honesty')}</p><div class="panel-actions"><button class="chip-button" data-action="share">${t('shareMission')}</button><button class="chip-button" data-action="download-report">${t('downloadReport')}</button></div>${mission.log.some(r=>r.id==='storm')?factHTML('marsStorm'):''}${missionDesignHTML()}${reportRows()}${resourcesHTML()}${teamCreditHTML()}</details>`,t('report'),'report',failed?t('safeHome'):complete?t('successLine'):t('reportIntro'));
  for(const a of dialog.querySelectorAll('a[href^="#choice-"]'))a.addEventListener('click',()=>{$('missionDiary').open=true;});
}
function showMenu(){const ended=missionEnded();if(ended){active=false;updateMeters();}paused=true;stopVoice();openPanel(`<h2>${t('pause')}</h2>${codeHTML()}<button class="chip-button" data-action="share">${t('shareMission')}</button><p>${t('paused')}</p><button class="primary" data-action="${ended?'restart':'resume'}">${t(ended?'newMission':'resume')}</button><div class="menu-grid"><button class="chip-button" data-action="report">${t(ended?'seeLastReport':'report')}</button><button class="chip-button" data-action="wardrobe">${t('wardrobe')}</button><button class="chip-button" data-action="notebook">${t('notebook')}</button><button class="chip-button" data-action="bonus-intro">${t('bonus')}</button><a class="chip-button" href="./?training=1">${t('train')}</a><a class="chip-button" href="./teacher.html">${t('teacher')}</a></div>${[['voice','voice'],['captions','captions'],['bigText','bigText'],['reduceMotion','reduced']].map(([key,label])=>`<label class="checkbox-row"><input type="checkbox" data-setting="${key}" ${profile[key]?'checked':''}>${t(label)}</label>`).join('')}<label for="languageSelect">${t('language')}</label><select id="languageSelect">${Object.entries(LANGUAGES).map(([code,lang])=>`<option value="${code}" ${profile.language===code?'selected':''}>${lang.name}</option>`).join('')}</select><p class="simple-note">${t('translation')}</p><p class="simple-note">${t(storageOK?'saved':'noStorage')} · ${t(offlineReady?'offline':offlineChecked?'offlineUnavailable':'offlinePreparing')}</p>${ended?'':`<button class="text-button" data-action="restart">${t('newMission')}</button>`}<button class="text-button" data-action="enter-code">${t('enterCode')}</button><a class="chip-button" href="./?choose=1">${t('chooseNav')}</a>${teamCreditHTML()}`,t('menu'),'menu');}
function notebook(){openPanel(`<h2>${t('honest')}</h2><p>${t('honesty')}</p>${eventHTML(mission?.stormEvent??latestEvent)}<button class="chip-button" data-action="refresh-data">${t('refreshData')}</button>${Object.keys(facts()).map(factHTML).join('')}<p class="simple-note">${t('noEndorsement')}</p>`,t('notebook'),'notebook');}
function wardrobe(){openPanel(`<h2>${t('wardrobe')}</h2><p>${t('stars',{n:totalStars(),patches:profile.patches})}</p><label for="callsignInput">${t('callsign')}</label><input id="callsignInput" maxlength="22" value="${esc(profile.name)}" type="text"><h3>${t('suits')}</h3><div class="wardrobe-options">${SUITS.map(([colour,label,cost])=>`<button class="chip-button" data-suit="${colour}" aria-pressed="${profile.suit===colour}" ${unlocked(cost)?'':'disabled'}><span class="colour-dot" style="background:${colour}"></span>${t(label)}${unlocked(cost)?'':` · ${t('unlockStars',{n:cost})}`}</button>`).join('')}</div><h3>${t('stickers')}</h3><div class="wardrobe-options">${STICKERS.map(([mark,label,cost],i)=>`<button class="chip-button" data-sticker="${i}" aria-pressed="${profile.sticker===mark}" ${unlocked(cost)?'':'disabled'}>${mark} ${t(label)}${unlocked(cost)?'':` · ${cost<0?t('unlockPatch'):t('unlockStars',{n:cost})}`}</button>`).join('')}</div><h3>${t('flagPatch')}</h3><div class="wardrobe-options">${FLAGS.map(f=>`<button class="chip-button" data-flag="${f.id}" aria-pressed="${profile.flag===f.id}">${flagSVG(f.id,30)}${t(f.nameKey)}</button>`).join('')}</div><button class="primary" data-action="apply-profile">${t('apply')}</button>${perkHTML()}`,t('trainer'),'wardrobe');}
function fieldRockHTML(r){if(!mission?.perks.fieldwork||!r.found)return '';const kind=copy('fieldworkKinds')[r.id];return `<p>${truthBadge('game')} ${esc(t(copy('sampleRocks')[kind].name))} · ${t('fieldworkNote',{note:esc(copy('fieldworkNotes')[r.id])})}</p>`;}
function rockCollection(){if(!mission)return;openPanel(`<h2>${t('rocks',{n:mission.rocks.filter(r=>r.found).length})}</h2>${mission.rocks.map(r=>`<article class="report-row"><h3>${r.found?'🌑':'✧'} ${t('rockLog',{n:r.id+1})}</h3><p>${r.found?esc(copy('rocks')[r.id]):'…'}</p>${fieldRockHTML(r)}</article>`).join('')}<button class="primary" data-action="find-rock">${t('rockMap')}</button>${factHTML('mars')}`,t('rockList'),'rocks');}
function tellJoke(){jokeIndex=(jokeIndex+1)%copy('jokes').length;announce(copy('jokes')[jokeIndex]);spinUntil=visualTime+.8;}
function photo(){photoPose=true;openPanel(`<h2>${t('photo')}</h2><p>${t('photoHint')}</p><div class="panel-actions"><button class="primary" data-action="photo-save">${t('photoSave')}</button><button class="chip-button" data-action="photo-pose">${t('photoPose')}</button></div>`,t('photo'),'photo');}
async function shareMission(){const url=new URL(mission?missionLink(location.href,mission):location.href);url.searchParams.set('code',mission?.code??nextCode);try{await navigator.clipboard.writeText(url.href);$('worldNote').textContent=t('shareCopied');speak(t('shareCopied'));}catch{openPanel(`<h2>${t('shareMission')}</h2><label for="shareLink">${t('shareManual')}</label><input type="text" id="shareLink" readonly value="${esc(url.href)}">`,t('missionCode'),'share');$('shareLink').select();}}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function savePhoto(){
  try{const pic=document.createElement('canvas');pic.width=1200;pic.height=850;const c=pic.getContext('2d');c.fillStyle='#14263e';c.fillRect(0,0,1200,850);
    const scale=Math.min(1160/canvas.width,690/canvas.height);c.save();c.beginPath();c.rect(20,20,1160,690);c.clip();c.drawImage(canvas,(1200-canvas.width*scale)/2,20+(690-canvas.height*scale)/2,canvas.width*scale,canvas.height*scale);c.restore();
    c.fillStyle='#fff0db';c.font='bold 38px sans-serif';c.fillText(t('photoTitle'),34,762);c.font='22px sans-serif';c.fillText(t('photoSol',{name:mission?.callsign??profile.name,n:mission?.sol??1}),35,802);c.font='13px sans-serif';c.textAlign='right';c.fillStyle='#ace3d0';c.fillText(t('photoStamp'),1160,816);
    pic.toBlob(blob=>{if(blob){download(blob,'Astro_Kitty_Postcard.png');announce(t('photoToast'));}else announce(t('photoError'));},'image/png');
  }catch{announce(t('photoError'));}
}
function bonusIntro(){openPanel(`<h2>${t('bonus')}</h2><p>${t('bonusIntro')}</p><button class="primary" data-action="bonus-start">${t('bonusStart')}</button>`,t('bonus'),'bonus-intro');}
function startBonus(){
 stopVoice();closePanel();
 bonus=createDodge(Date.now());bonusTarget=null;keys.clear();
 $('bonusResult').classList.add('hidden');
 $('bonusResultMessage').textContent='';
 $('bonusStatus').textContent=t('bonusClock',{n:30,lives:3});
 if(!$('bonusDialog').open)$('bonusDialog').showModal();
 $('bonusAgain').classList.add('hidden');$('bonusBack').classList.add('hidden');
 $('bonusCanvas').focus();
}
function updateMeters(){
 const m=active?mission?.meters:null;
 $('siteLabel').textContent=active&&mission?copy('sites')[mission.site].name:'';$('baseMapButton').disabled=!active;
 $('rockCounter').disabled=!active;
 $('outpostTouch').hidden=!active;
 if(!m)$('solLabel').textContent=t('readyForMission');
 for(const k of METERS){const el=$('meter-'+k),v=m?Math.round(m[k]):null,label=v===null?'none':String(v);
  if(el.dataset.value===label)continue;el.dataset.value=label;el.querySelector('b').textContent=v===null?'—':v;el.querySelector('i').style.width=(v??0)+'%';
  const meter=el.querySelector('[role=meter]');meter.setAttribute('aria-valuenow',String(v??0));if(v===null)meter.setAttribute('aria-valuetext',t('metersNoMission'));else meter.removeAttribute('aria-valuetext');
  el.classList.toggle('low',v!==null&&v<25);el.classList.toggle('inactive',v===null);el.classList.remove('changed');if(m){void el.offsetWidth;el.classList.add('changed');}
 }
}
function syncPhase(force=false){
  if(!mission)return;updateMeters();$('solLabel').textContent=t('sol',{n:mission.sol});$('rockCounter').textContent='🌑 '+t('rocks',{n:mission.rocks.filter(r=>r.found).length});
  $('taskButton').textContent=t(['brief','explore'].includes(mission.phase)?'plan':mission.phase==='decision'?'decision':mission.phase==='summary'?(mission.sol===5?'finish':'summary'):mission.phase==='complete'||mission.phase==='failed'?'report':'next',{n:mission.sol});
  if(!force&&lastPhase===mission.phase&&lastSol===mission.sol)return;lastPhase=mission.phase;lastSol=mission.sol;save();
  if(mission.phase==='brief'){if(arrivalPending)baseOpening();else briefing();}else if(mission.phase==='decision')eventCut();else if(mission.phase==='waiting')waiting();else if(mission.phase==='result')result();else if(mission.phase==='summary')summary();else if(['failed','complete'].includes(mission.phase))crewReport();
}
async function refreshEvent(){weatherPending=true;weatherState=await loadSpaceWeather({online:navigator.onLine!==false,eventId:sharedSettings.eventId});weatherPending=false;latestEvent=weatherState.event;
 if(dialogKind==='home'&&$('spaceWeather')){$('spaceWeather').innerHTML=weatherHTML();if($('sharedNotice'))$('sharedNotice').innerHTML=sharedNotice();}else if(dialogKind==='notebook')notebook();
}

panel.addEventListener('click',e=>{
  const site=e.target.closest('[data-site]');if(site&&draft){draft.site=normalizeSite(site.dataset.site,draft.code);const id=site.dataset.site;landingStep();panel.querySelector(`.site-select[data-site="${id}"]`)?.focus({preventScroll:true});return;}
  const module=e.target.closest('[data-module]');if(module&&draft){selectedModule=module.dataset.module;for(const b of panel.querySelectorAll('[data-module]'))b.setAttribute('aria-pressed',String(b.dataset.module===selectedModule));$('designStatus').textContent=t('designSelected',{module:moduleName(selectedModule)});return;}
  const tile=e.target.closest('[data-tile]');if(tile&&draft&&dialogKind==='design'){putModule(Number(tile.dataset.tile));return;}
  const choice=e.target.closest('[data-choice]');if(choice){if(choose(mission,choice.dataset.choice)){paused=false;syncPhase(true);}return;}
  const alloc=e.target.closest('[data-alloc]');if(alloc){const k=alloc.dataset.alloc;plan[k]=clamp(plan[k]+Number(alloc.dataset.step),0,6);updatePreview();return;}
  const flag=e.target.closest('[data-flag]');if(flag){profile.name=($('callsignInput')?.value.trim()||profile.name).slice(0,22);if(mission)mission.callsign=profile.name;profile.flag=validateFlag(flag.dataset.flag);save();wardrobe();return;}
  const suit=e.target.closest('[data-suit]');if(suit){profile.name=($('callsignInput')?.value.trim()||profile.name).slice(0,22);if(mission)mission.callsign=profile.name;profile.suit=suit.dataset.suit;save();wardrobe();return;}
  const sticker=e.target.closest('[data-sticker]');if(sticker){profile.name=($('callsignInput')?.value.trim()||profile.name).slice(0,22);if(mission)mission.callsign=profile.name;profile.sticker=STICKERS[Number(sticker.dataset.sticker)][0];save();wardrobe();return;}
  const answer=e.target.closest('[data-reflection]')?.dataset.reflection;if(answer){reflection(answer);return;}
  const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
  if(action==='cut-next'){finishCut();return;}else if(action==='cut-repeat'){speak(panel.querySelector('.story-cut p').textContent);return;}
  if(action==='new')beginSetup();else if(action==='pip-setup'){$('missionCodeInput').value=nextCode;$('newCallsign').value=profile.name||t('defaultName');beginSetup();}else if(action==='today')beginSetup(true);else if(action==='design')designStep();else if(action==='pip-site'){draft.site=defaultSite(draft.code);designStep();}else if(action==='pip-layout'){draft.layout={...PIP_LAYOUT};designStep();}else if(action==='reset-layout'){draft.layout={};designStep();}else if(action==='launch')startNew();else if(action==='pip-launch'){draft.layout={...PIP_LAYOUT};startNew();}else if(action==='back-sites')landingStep();else if(action==='setup-home')home();else if(action==='base-map')baseMap();else if(action==='continue'){closePanel();active=true;syncPhase(true);}else if(action==='plan')planning();
  else if(action==='explore'){if(mission.phase==='brief')mission.phase='explore';closePanel();announce(t('exploreHint'));save();}
  else if(action==='confirm'){if(confirmPlan(mission,plan)){plan=null;paused=false;syncPhase(true);}}
  else if(action==='summary'){if(mission.lastChoice?.id==='storm'&&!reflectionShown)reflection();else{showSummary(mission);syncPhase(true);}}else if(action==='reflection-next'){showSummary(mission);syncPhase(true);}else if(action==='nextsol'){nextSol(mission);plan=null;paused=false;syncPhase(true);}
  else if(action==='resume'){closePanel();if(mission?.phase==='waiting')syncPhase(true);}
  else if(action==='report'||action==='last-report')crewReport();else if(action==='notebook')notebook();else if(action==='wardrobe')wardrobe();
  else if(action==='apply-profile'){profile.name=($('callsignInput').value.trim()||t('defaultName')).slice(0,22);if(mission)mission.callsign=profile.name;save();closePanel();}
  else if(action==='restart'){active=false;nextCode=codeForSeed(Date.now());home();}
  else if(action==='enter-code'){active=false;nextCode=mission?.code??nextCode;home();{const d=$('missionCodeInput').closest('details');if(d)d.open=true;}$('missionCodeInput').focus();$('missionCodeInput').select();}
  else if(action==='share')shareMission();
  else if(action==='download-report'){download(new Blob([`${t('report')} · ${mission.callsign}\n${t('siteLabel',{site:copy('sites')[mission.site].name})}\n${t('baseDesign')}: ${encodeLayout(mission.layout)}\n${MODULES.map(k=>t('designLocation',{module:moduleName(k),row:Math.floor(mission.layout[k]/5)+1,column:mission.layout[k]%5+1})).join('\n')}\n${stormTargetText()}\n\n${mission.log.map(row=>row.type==='plan'?`${t('sol',{n:row.sol})}: ${t('reportPlan',row.plan)}\n${t('planReal')}\n${facts().oxygen.url}`:`${t('sol',{n:row.sol})}: ${cards()[row.id].title} — ${cards()[row.id].choices.find(c=>c.id===row.choice).label}\n${outcomeText(row)}\n${METERS.map(k=>t(k)+' '+row.changes[k]).join(' · ')}\n${facts()[cards()[row.id].fact].text}\n${facts()[cards()[row.id].fact].url}`).join('\n\n')}\n\n${t('learnedTitle')}\n${learnedIdeas(mission).map(x=>x.text+' '+x.choice).join('\n')}\n\n${facts().marsStorm.title}\n${facts().marsStorm.text}\n${facts().marsStorm.url}\n\n${t('honesty')}\n${t('missionCode')}: ${mission.code}\n${missionStars(mission).map(x=>`${x.earned?'★':'☆'} ${x.id==='storm'?t('starStormDynamic',{goal:stormGoal(mission)}):t('star'+x.id[0].toUpperCase()+x.id.slice(1))} ${x.id==='bonus'?goalText():''}`).join('\n')}\n${t('teamCredit')}`],{type:'text/plain;charset=utf-8'}),'Astro_Kitty_Crew_Report.txt');}
  else if(action==='find-rock'){const rock=mission.rocks.find(r=>!r.found);if(rock){rockGuide=rock.id;closePanel();aimOutpost(rock);announce(t('rockNearest'));}else announce(t('allRocks'));}
  else if(action==='refresh-data')refreshEvent();else if(action==='photo-save')savePhoto();else if(action==='photo-pose'){photoPose=!photoPose;sound();}
  else if(action==='bonus-intro')bonusIntro();else if(action==='bonus-start')startBonus();
});
panel.addEventListener('change',e=>{if(e.target.id==='wallPlan'){plan.wall=Number(e.target.value);updatePreview();}if(e.target.dataset.setting){profile[e.target.dataset.setting]=e.target.checked;settings();save();if(e.target.dataset.setting==='voice'&&!profile.voice)stopVoice();if(e.target.dataset.setting==='captions')$('pipCaption').classList.toggle('hidden',!profile.captions&&profile.voice&&!!synth);}if(e.target.id==='languageSelect'){profile.language=setLanguage(e.target.value);save();location.reload();}});
dialog.addEventListener('cancel',e=>{if(dialogKind==='film'){e.preventDefault();finishCut();}});
dialog.addEventListener('close',()=>{if(dialog.open)return;keys.clear();paused=false;dialogKind='';lastTick=0;});
$('panelClose').onclick=closePanel;
$('voiceToggle').onclick=()=>{profile.voice=!profile.voice;settings();save();if(profile.voice)speak(lastLine||t('welcome',{name:profile.name}));else{stopVoice();$('pipCaption').classList.remove('hidden');}};
$('repeatPip').onclick=()=>speak(lastLine);
$('baseMapButton').textContent=t('baseMap');$('baseMapButton').onclick=baseMap;$('menuToggle').onclick=showMenu;$('jokeButton').textContent='😺';$('jokeButton').setAttribute('aria-label',t('jokes'));$('jokeButton').onclick=tellJoke;
$('photoButton').textContent='📷';$('photoButton').setAttribute('aria-label',t('photo'));$('photoButton').onclick=photo;
$('taskButton').onclick=()=>{if(!mission||(!active&&missionEnded())){home();return;}active=true;paused=false;if(['brief','explore'].includes(mission.phase))planning();else syncPhase(true);};
$('rockCounter').onclick=rockCollection;
for(const id of ['phobos','deimos'])$(id+'Button').onclick=()=>openPanel(`<h2>${t(id)}</h2><p>${t(id+'Fact')}</p>${factHTML('moons')}`,t('moons'),'moon',t(id+'Fact'));
const keymap={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
panel.addEventListener('keydown',e=>{
 if(dialogKind!=='design'||!draft)return;const module=e.target.closest('[data-module]'),tile=e.target.closest('[data-tile]');
 if(!module&&!tile)return;
 const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5}[e.key];
 if(delta){e.preventDefault();e.stopPropagation();if(module){selectedModule=module.dataset.module;gridCursor=draft.layout[selectedModule]??GRID.habitat;}const row=Math.floor(gridCursor/5),column=gridCursor%5;gridCursor=clamp(row+(delta===-5?-1:delta===5?1:0),0,3)*5+clamp(column+(delta===-1?-1:delta===1?1:0),0,4);for(const b of panel.querySelectorAll('[data-module]'))b.setAttribute('aria-pressed',String(b.dataset.module===selectedModule));for(const b of panel.querySelectorAll('[data-tile]'))b.tabIndex=Number(b.dataset.tile)===gridCursor?0:-1;panel.querySelector(`[data-tile="${gridCursor}"]`)?.focus({preventScroll:true});}
});
let moduleDrag=null;
panel.addEventListener('pointerdown',e=>{const module=e.target.closest('[data-module]');if(dialogKind!=='design'||!module)return;moduleDrag={module:module.dataset.module,x:e.clientX,y:e.clientY,moved:false,pointer:e.pointerId};module.setPointerCapture(e.pointerId);});
panel.addEventListener('pointermove',e=>{if(!moduleDrag||e.pointerId!==moduleDrag.pointer)return;if(Math.hypot(e.clientX-moduleDrag.x,e.clientY-moduleDrag.y)>8){moduleDrag.moved=true;selectedModule=moduleDrag.module;e.preventDefault();}});
panel.addEventListener('pointerup',e=>{if(!moduleDrag||e.pointerId!==moduleDrag.pointer)return;const drag=moduleDrag;moduleDrag=null;if(!drag.moved)return;const tile=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-tile]');if(tile){selectedModule=drag.module;putModule(Number(tile.dataset.tile));}});
panel.addEventListener('pointercancel',()=>{moduleDrag=null;});
panel.addEventListener('dragstart',e=>{const b=e.target.closest('[data-module]');if(b&&MODULES.includes(b.dataset.module)){selectedModule=b.dataset.module;e.dataTransfer.setData('text/plain',selectedModule);e.dataTransfer.effectAllowed='move';}});
panel.addEventListener('dragover',e=>{if(dialogKind==='design'&&e.target.closest('[data-tile]'))e.preventDefault();});
panel.addEventListener('drop',e=>{const tile=e.target.closest('[data-tile]'),module=e.dataTransfer.getData('text/plain');if(dialogKind==='design'&&tile&&MODULES.includes(module)){e.preventDefault();selectedModule=module;putModule(Number(tile.dataset.tile));}});
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if($('bonusDialog').open){if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)){e.preventDefault();keys.add(keymap[e.key]??keymap[e.key.toLowerCase()]);}return;}
  if(dialog.open)return;if(['p','P','Escape'].includes(e.key)&&!e.repeat){e.preventDefault();showMenu();return;}
  const k=keymap[e.key]??keymap[e.key.toLowerCase()];if(k){e.preventDefault();keys.add(k);clearRoute();}if((e.key==='e'||e.key==='E')&&!e.repeat)$('taskButton').click();
});
window.addEventListener('keyup',e=>keys.delete(keymap[e.key]??keymap[e.key.toLowerCase()]));
for(const button of document.querySelectorAll('[data-move]')){
 const direction=button.dataset.move;
 function begin(){if(!dialog.open&&active){keys.add(direction);clearRoute();}}
 function end(){keys.delete(direction);}
 button.addEventListener('pointerdown',event=>{
  if(event.button!==0||dialog.open)return;
  event.preventDefault();button.setPointerCapture(event.pointerId);begin();
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(type,end);
 for(const type of ['keydown','keyup'])button.addEventListener(type,event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  event.preventDefault();
  if(type==='keydown')begin();else end();
 });
}
document.querySelector('.outpost-info').addEventListener('toggle',e=>{if(!e.currentTarget.open)keys.clear();});
canvas.addEventListener('pointerdown',e=>{
  if(!active||dialog.open||bonus)return;const rect=canvas.getBoundingClientRect(),p=toWorld(e.clientX-rect.left,e.clientY-rect.top);if(!p)return;
  if(Math.hypot(p.x-visual.player.x,p.y-(visual.player.y-45))<55){purrTaps=purrTaps.filter(n=>performance.now()-n<1800);purrTaps.push(performance.now());if(purrTaps.length>=3){purrTaps=[];sound('purr');announce(t('purr'));}return;}
  aimOutpost(p);idleTime=0;canvas.focus({preventScroll:true});
});
function autoPause(){keys.clear();bonusTarget=null;stopVoice();if((active||bonus)&&!dialog.open&&!$('bonusDialog').open)showMenu();}
window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});
$('bonusAgain').onclick=startBonus;
function endBonus(){bonus=null;keys.clear();$('bonusDialog').close();paused=false;lastTick=0;}
$('bonusClose').onclick=endBonus;$('bonusBack').onclick=endBonus;$('bonusDialog').addEventListener('close',()=>{bonus=null;keys.clear();lastTick=0;});
const bonusCanvas=$('bonusCanvas');
function steer(e){if(!bonus||bonus.finished)return;const r=bonusCanvas.getBoundingClientRect(),p=containPoint(e.clientX,e.clientY,r,480,430);if(p){bonusTarget=clamp(p.x/480,.05,.95);if(bonus)bonus.x=bonusTarget;}}
bonusCanvas.addEventListener('pointerdown',e=>{bonusCanvas.setPointerCapture(e.pointerId);steer(e);});bonusCanvas.addEventListener('pointermove',e=>{if(e.buttons)steer(e);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])bonusCanvas.addEventListener(event,()=>{bonusTarget=null;});
function drawBonus(){const c=bonusCanvas.getContext('2d');c.clearRect(0,0,480,430);c.fillStyle='#182d49';c.fillRect(0,0,480,430);
  for(let i=0;i<35;i++){c.fillStyle='#dce6e499';c.fillRect((i*137)%480,(i*71)%430,2,2);}c.fillStyle='#c79b8d';for(const r of bonus.rocks){c.beginPath();c.arc(r.x*480,r.y*430,13,0,7);c.fill();}
  c.save();c.translate(bonus.x*480,.83*430);c.globalAlpha=bonus.invulnerable>0?.55:1;c.fillStyle=profile.suit;c.beginPath();c.roundRect(-23,-17,46,34,14);c.fill();if(profile.flag!=='none')drawBangladeshFlag(c,-23,-1,14);c.fillStyle='#f3c7a2';c.beginPath();c.arc(0,-10,13,0,7);c.fill();c.fillStyle='#26384c';c.fillRect(-7,-13,3,4);c.fillRect(4,-13,3,4);c.restore();
  if(!bonus.finished){
    const status=t('bonusClock',{n:Math.ceil(bonus.remaining),lives:bonus.lives});
    if($('bonusStatus').textContent!==status)$('bonusStatus').textContent=status;
  }else if($('bonusResult').classList.contains('hidden')){
    const won=bonus.lives>0;
    $('bonusStatus').textContent='';
    $('bonusResultIcon').textContent=won?'★':'↻';
    $('bonusResult').dataset.result=won?'win':'retry';
    $('bonusResultMessage').textContent=t(won?'bonusWin':'bonusRetry');
    $('bonusResult').classList.remove('hidden');
    $('bonusAgain').classList.remove('hidden');$('bonusBack').classList.remove('hidden');
    $('bonusAgain').focus({preventScroll:true});
    if(won)sound();
  }
}
function move(dt){
  if(!mission||dialog.open||paused||bonus||!active)return;
  let dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),dy=(keys.has('down')?1:0)-(keys.has('up')?1:0);
  if(dx||dy){clearRoute();idleTime=0;}
  else if(exploringTarget){
    while(exploringRoute.length&&Math.hypot(exploringRoute[0].x-visual.player.x,exploringRoute[0].y-visual.player.y)<1)exploringRoute.shift();
    const waypoint=exploringRoute[0];
    if(waypoint){dx=waypoint.x-visual.player.x;dy=waypoint.y-visual.player.y;}
    else clearRoute();
  }
  const len=Math.hypot(dx,dy),speed=170;
  const player=visual.player,old={x:player.x,y:player.y};
  if(len){
    const amount=Math.min(speed*dt,exploringTarget?len:Infinity);
    const point=moveOnGround(old,{x:old.x+dx/len*amount,y:old.y+dy/len*amount},obstacles,KITTY_RADIUS,300);
    player.x=point.x;player.y=point.y;
    if(dx)player.facing=Math.sign(dx);
    if(player.x===old.x&&player.y===old.y)clearRoute();
  }
  player.vx=(player.x-old.x)/dt;player.vy=(player.y-old.y)/dt;
  visual.buddy.x+=(visual.player.x-75-visual.buddy.x)*Math.min(1,dt*3);visual.buddy.y+=(visual.player.y-28-visual.buddy.y)*Math.min(1,dt*3);
  mission.player={x:visual.player.x,y:visual.player.y};
  if(['brief','explore','summary','complete'].includes(mission.phase))for(const r of mission.rocks){if(r.found)continue;const distance=Math.hypot(r.x-visual.player.x,r.y-visual.player.y);if(distance<siteRules(mission.site).rockReach&&collectRock(mission,r.id)){rockGuide=null;save();sound();syncPhase();openPanel(`<h2>${t('rockFound')}</h2><p>${esc(copy('rocks')[r.id])}</p>${fieldRockHTML(r)}${factHTML(mission.perks.fieldwork?['streambed','jezeroLayers','lavaHoles','marsSalt','marsMeteorite'][r.id]:r.id===4?'moons':'mars')}<button class="primary" data-action="resume">${t('resume')}</button>`,t('rockLog',{n:r.id+1}),'rock',copy('rocks')[r.id]);break;}}
}
function frame(now){
  const dt=lastTick?Math.min(1,(now-lastTick)/1000):0;lastTick=now;
  if(!document.hidden){visualTime+=profile.reduceMotion||motion.matches?0:dt;idleTime+=dt;
    if(active&&mission?.phase==='waiting'&&!paused&&!$('bonusDialog').open){tickReply(mission,dt);if($('replyTimer'))$('replyTimer').textContent=t('waiting',{n:Math.ceil(mission.pending?.seconds??0)});if($('replyBar'))$('replyBar').style.width=`${(1-(mission.pending?.seconds??0)/6)*100}%`;syncPhase();}
    for(let left=dt;left>0;left-=1/60){move(Math.min(left,1/60));if(bonus&&!bonus.finished)tickDodge(bonus,Math.min(left,1/60),(keys.has('right')?1:0)-(keys.has('left')?1:0),bonusTarget);}
    if(idleTime>35&&active&&!dialog.open&&!bonus){idleTime=0;speak(t('idle'));}
  }
  if(filmShot&&!document.hidden)filmTime+=dt;
  const scene=filmShot?.scene??directedOutpostScene(mission,dialogKind),indoors=['power','shelter','monitor','finale'].includes(scene);
  document.querySelector('.moon-buttons').hidden=indoors;
  visual.scene=scene;visual.monitor.reading=scene==='monitor'?1:0;visual.sceneTime=filmShot?filmTime:10;visual.cable=true;visual.panels.forEach(p=>p.clean=mission?.cleanliness??100);visual.target=exploringTarget;

  drawScene(canvas,visual,{visualTime,reduceMotion:profile.reduceMotion||motion.matches,suit:profile.suit,sticker:profile.sticker,outpost:mission,pipSpin:spinUntil>visualTime,happy:happyUntil>visualTime,wave:photoPose,rockGuide,flag:profile.flag});
  if(bonus)drawBonus();if(active&&mission&&now-savedAt>2500){savedAt=now;save();}requestAnimationFrame(frame);
}
$('meters').innerHTML=METERS.map(k=>`<div class="outpost-meter" id="meter-${k}" style="--meter-color:${colours[k]}"><div><span aria-hidden="true">${symbols[k]}</span><span>${t(k)}</span><b></b></div><div class="bar" role="meter" aria-label="${t(k)} · ${t('gameRule')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div>`).join('');
$('taskButton').textContent=t('start');$('rockCounter').textContent=t('rocks',{n:mission?.rocks.filter(r=>r.found).length??0});
settings();updateMeters();
if(mission?.player)updateGround(mission.player);
registerOffline().then(ok=>{offlineReady=ok;offlineChecked=true;});weatherPromise=refreshEvent();home();requestAnimationFrame(frame);
