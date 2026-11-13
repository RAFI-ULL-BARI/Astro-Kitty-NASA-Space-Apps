import {t,tr} from './strings.js';

export const TRAINING_MILESTONES=[
  {id:'solar',patch:'sun',title:'trainingSolar',fact:'dust',perk:'perkSolar',icon:'sun'},
  {id:'power',title:'trainingPower',fact:'oxygen',perk:'perkPower',icon:'battery'},
  {id:'shelter',patch:'storm',title:'trainingShelter',fact:'rad',perk:'perkShelter',icon:'shield'},
  {id:'rover',patch:'rover',title:'trainingRover',fact:'geology',perk:'perkRover',icon:'rover'},
];
export function earnedStoryTraining(s){
  return TRAINING_MILESTONES.filter(m=>m.patch?s.patches.includes(m.patch):['monitor','rover','finale','complete'].includes(s.scene)).map(m=>m.id);
}
export function mergeStoryTraining(saved,s){
  const next={...saved,best:{...(saved?.best??{})}};
  for(const id of earnedStoryTraining(s)){
    const prior=next.best[id]??{};
    next.best[id]={...prior,success:true,score:Math.max(Number(prior.score)||0,100),stars:Math.max(Number(prior.stars)||0,1)};
  }
  return next;
}
export const EVENT_SCENES={landing:'walk',storm:'warning',dust:'walk',leak:'power',greenhouse:'shelter',homesick:'shelter',sick:'shelter',dustdevil:'walk',filter:'power',freeze:'shelter',cargo:'walk',ice:'walk',sand:'walk',pebbles:'walk',birthday:'finale',drawings:'shelter',help:'power'};
export function directedOutpostScene(s,kind=''){
  if(!s)return'walk';
  if(kind==='plan')return'power';
  if(s.phase==='complete')return kind==='report'?'finale':'walk';
  if(s.phase==='failed')return kind==='report'?'shelter':'walk';
  const card=s.deck[s.sol-1];
  if(['decision','waiting','result'].includes(s.phase)){
    if(card==='storm'&&s.phase==='result')return'monitor';
    return EVENT_SCENES[card]??'walk';
  }
  if(s.phase==='summary')return kind==='summary'?'shelter':'walk';
  return['walk','power','walk','shelter','power'][(s.sol-1)%5]??'walk';
}

export function storyStartScene(book,fresh=false){return fresh||!book.introSeen?'approach':book.scene&&book.scene!=='complete'?book.scene:'approach';}

const completedSceneCopy=Object.freeze({
  walk:()=>t('storyDoneWalk'),
  clean:()=>tr('text066'),
  connect:()=>tr('text063'),
  return:()=>t('storyDoneReturn'),
  airlock:()=>t('storyDoneAirlock'),
  shelter:()=>t('storyDoneShelter'),
  power:()=>tr('text064'),
  monitor:()=>tr('text054'),
  rover:()=>tr('text065'),
});
export function storyDoneText(scene){
  return Object.hasOwn(completedSceneCopy,scene)?completedSceneCopy[scene]():'';
}

export function storyBadgeBanner(scene,notice,remaining){
  if(scene==='warning'||remaining<=0)return '';
  if(notice?.id==='solar'&&!['connect','return'].includes(scene))return '';
  return notice?.text??'';
}
