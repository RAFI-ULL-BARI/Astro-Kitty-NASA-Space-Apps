import {sampleRock} from './classic/field-art.js';
import {copy} from './strings.js';
import {rockRevealDistance} from './outpost-engine.js';
import {visibleBaseModules} from './surface-world.js';
import {siteRules} from './landing-sites.js';
import {drawBangladeshFlag,currentFlag} from './flags.js';
import {tr,t} from './strings.js';
import {trainingLayout,feedbackPose,dangerOffset,roverGuideOpacity,STORM_ARRIVAL,STORM_DURATION} from './story-training.js';
import './compat.js';

import { SCENES } from './story.js';
import { clamp, goal, BEACONS, ROCKS } from './story-engine.js';
let c, time=0, reduced=false, decoration={};
const C={cream:'#fff0db',mint:'#ace3d0',lavender:'#b7a1e4',ink:'#263b54',edge:'#b3b9ce',white:'#e9e3df',orange:'#eab08c'};
const ease=n=>n*n*(3-2*n);
function rr(x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=1.5;c.strokeStyle=stroke;c.stroke();}}
function ell(x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function poly(points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function line(points,color,width=2,dash=[]){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.lineJoin='round';c.setLineDash(dash);c.stroke();c.setLineDash([]);}
function text(str,x,y,size=16,color=C.cream,align='center',maxWidth){
 c.font=tr("text087", [size]);c.textAlign=align;c.fillStyle=color;
 if(maxWidth===undefined)c.fillText(str,x,y);else c.fillText(str,x,y,maxWidth);
}
function shadow(x,y,w=32){ell(x,y,w,w*.23,'#14213c35');}
export const AVATARS={mishti:{name:'Mishti',ear:'#e2a982',face:'#efbb95',inner:'#ba8183',suit:'#b6a3e6'},megh:{name:'Megh',ear:'#efe3d2',face:'#fbf4ea',inner:'#e3a9a4',suit:'#f2b36b'},neel:{name:'Neel',ear:'#7f93b8',face:'#aebbd6',inner:'#d7a3ad',suit:'#5fb0e8'},tara:{name:'Tara',ear:'#6f5763',face:'#8f727c',inner:'#c98f96',suit:'#f09ab0'}};
let avatarId='mishti';try{const v=localStorage.getItem('astro-kitty-avatar');if(v&&AVATARS[v])avatarId=v;}catch{}
export function setAvatar(id){if(AVATARS[id]){avatarId=id;try{localStorage.setItem('astro-kitty-avatar',id);}catch{}}}
export function currentAvatar(){return avatarId;}
export function cat(x,y,scale=1,moving=false,facing=1,friend=false,wave=false){const A=AVATARS[avatarId];
 c.save();c.translate(x,y);c.scale(scale,scale);shadow(0,7,27);
 const walk=moving&&!reduced?Math.sin(time*12)*6:0,bob=!reduced?Math.sin(time*2)*1.3:0;c.translate(0,bob);
 rr(-25,-42,15,30,7,'#a29bb8');line([[-10,-10],[-13,5+walk]],'#d6d0dc',12);line([[10,-10],[13,5-walk]],'#d6d0dc',12);
 rr(-21,2+walk,17,9,4,'#6d6c8c');rr(5,2-walk,17,9,4,'#6d6c8c');
 rr(-19,-45,38,40,12,'#ede4e4','#f6efec');rr(-15,-38,30,19,6,friend?'#8fc7be':A.suit);rr(-5,-34,10,7,2,'#f8efde');
 line([[-20,-35],[-29,-18-walk]],'#ded5e0',11);
 const arm=wave?Math.sin(reduced?0:time*5)*8-20:walk;line([[20,-35],[30,-19+arm]],'#ded5e0',11);ell(-29,-17-walk,6,6,friend?C.mint:A.suit);ell(30,-18+arm,6,6,friend?C.mint:A.suit);
 ell(0,-64,33,32,'#f0e6e6');ell(0,-65,28,27,'#2a425b');
 poly([[-22,-63],[-23,-85],[-8,-75],[8,-75],[23,-85],[22,-63]],friend?'#b6a6a6':A.ear);
 ell(0,-60,23,21,friend?'#ccc0b3':A.face);poly([[-19,-79],[-18,-68],[-10,-74]],friend?'#ba8183':A.inner);poly([[19,-79],[18,-68],[10,-74]],friend?'#ba8183':A.inner);
 {const blink=!reduced&&((time+(friend?1.7:0))%4.2)<.13,glad=wave||decoration.happy;if(glad){line([[-11+facing,-61],[-8+facing,-64.5],[-5+facing,-61]],'#343d50',1.8);line([[5+facing,-61],[8+facing,-64.5],[11+facing,-61]],'#343d50',1.8);}else{ell(-8+facing,-62,2.4,blink?.5:3.4,'#343d50');ell(8+facing,-62,2.4,blink?.5:3.4,'#343d50');if(!blink){ell(-7.2+facing,-63.2,.8,.9,'#ffffffcc');ell(8.8+facing,-63.2,.8,.9,'#ffffffcc');}}}poly([[-3,-53],[3,-53],[0,-49]],'#9d6c70');line([[-8,-48],[-3,-45],[0,-48],[3,-45],[8,-48]],'#976b73',1.1);ell(-16,-52,4,2,'#e49f93');ell(16,-52,4,2,'#e49f93');
 if(!friend&&decoration.flag!=='none')drawBangladeshFlag(c,-32,-30,14);
 if(!friend&&decoration.sticker){text(decoration.sticker,19,-84,13,'#fff0db');}
 line([[-25,-69],[-20,-79],[-10,-84]],'#fff8ed95',3);line([[-19,-51],[-29,-54]],'#d49c8780',1);line([[19,-51],[29,-54]],'#d49c8780',1);c.restore();
}
function pip(x,y,scale=1,alert=false){
 c.save();c.translate(x,y+(reduced?0:Math.sin(time*2.4)*4));c.scale(scale,scale);if(decoration.pipSpin&&!reduced)c.rotate((time*5)%(Math.PI*2));shadow(0,31,26);rr(-23,-22,46,44,15,'#c7ccdb','#ece4e7');rr(-18,-16,36,26,9,'#2c425b');{const eye=alert?'#efd096':C.mint,blink=!reduced&&((time+.9)%3.6)<.12,glad=decoration.happy&&!alert;if(glad){line([[-11,-3],[-8,-7],[-5,-3]],eye,2);line([[5,-3],[8,-7],[11,-3]],eye,2);line([[-6,3],[0,8],[6,3]],eye,1.8);}else{ell(-8,-4,2.5,blink?.6:alert?5:4,eye);ell(8,-4,2.5,blink?.6:alert?5:4,eye);if(alert)ell(0,6,2.6,2.2,eye);else line([[-5,4],[0,6],[5,4]],eye,1.5);}}line([[0,-22],[0,-36]],'#c7ccdb',3);ell(0,-39,4.5,4.5,alert?'#efd096':C.mint);rr(-31,-1,7,18,3,'#a0b5c9');rr(24,-1,7,18,3,'#a0b5c9');ell(0,26,10,3,'#9fdbd97d');
 if(alert){rr(27,-55,43,38,12,'#e9bd81');text('!',48,-29,25,'#644e47');}c.restore();
}
function stars(){for(let i=0;i<110;i++){const x=(i*137.7+13)%1280,y=(i*59.3+23)%720;const a=.15+(i%5)*.1;c.globalAlpha=a;ell(x,y,i%9===0?1.8:1,i%9===0?1.8:1,'#efe8e9');}c.globalAlpha=1;}
function planet(x,y,r){
 const g=c.createRadialGradient(x-r*.35,y-r*.4,10,x,y,r);g.addColorStop(0,'#efba99');g.addColorStop(.45,'#ce8879');g.addColorStop(1,'#785672');ell(x,y,r,r,g);
 c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
 for(let i=0;i<16;i++){const a=i*2.399,rrr=r*(.2+(i%5)*.16),xx=x+Math.cos(a)*rrr,yy=y+Math.sin(a)*rrr;ell(xx,yy,r*(.055+(i%3)*.025),r*.035,'#704d6630');ell(xx-3,yy+3,r*.04,r*.018,'#f2c49c28');}
 line([[x-r*.9,y+r*.1],[x-r*.4,y-r*.05],[x,y+r*.18],[x+r*.6,y+r*.04]],'#814c663d',r*.09);c.restore();
 c.strokeStyle='#f6c79a30';c.lineWidth=9;c.beginPath();c.arc(x,y,r+5,-2.5,-.3);c.stroke();
}
function ship(x,y,scale=1,angle=0,flame=true){
 c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(angle);
 if(flame){const pulse=reduced?0:Math.sin(time*13)*6;poly([[-17,40],[0,92+pulse],[17,40]],'#f6cba176');poly([[-10,43],[0,73+pulse],[10,43]],'#ffe6b6');}
 poly([[-22,0],[-46,43],[-18,36]],'#b6a1c2');poly([[22,0],[46,43],[18,36]],'#b6a1c2');
 c.beginPath();c.moveTo(-21,37);c.bezierCurveTo(-29,-14,-19,-45,0,-60);c.bezierCurveTo(19,-45,29,-14,21,37);c.closePath();c.fillStyle='#e5dce1';c.fill();
 poly([[-17,-30],[0,-60],[17,-30]],'#d19d9d');ell(0,-9,15,15,'#889eae');ell(0,-9,11,11,'#314c63');ell(0,-8,6,5,C.orange);line([[-3,-12],[-5,-17],[-1,-14],[3,-14],[5,-17],[5,-12]],C.orange,2);rr(-21,29,42,10,3,'#7d7c9e');c.restore();
}
function space(s,home,compact=false){
 const g=c.createLinearGradient(0,0,1280,720);g.addColorStop(0,'#14263f');g.addColorStop(.5,'#28344f');g.addColorStop(1,'#5c425c');c.fillStyle=g;c.fillRect(0,0,1280,720);stars();
 c.save();c.globalAlpha=.2;ell(1010,360,350,350,'#da9278');c.restore();planet(1000,350,270);
 c.strokeStyle='#c4b1d636';c.lineWidth=1;c.setLineDash([3,10]);c.beginPath();c.ellipse(900,430,400,140,-.35,0,Math.PI*2);c.stroke();c.setLineDash([]);
 const p=home?.3:reduced?.65:clamp(s.sceneTime/16,0,1);
 if(home&&compact){ship(1020,370,.8,-.55,true);const shade=c.createLinearGradient(700,0,1080,0);shade.addColorStop(0,'#14263fc9');shade.addColorStop(1,'#14263f00');c.fillStyle=shade;c.fillRect(700,0,500,720);}
 else ship(740+p*140,505-p*165,1.45,-.55,true);
 if(home){pip(compact?805:1080,compact?650:603,compact?.9:1.15);cat(930,660,1.65,false,1,false,true);}
 else{const shade=c.createLinearGradient(0,0,1280,0);shade.addColorStop(0,'#15213a77');shade.addColorStop(1,'#15213a00');c.fillStyle=shade;c.fillRect(0,0,1280,720);}
}
function rock(x,y,r){shadow(x+2,y+10,r*1.2);poly([[x-r,y+5],[x-r*.75,y-r*.55],[x+r*.1,y-r*.85],[x+r,y-r*.13],[x+r*.65,y+r*.4],[x-r*.45,y+r*.55]],'#7c6874','#a58a8d');poly([[x-r*.75,y-r*.55],[x-r*.1,y],[x+r*.1,y-r*.85],[x+r,y-r*.13],[x-r*.1,y]],'#97808a');}
function panel(x,y,clean=0){
 shadow(x,y+25,90);line([[x-51,y],[x-53,y+34]],'#a8a8b6',6);line([[x+48,y],[x+51,y+34]],'#a8a8b6',6);
 poly([[x-94,y-41],[x+72,y-41],[x+95,y+21],[x-70,y+21]],'#273f62','#b2b8ce');
 for(let row=0;row<3;row++)for(let col=0;col<6;col++){const xx=x-86+col*26+row*7.2,yy=y-34+row*18;poly([[xx,yy],[xx+21,yy],[xx+27,yy+13],[xx+5,yy+13]],clean>=100?'#658eb2':'#4f698a','#a7bfd25c');}
 if(clean<100){c.globalAlpha=(100-clean)/100;poly([[x-94,y-41],[x+72,y-41],[x+95,y+21],[x-70,y+21]],'#bd9684e6');for(let i=0;i<25;i++)ell(x-71+(i*29)%142,y-30+(i*11)%45,2.5,1.3,'#e4c4a67a');c.globalAlpha=1;}
 if(clean>=100){ell(x+76,y+18,5,3,C.mint);line([[x-65,y-34],[x-34,y-34]],'#d4e8f1',1.5);}
}
function habitat(powered=false){
 shadow(1040,441,195);rr(890,293,312,134,35,'#b1adbd','#e0d4dc');rr(902,283,288,116,32,'#d2c5ce','#f0dfe0');rr(922,318,226,43,15,'#adb0c2');
 for(let i=0;i<3;i++){rr(940+i*59,324,40,29,8,'#344a61','#e9d9df');rr(945+i*59,330,30,10,3,powered?'#e8cc94':'#657d96');}
 poly([[938,282],[963,219],[1112,219],[1141,282]],'#ddd0d5','#f1e1dd');poly([[963,219],[985,203],[1091,203],[1112,219]],'#eee0db');line([[1007,222],[1007,280]],'#b3abbf',2);
 rr(1125,327,65,97,15,'#a2a0b4','#e4d6db');rr(1136,338,43,76,12,'#31485f','#a9b5c3');rr(1142,343,30,10,4,'#688297');ell(1169,382,3,3,C.mint);
 rr(890,411,312,16,5,'#8c879e');line([[1048,203],[1048,167],[1098,151]],'#c1b8ce',3);ell(1098,151,7,7,C.lavender);
 text(tr("text088"),1046,272,16,'#817c96');if(!decoration.outpost){const on=reduced||Math.sin(time*1.2)>0;ell(1117,286,4,4,powered&&on?C.mint:'#8093a5');if(decoration.storyScene==='warning'){ell(1117,274,8,6,'#e8b981');c.save();c.translate(1117,274);c.rotate(reduced?-.5:time*7);poly([[0,0],[90,-19],[90,19]],'#ffcf8059');c.restore();}}
}
function dish(){line([[850,320],[850,226]],'#b6b5c5',5);line([[833,319],[867,319]],'#b6b5c5',5);c.save();c.translate(850,221);c.rotate(-.55+(reduced||decoration.outpost?0:Math.sin(time*.17)*.18));c.beginPath();c.ellipse(0,0,33,15,0,0,Math.PI);c.fillStyle='#c7becd';c.fill();line([[-26,0],[26,0]],'#ebe0df',3);line([[0,5],[0,-23]],'#e3d5d6',3);ell(0,-24,4,4,C.mint);c.restore();}
function rover(x,y,moving=false,vx=0){
 c.save();c.translate(x,y);shadow(0,24,52);c.rotate(clamp(vx/1000,-.12,.12));
 for(const xx of [-34,0,34]){rr(xx-10,4,20,27,7,'#2e384e','#a69db4');for(let j=0;j<3;j++)line([[xx-7,10+j*7],[xx+7,10+j*7]],'#6a6982',2);}
 poly([[-48,-7],[-26,-27],[32,-27],[49,-5],[35,12],[-33,12]],'#c3b8cc','#eadfe1');rr(-28,-38,44,32,8,'#e0d2db');rr(-21,-32,30,17,5,'#354d65');line([[-18,-30],[-4,-30]],'#9bb3c9',2);line([[26,-27],[26,-59],[44,-67]],'#c5bbce',3);ell(44,-67,5,5,C.mint);rr(-42,-2,12,5,2,'#efd29f');rr(31,-2,11,5,2,'#efd29f');
 if(moving&&!reduced)for(let i=0;i<3;i++)ell(-49-i*11,20+Math.sin(time*8+i)*3,5+i*3,3+i,'#e3b79e3a');c.restore();
}
function marker(g){if(!g)return;const pulse=reduced?0:Math.sin(time*3)*3;ell(g.x,g.y+8,35+pulse,13,'#b8ecda21');c.beginPath();c.ellipse(g.x,g.y+8,35+pulse,13,0,0,Math.PI*2);c.lineWidth=2;c.strokeStyle='#b8ecda';c.setLineDash([5,6]);c.stroke();c.setLineDash([]);poly([[g.x-6,g.y-25-pulse],[g.x+6,g.y-25-pulse],[g.x,g.y-17-pulse]],C.mint);}
function surface(s){
 const g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,'#2b446a');g.addColorStop(.42,'#a87985');g.addColorStop(1,'#c18c7b');c.fillStyle=g;c.fillRect(0,0,1280,720);
 if(decoration.outpost)ell(155,132,27,18,'#e2bba239');else ambientSky(s);
 poly([[0,341],[128,243],[229,308],[377,218],[527,307],[680,258],[831,318],[1007,237],[1158,303],[1280,261],[1280,720],[0,720]],'#79657e');
 poly([[0,364],[188,313],[377,350],[591,290],[789,346],[973,314],[1280,351],[1280,720],[0,720]],'#9f7788');
 const soil=c.createLinearGradient(0,330,0,720);soil.addColorStop(0,'#af827f');soil.addColorStop(1,'#d69e83');poly([[0,377],[204,344],[405,379],[638,345],[878,375],[1097,353],[1280,388],[1280,720],[0,720]],soil);
 line([[270,609],[464,565],[681,568],[870,498],[1090,435]],'#edbba164',31);line([[270,609],[464,565],[681,568],[870,498],[1090,435]],'#d09b8564',2,[6,12]);
 for(let i=0;i<44;i++)ell((i*173+31)%1280,385+(i*47)%310,2+i%3,1+i%2,'#7d607529');
 dish();
 const foreground=[];
 const item=(base,draw)=>{if(s.player.y<base&&s.scene!=='landing')foreground.push(draw);else draw();};
 if(s.scene!=='connect'||decoration.outpost)item(429,()=>habitat(s.cable||!['walk','clean','connect'].includes(s.scene)));
 const panels=s.panels;
 if(decoration.outpost){
  const outpost=decoration.outpost;

  for(const {id,x,y} of visibleBaseModules(outpost.layout)){
   if(id.startsWith('solar'))item(y+34,()=>panel(x,y,outpost.cleanliness));
   else if(id==='greenhouse')item(y+16,()=>{rr(x-50,y-53,100,64,28,'#a8cac65c','#b9ddd2');for(let i=-1;i<=1;i++){line([[x+i*24,y+1],[x+i*24,y-25]],'#7aa790',3);ell(x+i*24-7,y-18,9,4,'#aad1a3');ell(x+i*24+6,y-27,8,4,'#c4d6a5');}rr(x-55,y+7,110,9,4,'#547b75');});
   else if(id==='shelter')item(y+37,()=>{rr(x-48,y-50,96,63,20,'#c2b9c7','#e2d5d2');rr(x-12,y-27,25,40,10,'#566d82');for(let i=0;i<4;i++){const full=outpost.wallWater>=10*(i+1);rr(x-65+i*35,y+7,29,30,7,full?'#89cbd4cc':'#8c9caa55','#d2e5e257');}});
  }
 }else if(s.scene!=='connect')panels.forEach((p,i)=>item(p.y+34,()=>popAt(s,'panel'+i,p.x,p.y,()=>panel(0,0,['landing','walk'].includes(s.scene)?0:['clean','connect'].includes(s.scene)?p.clean:100))));
 line([[320,600],[321,638]],'#d9c3bd',3);c.strokeStyle='#ead7c46b';c.lineWidth=2;c.setLineDash([6,9]);c.beginPath();c.ellipse(290,599,87,36,0,0,Math.PI*2);c.stroke();c.setLineDash([]);text('H',290,608,30,'#e7d0be84');
 if(s.scene==='landing'){const p=reduced?1:clamp(s.sceneTime/5,0,1);ship(290,90+ease(p)*440,.95,0,p<1);if(p>.8){cat(350+clamp((p-.8)/.2,0,1)*45,589,1.15,true);pip(480,541,.95);}}
 else if(s.scene!=='connect'||decoration.outpost){
  item(565,()=>ship(280,525,.9,0,false));ROCKS.forEach(r=>item(r.y+r.r*.55,()=>rock(r.x,r.y,r.r)));
  if(s.scene==='rover'){
   BEACONS.forEach((b,i)=>{if(i<s.rover.scan){popAt(s,'beacon'+i,b.x,b.y,()=>{ell(0,0,14,14,'#c1ebd57a');line([[-6,0],[-1,5],[7,-5]],'#244d50',3);});}});
   roverGuide(s);rover(s.player.x,s.player.y,Math.hypot(s.player.vx,s.player.vy)>5,s.player.vx);
   const b=BEACONS[s.rover.scan];if(b&&s.rover.progress>0){c.beginPath();c.arc(b.x,b.y,49,-Math.PI/2,-Math.PI/2+Math.PI*2*s.rover.progress);c.strokeStyle=C.mint;c.lineWidth=4;c.stroke();}
  }else{
   const walking=Math.hypot(s.player.vx,s.player.vy)>5;
   if(s.scene==='walk'&&!decoration.outpost)pip(520,490,1);
   else pip(s.buddy.x,s.buddy.y-25,1,['warning','return'].includes(s.scene));
   popAt(s,'player',s.player.x,s.player.y,()=>cat(0,0,1.12,walking,s.player.facing,false,decoration.wave));
   if(s.scene==='clean')for(const p of panels)if(p.clean>0&&p.clean<100){for(let i=0;i<7;i++){const f=(time*.8+i*.13)%1;ell(p.x-60+i*18,p.y-20-f*45,2.4-f,2-f,'#f3d4b8ad');}}
  }
 }
 foreground.forEach(draw=>draw());
 if(!decoration.outpost)marker(goal(s));
 if(decoration.outpost){const o=decoration.outpost;

  for(const r of o.rocks){if(r.found)continue;const d=Math.hypot(r.x-s.player.x,r.y-s.player.y);if(d<rockRevealDistance(o)||r.id===decoration.rockGuide){if(o.perks?.fieldwork)sampleRock(c,copy('fieldworkKinds')[r.id],r.x,r.y,12);else rock(r.x,r.y,12);text('✧',r.x,r.y-22,22,C.mint);if(r.id===decoration.rockGuide)marker(r);}}
 }
 if(s.target){ell(s.target.x,s.target.y,5,3,'#fff0d9a6');}
 if(s.scene==='warning'&&!decoration.outpost){const alert=clamp(s.sceneTime/1.5,0,1);rr(864,255,164,40,12,`rgba(238,194,140,${alert})`);text(tr("text089"),946,281,14,'#664d51');}
}
function doors(x,openness,label,color){rr(x-68,224,136,330,24,'#2b3f59','#97a8bf');rr(x-58,235,116,304,17,'#18334a');
 const w=52*(1-openness);if(w>0){rr(x-55,238,w,299,8,'#9cacc0');rr(x+55-w,238,w,299,8,'#bac2ce');}
 line([[x-71,232],[x-71,535]],color,7);text(label,x,210,15,'#455c74');}
function interior(s){
 const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#293d59');sky.addColorStop(1,'#4c6576');c.fillStyle=sky;c.fillRect(0,0,1280,720);
 rr(48,139,1184,501,55,'#687d92','#a9b6c8');rr(67,156,1146,450,43,'#b0bbc7');rr(81,177,1118,390,32,'#d3d5d6');rr(81,456,1118,121,0,'#7d93a4');
 poly([[81,456],[1199,456],[1199,577],[81,577]],'#8da1ae');for(let i=0;i<10;i++)line([[115+i*110,466],[92+i*114,575]],'#d3ddd929',1.5);line([[82,534],[1198,534]],'#d3ddd92b',1.5);
 for(let i=0;i<6;i++){rr(155+i*175,196,102,9,4,'#f0eee0');}
 if(!decoration.outpost)roomScience(s);
 if(s.scene==='airlock'){
  popAt(s,'outer',290,380,()=>{c.translate(-290,-380);doors(290,s.airlock.outer,tr("text090"),'#eac18f');});doors(988,s.airlock.inner,tr("text091"),C.mint);if(!decoration.outpost)for(const x of [290,988]){c.strokeStyle='#b0c7cf';c.lineWidth=5;c.beginPath();c.ellipse(x,387,77,172,0,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++)ell(x+Math.cos(i*Math.PI/6)*77,387+Math.sin(i*Math.PI/6)*172,3,3,'#e5e5db');}
  rr(556,270,158,94,17,'#4c627a','#b0c1cc');rr(569,282,132,43,8,'#273e58');
  const a=s.airlock;
  if(decoration.outpost)text(a.pressure===100?tr("text092"):tr("text093"),635,349,13,a.pressure===100?C.mint:'#e7e8de');
  cat(585,516,1.45);pip(733,482,1.25);return;
 }

 rr(622,224,551,235,26,'#8da5af','#cbd8d9');rr(648,250,499,199,20,'#afc0c5');
 for(let i=0;i<5;i++){const filled=!decoration.outpost||decoration.outpost.wallWater>i*8;rr(651+i*98,225,83,48,9,filled?'#7ba7ad':'#a9b8bf','#b1d4d1');if(filled)rr(670+i*98,239,45,7,3,'#b5d6d2');}
 rr(639,282,24,151,8,'#7ba7ad');rr(1130,282,24,151,8,'#7ba7ad');
 text(decoration.outpost?tr("text094"):t('upgradeWaterShield'),893,305,16,'#456875');
 rr(147,288,144,99,15,'#8a9caf');rr(159,300,120,59,10,'#375773');line([[176,338],[191,328],[203,341],[219,313],[234,330],[263,320]],C.mint,3);
 rr(167,376,104,12,4,'#c2cad1');
 rr(351,310,141,125,14,'#a8b8bf');for(let i=0;i<3;i++){rr(365,323+i*32,112,23,5,'#869eac');rr(410,331+i*32,20,5,2,'#d7dad6');}
 for(let i=0;i<2;i++){rr(180+i*120,416,54,29,7,'#978d92');line([[207+i*120,415],[207+i*120,370]],'#679285',4);ell(192+i*120,390,19,8,'#88b49a');ell(220+i*120,375,19,8,'#9bc2a8');}
 const finale=['finale','complete'].includes(s.scene);
 if(s.scene==='shelter'){
  cat(decoration.outpost?1000:1080,516,1.18,false,-1,true,true);pip(s.buddy.x,s.buddy.y-25,1.05);cat(s.player.x,s.player.y,1.25,Math.hypot(s.player.vx,s.player.vy)>5,s.player.facing);if(!decoration.outpost){marker(goal(s));waterGate(s);}

 }else if(s.scene!=='power'||decoration.outpost){
  cat(720,526,1.42,false,1,false,finale);cat(957,515,1.2,false,-1,true,finale);pip(1110,493,1.1);
  if(s.scene==='monitor'&&decoration.outpost){
   rr(484,337,152,106,17,'#9faebd','#d5dadc');rr(496,350,128,69,11,'#29445b');
   const read=s.monitor.reading,clr=read===3?C.mint:'#edc48f';
   for(let i=0;i<7;i++){const h=read===3?10:Math.max(8,35-(read===2?i*4:i%3*4));rr(509+i*15,405-h,8,h,3,clr);}
   text(read===3?tr("text095"):read===2?tr("text096"):tr("text097"),560,435,13,read===3?'#325d58':'#695a5d');
  }
  if(finale&&!reduced)for(let i=0;i<24;i++){const f=(time*.12+i*.071)%1;rr(490+(i*47)%610,230+f*300,3+i%3,7,2,[C.mint,C.lavender,'#e9c493'][i%3]);}
 }
}
function popAt(s,id,x,y,draw){const active=!decoration.outpost&&s.feedback?.target===id&&s.feedback.scene===s.scene,p=active?feedbackPose(s.feedback.age,reduced):{scale:1,angle:0};c.save();c.translate(x,y);c.rotate(p.angle);c.scale(p.scale,p.scale);draw();c.restore();}
function ambientSky(s){
 const motion=reduced?0:time;
 for(let i=0;i<3;i++){const x=100+i*390+(motion*6)%200;c.save();c.globalAlpha=.11;ell(x,173+i%2*32,135,10,'#efe1cf');ell(x+95,178+i%2*32,100,7,'#efe1cf');c.restore();}
 for(let i=0;i<18;i++){const x=(i*91+motion*12)%1280,y=335+(i*29)%280;ell(x,y,2,1,'#edd3b725');}
 const x=740+(reduced?0:Math.sin(time*.09)*18);for(let i=0;i<8;i++){const y=318-i*9,sw=12+i*2;line([[x-sw,y],[x+(reduced?0:Math.sin(time*.5+i)*4),y-3],[x+sw,y]],'#ddbc9a17',2);}
}
let sunDrift=0;
function smallSun(s,w,h){
 const storm=s.scene==='warning',narrow=w<700;
 const x=(storm?w*.21:narrow?w*.62:w*.19)+sunDrift;
 const y=storm?h*.235:narrow?85:154;
 const r=narrow?7:12;
 const age=s.sceneTime;
 if(storm){
  const tint=reduced?.27:.3*clamp((age-.32)/1.3,0,1);
  const skyTint=c.createLinearGradient(0,0,0,h*.73);
  skyTint.addColorStop(0,`rgba(245,78,44,${tint})`);
  skyTint.addColorStop(.68,`rgba(234,84,39,${tint})`);
  skyTint.addColorStop(1,'rgba(234,84,39,0)');
  c.fillStyle=skyTint;c.fillRect(0,0,w,h*.73);
 }

 const flash=storm&&!reduced?clamp(Math.min((age-.12)/.36,(1.3-age)/.44),0,1):0;
 const glow=c.createRadialGradient(x,y,r*.2,x,y,r*3);
 glow.addColorStop(0,flash>0?`rgba(255,255,255,${flash})`:'#fff0d894');
 glow.addColorStop(.42,`rgba(255,247,226,${.24+flash*.57})`);
 glow.addColorStop(1,'#fff4dc00');
 ell(x,y,r*3,r*3,glow);
 ell(x,y,r*(1+flash*.28),r*(1+flash*.28),flash>.2?'#fffef8':'#f9e6cb');
 if(!storm)return;
 if(!reduced&&age>=.34&&age<1.65){
  const progress=(age-.34)/1.31;
  c.save();
  c.strokeStyle=`rgba(255,247,218,${.88*(1-progress)})`;c.lineWidth=3;
  c.beginPath();c.arc(x,y,r+progress*Math.hypot(w,h*.5),0,Math.PI*2);c.stroke();
  c.restore();
 }
 if(!reduced&&age<STORM_ARRIVAL)return;
 const elapsed=age-STORM_ARRIVAL;
 const count=reduced?8:54;
 c.save();
 for(let i=0;i<count;i++){
  const phase=(i*.61803398875)%1;
  const lane=(i*.38196601125)%1;
  const p=reduced?.34+phase*.54:((phase+elapsed*(.80+(i%4)*.12))%1);
  const dx=w*(.12+lane*.75)*(i%7===0?-.28:1),dy=h*(-.13+((i*37)%53)/53*.62);
  const size=Math.hypot(dx,dy),tail=Math.min(p, (20+(i%5)*8)/size);
  c.globalAlpha=reduced?.59:(.58+(i%4)*.12)*clamp((STORM_DURATION-age)/.50,0,1);
  line([[x+(p-tail)*dx,y+(p-tail)*dy],[x+p*dx,y+p*dy]],i%3===0?'#fffbe9':'#ffda98',i%4===0?2.5:1.65);
 }
 c.restore();
}
function roomScience(s){
 const storm=['shelter','power'].includes(s.scene)||(s.scene==='monitor'&&s.monitor.reading<3);
 for(const x of [205,441,1091]){c.save();c.beginPath();c.arc(x,267,43,0,Math.PI*2);c.clip();const g=c.createLinearGradient(0,220,0,310);g.addColorStop(0,storm?'#d69173':'#728da3');g.addColorStop(1,'#e9b797');c.fillStyle=g;c.fillRect(x-44,220,88,94);if(storm)for(let i=0;i<4;i++){const y=240+i*15,xx=x-50+((reduced?i*18:time*70+i*23)%95);line([[xx,y],[xx+21,y+5]],'#f9dcc68f',1.5);}c.restore();c.strokeStyle='#849aaf';c.lineWidth=9;c.beginPath();c.arc(x,267,47,0,Math.PI*2);c.stroke();for(let i=0;i<8;i++)ell(x+Math.cos(i*Math.PI/4)*47,267+Math.sin(i*Math.PI/4)*47,2,2,'#e3e0db');}
 line([[112,214],[112,184],[765,184],[765,233]],'#8cb6bd',9);text(t('upgradePipesOxygen'),611,179,16,'#446779');line([[121,226],[121,205],[903,205],[903,230]],'#9cc8d7',6);text(t('upgradePipesWater'),846,198,16,'#446779');
 for(let i=0;i<3;i++){rr(99+i*35,330,25,86,11,'#9fc6cb','#5e8192');rr(106+i*35,322,11,12,3,'#647f92');text(t('upgradePipesOxygen'),111+i*35,374,11,'#416475');}
 rr(321,342,159,97,9,'#78929d');for(let row=0;row<2;row++){rr(331,349+row*43,139,7,3,'#d29de1');c.fillStyle='#ce80df22';c.fillRect(331,356+row*43,139,32);for(let j=0;j<4;j++){const x=347+j*34,y=385+row*43;rr(x-10,y-8,20,11,3,'#8c797d');line([[x,y-8],[x,y-23]],'#5d9176',2);ell(x-5,y-20,7,3,'#92c4a1');ell(x+5,y-25,7,3,'#bad2a6');}}
 for(let i=0;i<4;i++){const on=reduced||Math.sin(time*1.4+i)>-.5;ell(516+i*23,230,4,4,on?'#b4e8ce':'#8097a8');}
}
function waterGate(s){const gate=s.shelter?.gate??0,p=reduced&&gate>0?1:gate;if(p<=0)return;const x=648+(1-p)*500,y=284;popAt(s,'gate',900,390,()=>{c.translate(-900,-390);rr(x,y,497,266,18,'#81c9de27','#bee8eb9c');rr(x+7,y+8,483,250,14,'#b1e0e820','#d7f1ed80');line([[x+16,y+17],[x+16,y+247]],'#c6eff2aa',2);for(let i=0;i<12;i++){const bx=x+30+i*37,by=y+240-((reduced?i*15:time*16+i*23)%200);ell(bx,by,2+i%3,3+i%3,'#d5eff27a');}for(let i=0;i<4;i++){const yy=y+40+i*55;line([[x+8,yy],[x+130,yy+(reduced?0:Math.sin(time+i)*3)],[x+360,yy-2],[x+485,yy]],'#b0e7e72b',2);}text(t('upgradeWaterShield'),x+248,y+236,15,'#e3f4eb');if(p===1)rr(x+462,y+128,15,24,4,C.mint);});}
function roverGuide(s){if(decoration.outpost)return;const opacity=roverGuideOpacity(s,reduced);if(!opacity)return;const {x,y}=s.player,on=reduced||s.sceneTime<2||Math.floor(time*2)%2===0;
 c.save();c.globalAlpha=opacity;
 ell(x,y+27,73,26,'#d9f7d12b');c.strokeStyle='#bbefd7';c.lineWidth=2;c.beginPath();c.ellipse(x,y+27,73,26,0,0,Math.PI*2);c.stroke();
 c.strokeStyle='#fff1b8';c.lineWidth=4;c.globalAlpha=opacity*(on?1:.38);
 c.beginPath();c.roundRect(x-66,y-88,132,126,18);c.stroke();c.globalAlpha=opacity;
 const bob=reduced?0:Math.sin(time*2.4)*5;poly([[x-10,y-116+bob],[x+10,y-116+bob],[x,y-100+bob]],'#fff1b8');text(t('upgradeRoverArrow'),x,y-132+bob,21,'#fff1c4');c.restore();}
function cablePath(a,b,color,on=false){c.save();c.strokeStyle=on?color:'#52677f';c.lineWidth=on?5:4;c.shadowColor=on?color:'transparent';c.shadowBlur=on?8:0;c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x+40,a.y+35,b.x-50,b.y+30,b.x,b.y);c.stroke();c.shadowBlur=0;c.restore();}
function drawMachine(id,x,y,scale,on){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const led=on?C.mint:'#8296a4';
 if(id==='air'){
  rr(-36,-22,50,47,6,'#6d879b','#d6e3e0');rr(-32,-17,38,37,6,'#3a566f');
  ell(-13,1,16,16,'#29445e');
  c.save();c.translate(-13,1);if(on&&!reduced)c.rotate(time*7);
  for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);ell(0,-7,4,8,'#c7d9df');}
  ell(0,0,4,4,'#8fa8b6');c.restore();
  rr(18,-28,21,51,10,'#b7dbe0','#e2f2ed');rr(24,-33,9,7,2,'#748c9e');
  line([[28,-31],[28,-39],[9,-39],[9,-22]],'#7499a7',3);
  text(t('upgradePipesOxygen'),28,2,12,'#32536a');ell(-28,21,2.5,2.5,led);
 }else if(id==='radio'){
  line([[-22,-18],[-22,-39],[-4,-52]],'#5b7a92',3);ell(-4,-52,3,3,'#e3b483');
  poly([[-35,-16],[-24,-24],[33,-24],[35,-16]],'#a0b3bd','#d5e1df');
  rr(-35,-17,70,39,7,'#4d677d','#bacdd5');rr(-28,-9,30,10,3,'#253e54');
  line([[-25,-4],[-4,-4]],on?C.mint:'#d7c298',2);
  for(let i=0;i<3;i++)line([[-27,7+i*4],[-8,7+i*4]],'#adc0c8',1.5);
  ell(18,4,10,10,'#d8b58f');line([[18,4],[21,-2]],'#5c5b61',2);
 }else if(id==='rover'){
  rr(-29,-27,46,53,6,'#73879b','#d2dfe0');rr(-21,-19,26,13,4,'#2d4b63');ell(-10,-13,3,3,led);
  rr(-34,24,61,7,3,'#536e83');
  c.beginPath();c.moveTo(-11,4);c.bezierCurveTo(-11,27,38,27,35,3);
  c.strokeStyle='#344b63';c.lineWidth=4;c.stroke();
  rr(25,-9,20,15,4,'#e1cbb5','#596d7e');line([[29,-9],[29,-16]],'#5d7285',3);line([[40,-9],[40,-16]],'#5d7285',3);
 }else if(id==='heater'){
  rr(-35,-25,70,49,7,'#70889a','#c9d8db');rr(-29,-20,58,39,5,'#584c58');
  for(let i=0;i<4;i++){
   const x=-23+i*13;
   rr(x-2,-17,8,34,4,'#d77e5d');
   line([[x+1,-14],[x+1,13]],'#ffc29b',2);
  }
  rr(-34,24,13,6,3,'#557084');rr(21,24,13,6,3,'#557084');
 }else{
  line([[-39,-28],[39,-28]],'#7c97aa',5);
  for(let i=0;i<3;i++){
   const x=-26+i*26,y=i===1?0:7;
   line([[x,-27],[x,y-15]],'#7893a5',2);rr(x-7,y-17,14,9,3,'#526d82');
   ell(x,y+1,10,12,'#f7df9d');line([[x-4,y+2],[x,y-2],[x+4,y+2]],'#b78c59',1.5);
  }
 }
 c.restore();
}
function drawWorkbench(s,w,h,controls,sceneScale){
 const l=trainingLayout(w,h,s.scene,s.socketOrder),f=s.feedback??{};
 c.save();c.translate(l.left,l.top);
 const mobile=l.narrow,artScale=mobile?.78:1.15;
 if(s.scene==='connect'){
  const x=l.width*.8;

  poly([[x-62,7],[x-46,-20],[x+46,-20],[x+62,7]],'#e2d6d8','#f5e5e0');
  rr(x-62,3,124,l.height+3,18,'#bfb8c6','#ebdbdf');
  line([[x-51,9],[x-51,l.height-5]],'#a49cad',2);
  rr(x-41,14,82,l.height-13,16,'#aab5c0','#e0d7db');
  for(const y of [25,l.height-10])for(const side of [-1,1])ell(x+side*36,y,3,3,'#74879a');
  for(let i=0;i<3;i++)rr(x+28,40+i*(l.height-80)/2,10,15,4,s.cable?'#f4db9b':'#526c83','#d4dcd8');
  text(t('upgradeSocketPanel'),x,9,mobile?12:15,C.ink);
  for(let i=0;i<2;i++){
   const group=l.sources.slice(i*2,i*2+2),x=(group[0].x+group[1].x)/2,y=group[0].y-46;
   c.save();c.translate(x,y);c.scale(mobile?.6:1,mobile?.6:1);panel(0,0,100);c.restore();
   text(t('upgradePanel',{n:i+1}),x,y-35,mobile?12:16,C.cream);
  }
  for(const source of l.sources){
   const target=l.targets.find(p=>p.id===source.id),on=s.cables[source.id],start={x:source.x,y:source.y-45},end=on?target:source;
   cablePath(start,end,source.color,on);
   if(on&&!reduced){const p=(time*.35)%1;ell(start.x+(end.x-start.x)*p,start.y+(end.y-start.y)*p,3,3,'#e8efd6');}
  }
  if(s.cable)rr(x-23,l.height-22,46,7,3,C.mint);
 }else{
  const batteryX=l.width*.16,batteryTop=l.height*.12;
  const batteryBottom=l.sources[1].y+31;
  rr(batteryX-33,batteryTop,66,batteryBottom-batteryTop,14,'#748d9b','#d0d7d8');
  rr(batteryX-15,batteryTop-7,30,8,3,'#a5b7c0');
  rr(batteryX-(mobile?47:62),1,mobile?94:124,26,9,'#203b53');
  text(t('upgradeBatteryLeft',{n:2-Number(s.power.air)-Number(s.power.radio)}),batteryX,19,mobile?12:15,'#fff6e8');
  for(const source of l.sources){
   rr(source.x-21,source.y-28,42,57,8,s.power.ports[source.id]?'#536a7e':'#b3dfc9','#c5e6de');
   const id=s.power.ports[source.id];
   if(id)cablePath(source,l.targets.find(p=>p.id===id),C.mint,true);
  }
  for(const target of l.targets){
   const active=f.target===target.id&&f.scene===s.scene&&f.kind==='happy',pose=active?feedbackPose(f.age,reduced):{scale:1,angle:0};
   c.save();c.translate(target.x,target.y);c.rotate(pose.angle);
   drawMachine(target.id,0,0,artScale*pose.scale,s.power[target.id]);
   c.restore();
   if(s.power[target.id])text(t('upgrade'+target.id[0].toUpperCase()+target.id.slice(1)+'Name'),target.x,target.y+(mobile?36:51),mobile?11:15,C.ink);
  }
 }
 const selected=l.sources.find(p=>p.id===controls?.selected);if(selected&&controls?.drag)cablePath(selected,{x:controls.drag.x-l.left,y:controls.drag.y-l.top},'#fff1c4',true);

 if(s.scene==='power'){
  const floor=l.height+36;
  c.save();c.globalAlpha=1;
  cat(l.width*.17,floor,sceneScale*1.25);
  cat(l.width*.43,floor-2,sceneScale*1.18,false,-1,true);
  pip(l.width*.90,floor-sceneScale*26,sceneScale*1.05);
  c.restore();
 }
 c.restore();}
function pressureDial(s,w,h){const a=s.airlock,x=w/2,y=h*.39,r=Math.min(78,w*.21);popAt(s,'gauge',x,y,()=>{ell(0,0,r+13,r+13,'#6f899f');ell(0,0,r,r,'#263f57');for(let i=0;i<=10;i++){const angle=Math.PI*(1.18+i*.064),xx=Math.cos(angle)*r*.83,yy=Math.sin(angle)*r*.83;line([[xx*.88,yy*.88],[xx,yy]],i>7?C.mint:'#ecc495',2);}const angle=Math.PI*(1.18+a.pressure/100*.64);line([[0,0],[Math.cos(angle)*r*.73,Math.sin(angle)*r*.73]],a.pressure===100?C.mint:'#f0c598',4);ell(0,0,6,6,'#d8ded9');text(t('upgradeMarsOutside'),-r*.41,r*.46,w<700?10:12,'#eec69d','center',r*.72);text(t('upgradeHomeAir'),r*.41,r*.46,w<700?10:12,C.mint,'center',r*.72);ell(r*.85,-r*.72,6,6,a.pressure===100?C.mint:'#ddb488');});
 if(w<700){
  doorStatus(x-r-38,y+5,t('storyOuterDoor'),a.outer);
  doorStatus(x+r+38,y+5,t('storyInnerDoor'),a.inner);
 }
}
function doorStatus(x,y,label,open){
 rr(x-33,y-33,66,83,10,'#263f57','#a7bcca');
 text(label,x,y-17,10,'#f8f4e9');
 rr(x-12,y-10,24,34,4,'#1a3043','#b3c5d2');
 const leaf=10*(1-open);
 if(leaf>0){
  rr(x-10,y-8,leaf,30,2,'#8faab9');
  rr(x+10-leaf,y-8,leaf,30,2,'#b3c5cb');
 }
 text(t(open===1?'storyDoorOpen':open===0?'storyDoorClosed':'storyDoorMoving'),x,y+40,11,open===1?'#ffdcaa':'#c3f4df');
}
function radiationScreen(s,w,h){
 const x=w/2,y=h*.36,width=Math.min(w-38,420),height=Math.min(160,h*.22);
 const {reading,scale}=s.monitor,zoom=[.64,1,1.38][scale]??1;
 const colour=reading===3?C.mint:'#edc48f';
 popAt(s,'monitor',x,y,()=>{
  text(t('upgradeRadiationGame'),0,-height/2-17,14,'#2e536a');
  rr(-width/2,-height/2,width,height,18,'#678598','#c8d9db');
  rr(-width/2+10,-height/2+10,width-20,height-20,10,'#203e54');
  c.save();c.beginPath();c.rect(-width/2+16,-height/2+15,width-32,height-49);c.clip();
  for(let i=0;i<4;i++){
   const gridY=-height/2+28+i*25;
   line([[-width/2,gridY],[width/2,gridY]],'#88acb21d',1);
  }
  c.beginPath();
  for(let i=0;i<=70;i++){
   const xx=-width/2+16+(width-32)*i/70,phase=(reduced?0:time*4)+i*.5;
   let yy;
   if(reading===3)yy=height*.18+Math.sin(phase)*2*zoom;
   else if(reading===2)yy=-height*.19+i/70*height*.34+Math.sin(phase)*4*zoom;
   else yy=-height*.16+(Math.sin(phase*1.7)*13+Math.sin(phase*3.1)*8)*zoom;
   if(i)c.lineTo(xx,yy-12);else c.moveTo(xx,yy-12);
  }
  c.strokeStyle=colour;c.lineWidth=2;c.stroke();
  for(let i=0;i<7;i++)ell(-width/2+30+i*22,-height/2+20,2,2,reduced||Math.sin(time*5+i)>.2?'#e0daac77':'#65839344');
  c.restore();
  rr(-width/2+10,height/2-38,width-20,28,6,'#142a3e');
  text(reading===3?tr('text095'):reading===2?tr('text096'):tr('text097'),0,height/2-19,15,'#fff9e9');
  c.strokeStyle=colour;c.globalAlpha=reduced?.5:.3+Math.sin(time*2)*.08;c.lineWidth=2;
  c.beginPath();c.roundRect(-width/2-5,-height/2-5,width+10,height+10,21);c.stroke();
  c.globalAlpha=1;
 });
}
function feedbackLocation(s,w,h,v){const f=s.feedback;if(!f||f.scene!==s.scene)return null;if(['connect','power'].includes(s.scene)){const l=trainingLayout(w,h,s.scene,s.socketOrder),p=l.targets.find(p=>p.id===f.target);return p?{x:l.left+p.x,y:l.top+p.y}:null;}
 if(f.target==='gauge')return{x:w/2,y:h*.39};if(f.target==='monitor')return{x:w/2,y:h*.36};let p=f.target.startsWith('panel')?s.panels[Number(f.target.slice(5))]:f.target.startsWith('beacon')?BEACONS[Number(f.target.slice(6))]:f.target==='gate'?{x:900,y:390}:f.target==='outer'?{x:290,y:380}:f.target==='hatch'?{x:988,y:400}:s.player;return p?{x:p.x*v.scale+v.ox,y:p.y*v.scale+v.oy}:null;}
function feedbackSparkle(s,p){const age=s.feedback.age,a=Math.max(0,1-age/.7);c.save();c.globalAlpha=a;c.strokeStyle=C.mint;c.lineWidth=2;const r=reduced?30:20+age*42;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.stroke();if(!reduced)for(let i=0;i<6;i++){const ang=i*Math.PI/3,x=p.x+Math.cos(ang)*r,y=p.y+Math.sin(ang)*r;line([[x-3,y],[x+3,y]],'#fff0c7',2);line([[x,y-3],[x,y+3]],'#fff0c7',2);}c.restore();}

let lastView=null;
export function drawScene(canvas,s,{home=false,visualTime=0,reduceMotion=false,suit='#b7a1e4',sticker='',outpost=null,pipSpin=false,wave=false,rockGuide=null,controls=null,flag=currentFlag(),happy=false}={}){
 c=canvas.getContext('2d');time=visualTime;reduced=reduceMotion;C.lavender=suit;decoration={sticker,outpost,pipSpin,wave,rockGuide,controls,flag,happy,storyScene:s?.scene};
 const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(window.devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 c.setTransform(dpr,0,0,dpr,0,0);c.globalAlpha=1;c.clearRect(0,0,w,h);c.fillStyle='#d69e83';c.fillRect(0,0,w,h);
 const view=home?'space':SCENES[s.scene].view,scale=s?.scene==='rover'&&!outpost?Math.max(w/1280,(h-260)/720):Math.max(w/1280,h/720),vw=w/scale;
 let center=640;
 if(vw<1180){
  if(view==='space')center=home?(w<600?850:650):940;
  else if(s.scene==='landing')center=370;
  else if(view==='airlock')center=640;
  else if(s.scene==='warning'&&!outpost)center=reduced?1020:900+Math.sin(clamp(s.sceneTime/STORM_DURATION,0,1)*Math.PI/2)*90;
  else if(['power','monitor','finale','complete'].includes(s.scene))center=830;
  else center=clamp(s.player.x,vw/2,1280-vw/2);
 }
 center=clamp(center,vw/2,1280-vw/2);
 const ox=w/2-center*scale,oy=s?.scene==='rover'&&!outpost?Math.min(h*.56,h-250)-s.player.y*scale:h/2-360*scale;const shake=s&&!outpost?dangerOffset(s.shake?.left??0,s.shake?.strength??0,time,reduceMotion):{x:0,y:0};sunDrift=(ox-(w/2-640*scale))*.3;c.translate(ox+shake.x,oy+shake.y);c.scale(scale,scale);
 if(view==='space')space(s,home,w<600);else if(view==='surface')surface(s);else interior(s);

 if(s&&!home&&!s.completed&&!reduceMotion&&!['connect','power','warning'].includes(s.scene)&&s.sceneTime<.45){c.fillStyle=`rgba(19,33,54,${1-s.sceneTime/.45})`;c.fillRect(-1000,-1000,3300,2700);}
 c.setTransform(dpr,0,0,dpr,0,0);
 if(s&&!outpost){if(view==='surface')smallSun(s,w,h);if(['connect','power'].includes(s.scene))drawWorkbench(s,w,h,decoration.controls,scale);if(s.scene==='airlock')pressureDial(s,w,h);if(s.scene==='monitor')radiationScreen(s,w,h);}
 const g=s&&!home?goal(s):null;
 if(g&&!outpost&&['walk','drive'].includes(SCENES[s.scene].kind)){
  const screenX=g.x*scale+ox,screenY=g.y*scale+oy;
  if(screenX<30||screenX>w-30){const right=screenX>w-30,x=right?w-38:38,y=clamp(screenY,160,h-290);c.fillStyle='#18314ee6';c.beginPath();c.arc(x,y,23,0,Math.PI*2);c.fill();line([[x+(right?-5:5),y-7],[x+(right?3:-3),y],[x+(right?-5:5),y+7]],C.mint,3);}
 }
 const point=s&&!outpost?feedbackLocation(s,w,h,{scale,ox,oy}):null;if(point&&s.feedback?.kind==='happy'&&s.feedback.age<.7)feedbackSparkle(s,point);
 lastView={scale,ox,oy,width:w,height:h,feedbackPoint:point};return lastView;
}
export function toWorld(x,y){return lastView?{x:(x-lastView.ox)/lastView.scale,y:(y-lastView.oy)/lastView.scale}:null;}
