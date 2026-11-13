import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,tick,interact,connect,matchCable,setTarget,skipFilm,goal,BEACONS,ROCKS,distance} from '../dist/story-engine.js';
import {SCENES,LINES,PATCHES} from '../dist/story.js';
const advance=(s,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds*60);i++)tick(s,1/60,input);};
const go=(s,x,y)=>{const scene=s.scene;setTarget(s,x,y);for(let i=0;i<1200&&s.scene===scene&&(s.target||s.auto);i++)tick(s,1/60);};
test('every scene has a known narration and cinematic destination',()=>{for(const d of Object.values(SCENES)){assert.ok(LINES[d.line]);if(d.kind==='film')assert.ok(SCENES[d.next]);}});
test('opening stops for a choice; training still requires following Pip on foot',()=>{const opening=createGame();advance(opening,27);assert.equal(opening.scene,'choose');advance(opening,40);assert.equal(opening.scene,'choose');const s=createGame('walk');advance(s,20);assert.equal(s.scene,'walk');go(s,520,520);advance(s,1);assert.equal(s.scene,'clean');assert.ok(s.patches.includes('steps'));});
test('both panels need cleaning before the cable becomes available',()=>{const s=createGame('clean');for(const p of [...s.panels])go(s,p.x,p.y);assert.ok(s.panels.every(p=>p.clean===100));advance(s,3);assert.equal(s.scene,'connect');for(const id of ['p1plus','p1minus','p2plus','p2minus'])assert.ok(matchCable(s,id,id));advance(s,4);assert.equal(s.scene,'warning');assert.ok(s.patches.includes('sun'));});
test('storm priorities: the next objective is the airlock with no equipment collection',()=>{const s=createGame('warning');advance(s,10);assert.equal(s.scene,'return');assert.equal(goal(s).label,'Airlock');go(s,goal(s).x,goal(s).y);advance(s,1);assert.equal(s.scene,'airlock');});
test('airlock inner door cannot open before outer closure and pressure',()=>{const s=createGame('airlock');interact(s);interact(s);assert.equal(s.airlock.phase,'closing');assert.equal(s.airlock.inner,0);advance(s,1);assert.equal(s.airlock.phase,'sealed');interact(s);advance(s,1);interact(s);assert.equal(s.airlock.inner,0);assert.equal(s.airlock.outer,0);advance(s,3);assert.equal(s.airlock.phase,'ready');interact(s);advance(s,1.2);assert.equal(s.airlock.inner,1);assert.ok(s.transition>0);advance(s,.8);assert.equal(s.scene,'shelter');});
test('crew must reach the prepared shelter before the power puzzle',()=>{const s=createGame('shelter');interact(s);assert.equal(s.scene,'shelter');go(s,1010,510);interact(s);assert.equal(s.scene,'shelter');advance(s,3);assert.equal(s.scene,'power');assert.ok(s.patches.includes('crew'));});
test('backup battery is reserved for air and radio; wrong machines cost no cells',()=>{const s=createGame('power');assert.equal(connect(s,'rover'),false);assert.equal(connect(s,'heater'),false);assert.equal(s.power.air,false);assert.equal(s.scene,'power');assert.equal(connect(s,'radio'),false);assert.equal(connect(s,'air'),true);assert.equal(connect(s,'radio'),true);advance(s,4);assert.equal(s.scene,'monitor');});
test('the monitor cannot be clicked through before story time passes',()=>{const s=createGame('monitor');interact(s);interact(s);assert.equal(s.monitor.reading,1);advance(s,5.1);interact(s);assert.equal(s.monitor.reading,2);assert.equal(s.scene,'monitor');advance(s,5.1);interact(s);assert.equal(s.monitor.reading,3);advance(s,5.1);assert.equal(s.scene,'rover');assert.ok(s.patches.includes('storm'));});
test('rover can steer around a collision and finish all three scans',()=>{const s=createGame('rover');go(s,965,585);assert.ok(ROCKS.every(r=>distance(s.player,r)>=r.r+22.99));const x=s.player.x;advance(s,.8,{up:true});assert.ok(s.player.y<580);assert.ok(Math.abs(s.player.x-x)<30);go(s,1070,470);for(const b of BEACONS)go(s,b.x,b.y);advance(s,4);assert.equal(s.scene,'finale');advance(s,10);assert.equal(s.scene,'complete');assert.equal(s.completed,true);assert.ok(s.patches.includes('rover'));});
test('chapter restore rejects unknown scenes and resets only the current task',()=>{const s=createGame('invalid',['steps','sun']);assert.equal(s.scene,'approach');const r=createGame('airlock',['steps','sun']);assert.deepEqual(r.patches,['steps','sun']);assert.equal(r.airlock.outer,1);assert.equal(r.airlock.pressure,0);});
test('skipping is limited to cinematic scenes',()=>{const s=createGame('clean');advance(s,2);skipFilm(s);assert.equal(s.scene,'clean');const f=createGame();advance(f,1.3);skipFilm(f);assert.equal(f.scene,'landing');});
test('completed story awards each patch at most once',()=>{const s=createGame('rover',PATCHES.map(x=>x.id));go(s,1070,470);for(const b of BEACONS)go(s,b.x,b.y);advance(s,14);assert.equal(s.patches.length,5);});

test('each story transition has its own completion message',async()=>{
 const {storyDoneText}=await import('../dist/journey.js');
 const expected={clean:'Both panels are clean!',walk:'We reached the panels!',return:'Back at the airlock!',airlock:'Everyone is inside!',shelter:'Safe behind the water shield!'};
 for(const [scene,line] of Object.entries(expected))assert.equal(storyDoneText(scene),line);
 const scenes=[...Object.keys(expected),'connect','power','monitor','rover'];
 assert.equal(new Set(scenes.map(storyDoneText)).size,scenes.length);
 assert.equal(storyDoneText('warning'),'');
});

test('the Maintenance banner can show at connect and return but never during the storm',async()=>{
 const {storyBadgeBanner}=await import('../dist/journey.js');
 const notice={id:'solar',text:'Maintenance badge earned'};
 assert.equal(storyBadgeBanner('connect',notice,2),notice.text);
 assert.equal(storyBadgeBanner('warning',notice,2),'');
 assert.equal(storyBadgeBanner('warning',{id:'power',text:'Resource Planning'},2),'');
 assert.equal(storyBadgeBanner('return',notice,2),notice.text);
 assert.equal(storyBadgeBanner('return',notice,0),'');
});
