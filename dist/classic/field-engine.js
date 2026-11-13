export const COMMANDS=['forward','left','right'];
export const COMMAND_LIMIT=12;
export const DRIVE_LEVELS=Object.freeze([
 {start:{x:0,y:5,dir:0},flags:[[0,4],[0,2],[2,2]],rocks:[[1,4],[3,3],[4,1]],sand:[[1,3],[3,2],[4,4]],par:6},
 {start:{x:1,y:5,dir:0},flags:[[1,4],[3,3],[3,1]],rocks:[[1,2],[2,4],[4,3],[0,1]],sand:[[2,2],[4,2],[4,4]],par:8},
 {start:{x:5,y:5,dir:3},flags:[[4,5],[2,3],[0,2]],rocks:[[3,4],[2,1],[1,3],[4,2]],sand:[[1,5],[3,2],[1,1]],par:10}
]);
const clone=v=>JSON.parse(JSON.stringify(v));
const at=(points,x,y)=>points.some(p=>p[0]===x&&p[1]===y);
export function runDrive(level,queue){
 const route=typeof level==='number'?DRIVE_LEVELS[level]:level;
 if(!route||!Array.isArray(queue)||queue.length>COMMAND_LIMIT||queue.some(c=>!COMMANDS.includes(c)))return{success:false,reason:'invalid',failStep:0,path:[],flags:[]};
 let rover={...route.start},flags=[],path=[{...rover,step:-1}],reason=null,failStep=null;
 for(let step=0;step<queue.length;step++){
  const cmd=queue[step];if(cmd==='left')rover.dir=(rover.dir+3)%4;else if(cmd==='right')rover.dir=(rover.dir+1)%4;
  else{const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][rover.dir],x=rover.x+dx,y=rover.y+dy;
   if(x<0||x>5||y<0||y>5){reason='edge';failStep=step;break;}
   if(at(route.rocks,x,y)){reason='rock';failStep=step;break;}
   rover.x=x;rover.y=y;
   if(at(route.sand,x,y)){path.push({...rover,step});reason='sand';failStep=step;break;}
   const flag=route.flags.findIndex(p=>p[0]===x&&p[1]===y);if(flag>=0&&!flags.includes(flag))flags.push(flag);
  }
  path.push({...rover,step});
 }
 if(!reason&&flags.length!==route.flags.length){reason='missing';failStep=Math.max(0,queue.length-1);}
 return{success:!reason,reason,failStep,path,flags,rover};
}
export function createCommands(){return{id:'commands',level:0,phase:'editing',queue:[],selected:-1,simUsed:false,ghost:null,sends:0,delay:0,step:0,clock:0,run:null,shown:null,failStep:null,results:[],elapsed:0};}
export function addCommand(s,cmd){if(s.phase!=='editing'||!COMMANDS.includes(cmd)||s.queue.length>=COMMAND_LIMIT)return false;s.queue.push(cmd);s.selected=s.queue.length-1;s.ghost=null;return true;}
export function removeCommand(s,index=s.selected){if(s.phase!=='editing'||!Number.isInteger(index)||index<0||index>=s.queue.length)return false;s.queue.splice(index,1);s.selected=Math.min(index,s.queue.length-1);s.ghost=null;return true;}
export function moveCommand(s,index,delta){const to=index+delta;if(s.phase!=='editing'||!Number.isInteger(index)||![-1,1].includes(delta)||index<0||index>=s.queue.length||to<0||to>=s.queue.length)return false;[s.queue[index],s.queue[to]]=[s.queue[to],s.queue[index]];s.selected=to;s.ghost=null;return true;}
export function testDrive(s){if(s.phase!=='editing'||s.simUsed||!s.queue.length)return false;s.simUsed=true;s.ghost=runDrive(s.level,s.queue);return s.ghost;}
export function sendDrive(s){if(s.phase!=='editing'||!s.queue.length)return false;s.sends++;s.run=runDrive(s.level,s.queue);s.phase='delay';s.delay=4;s.clock=0;s.step=0;s.shown=clone(DRIVE_LEVELS[s.level].start);s.failStep=null;return true;}
export function tickDrive(s,dt){if(!Number.isFinite(dt)||dt<0)return false;s.elapsed+=dt;
 if(s.phase==='delay'){const used=Math.min(s.delay,dt);s.delay-=used;dt-=used;if(s.delay>1e-9)return true;s.delay=0;s.phase='running';}
 if(s.phase!=='running')return false;s.clock+=dt;
 while(s.clock>=.4&&s.phase==='running'){s.clock-=.4;const pose=s.run.path.find(p=>p.step===s.step);if(pose)s.shown=clone(pose);
  if(s.run.failStep===s.step&&s.run.reason!=='missing'){s.failStep=s.step;s.phase='failed';break;}
  s.step++;
  if(s.step>=s.queue.length){if(s.run.success){s.phase='level-result';s.results.push({success:true,cards:s.queue.length,efficient:s.queue.length<=DRIVE_LEVELS[s.level].par,first:s.sends===1,sends:s.sends});}else{s.failStep=s.run.failStep;s.phase='failed';}}
 }
 return true;
}
export function editDrive(s){if(s.phase!=='failed')return false;s.phase='editing';s.shown=null;s.selected=s.failStep;return true;}
export function nextDrive(s){if(s.phase!=='level-result')return false;if(s.level===2){s.phase='complete';return true;}s.level++;Object.assign(s,{phase:'editing',queue:[],selected:-1,simUsed:false,ghost:null,sends:0,run:null,shown:null,failStep:null});return true;}
export function commandsResult(s){const success=s.results.length===3&&s.results.every(r=>r.success),stars=success?1+Number(s.results.every(r=>r.efficient))+Number(s.results.every(r=>r.first)):0;return{success,stars,score:success?300+stars*200:0};}
export const SAMPLE_ROCKS=Object.freeze([
 {id:'pebbles',category:'water',fact:'streambed'}, {id:'layers',category:'water',fact:'jezeroLayers'},
 {id:'holes',category:'lava',fact:'lavaHoles'}, {id:'salt',category:'water',fact:'marsSalt',simplified:true},
 {id:'dark',category:'unknown',fact:'rockContext',simplified:true}, {id:'metal',category:'space',fact:'marsMeteorite',simplified:true}
]);
export const GEO_ROUNDS=Object.freeze([{water:3},{water:1,lava:1,space:1},{water:2,lava:1}]);
export function scoreGeology(round,bag){const needs={...GEO_ROUNDS[round]},seen=new Set();if(!GEO_ROUNDS[round]||!Array.isArray(bag)||bag.length>3)return{score:0,picks:[],valid:false};
 const picks=bag.map(id=>{const rock=SAMPLE_ROCKS.find(r=>r.id===id),valid=!!rock&&!seen.has(id);seen.add(id);const useful=valid&&(needs[rock.category]??0)>0;if(useful)needs[rock.category]--;return{id,useful,category:rock?.category??'unknown'};});
 return{score:picks.filter(p=>p.useful).length,picks,valid:picks.every(p=>SAMPLE_ROCKS.some(r=>r.id===p.id))&&new Set(bag).size===bag.length};
}
export function createGeology(){return{id:'geology',round:0,phase:'choosing',bag:[],selected:null,results:[]};}
export function inspectRock(s,id){if(s.phase!=='choosing'||!SAMPLE_ROCKS.some(r=>r.id===id))return false;s.selected=id;return true;}
export function keepRock(s){if(s.phase!=='choosing'||!s.selected||s.bag.includes(s.selected)||s.bag.length>=3)return false;s.bag.push(s.selected);return true;}
export function leaveRock(s){if(s.phase!=='choosing'||!s.selected)return false;s.bag=s.bag.filter(id=>id!==s.selected);s.selected=null;return true;}
export function submitGeology(s){if(s.phase!=='choosing'||s.bag.length!==3)return false;const result=scoreGeology(s.round,s.bag);if(!result.valid)return false;s.results.push(result);s.phase='round-result';return true;}
export function nextGeology(s){if(s.phase!=='round-result')return false;if(s.round===2){s.phase='complete';return true;}s.round++;s.phase='choosing';s.bag=[];s.selected=null;return true;}
export function geologyResult(s){const points=s.results.reduce((n,r)=>n+r.score,0),stars=Math.floor(points/3),success=s.results.length===3&&stars>0;return{success,stars:success?stars:0,score:success?300+stars*200:0,points};}
export function awardTraining(save,id,result){if(!result?.success||!['commands','geology','solar','rover','power','shelter'].includes(id))return false;save.best??={};const prior=save.best[id]??{};save.best[id]={...prior,success:true,score:Math.max(Number(prior.score)||0,result.score),stars:Math.max(Number(prior.stars)||0,result.stars)};return true;}
