import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {createGame,enter,tick,interact,matchCable,connect,powerUsed,restoreStory,setTarget,useRoverControls} from '../dist/story-engine.js';
import {CABLES,DEVICES,trainingLayout,feedbackPose,dangerOffset,shuffledSockets,roverGuideOpacity,STORM_ARRIVAL,STORM_DURATION} from '../dist/story-training.js';
import {createStorySound} from '../dist/story-sound.js';import {EN} from '../dist/strings.js';import {readingReport} from '../scripts/reading-level.mjs';
const advance=(s,n)=>{for(let i=0;i<n*60;i++)tick(s,1/60);};
test('four unique colour-and-shape plugs match only their own sockets',()=>{const s=createGame('connect');assert.equal(new Set(CABLES.map(c=>c.shape)).size,4);for(const p of CABLES)for(const q of CABLES){if(p.id===q.id)continue;assert.equal(matchCable(s,p.id,q.id),false);assert.equal(s.cables[p.id],false);assert.equal(s.cable,false);}assert.equal(s.patches.includes('sun'),false);});
test('all four connections are required; duplicates and unknown ports grant nothing',()=>{const s=createGame('connect');for(const c of CABLES.slice(0,3))assert.equal(matchCable(s,c.id,c.id),true);assert.equal(s.cable,false);assert.equal(s.transition,0);assert.equal(matchCable(s,CABLES[0].id,CABLES[0].id),false);assert.equal(matchCable(s,'fake','fake'),false);assert.equal(matchCable(s,CABLES[3].id,CABLES[3].id),true);assert.equal(s.cable,true);assert.ok(s.patches.includes('sun'));assert.equal(matchCable(s,CABLES[3].id,CABLES[3].id),false);advance(s,4);assert.equal(s.scene,'warning');assert.equal(matchCable(s,'p1plus','p1plus'),false);});
test('wrong sockets preserve all previous work and rotate no praise',()=>{const s=createGame('connect');matchCable(s,'p1plus','p1plus');const cheers=s.cheers;assert.equal(matchCable(s,'p1minus','p2minus'),false);assert.equal(s.cables.p1plus,true);assert.equal(s.cheers,cheers);assert.equal(s.speech,'cableWrong');});
test('power teaches air first, then radio, with exactly two separate cells',()=>{const s=createGame('power');assert.equal(connect(s,'radio','cell0'),false);assert.equal(powerUsed(s),0);assert.equal(connect(s,'air','cell1'),true);assert.equal(powerUsed(s),1);assert.equal(s.speech,'powerRadio');assert.equal(connect(s,'radio','cell1'),false);assert.equal(connect(s,'air','cell0'),false);assert.equal(connect(s,'radio','fake'),false);assert.equal(powerUsed(s),1);assert.equal(connect(s,'radio','cell0'),true);assert.equal(powerUsed(s),2);assert.equal(s.power.ports.cell1,'air');assert.equal(s.power.ports.cell0,'radio');advance(s,4);assert.equal(s.scene,'monitor');});
test('every distractor is free to try and cannot fill the emergency battery budget',()=>{const s=createGame('power');for(let n=0;n<3;n++)for(const id of ['rover','heater','lights']){assert.equal(connect(s,id,'cell0'),false);assert.equal(powerUsed(s),0);assert.deepEqual(s.power.ports,{});}connect(s,'air');for(const id of ['rover','heater','lights'])assert.equal(connect(s,id),false);assert.equal(powerUsed(s),1);connect(s,'radio');assert.equal(powerUsed(s),2);assert.equal(DEVICES.find(d=>d.id==='rover').cost,2);});
test('old connect and power saves restart only that step and retain prior patches',()=>{for(const scene of ['connect','power']){const old={scene,patches:['steps','sun','crew','bogus'],cable:true,power:{air:true,radio:true,rover:true}};const s=restoreStory(old);assert.equal(s.scene,scene);assert.deepEqual(s.patches,['steps','sun','crew']);assert.equal(s.cable,false);assert.ok(Object.values(s.cables).every(x=>x===false));assert.equal(powerUsed(s),0);assert.deepEqual(s.power.ports,{});}assert.equal(restoreStory({scene:'bad'}).scene,'approach');});
test('water gate closes only with the player at the shelter and seals before moving on',()=>{const s=createGame('shelter');interact(s);assert.equal(s.shelter.gate,0);setTarget(s,1010,510);advance(s,5);interact(s);assert.equal(s.shelter.phase,'closing');advance(s,.4);assert.ok(s.shelter.gate>0&&s.shelter.gate<1);advance(s,.5);assert.equal(s.shelter.phase,'sealed');assert.equal(s.scene,'shelter');assert.equal(s.speech,'gateSealed');advance(s,2);assert.equal(s.scene,'power');});
test('storm shake happens once, and airlock pressure is required for its soft thunk',()=>{const s=createGame('warning');advance(s,STORM_ARRIVAL-.1);assert.equal(s.stormArrived,false);advance(s,.2);assert.ok(s.sceneTime<1.1);assert.equal(s.stormArrived,true);assert.ok(s.shake.left>0&&s.shake.left<=.32);advance(s,.5);assert.equal(s.shake.left,0);advance(s,1);assert.equal(s.shake.left,0);advance(s,STORM_DURATION);assert.equal(s.scene,'return');const a=createGame('airlock');interact(a);advance(a,1);interact(a);advance(a,3.4);assert.equal(a.airlock.phase,'ready');assert.equal(a.airlock.pressure,100);assert.equal(a.feedback.target,'gauge');assert.equal(a.airlock.inner,0);});
test('bounce ends before 0.4 seconds; reduced motion uses a glow and shakes stay within 6px',()=>{for(const n of [.36,.4,1])assert.deepEqual(feedbackPose(n),{scale:1,angle:0,glow:n<.7?1-n/.7:0});assert.equal(feedbackPose(.15,true).scale,1);assert.equal(feedbackPose(.15,true).angle,0);assert.ok(feedbackPose(.15,true).glow>0);for(let i=0;i<100;i++){const p=dangerOffset(.32,99,i/12);assert.ok(Math.abs(p.x)<=6&&Math.abs(p.y)<=6);assert.deepEqual(dangerOffset(.3,6,i,true),{x:0,y:0});}});
test('all wire targets fit the three requested viewports with 44px separation',()=>{for(const [w,h]of [[1366,860],[375,760],[360,640]])for(const scene of ['connect','power']){const l=trainingLayout(w,h,scene),ps=[...l.sources,...l.targets];for(const p of ps){assert.ok(p.x>=22&&p.x<=l.width-22);assert.ok(p.y>=22&&p.y<=l.height-22);assert.ok(l.top+p.y+22<h-140);}for(let i=0;i<ps.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(ps[i].x-ps[j].x,ps[i].y-ps[j].y)>=44);}});
test('every new spoken line and compliment is in recording Part 4 and prose meets grade five',async()=>{const script=await readFile(new URL('../voice/SCRIPT.md',import.meta.url),'utf8');assert.match(script,/Part 4 · Training upgrade/);for(const key of ['upgradeConnectLine','upgradeCableWrong','upgradeAirHint','upgradeRoverPriority','upgradeSaveBattery','upgradeGateClosing','upgradeGateSealed','upgradePressureFact'])assert.ok(script.includes(EN.ui[key]));for(const line of EN.trainingCheers)assert.ok(script.includes(line));assert.ok(readingReport().storyUpgrade.grade<=5);});
function soundFixture(files=[]){const oscillators=[],recordings=[];class Context{currentTime=0;destination={};resume(){return Promise.resolve();}createOscillator(){const n={frequency:{value:0,setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){this.stopped=true;}};oscillators.push(n);return n;}createGain(){return{gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}createBiquadFilter(){return{frequency:{value:0},Q:{value:0},connect(){},disconnect(){}};}}class Recording{constructor(url){this.url=url;recordings.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}}return{oscillators,recordings,sound:createStorySound({ContextClass:Context,AudioClass:Recording,fetcher:async()=>({ok:true,json:async()=>({files})})})};}
test('missing recordings use built-in synth sounds and mute stops every active sound and future note',async()=>{const {sound,oscillators,recordings}=soundFixture();sound.unlock();await sound.load();sound.play('yay');const made=oscillators.length;assert.ok(made>=3);assert.equal(recordings.length,0);sound.setEnabled(false);assert.ok(oscillators.every(x=>x.stopped));sound.finish();sound.buzz();sound.play('purr');sound.kitty();assert.equal(oscillators.length,made);});
test('manifest-listed recordings play locally; pause and mute stop them',async()=>{const {sound,recordings}=soundFixture(['yay.mp3','applause.mp3','meow.mp3','purr.mp3','evil.mp3']);await sound.load();sound.unlock();sound.play('yay');sound.finish();sound.play('purr');assert.equal(recordings.length,4);assert.ok(recordings.every(a=>a.url.includes('/audio/sfx/')));sound.stopAll();assert.ok(recordings.every(a=>a.paused));sound.setEnabled(false);sound.finish();assert.equal(recordings.length,4);});

test('every story scene renders with valid Canvas calls at all three sizes',async()=>{
 const {drawScene}=await import('../dist/art.js'),{SCENES}=await import('../dist/story.js');const previous=globalThis.window;globalThis.window={devicePixelRatio:1};
 try{for(const [width,height]of [[1366,860],[375,760],[360,640]])for(const scene of Object.keys(SCENES)){
  const methods={scale:(x,y)=>{assert.equal(typeof x,'number');assert.equal(typeof y,'number');assert.ok(Number.isFinite(x)&&Number.isFinite(y));},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
  const ctx=new Proxy(methods,{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),canvas={width,height,getContext:()=>ctx,getBoundingClientRect:()=>({width,height})};
  for(const reduceMotion of [false,true])assert.doesNotThrow(()=>drawScene(canvas,createGame(scene),{visualTime:2,reduceMotion}),scene+' '+width);
 }}finally{globalThis.window=previous;}
});

test('a short held arrow moves the same distance when input is flushed between slow frames',async()=>{const {advanceStory}=await import('../dist/story-engine.js');const slow=createGame('clean'),fast=createGame('clean');advanceStory(slow,.4,{right:true});for(let i=0;i<24;i++)tick(fast,1/60,{right:true});assert.ok(Math.abs(slow.player.x-fast.player.x)<1e-8);assert.ok(Math.abs(slow.player.x-493)<1e-8);advanceStory(slow,.2,{});assert.equal(slow.player.vx,0);});

test('native visibility and blur bindings pause, ignore a visible change and clean up',async()=>{const {bindStoryVisibility}=await import('../dist/story-controls.js');const doc=new EventTarget(),win=new EventTarget();doc.hidden=false;let count=0;const cleanup=bindStoryVisibility(doc,win,()=>count++);doc.dispatchEvent(new Event('visibilitychange'));assert.equal(count,0);doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(count,1);win.dispatchEvent(new Event('blur'));assert.equal(count,2);cleanup();doc.dispatchEvent(new Event('visibilitychange'));win.dispatchEvent(new Event('blur'));assert.equal(count,2);});

test('a recording rejected after pause cannot restart a fallback chime',async()=>{let rejectPlay;const notes=[];class Context{currentTime=0;resume(){}createOscillator(){notes.push(1);return{frequency:{},connect(){},start(){},stop(){}};}createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}}class Audio{play(){return new Promise((_,reject)=>rejectPlay=reject);}pause(){}}const sound=createStorySound({ContextClass:Context,AudioClass:Audio,fetcher:async()=>({ok:true,json:async()=>({files:['yay.mp3']})})});await sound.load();sound.unlock();sound.play('yay');sound.stopAll();rejectPlay(Error('paused'));await Promise.resolve();assert.equal(notes.length,0);});

test('the seeded socket row never mirrors the plugs or repeats on a chapter restart',()=>{
 const plugs=CABLES.map(c=>c.id),variants=new Set();
 for(let seed=0;seed<100;seed++){
  const state=createGame('connect',[],seed);
  const first=state.socketOrder;
  variants.add(first.join(','));
  assert.deepEqual(first,shuffledSockets(seed+1));
  assert.deepEqual([...first].sort(),[...plugs].sort());
  assert.notDeepEqual(first,plugs);
  const layout=trainingLayout(360,640,'connect',first);
  assert.deepEqual(layout.targets.map(c=>c.id),first);
  assert.deepEqual(layout.sources.map(c=>c.id),plugs);
  enter(state,'connect');
  assert.notDeepEqual(state.socketOrder,first);
  assert.notDeepEqual(state.socketOrder,plugs);
 }
 assert.ok(variants.size>5);
});

test('a remote brush request walks to the next dusty panel and brushes it',()=>{
 const state=createGame('clean');
 state.player.x=90;state.player.y=630;
 interact(state);
 assert.deepEqual(state.target,{x:490,y:493});
 advance(state,6);
 assert.equal(state.panels[0].clean,100);
 assert.equal(state.panels[1].clean,0);
 assert.equal(state.auto,false);
 interact(state);
 assert.deepEqual(state.target,{x:720,y:533});
 advance(state,6);
 assert.equal(state.panels[1].clean,100);
 assert.ok(state.transition>0);
});

test('only the final monitor reading celebrates',()=>{
 const state=createGame('monitor');
 for(const line of ['elevated','falling']){
  interact(state);
  assert.equal(state.speech,line);
  assert.equal(state.feedback.kind,'check');
  assert.equal(state.feedback.complete,false);
  assert.equal(state.cheers,0);
  advance(state,5.1);
 }
 interact(state);
 assert.equal(state.speech,'clear');
 assert.equal(state.feedback.kind,'happy');
 assert.equal(state.feedback.complete,true);
 assert.equal(state.cheers,1);
});

test('the rover guide fades once after input and starts fresh on restart',()=>{
 for(const start of [
  state=>useRoverControls(state),
  state=>setTarget(state,state.player.x,state.player.y),
  state=>interact(state),
  state=>tick(state,1/60,{left:true}),
 ]){
  const state=createGame('rover');
  advance(state,.3);
  assert.equal(roverGuideOpacity(state),1);
  start(state);
  assert.ok(roverGuideOpacity(state)>.9);
  assert.equal(roverGuideOpacity(state,true),0);
  const first=state.rover.inputAt;
  advance(state,.2);
  assert.ok(Math.abs(roverGuideOpacity(state)-.5)<.06);
  start(state);
  assert.equal(state.rover.inputAt,first);
  advance(state,.23);
  assert.equal(roverGuideOpacity(state),0);
  enter(state,'rover');
  assert.equal(roverGuideOpacity(state),1);
 }
});
