import {tr} from './strings.js';
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const MISSIONS=[
 {id:'solar',name:tr("text154"),subtitle:tr("text155"),icon:'sun',color:'#efd18d',time:tr("text156"),skill:tr("text157"),description:tr("text158"),objectives:[tr("text159"),tr("text160")],controls:tr("text161"),science:tr("text162"),maxTime:70},
 {id:'rover',name:tr("text163"),subtitle:tr("text164"),icon:'rover',color:'#bda7f6',time:tr("text165"),skill:tr("text166"),description:tr("text167"),objectives:[tr("text168"),tr("text169")],controls:tr("text170"),science:tr("text171"),maxTime:95},
 {id:'power',name:tr("text172"),subtitle:tr("text173"),icon:'bolt',color:'#9cdbcc',time:tr("text174"),skill:tr("text175"),description:tr("text176"),objectives:[tr("text177"),tr("text178")],controls:tr("text179"),science:tr("text180"),maxTime:0},
 {id:'shelter',name:tr("text181"),subtitle:tr("text182"),icon:'shield',color:'#e6a18c',time:tr("text156"),skill:tr("text183"),description:tr("text184"),objectives:[tr("text185"),tr("text186")],controls:tr("text187"),science:tr("text188"),maxTime:40}
];
export function createMission(id){
 const def=MISSIONS.find(m=>m.id===id);if(!def)throw new Error(tr("text189"));
 const s={id,elapsed:0,time:def.maxTime,phase:'playing',player:{x:150,y:400,vx:0,vy:0,facing:1},target:null,action:false,event:'',eventVersion:0,result:null};
 if(id==='solar')Object.assign(s,{panels:[{x:275,y:240,clean:0},{x:515,y:360,clean:0},{x:760,y:235,clean:0}],energy:20,cleaning:-1});
 if(id==='rover')Object.assign(s,{player:{x:115,y:423,vx:0,vy:0,facing:1},crates:[{x:268,y:145,got:false},{x:765,y:140,got:false},{x:793,y:415,got:false}],rocks:[{x:365,y:286,r:45},{x:540,y:175,r:38},{x:636,y:379,r:40},{x:200,y:300,r:30},{x:852,y:278,r:32}],pad:{x:115,y:423},hull:100,fuel:100,hitCooldown:0,delivered:false});
 if(id==='power')Object.assign(s,{shift:0,available:[12,10,8],alloc:{air:3,crop:3,rover:1},air:55,crop:0,charge:0,history:[],anim:0,lastMessage:tr("text190")});
 if(id==='shelter')Object.assign(s,{sensors:[{x:480,y:170,got:false},{x:790,y:365,got:false}],shelter:{x:145,y:165},exposure:0,sheltered:false});
 return s;
}
function emit(s,msg){s.event=msg;s.eventVersion++}
function finish(s,success,score,title,detail){s.phase='finished';s.target=null;s.action=false;s.result={success,score:clamp(Math.round(score),0,1000),stars:success?(score>=850?3:score>=600?2:1):0,title,detail};}
export function powerPreview(s){const a=s.alloc;return{used:a.air+a.crop+a.rover+2,available:s.available[s.shift]??0,air:clamp(s.air+a.air*7-18,0,100),crop:clamp(s.crop+a.crop*10,0,100),charge:clamp(s.charge+a.rover*10,0,100)}}
export function runShift(s){
 if(s.id!=='power'||s.phase!=='playing')return false;
 const p=powerPreview(s);if(p.used>p.available){s.lastMessage=tr("text191");return false;}
 const before={air:s.air,crop:s.crop,charge:s.charge};s.air=p.air;s.crop=p.crop;s.charge=p.charge;s.history.push({...s.alloc,...p});s.shift++;s.anim=1;
 s.lastMessage=tr("text192", [s.shift, s.air>=before.air?'+':'', s.air-before.air, s.crop-before.crop, s.shift<3?tr("text193"):'']);
 emit(s,tr("text194", [s.shift, s.air, s.crop]));
 if(s.air<25){finish(s,false,0,tr("text195"),tr("text196"));return true;}
 if(s.shift===3){const ok=s.air>=45&&s.crop>=60;finish(s,ok,ok?700+s.charge*3+Math.max(0,s.air-45)*2:0,ok?tr("text197"):tr("text198"),ok?tr("text199"):tr("text200"));}
 return true;
}
export function setDestination(s,x,y){if(s.phase!=='playing'||s.id==='power')return;s.target={x:clamp(x,40,920),y:clamp(y,100,475)};}
export function tick(s,delta,input={}){
 if(s.phase!=='playing')return;
 const dt=clamp(delta,0,.05);s.elapsed+=dt;s.anim=Math.max(0,(s.anim||0)-dt);
 if(s.id==='power')return;
 s.time=Math.max(0,s.time-dt);
 let dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);
 const manual=!!(dx||dy);if(manual){s.target=null;s.autoClean=-1;}
 if(!manual&&s.target){const d=distance(s.player,s.target);if(d<8){s.target=null;}else{dx=(s.target.x-s.player.x)/d;dy=(s.target.y-s.player.y)/d;}}
 const len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
 let speed=s.id==='rover'?165:185;
 if(s.id==='rover'){
   const k=1-Math.exp(-dt*7);s.player.vx+=(dx*speed-s.player.vx)*k;s.player.vy+=(dy*speed-s.player.vy)*k;
   s.hitCooldown=Math.max(0,s.hitCooldown-dt);s.fuel=Math.max(0,s.fuel-dt*(.14+Math.hypot(s.player.vx,s.player.vy)*.0015));
 }else{s.player.vx=dx*speed;s.player.vy=dy*speed;}
 s.player.x=clamp(s.player.x+s.player.vx*dt,38,922);s.player.y=clamp(s.player.y+s.player.vy*dt,105,475);
 if(Math.abs(s.player.vx)>1)s.player.facing=Math.sign(s.player.vx);
 if(s.id==='solar'){
   s.cleaning=-1;const near=s.panels.findIndex(p=>p.clean<100&&distance(s.player,p)<91);

   const tapped=s.target&&near>=0&&distance(s.target,s.panels[near])<70;
   const arrived=near>=0&&!manual&&!s.target&&s.autoClean===near;
   if(near>=0&&(input.action||s.action||tapped||arrived)){
     s.cleaning=near;s.player.vx=0;s.player.vy=0;s.panels[near].clean=Math.min(100,s.panels[near].clean+dt*38);
     if(s.panels[near].clean>=100){s.energy=Math.min(100,s.energy+80/3);emit(s,tr("text201"));s.autoClean=-1;s.target=null;}
   }
   if(s.panels.every(p=>p.clean>=100))finish(s,true,650+s.time*5,tr("text202"),tr("text203"));
 }else if(s.id==='rover'){
   for(const r of s.rocks){const d=distance(s.player,r),min=r.r+24;if(d<min){let nx=(s.player.x-r.x)/(d||1),ny=(s.player.y-r.y)/(d||1);if(!d)nx=1;s.player.x=r.x+nx*(min+.5);s.player.y=r.y+ny*(min+.5);s.player.vx=0;s.player.vy=0;s.target=null;if(s.hitCooldown===0){s.hull=Math.max(0,s.hull-12);s.hitCooldown=1.1;emit(s,tr("text204"));}}}
   for(const c of s.crates)if(!c.got&&distance(s.player,c)<45){c.got=true;emit(s,tr("text205", [s.crates.filter(c=>c.got).length]));}
   if(s.crates.every(c=>c.got)&&distance(s.player,s.pad)<62){s.delivered=true;finish(s,true,550+s.hull*3+s.time*1.6,tr("text206"),tr("text207"));}
   if(s.hull<=0||s.fuel<=0)finish(s,false,0,tr("text208"),tr("text209"));
 }else if(s.id==='shelter'){
   for(const sensor of s.sensors)if(!sensor.got&&distance(s.player,sensor)<40){sensor.got=true;emit(s,tr("text210", [s.sensors.filter(c=>c.got).length]));}
   if(s.elapsed>12)s.exposure=Math.min(100,s.exposure+dt*3);
   if((s.sensors.every(c=>c.got)||s.elapsed>12)&&distance(s.player,s.shelter)<70){s.sheltered=true;finish(s,true,700+s.time*5-s.exposure*2,tr("text211"),tr("text212"));}
 }
 if(s.phase==='playing'&&s.time<=0)finish(s,false,0,tr("text213"),s.id==='solar'?tr("text214"):s.id==='shelter'?tr("text215"):tr("text216"));
}
