import {tr} from './strings.js';

import {CABLES,DEVICES,STORM_ARRIVAL,shuffledSockets} from './story-training.js';
import {surfaceObstacles,moveOnGround,groundRoute,SURFACE_ROCKS,KITTY_RADIUS,ROVER_RADIUS} from './surface-world.js';
import { SCENES, PATCHES } from './story.js';
export const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const BEACONS=[{x:500,y:515,name:tr("text147")},{x:850,y:380,name:tr("text148")},{x:290,y:615,name:tr("text149")}];
export const ROCKS=SURFACE_ROCKS;
export function say(s,key){s.speech=key;s.speechVersion++;}
export function feedback(s,target,complete=false,kind='happy'){s.feedback={version:s.feedback.version+1,scene:s.scene,target,complete,kind,age:0,cheer:kind==='happy'?(s.cheers++%5):0};}
export function powerUsed(s){return Number(s.power.air)+Number(s.power.radio);}
export function restoreStory(raw={},wiringSeed=0){return createGame(Object.hasOwn(SCENES,raw.scene)?raw.scene:'approach',Array.isArray(raw.patches)?raw.patches.filter(p=>PATCHES.some(x=>x.id===p)):[],wiringSeed);}
function earn(s,id){if(!s.patches.includes(id))s.patches.push(id);}
export function createGame(scene='approach',patches=[],wiringSeed=0){
  const s={scene:'',sceneTime:0,totalTime:0,patches:[...new Set(patches)],player:{x:230,y:540,vx:0,vy:0,facing:1},buddy:{x:320,y:525},target:null,auto:false,speech:'welcome',speechVersion:0,checkpointVersion:0,
    wiringSeed,socketOrder:[],panels:[{x:490,y:445,clean:0},{x:720,y:485,clean:0}],cable:false,cables:Object.fromEntries(CABLES.map(p=>[p.id,false])),power:{air:false,radio:false,rover:false,heater:false,lights:false,ports:{}},shelter:{gate:0,phase:'open'},feedback:{version:0,age:10,kind:'',target:'',complete:false,cheer:0},cheers:0,shake:{left:0,strength:0},stormArrived:false,airlock:{outer:1,inner:0,pressure:0,phase:'outer'},monitor:{reading:0,cooldown:0,scale:1},rover:{scan:0,progress:0},completed:false,blockedHint:0,transition:0};
  enter(s,Object.hasOwn(SCENES,scene)?scene:'approach');return s;
}
export function enter(s,scene){
  if(!SCENES[scene])return;s.scene=scene;s.sceneTime=0;s.target=null;s.route=[];s.auto=false;s.transition=0;s.player.vx=s.player.vy=0;
  if(scene==='choose')Object.assign(s.player,{x:950,y:610});
  if(scene==='walk')Object.assign(s.player,{x:355,y:570});
  if(scene==='clean'){Object.assign(s.player,{x:425,y:525});s.panels.forEach(p=>p.clean=0);}
  if(scene==='connect'){s.wiringSeed=(s.wiringSeed+1)>>>0;s.socketOrder=shuffledSockets(s.wiringSeed,s.socketOrder);s.panels.forEach(p=>p.clean=100);s.cable=false;s.cables=Object.fromEntries(CABLES.map(p=>[p.id,false]));}
  if(['warning','return'].includes(scene)){s.panels.forEach(p=>p.clean=100);s.cable=true;Object.assign(s.player,{x:690,y:540});}
  if(scene==='airlock'){s.airlock={outer:1,inner:0,pressure:0,phase:'outer'};Object.assign(s.player,{x:570,y:525});}
  if(scene==='shelter'){Object.assign(s.player,{x:235,y:535});s.shelter={gate:0,phase:'open'};}
  if(scene==='power'){s.power={air:false,radio:false,rover:false,heater:false,lights:false,ports:{}};Object.assign(s.player,{x:650,y:535});}
  if(scene==='monitor'){s.power.air=s.power.radio=true;s.monitor={reading:0,cooldown:0,scale:1};Object.assign(s.player,{x:650,y:535});}
  if(scene==='rover'){Object.assign(s.player,{x:1070,y:600});s.rover={scan:0,progress:0,inputAt:null};earn(s,'storm');}
  if(['finale','complete'].includes(scene)){Object.assign(s.player,{x:655,y:535});earn(s,'rover');}
  if(scene==='complete')s.completed=true;
  s.obstacles=['walk','clean','return','rover'].includes(scene)?surfaceObstacles({panels:s.panels}):[];
  s.stormArrived=false;s.shake={left:0,strength:0};s.buddy={x:s.player.x+90,y:s.player.y-12};say(s,SCENES[scene].line);s.checkpointVersion++;
}
export function useRoverControls(s){
 if(s.scene==='rover'&&s.rover.inputAt===null)s.rover.inputAt=s.sceneTime;
}
export function nearbyDustyPanel(s){
 return s.panels.find(p=>p.clean<100&&distance(s.player,{x:p.x,y:p.y+30})<88);
}
function aim(s,point,auto=false){
  s.route=s.obstacles.length?groundRoute(s.player,point,s.obstacles,s.scene==='rover'?ROVER_RADIUS:KITTY_RADIUS):[point];
  s.target=s.route.at(-1)??null;
  s.auto=auto&&!!s.target;
}
export function setTarget(s,x,y){
  if(!['walk','drive'].includes(SCENES[s.scene].kind))return;
  useRoverControls(s);
  if(s.scene==='clean'){
    const panel=s.panels.find(p=>p.clean<100&&distance(p,{x,y})<115);
    if(panel){aim(s,{x:panel.x,y:panel.y+48},true);return;}
  }
  const beacon=s.scene==='rover'?BEACONS[s.rover.scan]:null;
  if(beacon&&distance(beacon,{x,y})<120){aim(s,beacon,true);return;}
  aim(s,{x:clamp(x,60,1220),y:clamp(y,280,660)});
}
export function goal(s){
  if(s.scene==='walk')return{x:520,y:520,label:tr("text150")};
  if(s.scene==='clean'){const p=s.panels.find(p=>p.clean<100);return p?{x:p.x,y:p.y+48,label:tr("text151")}:null;}
  if(s.scene==='return')return{x:1156,y:460,label:tr("text152")};
  if(s.scene==='shelter')return{x:1010,y:510,label:tr("text153")};
  if(s.scene==='rover'){const b=BEACONS[s.rover.scan];return b?{...b,label:b.name}:null;}return null;
}
export function interact(s){
  if(s.transition>0)return;
  if(s.scene==='clean'){
    const near=nearbyDustyPanel(s),next=near??s.panels.find(p=>p.clean<100);
    if(!next)return;
    if(near){s.target=null;s.route=[];s.auto=true;}
    else aim(s,{x:next.x,y:next.y+48},true);
    return;
  }
  if(s.scene==='airlock'){const a=s.airlock;if(a.phase==='outer')a.phase='closing';else if(a.phase==='sealed'){a.phase='pressurizing';say(s,'pressure');}else if(a.phase==='ready'&&a.outer===0&&a.pressure>=100)a.phase='opening';return;}
  if(s.scene==='shelter'&&s.shelter.phase==='open'&&distance(s.player,goal(s))<85){s.shelter.phase='closing';say(s,'gateClosing');return;}
  if(s.scene==='monitor'&&s.monitor.cooldown<=0&&s.monitor.reading<3){s.monitor.reading++;s.monitor.cooldown=5;feedback(s,'monitor',s.monitor.reading===3,s.monitor.reading===3?'happy':'check');say(s,['','elevated','falling','clear'][s.monitor.reading]);if(s.monitor.reading===3)s.transition=5;return;}
  if(s.scene==='rover'){useRoverControls(s);const b=goal(s);if(b&&distance(s.player,b)<88)s.auto=!s.auto;}
}
export function matchCable(s,plug,socket){
 if(s.scene!=='connect'||s.transition>0||!CABLES.some(c=>c.id===plug)||s.cables[plug])return false;
 if(plug!==socket){say(s,'cableWrong');feedback(s,socket,false,'wrong');return false;}
 s.cables[plug]=true;const done=CABLES.every(c=>s.cables[c.id]);s.cable=done;feedback(s,plug,done);say(s,done?'connected':'plugRight');
 if(done){earn(s,'sun');s.transition=2.8;}return true;
}
export function connect(s,device,port){
 if(s.scene!=='power'||s.transition>0||!DEVICES.some(d=>d.id===device)||s.power[device])return false;
 if(device==='rover'){say(s,'roverPriority');feedback(s,device,false,'wrong');return false;}
 if(['heater','lights'].includes(device)){say(s,'saveBattery');feedback(s,device,false,'wrong');return false;}
 if(device==='radio'&&!s.power.air){say(s,'airHint');feedback(s,device,false,'wrong');return false;}
 port??=['cell0','cell1'].find(p=>!s.power.ports[p]);
 if(!['cell0','cell1'].includes(port)||s.power.ports[port]||powerUsed(s)>=2){say(s,'overBudget');feedback(s,device,false,'wrong');return false;}
 s.power[device]=true;s.power.ports[port]=device;const done=s.power.air&&s.power.radio;feedback(s,device,done);say(s,done?'powerDone':'powerRadio');if(done)s.transition=3.5;return true;
}
export function skipFilm(s){const d=SCENES[s.scene];if(d.kind==='film'&&s.sceneTime>=1.2)enter(s,d.next);}
function move(s,dt,input){
  let dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);
  if(input.right||input.left||input.down||input.up)useRoverControls(s);
  if(dx||dy){s.target=null;s.route=[];s.auto=false;}
  else if(s.target){
    while(s.route.length&&distance(s.player,s.route[0])<1)s.route.shift();
    const waypoint=s.route[0];
    if(waypoint){dx=waypoint.x-s.player.x;dy=waypoint.y-s.player.y;}
    else s.target=null;
  }
  const d=Math.hypot(dx,dy),speed=s.scene==='rover'?235:170;
  const old={x:s.player.x,y:s.player.y};
  if(d){
    const amount=Math.min(speed*dt,s.target?d:Infinity);
    const requested={x:old.x+dx/d*amount,y:old.y+dy/d*amount};
    const next=moveOnGround(old,requested,s.obstacles,s.scene==='rover'?ROVER_RADIUS:KITTY_RADIUS);
    s.player.x=next.x;s.player.y=next.y;
    if(distance(old,next)<.001){
      if(s.scene==='rover'&&s.blockedHint<=0){say(s,'careful');s.blockedHint=5;}
      s.target=null;s.route=[];s.auto=false;
    }
  }
  s.player.vx=(s.player.x-old.x)/dt;s.player.vy=(s.player.y-old.y)/dt;if(Math.abs(s.player.vx)>1)s.player.facing=Math.sign(s.player.vx);
  const f={x:s.player.x-75*s.player.facing,y:s.player.y-14};s.buddy.x+=(f.x-s.buddy.x)*Math.min(1,dt*3);s.buddy.y+=(f.y-s.buddy.y)*Math.min(1,dt*3);
}
export function tick(s,seconds,input={}){
  const dt=clamp(seconds,0,.05);if(!dt||s.completed)return;s.sceneTime+=dt;s.totalTime+=dt;s.feedback.age+=dt;s.shake.left=Math.max(0,s.shake.left-dt);s.blockedHint=Math.max(0,s.blockedHint-dt);const def=SCENES[s.scene];
  if(s.transition>0){s.transition=Math.max(0,s.transition-dt);if(!s.transition)enter(s,({walk:'clean',clean:'connect',connect:'warning',return:'airlock',airlock:'shelter',power:'monitor',monitor:'rover',rover:'finale',shelter:'power'})[s.scene]);return;}
  if(s.scene==='warning'&&!s.stormArrived&&s.sceneTime>=STORM_ARRIVAL){s.stormArrived=true;s.shake={left:.32,strength:4};}
  if(def.kind==='film'){
    if(s.scene==='approach'){if(s.sceneTime>5.5&&s.speech==='welcome')say(s,'approachHome');if(s.sceneTime>11&&s.speech==='approachHome')say(s,'approachLand');}
    if(s.scene==='landing'&&s.sceneTime>4.5&&s.speech==='landing')say(s,'landingHello');if(s.sceneTime>=def.seconds)enter(s,def.next);return;
  }
  if(['walk','drive'].includes(def.kind))move(s,dt,input);
  if(s.scene==='walk'&&distance(s.player,goal(s))<55){earn(s,'steps');s.transition=.8;feedback(s,'player',true);}
  else if(s.scene==='clean'){
    const p=nearbyDustyPanel(s);
    if(p&&(input.action||(s.auto&&!s.target))&&Math.hypot(s.player.vx,s.player.vy)<20){const before=p.clean;p.clean=clamp(p.clean+dt*34,0,100);if(before<100&&p.clean===100){s.auto=false;s.target=null;feedback(s,'panel'+s.panels.indexOf(p),s.panels.every(q=>q.clean===100));if(s.panels.every(p=>p.clean===100)){say(s,'panelsDone');s.transition=2.5;}else say(s,'panelDone');}}
  }else if(s.scene==='return'&&distance(s.player,goal(s))<52)s.transition=.8;
  else if(s.scene==='airlock'){
    const a=s.airlock;if(a.phase==='closing'){a.outer=Math.max(0,a.outer-dt*1.2);if(a.outer===0){a.phase='sealed';say(s,'sealed');feedback(s,'outer');}}
    if(a.phase==='pressurizing'){a.pressure=Math.min(100,a.pressure+dt*30);if(a.pressure===100){a.phase='ready';say(s,'ready');feedback(s,'gauge');s.shake={left:.22,strength:2};}}
    if(a.phase==='opening'){a.inner=Math.min(1,a.inner+dt);if(a.inner===1){s.transition=.8;feedback(s,'hatch',true);}}
  }else if(s.scene==='shelter'&&s.shelter.phase==='closing'){s.shelter.gate=Math.min(1,s.shelter.gate+dt*1.3);if(s.shelter.gate===1){s.shelter.phase='sealed';earn(s,'crew');say(s,'gateSealed');feedback(s,'gate',true);s.transition=1.8;}}
  else if(s.scene==='monitor')s.monitor.cooldown=Math.max(0,s.monitor.cooldown-dt);
  else if(s.scene==='rover'){
    const b=BEACONS[s.rover.scan];if(b&&distance(s.player,b)<72&&(input.action||s.auto)&&Math.hypot(s.player.vx,s.player.vy)<25){s.rover.progress+=dt/1.7;if(s.rover.progress>=1){s.rover.scan++;feedback(s,'beacon'+(s.rover.scan-1),s.rover.scan===3);s.rover.progress=0;s.auto=false;s.target=null;if(s.rover.scan===3){earn(s,'rover');s.transition=3.5;say(s,'roverDone');}else say(s,'scanDone');}}else s.rover.progress=Math.max(0,s.rover.progress-dt*.3);
  }
}

export function advanceStory(s,seconds,input={}){for(let left=clamp(seconds,0,1);left>0;left-=1/60)tick(s,Math.min(left,1/60),input);}
