import {copy,t} from './strings.js';
import {truthBadge} from './outpost-presentation.js';
import {
  PLAN_STEPS,PUSHES,PATHS,GEAR,INTRO_SECONDS,REPLAY_SECONDS,FLIGHT_SPEED,
  launchWindow,launchAngles,emptyPlan,stepReady,planReady,flightFor,flightFrame,
  recordFailure,retryPlan,hintChoices
} from './launch-engine.js';

const WORDS=copy('launch');
const DAY_IDS=[0,1,2];
const STEP_ICONS={day:'☀',push:'↑',path:'↷',gear:'◈'};
const PARTS={
 little:'<path d="M13 34h22m-11-5V14m-5 5 5-5 5 5"/>',
 right:'<path d="M13 34h22m-11-5V10m-6 6 6-6 6 6"/><path d="m18 24 6-6 6 6"/>',
 extra:'<path d="M13 34h22M24 29V5m-7 7 7-7 7 7m-14 8 7-7 7 7m-14 8 7-7 7 7"/>',
 straight:'<circle cx="38" cy="12" r="6" fill="#e8a687"/><path d="m7 33 23-15m-9 1 9-1-2 9"/>',
 curved:'<circle cx="37" cy="10" r="6" fill="#e8a687"/><path d="M7 35Q10 8 28 12m-6-6 6 6-7 4"/>',
 shield:'<path d="M24 6 40 13v10q-3 12-16 17-13-5-16-17V13Z" fill="#d9ab86"/><path d="m24 13 9 4v8l-9 7"/>',
 chute:'<path d="M4 20a20 15 0 0 1 40 0H4l20 17 20-17M15 20q0-15 9-15 9 0 9 15M24 20v17"/>',
 rockets:'<path d="M10 28V15l5-8 5 8v13zm18 0V15l5-8 5 8v13z" fill="#aac5d6"/><path stroke="#fac386" d="m11 31 4 7 4-7m10 0 4 7 4-7"/>',
 airbags:'<circle cx="17" cy="27" r="12" fill="#d9a98e"/><circle cx="32" cy="27" r="12" fill="#d9a98e"/><circle cx="24" cy="15" r="11" fill="#e8c2a9"/>',
 wings:'<path d="m24 5 4 13 16 12v5l-17-6-3 9-3-9-17 6v-5l16-12Z" fill="#b8b5d5"/>'
};
function picture(id,day,window){
  const content=id==='day'?(()=>{
    const {earth,mars}=launchAngles(window,day);
    const cx=24,cy=22;
    return `<circle cx="${cx}" cy="${cy}" r="17" stroke="#c9877d"/><circle cx="${cx}" cy="${cy}" r="11" stroke="#90b8cb"/><circle cx="${cx}" cy="${cy}" r="4" fill="#ffcc89"/><circle cx="${cx+11*Math.cos(earth)}" cy="${cy-11*Math.sin(earth)}" r="4" fill="#8ed8db"/><circle cx="${cx+17*Math.cos(mars)}" cy="${cy-17*Math.sin(mars)}" r="3.5" fill="#e8a687"/>`;
  })():PARTS[id];
  return `<svg viewBox="0 0 48 44" fill="none" stroke="#e4ede9" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${content}</svg>`;
}
const format=(text,values)=>text.replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');
const choicesFor=step=>({day:DAY_IDS,push:PUSHES,path:PATHS,gear:GEAR})[step];
const nextStep=step=>PLAN_STEPS[PLAN_STEPS.indexOf(step)+1];

export function createLaunchSimulator(root,{speak,stopVoice,unlock,celebrate,arrive,isReduced,showCaptions}){
  let active=false,mode='intro',step='day',plan,window,failures,flight,clock=0,preview=0;
  let viewedDay=1,mapDay=1,mapGoal=1,speed=1,factIndex=0,line='',spoken='',finishedFrame=null;
  const byId=id=>root.querySelector('#'+id);
  const say=(key)=>{
    line=WORDS.pip[key];
    spoken=key;
    byId('launchPip').textContent=line;
    speak(line);
  };
  const failureLine=()=>{
    if(flight.outcome!=='hardLanding')return WORDS.pip[flight.outcome];
    const key=plan.gear.includes('airbags')?'airbags':plan.gear.includes('wings')?'wings':flight.missing;
    return [WORDS.pip[flight.missing],key===flight.missing?'':WORDS.pip[key]].filter(Boolean).join(' ');
  };
  const describe=key=>{
    byId('launchCanvas').setAttribute('aria-label',WORDS.descriptions[key]);
    byId('launchDescription').textContent=WORDS.descriptions[key];
  };
  const choiceName=(id)=>typeof id==='number'?format(WORDS.dayName,{n:id+1}):WORDS.choices[id];
  const currentValue=id=>id==='gear'?plan.gear.map(choiceName).join(', '):stepReady(plan,id)?choiceName(plan[id]):'';
  const factMarkup=(line,url)=>`${truthBadge('real')} <span>${line}</span> <a href="${url}" target="_blank" rel="noopener">${t('source')}</a>`;
  function setViewedDay(value){
    viewedDay=Number(value);mapGoal=viewedDay;
    const {earth,mars}=launchAngles(window,viewedDay);
    const degrees=Math.round((mars-earth)*180/Math.PI);
    byId('launchDial')?.setAttribute('aria-valuetext',format(degrees<0?WORDS.behind:WORDS.ahead,{n:viewedDay+1,angle:Math.abs(degrees)}));
  }
  function render({focus=null}={}){
    const picking=mode==='plan',running=mode==='flight'||mode==='replay',result=mode==='result';
    const done=result&&flight.outcome==='success';
    const title=mode==='intro'?WORDS.title:picking?WORDS.steps[step]:result?done?WORDS.success:WORDS.ended:'';
    const needed=hintChoices(failures,step,window);
    const action=done?WORDS.continue:result?WORDS.retry:picking&&planReady(plan)?WORDS.launch:WORDS.next;
    root.dataset.mode=mode;
    root.dataset.step=picking?step:'';
    root.dataset.outcome=result?flight.outcome:'';
    root.innerHTML=`
      <header class="launch-head"><h1 tabindex="-1">${title}</h1>
        ${picking?`<button class="launch-icon" data-act="fact" aria-label="${WORDS.about}" aria-haspopup="dialog">ⓘ</button>`:''}
      </header>
      <div class="launch-art"><canvas id="launchCanvas" role="img"></canvas>
        <div class="launch-art-tools"><span id="launchClock" class="launch-clock hidden" aria-hidden="true"></span>
         <div class="launch-flight-controls">
          ${running?`<button class="launch-icon" data-act="speed" aria-label="${speed===1?WORDS.speed:WORDS.normal}" aria-pressed="${speed>1}">⏩</button>`:''}
          ${mode==='intro'||running?`<button class="launch-icon" data-act="skip">${WORDS.skip}</button>`:''}
         </div>
        </div>
      </div>
      <div class="launch-input">
       ${picking&&step==='day'?`<label class="launch-time"><span class="dial-mark" aria-hidden="true">◷</span><input id="launchDial" type="range" min="0" max="2" step="1" value="${viewedDay}" aria-label="${WORDS.pickDay}"></label>`:''}
       ${picking?`<div class="launch-options" style="--options:${choicesFor(step).length}" role="group" aria-label="${WORDS.steps[step]}">${choicesFor(step).map(id=>{
          const chosen=step==='gear'?plan.gear.includes(id):plan[step]===id;
          const text=step==='day'?String(id+1):step==='gear'?WORDS.gearLabels[id]:choiceName(id);
          return `<button class="launch-choice" data-choice="${id}" data-hint="${needed.includes(id)}" aria-label="${choiceName(id)}" aria-pressed="${chosen}">${picture(step==='day'?'day':id,id,window)}<span>${text}</span></button>`;
        }).join('')}</div>`:''}
       ${result?`<div class="launch-result">${done?`<div class="launch-result-fact" id="launchResultFact">${factMarkup(WORDS.facts[factIndex].line,WORDS.facts[factIndex].url)}<button class="launch-icon" data-act="next-fact" aria-label="${WORDS.fact}">↻</button></div>`:`<p>${WORDS.safe}</p>`}</div>`:''}
       <p id="launchGame" class="launch-note hidden">${WORDS.game}</p>
      </div>
      <div class="launch-pip-row"><span class="launch-bot" aria-hidden="true"><i></i><i></i></span><p id="launchPip" class="launch-pip" aria-live="polite"></p></div>
      <div class="launch-plan" role="group" aria-label="${WORDS.plan}">
       ${PLAN_STEPS.map(id=>`<button class="launch-step" data-step="${id}" data-ready="${stepReady(plan,id)}" data-mistake="${result&&flight.mistake===id}" ${picking&&step===id?'aria-current="step"':''} ${picking||result&&!done?'':'disabled'} aria-label="${format(stepReady(plan,id)?WORDS.chosen:WORDS.unchosen,{step:WORDS.steps[id],choice:currentValue(id)})}"><span class="step-glyph" aria-hidden="true">${stepReady(plan,id)?'✓':STEP_ICONS[id]}</span><small aria-hidden="true">${(WORDS.stepShort??WORDS.steps)[id]}</small></button>`).join('')}
       ${picking||result?`<button class="primary" data-act="advance" ${picking&&!planReady(plan)&&!stepReady(plan,step)?'disabled':''}>${action}</button>`:'<span></span>'}
      </div>
      <span class="sr-only" id="launchDescription" role="status"></span>
      <span class="sr-only" id="launchSelection" role="status"></span>
      <dialog class="launch-fact" id="launchFact" aria-label="${WORDS.about}"></dialog>`;
    byId('launchPip').textContent=line;
    if(picking&&step==='day')setViewedDay(viewedDay);
    if(focus)root.querySelector(focus)?.focus({preventScroll:true});
  }
  function selectStep(next){
    mode='plan';step=next;clock=0;preview=0;
    if(next==='day'){
      viewedDay=plan.day??1;mapDay=mapGoal=viewedDay;
    }
    render({focus:'.launch-head h1'});
    describe(next);say(next);
  }
  function openFlight(){
    flight=flightFor(plan,window);
    if(!flight)return;
    mode='flight';clock=0;speed=1;finishedFrame=null;
    render({focus:'[data-act="speed"]'});
    describe('liftoff');say('liftoff');
  }
  function result(){
    mode='result';clock=0;
    if(flight.mistake)failures=recordFailure(failures,flight);
    render({focus:'.launch-head h1'});
    describe(flight.outcome);
    if(flight.mistake){
      spoken='failure';
      line=failureLine();byId('launchPip').textContent=line;speak(line);
    }else{
      say('success');celebrate();
    }
  }
  function openFact(){
    const dialog=byId('launchFact');
    dialog.innerHTML=`<p>${factMarkup(WORDS.terms[step],WORDS.termsLinks[step])}</p><button class="launch-icon" data-act="close-fact">${t('close')}</button>`;
    stopVoice();dialog.showModal();
    dialog.addEventListener('close',()=>{
      root.querySelector('[data-act="fact"]')?.focus({preventScroll:true});
    },{once:true});
  }
  function choose(id){
    const previous=step==='gear'?plan.gear:[];
    if(step==='gear'){
      if(previous.includes(id))plan.gear=previous.filter(item=>item!==id);
      else if(previous.length<3)plan.gear=[...previous,id];
      else{byId('launchSelection').textContent=WORDS.gearFull;return;}
    }else{
      plan[step]=id;preview=0;
      if(step==='day'){viewedDay=id;mapGoal=id;}
    }
    render({focus:`[data-choice="${id}"]`});describe(step);
    if(step==='gear')byId('launchSelection').textContent=format(WORDS.gearCount,{n:plan.gear.length});
  }
  root.addEventListener('input',event=>{
    if(event.target.id==='launchDial')setViewedDay(event.target.value);
  });
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button||button.disabled||!active)return;
    unlock();
    if(button.dataset.choice!==undefined&&mode==='plan'){
      choose(step==='day'?Number(button.dataset.choice):button.dataset.choice);
      return;
    }
    if(button.dataset.step){
      const next=button.dataset.step;
      if(mode==='result'&&flight.mistake&&next===flight.mistake)plan=retryPlan(plan,flight);
      selectStep(next);return;
    }
    switch(button.dataset.act){
      case 'fact':openFact();break;
      case 'close-fact':byId('launchFact').close();break;
      case 'next-fact':{
        factIndex=(factIndex+1)%WORDS.facts.length;
        const fact=WORDS.facts[factIndex];
        byId('launchResultFact').innerHTML=factMarkup(fact.line,fact.url)+
          `<button class="launch-icon" data-act="next-fact" aria-label="${WORDS.fact}">↻</button>`;
        root.querySelector('[data-act="next-fact"]').focus({preventScroll:true});
        break;
      }
      case 'skip':
        if(mode==='intro')selectStep('day');
        else if(mode==='flight'||mode==='replay'){finishedFrame=flightFrame(flight,flight.seconds);result();}
        break;
      case 'speed':
        speed=speed===1?FLIGHT_SPEED:1;
        button.setAttribute('aria-pressed',String(speed>1));
        button.setAttribute('aria-label',speed>1?WORDS.normal:WORDS.speed);
        break;
      case 'advance':
        if(mode==='result'){
          if(!flight.mistake){active=false;root.classList.add('hidden');arrive();break;}
          plan=retryPlan(plan,flight);selectStep(flight.mistake);
        }else if(planReady(plan))openFlight();
        else if(nextStep(step))selectStep(nextStep(step));
        else selectStep(PLAN_STEPS.find(item=>!stepReady(plan,item)));
        break;
    }
  });
  function tick(seconds,paused){
    if(!active)return;
    const running=!paused&&!byId('launchFact')?.open;
    if(running){
      clock+=seconds*(mode==='flight'||mode==='replay'?speed:1);
      preview=Math.min(2,preview+seconds);
      mapDay+= (mapGoal-mapDay)*Math.min(1,seconds*6);
      if(mode==='intro'&&clock>=INTRO_SECONDS)selectStep('day');
      if(mode==='flight'&&clock>=flight.seconds){
        finishedFrame=flightFrame(flight,flight.seconds);
        if(!flight.mistake)result();
        else{
          mode='replay';clock=0;
          render({focus:'[data-act="skip"]'});
          say('try');describe(flight.outcome);
        }
      }else if(mode==='replay'&&clock>=REPLAY_SECONDS)result();
    }
    const reduced=isReduced(),frame=mode==='flight'?flightFrame(flight,clock):mode==='replay'?
      flightFrame(flight,flight.seconds-REPLAY_SECONDS+clock):mode==='result'?finishedFrame:null;
    if(frame&&mode==='flight'&&spoken!==frame.id){
      say(frame.id);describe(frame.id);
    }
    const month=mode==='flight'&&frame?.id==='cruise'?Math.min(7,1+Math.floor(frame.progress*7)):0;
    const label=month?format(WORDS.month,{n:month}):mode==='replay'?WORDS.replay:
      mode==='flight'&&frame?.id==='liftoff'&&frame.elapsed<3?String(3-Math.floor(frame.elapsed)):'';
    root.dataset.flightStage=frame?.id??'';
    const status=byId('launchClock');
    if(status.textContent!==label)status.textContent=label;
    status.classList.toggle('hidden',!label);
    byId('launchGame').classList.toggle('hidden',!month);
    byId('launchPip').classList.toggle('hidden',!showCaptions());
    drawLaunch(byId('launchCanvas'),{mode,step,plan,window,mapDay:reduced?mapGoal:mapDay,clock,preview,flight,frame,reduced});
  }
  return {
    get active(){return active;},
    get factOpen(){return !!byId('launchFact')?.open;},
    start(seed){
      active=true;mode='intro';step='day';plan=emptyPlan();window=launchWindow(seed);
      failures={};clock=0;preview=0;viewedDay=mapDay=mapGoal=1;speed=1;factIndex=0;line='';spoken='';flight=null;
      root.classList.remove('hidden');render({focus:'.launch-head h1'});
      describe('intro');say('intro');tick(0,false);
    },
    repeat(){if(line)speak(line);},
    focus(){root.querySelector('[data-act="advance"]:not(:disabled),[data-act="skip"],.launch-head h1')?.focus({preventScroll:true});},
    tick
  };
}

const TAU=Math.PI*2;
const outcomeFrom=state=>state.flight?.outcome;
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const mix=(from,to,p)=>from+(to-from)*p;
const smooth=p=>{p=clamp(p);return p*p*(3-2*p);};
function ellipse(ctx,x,y,rx,ry,fill,stroke){
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}
}
function path(ctx,points,colour,width=2){
  ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
}
function polygon(ctx,points,colour){
  ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();ctx.fillStyle=colour;ctx.fill();
}
function label(ctx,value,x,y,colour='#fff0db'){
  ctx.fillStyle=colour;ctx.font='600 15px system-ui';ctx.textAlign='center';ctx.fillText(value,x,y);
}
function gradient(ctx,w,h,top,bottom){
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,top);sky.addColorStop(1,bottom);
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
}
function stars(ctx,w,h,opacity=1){
  ctx.save();ctx.globalAlpha=opacity;
  for(let i=0;i<83;i++){
    const x=((i*173+25)%997)/997*w,y=((i*97+11)%491)/491*h;
    const r=i%8===0?1.5:.7;
    ellipse(ctx,x,y,r,r,i%3===0?'#bedfdd':'#d8c6d4');
  }
  ctx.restore();
}
function planet(ctx,x,y,r,kind,ghost=false){
  const earth=kind==='earth';
  if(ghost){
    ctx.save();ctx.setLineDash([3,4]);ellipse(ctx,x,y,r,r,'#f2b08b25','#ffc6a4');
    ctx.restore();return;
  }
  const light=ctx.createRadialGradient(x-r*.3,y-r*.35,1,x,y,r);
  light.addColorStop(0,earth?'#9ad9e0':'#f6b596');
  light.addColorStop(1,earth?'#4c83a3':'#b66b63');
  ellipse(ctx,x,y,r+4,r+4,earth?'#96e0f027':'#efad9226');
  ellipse(ctx,x,y,r,r,light);
  ctx.save();ctx.clip();
  if(earth){
    polygon(ctx,[[x-r,y-r*.4],[x-r*.4,y-r*.75],[x+r*.25,y-r*.45],[x+r*.37,y-r*.05],[x,y+r*.16],[x-r*.39,y+r*.02]],'#a2ceb0');
    polygon(ctx,[[x+r*.5,y+r*.02],[x+r*.92,y+r*.32],[x+r*.47,y+r*.67],[x+r*.18,y+r*.37]],'#80bdab');
  }else{
    ellipse(ctx,x-r*.25,y+r*.25,r*.62,r*.24,'#984e6260');
    ellipse(ctx,x+r*.38,y-r*.24,r*.29,r*.17,'#f7ccad66');
  }
  ctx.restore();
}
function rocket(ctx,x,y,size,{angle=0,flame=0,heat=0,hatch=0}={}){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size,size);
  if(heat>0){
    ellipse(ctx,0,12,30,31,`rgba(249,145,71,${heat*.25})`);
    ellipse(ctx,0,19,23,17,`rgba(255,170,93,${heat*.38})`);
  }
  if(flame>0){
    polygon(ctx,[[-9,22],[0,23+29*flame],[9,22]],'#eaaa76');
    polygon(ctx,[[-5,22],[0,23+18*flame],[5,22]],'#fff0ae');
  }
  polygon(ctx,[[-13,7],[-28,24],[-9,23]],'#ab9cc1');
  polygon(ctx,[[13,7],[28,24],[9,23]],'#ab9cc1');
  ctx.beginPath();ctx.moveTo(-13,23);ctx.bezierCurveTo(-22,-2,-16,-23,0,-35);
  ctx.bezierCurveTo(16,-23,22,-2,13,23);ctx.closePath();ctx.fillStyle='#e6dce2';ctx.fill();
  polygon(ctx,[[-10,-22],[0,-35],[10,-22]],'#d59e9e');
  ellipse(ctx,0,-7,9,9,'#3a566f','#f5e9db');
  if(hatch>0){
    ctx.fillStyle='#3a566f';ctx.fillRect(-7,7,14,16);
    ellipse(ctx,0,14,5,5,'#edbb96');
    polygon(ctx,[[-5,13],[-5,8],[-1,11],[1,11],[5,8],[5,13]],'#edbb96');
  }else{
    ctx.fillStyle='#94adbf';ctx.fillRect(-6,8,12,10);
  }
  ctx.restore();
}
function parachute(ctx,x,y,size){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  path(ctx,[[-31,-39],[0,-13],[31,-39]],'#efe1cf',1.5);
  ctx.beginPath();ctx.ellipse(0,-39,32,17,0,Math.PI,TAU);
  ctx.lineTo(-32,-39);ctx.fillStyle='#f1ceb0';ctx.fill();
  path(ctx,[[-32,-39],[32,-39]],'#b88189',2);
  path(ctx,[[-17,-39],[-10,-51],[0,-56],[10,-51],[17,-39]],'#b88189',1.5);
  ctx.restore();
}
function orbitArt(ctx,w,h,s){
  gradient(ctx,w,h,'#172c48','#3b3754');stars(ctx,w,h,.65);
  const cx=w*.5,cy=h*.52,outer=Math.min(w*.32,h*.41),inner=outer*.65;
  const point=(a,r)=>[cx+Math.cos(a)*r,cy-Math.sin(a)*r];
  ellipse(ctx,cx,cy,outer,outer,null,'#c78e8d81');
  ellipse(ctx,cx,cy,inner,inner,null,'#9bc8d392');
  const glow=ctx.createRadialGradient(cx,cy,5,cx,cy,42);
  glow.addColorStop(0,'#f9d4a2');glow.addColorStop(1,'#eec18400');
  ellipse(ctx,cx,cy,42,42,glow);ellipse(ctx,cx,cy,17,17,'#f6cc88');

  const frame=s.frame;
  const intro=s.mode==='intro';
  const launchDay=intro?(s.reduced?1:s.clock*.09):s.step==='day'&&s.mode==='plan'?s.mapDay:(s.plan.day??1);
  const {earth,mars}=launchAngles(s.window,launchDay);
  const progress=frame?.progress??0;
  const frozen=s.reduced&&frame&&s.mode!=='result'?Math.min(.9,.25+Math.floor(progress*3)*.33):progress;
  const cruiseProgress=outcomeFrom(s)==='tooFast'?Math.min(1,frozen/.78):frozen;
  const movingMars=frame?cruiseProgress*Math.PI*.75:0;
  const earthPoint=point(earth+(frame?frozen*4.4:0),inner);
  const marsPoint=point(mars+movingMars,outer);
  const launchPoint=point(earth,inner),oldMars=point(mars,outer);
  const target=point(earth+Math.PI,outer);
  const outcome=outcomeFrom(s);
  const straight=s.plan.path==='straight'&&(!frame||outcome==='straightMiss');
  const routeAt=p=>{
    if(straight)return [mix(launchPoint[0],oldMars[0],p),mix(launchPoint[1],oldMars[1],p)];
    if(outcome==='wrongDay'&&p>.76){
      const u=smooth((p-.76)/.24),tip=point(earth+Math.PI*.76,outer*.89);
      const [x,y]=earthPoint;
      return [mix(tip[0],x,u),mix(tip[1],y,u)+Math.sin(u*Math.PI)*outer*.35];
    }
    const over=outcome==='tooFast'?Math.max(0,p-.78)*1.9:0;
    return point(earth+Math.PI*(outcome==='tooFast'?Math.min(1,p/.78):p)+over,mix(inner,outer,smooth(p))+over*outer*.47);
  };
  if(!intro){
    ctx.save();ctx.setLineDash([4,6]);
    path(ctx,Array.from({length:61},(_,i)=>routeAt(i/60)),'#fff0b999',2);
    ctx.restore();
    if((s.mode==='plan'&&['day','path'].includes(s.step))||frame)planet(ctx,...(frame&&outcome==='straightMiss'?oldMars:point(mars+Math.PI*.75,outer)),10,'mars',true);
    if(s.step==='day'&&s.mode==='plan'){
      ctx.save();ctx.setLineDash([3,5]);
      path(ctx,[[cx,cy],launchPoint],'#9edbd199',1.5);
      path(ctx,[[cx,cy],oldMars],'#efb199aa',1.5);
      ctx.restore();

      const gap=mars-earth;
      ctx.beginPath();ctx.arc(cx,cy,outer*.36,-earth,-mars,gap>0);
      ctx.lineWidth=3;ctx.strokeStyle='#f6ce96';ctx.stroke();
      ellipse(ctx,...target,5,5,null,'#f6ce96');
    }
  }
  planet(ctx,...earthPoint,13,'earth');
  planet(ctx,...marsPoint,11,'mars');
  ctx.save();ctx.font='700 13px DM Sans, Avenir Next, sans-serif';ctx.textAlign='center';ctx.fillStyle='#d9f3ea';ctx.fillText(WORDS.labels?.earth??'Earth',earthPoint[0],earthPoint[1]-20);ctx.fillStyle='#ffd0b8';ctx.fillText(WORDS.labels?.mars??'Mars',marsPoint[0],marsPoint[1]-18);ctx.restore();
  if(frame){
    const p=routeAt(frozen),q=routeAt(Math.max(0,frozen-.02));
    rocket(ctx,...p,.42,{angle:Math.atan2(p[1]-q[1],p[0]-q[0])+Math.PI/2,flame:.45});
  }
}
function landscape(ctx,w,h,mars=false,night=0){
  gradient(ctx,w,h,mars?'#523f65':night>.55?'#10213b':'#41698d',mars?'#deab8c':night>.55?'#36516b':'#afced5');
  if(night>.28)stars(ctx,w,h,Math.min(1,night));
  const ground=h*.80;
  polygon(ctx,[[0,ground],[0,h*.63],[w*.17,h*.49],[w*.34,h*.67],[w*.53,h*.59],[w*.70,h*.47],[w,h*.66],[w,ground]],mars?'#9d7082':'#647e91');
  polygon(ctx,[[0,ground],[w*.27,h*.69],[w*.51,h*.74],[w*.75,h*.65],[w,ground],[w,h],[0,h]],mars?'#b5847c':'#769d9a');
  ctx.fillStyle=mars?'#bf8d7f':'#8aa99d';ctx.fillRect(0,ground,w,h-ground);
  return ground;
}
function dust(ctx,x,y,progress,colour){
  ctx.save();ctx.globalAlpha=(1-progress)*.64;
  for(let i=0;i<19;i++){
    const spread=(i%2===0?-1:1)*(7+i*4)*progress;
    ellipse(ctx,x+spread,y-Math.sin(i*.7)**2*progress*28,6+i%5,3+i%4,colour);
  }
  ctx.restore();
}
function launchPad(ctx,w,h,s){
  const frame=s.frame;
  const elapsed=frame?.elapsed??0;
  const phase=s.reduced&&frame&&s.mode!=='result'?Math.floor(elapsed/3)*3:elapsed;
  const rise=frame?smooth((phase-3)/5):s.plan.push?(s.reduced?1:smooth(s.preview/1.3)):0;
  const falling=s.flight?.outcome==='fallBack'&&frame;
  const splashed=falling&&elapsed>11.8;
  const ground=landscape(ctx,w,h,false,frame?rise:0);
  const scale=Math.min(1.25,h/210);
  const x=w*.47,y0=ground-23*scale;
  const height=frame?(falling?h*.39:h*.66):({little:h*.13,right:h*.35,extra:h*.58})[s.plan.push]??0;
  let y=y0-rise*height,shipX=x;
  const fall=falling?smooth((phase-6)/6):0;
  if(falling){
    ctx.fillStyle='#527f9c';ctx.fillRect(w*.55,ground,w*.45,h-ground);
    for(let i=0;i<6;i++)path(ctx,[[w*.59+i*18,ground+12+i%2*9],[w*.62+i*18,ground+12+i%2*9]],'#afd7df',1.5);
    y=mix(y,y0,fall);shipX=mix(x,w*.73,fall);
  }
  if(frame&&elapsed>3&&!s.reduced&&elapsed<4.2)ctx.translate(Math.sin(elapsed*48)*3,Math.sin(elapsed*58)*2);
  ctx.fillStyle='#53677f';ctx.fillRect(x-46,ground,92,8);
  if(!s.reduced&&rise>0&&rise<.95&&!fall)dust(ctx,x,ground,rise,'#ebe1cc');
  if(fall>.1)parachute(ctx,shipX,y,scale);
  rocket(ctx,shipX,y,scale,{flame:falling&&fall>0?0:rise>0?.7:0});
  if(splashed)ellipse(ctx,shipX,ground,24,5,null,'#b5e3e2');
  if(!frame){
    const gx=w*.82,gy=h*.37,rg=Math.min(40,h*.21);
    ellipse(ctx,gx,gy,rg,rg,'#223951','#a5bdc9');
    for(let i=0;i<5;i++){
      const a=Math.PI*(1.12+i*.19);
      path(ctx,[[gx+Math.cos(a)*rg*.67,gy+Math.sin(a)*rg*.67],[gx+Math.cos(a)*rg*.85,gy+Math.sin(a)*rg*.85]],i===2?'#b4e9ce':'#ecc698',2);
    }
    const a=Math.PI*(1.12+.38*PUSHES.indexOf(s.plan.push??'little'));
    path(ctx,[[gx,gy],[gx+Math.cos(a)*rg*.68,gy+Math.sin(a)*rg*.68]],'#fff0d8',3);
    ellipse(ctx,gx,gy,4,4,'#fff0d8');
  }
}
function landingArt(ctx,w,h,s){
  const frame=s.frame,raw=frame?.progress??0;
  const outcome=s.flight?.outcome;
  const p=s.reduced&&['flight','replay'].includes(s.mode)?Math.min(.92,.18+Math.floor(raw*4)*.24):raw;
  const ground=landscape(ctx,w,h,true),size=Math.min(1.25,h/210);
  const y0=ground-23*size,x=w*.5;
  const overheated=outcome==='burnUp';
  const rough=outcome==='hardLanding';
  const down=frame?smooth(p/(overheated?1.2:rough?.96:.84)):0;
  const shipY=mix(h*.33,y0,down);
  if(frame&&p<.48){
    for(let i=0;i<20;i++){
      const xx=(i*67+(s.reduced?0:p*223))%w,yy=12+(i*41)%Math.max(1,h*.64);
      path(ctx,[[xx,yy],[xx+16,yy-8]],'#ffca9877',1.5);
    }
  }
  if(frame&&s.plan.gear.includes('chute')&&!overheated&&p>.30&&p<.68)parachute(ctx,x,shipY,size);
  const heat=frame?(overheated?smooth(p*1.8):clamp(1-p*2.3)*.85):0;
  const wobble=rough&&!s.reduced&&p>.78?Math.sin(p*65)*.19:0;
  rocket(ctx,x,shipY,size,{
    angle:wobble,heat,flame:frame&&p>.60&&p<.84&&s.plan.gear.includes('rockets')?.8:0,
    hatch:outcome==='success'&&p>.87?1:0
  });
  if(frame&&!overheated&&p>.74){
    dust(ctx,x,ground,clamp((p-.74)/.40),'#f1bd98');
    if(outcome==='success'&&p>.87){
      for(let i=0;i<28;i++){
        const xx=w*.18+(i*83%401)/401*w*.64;
        const yy=h*.15+(i*43%283)/283*h*.40+(s.reduced?0:(p-.87)*h*1.4);
        ellipse(ctx,xx,yy,2.5,4,['#ffce91','#a6deca','#cfb2e6'][i%3]);
      }
    }
  }
  if(overheated&&p>.8){
    ctx.fillStyle=`rgba(20,33,53,${smooth((p-.8)/.2)*.7})`;
    ctx.fillRect(0,0,w,h);
  }
}
function drawLaunch(canvas,state){
  const {width:w,height:h}=canvas.getBoundingClientRect();
  if(!w||!h)return;
  const dpr=Math.min(globalThis.devicePixelRatio||1,1.5);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  }
  const ctx=canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  if(state.frame?.id==='landing'||(state.mode==='plan'&&state.step==='gear'))landingArt(ctx,w,h,state);
  else if(state.frame?.id==='liftoff'||(state.mode==='plan'&&state.step==='push'))launchPad(ctx,w,h,state);
  else orbitArt(ctx,w,h,state);
}
