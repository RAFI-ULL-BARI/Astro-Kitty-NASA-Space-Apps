import {createOutpost,rng,defaultPlan,previewPlan,confirmPlan,choose,tickReply,showSummary,nextSol,cellsAvailable,choiceAllowed,choiceEffects,sensibleChoice,missionStars} from '../dist/outpost-engine.js';
import {EN} from '../dist/strings.js';
export function simulate(seed,policy='default',options={}){

 const n=Number(seed)>>>0,code=['DUST','NOVA','PAWS','MARS','ORBIT','ROVER'][n%6]+'-'+n.toString(36).toUpperCase().padStart(2,'0');
 const s=createOutpost({code,...options}),random=rng(seed^0x8e21765b);let mornings=0;
 while(!s.outcome){mornings++;let p=defaultPlan(s);
 if(policy==='random'){
  p={air:0,water:0,food:0,shield:0,wall:0};const keys=['air','water','food','shield',null];
  for(let n=0;n<cellsAvailable(s);n++){const k=keys[Math.floor(random()*keys.length)];if(k&&p[k]<6)p[k]++;}
  const walls=[-1,0,1,2].filter(w=>previewPlan(s,{...p,wall:w}).valid);p.wall=walls[Math.floor(random()*walls.length)];
 }else if(policy==='noShield'){p.food+=p.shield;p.shield=0;p.wall=0;}
 else if(policy==='ignoreAir'||policy==='ignoreFood'){const k=policy==='ignoreAir'?'air':'food';p[k]=0;}
 if(!previewPlan(s,p).valid)throw new Error('invalid default '+JSON.stringify({seed,policy,s,p}));
 confirmPlan(s,p);if(s.outcome)break;
 const id=s.deck[s.sol-1];let options=EN.cards[id].choices.filter(c=>choiceAllowed(s,id,c.id));

 let option=policy==='random'?options[Math.floor(random()*options.length)]?.id:options.find(c=>c.id===sensibleChoice(s))?.id??options[0]?.id;
 if(!option)option=EN.cards[id].choices.filter(c=>choiceAllowed(s,id,c.id)).sort((a,b)=>(choiceEffects(s,id,a.id).food||0)-(choiceEffects(s,id,b.id).food||0))[0]?.id;
 choose(s,option);for(let n=0;n<7;n++)tickReply(s,1);if(s.outcome)break;showSummary(s);nextSol(s);
 }
 return {s,mornings};
}
