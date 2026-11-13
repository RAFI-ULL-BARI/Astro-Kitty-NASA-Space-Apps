export const PLAN_STEPS=Object.freeze(['day','push','path','gear']);
export const PUSHES=Object.freeze(['little','right','extra']);
export const PATHS=Object.freeze(['straight','curved']);
export const GEAR=Object.freeze(['shield','chute','rockets','airbags','wings']);
export const REQUIRED_GEAR=Object.freeze(GEAR.slice(0,3));
export const INTRO_SECONDS=10;
export const REPLAY_SECONDS=3;
export const FLIGHT_SPEED=4;

export function launchWindow(seed=0){
  let value=seed>>>0;
  value=Math.imul(value^(value>>>16),0x45d9f3b);
  value=Math.imul(value^(value>>>16),0x45d9f3b);
  value=(value^(value>>>16))>>>0;
  return {rightDay:value%3,orientation:(value/2**32)*Math.PI*2};
}

export function launchAngles(window,day){
  const earth=window.orientation+day*2.85;
  const mars=earth+Math.PI/4+(window.rightDay-day)*1.37;
  return {earth,mars};
}

export function emptyPlan(){return {day:null,push:null,path:null,gear:[]};}
export function stepReady(plan,step){
  if(step==='day')return Number.isInteger(plan.day)&&plan.day>=0&&plan.day<3;
  if(step==='push')return PUSHES.includes(plan.push);
  if(step==='path')return PATHS.includes(plan.path);
  return step==='gear'&&Array.isArray(plan.gear)&&plan.gear.length===3
    &&new Set(plan.gear).size===3&&plan.gear.every(item=>GEAR.includes(item));
}
export function planReady(plan){return PLAN_STEPS.every(step=>stepReady(plan,step));}

export function flightFor(plan,window){
  if(!planReady(plan))return null;
  let outcome='success',mistake=null,missing=null;
  if(plan.push!=='right'){
    outcome=plan.push==='little'?'fallBack':'tooFast';
    mistake='push';
  }else if(plan.day!==window.rightDay){
    outcome='wrongDay';mistake='day';
  }else if(plan.path==='straight'){
    outcome='straightMiss';mistake='path';
  }else{
    missing=REQUIRED_GEAR.find(item=>!plan.gear.includes(item))??null;
    if(missing){outcome=missing==='shield'?'burnUp':'hardLanding';mistake='gear';}
  }

  const stages=[{id:'liftoff',seconds:outcome==='fallBack'?13:10}];
  if(outcome!=='fallBack')stages.push({id:'cruise',seconds:21});
  if(outcome==='success'||mistake==='gear')stages.push({id:'landing',seconds:14});

  let seconds=0;
  const timeline=stages.map(stage=>{
    const start=seconds;
    seconds+=stage.seconds;
    return {...stage,start,end:seconds};
  });
  return {outcome,mistake,missing,timeline,seconds};
}

export function flightFrame(flight,time){
  const clock=Math.min(flight.seconds,Math.max(0,time));
  const stage=flight.timeline.find(item=>clock<item.end)??flight.timeline.at(-1);
  return {...stage,elapsed:clock-stage.start,progress:(clock-stage.start)/stage.seconds};
}

export function recordFailure(failures,flight){
  const step=flight.mistake;
  return step?{...failures,[step]:(failures[step]??0)+1}:failures;
}
export function retryPlan(plan,flight){
  const step=flight.mistake;
  if(!step)return plan;
  const value=step==='gear'?plan.gear.filter(item=>REQUIRED_GEAR.includes(item)):null;
  return {...plan,[step]:value};
}
export function hintChoices(failures,step,window){
  if((failures[step]??0)<2)return [];
  if(step==='day')return [window.rightDay];
  if(step==='push')return ['right'];
  if(step==='path')return ['curved'];
  return [...REQUIRED_GEAR];
}
