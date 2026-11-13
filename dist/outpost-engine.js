import {normalizeMissionCode,codeForSeed,hashCode} from './mission-code.js';
export {normalizeMissionCode,codeForSeed,hashCode} from './mission-code.js';
import {archiveStormForCode} from './solar-archive.js';
import {normalizeLayout,layoutEffects} from './base-design.js';
import {normalizeSite,siteRules,siteWeight} from './landing-sites.js';
import {flareStrength,normalizeEvent} from './nasa-data.js';

export const METERS=['power','air','water','food','shielding','spirit'];
export const SYSTEMS=['air','water','food','shield'];
export const PERKS={solar:'maintenance',rover:'navigation',power:'planning',shelter:'warning',commands:'forecast',geology:'fieldwork'};
export const WEATHER={clear:{cells:7,sunlight:100,icon:'☀️'},hazy:{cells:6,sunlight:80,icon:'🌤️'},dusty:{cells:5,sunlight:55,icon:'🌫️'}};
export const GOALS=[{id:'rocks',target:2},{id:'food',target:70},{id:'spirit',target:80},{id:'water',target:60},{id:'shielding',target:80},{id:'power',target:50}];
export const CARD_IDS=['landing','storm','dust','leak','greenhouse','homesick','sick','dustdevil','filter','freeze','cargo','ice','sand','pebbles','birthday','drawings','help'];
export const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
const clone=value=>JSON.parse(JSON.stringify(value));
function next(seed){return(Math.imul(seed,1664525)+1013904223)>>>0;}
export function rng(seed){let n=seed>>>0;return()=>{n=next(n);return n/4294967296;};}
function random(s){s.rngState=next(s.rngState);return s.rngState/4294967296;}
export function shuffle(items,random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function readPerks(training={}){return Object.fromEntries(Object.entries(PERKS).map(([id,key])=>[key,training?.best?.[id]?.success===true]));}
export function createOutpost({seed=Date.now(),code=null,training={},callsign='Cadet Kitty',site=null,layout=null,stormEvent=null,stormGoal=null}={}){
  const missionCode=code===null?codeForSeed(seed):normalizeMissionCode(code);if(!missionCode)throw new Error('Invalid mission code');
  const seedNumber=hashCode(missionCode),random=rng(seedNumber),stormSol=2+Math.floor(random()*4);
  const weather=Array.from({length:5},()=>{const roll=random();return roll<.4?'clear':roll<.75?'hazy':'dusty';});
  const deck=['landing',null,null,null,null];deck[stormSol-1]='storm';
  const spots=shuffle([{x:170,y:470},{x:390,y:625},{x:580,y:340},{x:810,y:620},{x:1090,y:545},{x:740,y:385},{x:180,y:650}],random).slice(0,5);
  const goal=clone(GOALS[Math.floor(random()*GOALS.length)]),landingSite=normalizeSite(site,missionCode),event=normalizeEvent(stormEvent??archiveStormForCode(missionCode));
  const target=[30,40,50].includes(stormGoal)?stormGoal:event?flareStrength(event).goal:40;
  return {version:3,site:landingSite,layout:normalizeLayout(layout),stormGoal:target,code:missionCode,seed:seedNumber,rngState:Math.floor(random()*4294967296)>>>0,stormSol,weather,bonusGoal:goal,
    sol:1,phase:'brief',callsign:String(callsign).slice(0,22),perks:readPerks(training),
    meters:{power:70,air:55,water:72+siteRules(landingSite).waterBonus,food:28,shielding:12,spirit:70},wallWater:0,cleanliness:100,kits:1,deck,helpUsed:false,
    log:[],snapshots:[],outcome:null,failedMeter:null,pending:null,lastChoice:null,stormEvent:event,
    rocks:spots.map((p,id)=>({...p,id,found:false})),player:{x:330,y:550},solStart:null,morningSpirit:70};
}
export function restoreOutpost(raw){
  if(!raw||![1,2,3].includes(raw.version)||!Number.isInteger(raw.sol)||raw.sol<1||raw.sol>5)return null;
  if(!['brief','explore','decision','waiting','result','summary','complete','failed'].includes(raw.phase))return null;
  if(!raw.meters||!METERS.every(k=>Number.isFinite(raw.meters[k])&&raw.meters[k]>=0&&raw.meters[k]<=100))return null;
  if(!Array.isArray(raw.deck)||raw.deck.length!==5||raw.deck[0]!=='landing'||raw.deck.filter(x=>x==='storm').length!==1||!raw.deck.every(x=>x===null||CARD_IDS.includes(x)))return null;
  const drawn=raw.deck.filter(Boolean);if(new Set(drawn).size!==drawn.length)return null;
  if(!raw.perks||!Array.isArray(raw.log)||!Array.isArray(raw.snapshots))return null;
  if(!Array.isArray(raw.rocks)||raw.rocks.length!==5||!raw.rocks.every((r,i)=>r.id===i&&Number.isFinite(r.x)&&Number.isFinite(r.y)))return null;
  if(!raw.player||!Number.isFinite(raw.player.x)||!Number.isFinite(raw.player.y))return null;
  if(!Number.isFinite(raw.wallWater)||raw.wallWater<0||raw.wallWater>40||!Number.isFinite(raw.cleanliness))return null;
  const s=clone(raw);
  if(raw.version===1){Object.assign(s,{version:2,legacy:true,code:codeForSeed(raw.seed),stormSol:raw.deck.indexOf('storm')+1,
    rngState:raw.seed>>>0,weather:['clear','hazy','dusty','hazy','clear'],bonusGoal:{id:'rocks',target:2},helpUsed:false,morningSpirit:raw.meters.spirit});}
  if(!normalizeMissionCode(s.code)||!Number.isInteger(s.rngState)||!Array.isArray(s.weather)||s.weather.length!==5||!s.weather.every(k=>Object.hasOwn(WEATHER,k)))return null;
  if(!Number.isInteger(s.stormSol)||s.stormSol<2||s.stormSol>5||s.deck[s.stormSol-1]!=='storm')return null;
  if(!GOALS.some(g=>g.id===s.bonusGoal?.id&&g.target===s.bonusGoal.target))return null;
  if(!s.log.every(r=>r&&['plan','decision'].includes(r.type)&&r.changes&&METERS.every(k=>Number.isFinite(r.changes[k]))&&(r.type==='plan'?r.plan:CARD_IDS.includes(r.id)&&choiceEffects(s,r.id,r.choice))))return null;
  if(s.phase==='waiting'&&(!s.pending||!Number.isFinite(s.pending.seconds)||!choiceEffects(s,s.pending.card,s.pending.choice)))return null;
  if(s.phase==='result'&&(!s.lastChoice||!CARD_IDS.includes(s.lastChoice.id)))return null;
  if(['decision','waiting','result'].includes(s.phase)&&!s.deck[s.sol-1])return null;
  if(raw.version<3){s.legacyRules=true;s.site='gale';s.layout=normalizeLayout(null);s.stormGoal=40;}
  else{s.site=normalizeSite(s.site,s.code);s.layout=normalizeLayout(s.layout);s.stormGoal=[30,40,50].includes(s.stormGoal)?s.stormGoal:flareStrength(s.stormEvent).goal;}
  s.perks.forecast=s.perks.forecast===true;s.perks.fieldwork=s.perks.fieldwork===true;
  s.version=3;return s;
}
export function missionLayoutEffects(s){return s.legacyRules?{shelterFar:false,windyPanels:0,nearPanels:0,foodBonus:0,roverSafe:false}:layoutEffects(s.layout);}
export function stormGoal(s){return [30,40,50].includes(s.stormGoal)?s.stormGoal:40;}
export function tomorrowWeather(s){return s.perks?.forecast&&s.sol<5?s.weather[s.sol]:null;}
export function rockRevealDistance(s){return siteRules(s.site).rockReveal*(s.perks?.fieldwork?1.25:1);}
export function moraleCells(s){const mood=s.morningSpirit??s.meters.spirit;return mood>=80?1:mood<=30?-1:0;}
export function weatherToday(s){return WEATHER[s.weather?.[s.sol-1]??'clear'];}
export function cellsAvailable(s){return Math.max(3,weatherToday(s).cells+(s.perks.planning?1:0)+moraleCells(s)-(s.cleanliness<60?1:0));}
export function defaultPlan(s){
  const cells=cellsAvailable(s),p={air:2,water:1,food:Math.max(1,cells-4),shield:1,wall:0};
  while(p.air+p.water+p.food+p.shield>cells){if(p.food>0)p.food--;else if(p.shield>0)p.shield--;else break;}

  if(!s.legacyRules&&s.meters.shielding>=stormGoal(s)){p.food+=p.shield;p.shield=0;}

  if(!s.legacyRules&&s.meters.food+p.food*9-14+missionLayoutEffects(s).foodBonus<18&&p.air>1&&s.meters.air>40){p.air--;p.food++;}
  p.wall=p.shield>0&&s.wallWater<40&&s.meters.water>35&&s.sol<=s.stormSol&&s.meters.shielding+p.shield*3<stormGoal(s)?1:0;
  return p;
}
export function previewPlan(s,plan){
  const p={...plan},used=SYSTEMS.reduce((sum,k)=>sum+Number(p[k]),0),total=cellsAvailable(s);let error=null;
  if(SYSTEMS.some(k=>!Number.isInteger(p[k])||p[k]<0||p[k]>6)||![-1,0,1,2].includes(p.wall))error='invalid';
  else if(used>total)error='over';else if(p.wall>p.shield)error='prepNeeded';
  else if(p.wall<0&&s.wallWater<10)error='noWall';else if(s.wallWater+p.wall*10>40)error='invalid';
  const meters=clone(s.meters);
  meters.air=clamp(meters.air+p.air*12-18);
  meters.water=clamp(meters.water+p.water*14-13-p.food*2-p.wall*10);
  meters.food=clamp(meters.food+p.food*9-14+(p.food>0?missionLayoutEffects(s).foodBonus:0));
  meters.shielding=clamp(meters.shielding+p.shield*3+p.wall*18);
  meters.power=clamp(meters.power+(total-used)*6-4);
  meters.spirit=clamp(meters.spirit-2);
  if(!error&&p.wall>0&&meters.water<=0)error='noWater';
  const changes=Object.fromEntries(METERS.map(k=>[k,meters[k]-s.meters[k]]));
  return{valid:!error,error,meters,changes,used,total,wallWater:s.wallWater+p.wall*10};
}
function failIfEmpty(s){const k=['air','water','food'].find(k=>s.meters[k]<=0);if(k){s.phase='failed';s.outcome='home';s.failedMeter=k;return true;}return false;}
function record(s,type,id,before,extra={}){const changes=Object.fromEntries(METERS.map(k=>[k,s.meters[k]-before[k]]));const row={sol:s.sol,type,id,before:clone(before),after:clone(s.meters),changes,...extra};s.log.push(row);return row;}
function weightFor(s,id){
  const m=s.meters;
  return ({dust:s.cleanliness<80?3:1,leak:m.water>25?1.5:.5,greenhouse:m.food<65?2:1,homesick:m.spirit<80?2:1,sick:1,
    dustdevil:s.cleanliness<90?2:1,filter:m.air<75?2.5:1,freeze:s.weather[s.sol-1]==='dusty'?2:1,cargo:1.5,
    ice:m.water<60?2.5:.6,sand:1,pebbles:1,birthday:1,drawings:m.spirit<65?2:1})[id]??0;
}
export function drawSurprise(s){
  if(s.deck[s.sol-1])return s.deck[s.sol-1];
  if(!s.helpUsed&&Math.min(s.meters.air,s.meters.water,s.meters.food)<=25&&random(s)<.55){s.deck[s.sol-1]='help';s.helpUsed=true;return'help';}
  const options=CARD_IDS.filter(id=>!['landing','storm','help'].includes(id)&&!s.deck.includes(id)&&!(id==='sand'&&missionLayoutEffects(s).roverSafe));
  const total=options.reduce((n,id)=>n+weightFor(s,id),0);let roll=random(s)*total,chosen=options.at(-1);
  for(const id of options){roll-=weightFor(s,id)*siteWeight(s.legacyRules?'gale':s.site,id);if(roll<=0){chosen=id;break;}}
  s.deck[s.sol-1]=chosen;return chosen;
}
export function confirmPlan(s,plan){
  if(!['brief','explore'].includes(s.phase))return false;const p=previewPlan(s,plan);if(!p.valid)return false;
  const before=clone(s.meters);s.solStart=before;s.meters=p.meters;s.wallWater=p.wallWater;s.cleanliness=clamp(s.cleanliness-(s.perks.maintenance?5:12)-(s.weather[s.sol-1]==='dusty'?missionLayoutEffects(s).windyPanels:0));
  record(s,'plan','allocation',before,{plan:clone(plan),cells:p.total,wallWater:s.wallWater});
  if(!failIfEmpty(s)){s.phase='decision';drawSurprise(s);}return true;
}
export function stormTier(s){return s.meters.shielding>=stormGoal(s)?'strong':s.meters.shielding>=20?'cramped':'emergency';}
export function choiceEffects(s,card,choice){
  const shelter={strong:{spirit:10},cramped:{spirit:-10,food:-6},emergency:{spirit:-20,food:-10,power:-10}}[stormTier(s)],design=missionLayoutEffects(s);
  const quickShelter={...shelter,spirit:shelter.spirit-(design.shelterFar?5:0)};
  const map={
    landing:{outside:{air:-8,spirit:-5},balance:{spirit:9,power:-3}},
    storm:{finish:{...quickShelter,air:-10,spirit:quickShelter.spirit-5},shelter:quickShelter,radio:{...quickShelter,spirit:quickShelter.spirit-5}},
    dust:{lights:{power:12,food:-12},battery:{power:-16,spirit:3},rover:{power:-(s.perks.navigation?4:12)+design.nearPanels}},
    leak:{fix:{power:-8,water:3},ration:{water:-9,spirit:-4}},
    greenhouse:{light:{power:-10,food:8,water:-3},water:{water:-12,food:10},harvest:{food:4,spirit:2}},
    homesick:{message:{spirit:10,power:-3},game:{spirit:14,food:-3},joke:{spirit:7}},
    sick:{rest:{spirit:6,food:-3},kit:{spirit:9},doctor:{power:-3,spirit:6}},
    dustdevil:{watch:{power:-2,spirit:4},risk:{power:-3}},
    filter:{swap:{power:-8,air:12},shake:{power:-2},fan:{power:-5,spirit:3}},
    freeze:{warm:{power:-12,spirit:5},bunks:{food:-4,spirit:3}},
    cargo:{water:{water:18},food:{food:16},battery:{power:20}},
    ice:{probe:{power:-8,water:18},mark:{spirit:4}},
    sand:{route:{power:s.perks.navigation?-5:-10,spirit:3},pause:{food:-3,spirit:4}},
    pebbles:{spare:{power:-8,spirit:3},share:{food:-6,spirit:-3}},
    birthday:{card:{spirit:7},snack:{food:-5,spirit:14},video:{power:-2,spirit:9}},
    drawings:{gallery:{power:-2,spirit:10},reply:{power:-4,spirit:12}},
    help:{air:{air:18},water:{water:18},food:{food:18}},
  };return map[card]?.[choice]??null;
}
export function choiceAllowed(s,card,choice){
  const effects=choiceEffects(s,card,choice);if(!effects)return false;

  if(card!=='storm'&&effects.power<0&&s.meters.power< -effects.power)return false;
  return !(card==='sick'&&choice==='kit'&&s.kits<1);
}
export function choose(s,choice){
  if(s.phase!=='decision')return false;const card=s.deck[s.sol-1];if(!choiceAllowed(s,card,choice))return false;
  if((card==='storm'&&choice==='radio')||(card==='sick'&&choice==='doctor')){s.phase='waiting';s.pending={card,choice,seconds:6};return true;}
  return resolveChoice(s,card,choice);
}
function resolveChoice(s,card,choice){
  const panelBefore=s.cleanliness,effects={...choiceEffects(s,card,choice)},before=clone(s.meters),extra={choice,event:card==='storm'?clone(s.stormEvent):null};
  if(card==='storm'){extra.goal=stormGoal(s);extra.protection=stormTier(s);extra.outcomeKey=choice==='finish'?'stormFinish':(choice==='radio'?'stormRadio':'storm')+extra.protection[0].toUpperCase()+extra.protection.slice(1);}
  if(card==='dustdevil'&&choice==='risk'){extra.roll=random(s);extra.riskSuccess=extra.roll<.6;s.cleanliness=clamp(s.cleanliness+(extra.riskSuccess?35:-18));extra.outcomeKey=extra.riskSuccess?'devilClean':'devilDust';}
  if(card==='filter'&&choice==='shake'){extra.roll=random(s);extra.riskSuccess=extra.roll<.65;effects.air=extra.riskSuccess?12:-10;extra.outcomeKey=extra.riskSuccess?'filterClear':'filterClogged';}
  for(const [k,v]of Object.entries(effects))s.meters[k]=clamp(s.meters[k]+v);
  if(card==='dust'){s.cleanliness=clamp(s.cleanliness-(s.perks.maintenance?8:20));if(choice==='rover')s.cleanliness=100;}
  if(card==='pebbles'&&choice==='share')s.cleanliness=clamp(s.cleanliness-15);
  if(card==='sick'&&choice==='kit')s.kits--;
  if(s.cleanliness!==panelBefore){extra.panelBefore=panelBefore;extra.panelAfter=s.cleanliness;}
  s.lastChoice=record(s,'decision',card,before,extra);s.pending=null;if(!failIfEmpty(s))s.phase='result';return true;
}
export function tickReply(s,seconds){if(s.phase!=='waiting'||!s.pending)return false;s.pending.seconds=Math.max(0,s.pending.seconds-clamp(seconds,0,1));if(s.pending.seconds===0){const {card,choice}=s.pending;resolveChoice(s,card,choice);}return true;}
export function showSummary(s){if(s.phase!=='result')return false;s.phase='summary';s.snapshots.push({sol:s.sol,meters:clone(s.meters)});return true;}
export function nextSol(s){if(s.phase!=='summary')return false;if(s.sol===5){s.phase='complete';s.outcome='success';return true;}s.sol++;s.phase='brief';s.lastChoice=null;s.solStart=null;s.morningSpirit=s.meters.spirit;return true;}
export function collectRock(s,id){const r=s.rocks.find(r=>r.id===id);if(!r||r.found||!['brief','explore','summary','complete'].includes(s.phase))return false;r.found=true;return true;}
export function missionStars(s){
  const final=['complete','failed'].includes(s.phase),storm=s.log.find(row=>row.type==='decision'&&row.id==='storm');
  const goal=s.bonusGoal??GOALS[0],value=goal.id==='rocks'?s.rocks.filter(r=>r.found).length:s.meters[goal.id];
  return[{id:'survive',earned:s.phase==='complete',reason:s.phase==='failed'?'starHome':'starInProgress'},
    {id:'storm',earned:!!storm&&storm.choice==='shelter'&&storm.before.shielding>=(storm.goal??stormGoal(s)),reason:!storm?'starStormWaiting':storm.choice!=='shelter'?'starStormChoice':'starStormWall'},
    {id:'bonus',earned:s.phase==='complete'&&value>=goal.target,reason:s.phase==='failed'?'starBonusFinish':final?'starBonusMiss':'starInProgress',goal,value,target:goal.target}];
}
export function sensibleChoice(s){
  const id=s.deck[s.sol-1],m=s.meters,preferred={landing:'balance',storm:'shelter',dust:'rover',leak:'fix',greenhouse:'harvest',homesick:'joke',sick:'rest',dustdevil:'watch',filter:'swap',freeze:'warm',cargo:m.water<55?'water':m.food<65?'food':'battery',ice:'probe',sand:'route',pebbles:'spare',birthday:'card',drawings:'gallery',help:m.water<40?'water':m.food<40?'food':'air'}[id];
  if(choiceAllowed(s,id,preferred))return preferred;
  return({dust:'lights',filter:'fan',freeze:'bunks',ice:'mark',sand:'pause',pebbles:'share',drawings:'gallery'})[id]??preferred;
}
export function createDodge(seed=1){return{remaining:30,lives:3,x:.5,rocks:[],spawn:0,invulnerable:0,seed,finished:false};}
export function tickDodge(s,seconds,direction=0,target=null){
  if(s.finished)return;const dt=clamp(seconds,0,.05);s.remaining=Math.max(0,s.remaining-dt);s.x=clamp(target??s.x+direction*dt*.65,.05,.95);s.spawn-=dt;s.invulnerable=Math.max(0,s.invulnerable-dt);
  if(s.spawn<=0){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;s.rocks.push({x:.05+(s.seed/4294967296)*.9,y:-.07});s.spawn=.95;}
  for(const r of s.rocks){r.y+=dt*.23;if(s.invulnerable===0&&Math.abs(r.x-s.x)<.075&&Math.abs(r.y-.83)<.07){s.lives--;s.invulnerable=1.8;r.y=2;}}
  s.rocks=s.rocks.filter(r=>r.y<1.1);if(!s.remaining||s.lives<=0)s.finished=true;
}
