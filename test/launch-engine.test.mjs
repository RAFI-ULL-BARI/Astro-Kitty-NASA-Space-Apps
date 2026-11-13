import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EN} from '../dist/strings.js';
import {readingReport} from '../scripts/reading-level.mjs';
import {
  GEAR,REQUIRED_GEAR,PUSHES,PATHS,launchWindow,launchAngles,flightFor,flightFrame,
  emptyPlan,recordFailure,retryPlan,hintChoices
} from '../dist/launch-engine.js';

const window=launchWindow(42);
const good={day:window.rightDay,push:'right',path:'curved',gear:[...REQUIRED_GEAR]};
const allGear=GEAR.flatMap((a,i)=>GEAR.slice(i+1).flatMap((b,j)=>GEAR.slice(i+j+2).map(c=>[a,b,c])));

test('all 180 complete plans have one deterministic outcome and a continuous timeline',()=>{
  assert.equal(allGear.length,10);
  const counts={};
  for(const day of [0,1,2])for(const push of PUSHES)for(const path of PATHS)for(const gear of allGear){
    const plan={day,push,path,gear};
    const flight=flightFor(plan,window);
    counts[flight.outcome]=(counts[flight.outcome]??0)+1;
    assert.deepEqual(flightFor(plan,window),flight);
    assert.equal(flight.timeline[0].id,'liftoff');
    assert.equal(flight.timeline[0].start,0);
    flight.timeline.slice(1).forEach((stage,i)=>assert.equal(stage.start,flight.timeline[i].end));
    assert.equal(flightFrame(flight,flight.seconds).progress,1);
  }
  assert.deepEqual(counts,{fallBack:60,tooFast:60,wrongDay:40,straightMiss:10,burnUp:4,hardLanding:5,success:1});
  assert.equal(flightFor(good,window).seconds,45);
  assert.equal(flightFor(emptyPlan(),window),null);
  assert.equal(flightFor({...good,gear:['shield','shield','rockets']},window),null);
});

test('only the first incorrect choice appears, even when other choices are wrong',()=>{
  const bad={day:(window.rightDay+1)%3,push:'little',path:'straight',gear:['chute','airbags','wings']};
  assert.equal(flightFor(bad,window).outcome,'fallBack');
  assert.equal(flightFor({...bad,push:'extra'},window).outcome,'tooFast');
  const launched={...bad,push:'right'};
  assert.equal(flightFor(launched,window).outcome,'wrongDay');
  const timed={...launched,day:window.rightDay};
  assert.equal(flightFor(timed,window).outcome,'straightMiss');
  assert.equal(flightFor({...timed,path:'curved'},window).outcome,'burnUp');
  assert.equal(flightFor({...good,gear:['shield','rockets','wings']},window).missing,'chute');
  assert.equal(flightFor({...good,gear:['shield','chute','airbags']},window).missing,'rockets');
});

test('seeded windows use all three days and only the good day is 45 degrees ahead',()=>{
  const days=new Set();
  for(let seed=0;seed<100;seed++){
    const result=launchWindow(seed);
    assert.deepEqual(launchWindow(seed),result);
    days.add(result.rightDay);
    for(const day of [0,1,2]){
      const {earth,mars}=launchAngles(result,day);
      assert.equal(Math.abs(mars-earth-Math.PI/4)<1e-9,day===result.rightDay);
    }
  }
  assert.equal(days.size,3);
});

test('retry preserves the other choices and a second failure adds a step-specific hint',()=>{
  const cases=[
    [{...good,push:'little'},'push',['right'],null],
    [{...good,day:(window.rightDay+1)%3},'day',[window.rightDay],null],
    [{...good,path:'straight'},'path',['curved'],null],
    [{...good,gear:['shield','chute','wings']},'gear',REQUIRED_GEAR,['shield','chute']]
  ];
  for(const [plan,step,hint,next] of cases){
    const flight=flightFor(plan,window);
    const once=recordFailure({},flight),twice=recordFailure(once,flight);
    assert.deepEqual(hintChoices(once,step,window),[]);
    assert.deepEqual(hintChoices(twice,step,window),hint);
    assert.deepEqual(retryPlan(plan,flight),{...plan,[step]:next});
  }
});

test('simulator Pip lines are recorded and the new text meets the reading target',async()=>{
  const script=await readFile(new URL('../voice/SCRIPT.md',import.meta.url),'utf8');
  assert.match(script,/Part 5 · Mission Simulator/);
  for(const line of Object.values(EN.launch.pip))assert.ok(script.includes(line));
  assert.ok(readingReport().launchSimulator.grade<=4);
});
