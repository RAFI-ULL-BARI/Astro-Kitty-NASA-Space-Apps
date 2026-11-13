import test from 'node:test';
import assert from 'node:assert/strict';
import {EN} from '../dist/strings.js';
import {createOutpost,codeForSeed,normalizeMissionCode,defaultPlan,previewPlan,confirmPlan,choose,tickReply,showSummary,nextSol,choiceEffects,missionStars,cellsAvailable,drawSurprise,restoreOutpost,sensibleChoice} from '../dist/outpost-engine.js';
const decision=(id,shielding=40)=>{const s=createOutpost({code:'DUST-42',stormGoal:40});s.phase='decision';s.sol=2;s.deck=['landing',id,null,null,id==='storm'?null:'storm'];s.stormSol=id==='storm'?2:5;s.meters.shielding=shielding;return s;};
function play(code){const s=createOutpost({code});while(!s.outcome){confirmPlan(s,defaultPlan(s));if(s.outcome)break;choose(s,sensibleChoice(s));for(let n=0;n<6;n++)tickReply(s,1);if(s.outcome)break;showSummary(s);nextSol(s);}return s;}
test('mission code normalizes, seeds every rule and rejects invalid input',()=>{assert.equal(normalizeMissionCode(' dust-42 '),'DUST-42');for(const value of ['no spaces','D-4','../file','A'.repeat(30),'<script>'])assert.equal(normalizeMissionCode(value),null);assert.deepEqual(play('DUST-42'),play('dust-42'));assert.notDeepEqual(play('DUST-42').weather,play('NOVA-99').weather);});
test('seeded runs vary weather and storm sol, select nonrepeating surprises and preserve landing first',()=>{const sols=new Set(),weather=new Set(),cards=new Set();for(let n=1;n<=500;n++){const s=play('DUST-'+n.toString(36).padStart(2,'0'));sols.add(s.stormSol);s.weather.forEach(x=>weather.add(x));assert.equal(s.deck[0],'landing');assert.equal(new Set(s.deck).size,5);s.deck.forEach(x=>cards.add(x));}assert.equal(sols.size,4);assert.equal(weather.size,3);assert.ok(cards.size>=16);});
for(const [shielding,effects,tier]of [[0,{spirit:-20,food:-10,power:-10},'Emergency'],[19,{spirit:-20,food:-10,power:-10},'Emergency'],[20,{spirit:-10,food:-6},'Cramped'],[39,{spirit:-10,food:-6},'Cramped'],[40,{spirit:10},'Strong'],[100,{spirit:10},'Strong']])test(`storm shelter threshold ${shielding} applies exact safe-return consequences`,()=>{const s=decision('storm',shielding);assert.deepEqual(choiceEffects(s,'storm','shelter'),effects);choose(s,'shelter');assert.equal(s.lastChoice.outcomeKey,'storm'+tier);assert.equal(missionStars(s)[1].earned,shielding>=40);});
test('finish still pays shelter plus air and spirit costs; radio waits before shelter',()=>{for(const shield of [0,25,50]){const s=decision('storm',shield);const shelterNow=choiceEffects(s,'storm','shelter');assert.deepEqual(choiceEffects(s,'storm','finish'),{...shelterNow,air:-10,spirit:shelterNow.spirit-5});choose(s,'finish');assert.equal(missionStars(s)[1].earned,false);const radio=decision('storm',shield),shelter=choiceEffects(radio,'storm','shelter');choose(radio,'radio');const before={...radio.meters};for(let n=0;n<5;n++)tickReply(radio,1);assert.equal(radio.phase,'waiting');assert.deepEqual(radio.meters,before);const saved=restoreOutpost(JSON.parse(JSON.stringify(radio)));assert.ok(saved);tickReply(saved,1);assert.equal(saved.meters.spirit,before.spirit+shelter.spirit-5);assert.equal(missionStars(saved)[1].earned,false);}});
test('morning morale modifies the next sol budget at exact boundaries and dust still costs a cell',()=>{for(const [spirit,bonus]of [[0,-1],[30,-1],[31,0],[79,0],[80,1],[100,1]]){const s=createOutpost({code:'DUST-42'});s.weather=['clear','hazy','dusty','clear','clear'];s.phase='summary';s.meters.spirit=spirit;nextSol(s);assert.equal(cellsAvailable(s),6+bonus);s.cleanliness=50;assert.equal(cellsAvailable(s),5+bonus);assert.ok(previewPlan(s,defaultPlan(s)).valid);}});
test('all completed-mission bonus goals award and explain their target',()=>{for(const g of [{id:'rocks',target:2},{id:'food',target:70},{id:'spirit',target:80},{id:'water',target:60},{id:'shielding',target:80},{id:'power',target:50}]){const s=createOutpost({code:'DUST-42'});s.bonusGoal=g;s.phase='complete';if(g.id==='rocks')s.rocks.slice(0,2).forEach(x=>x.found=true);else s.meters[g.id]=g.target;assert.equal(missionStars(s)[0].earned,true);assert.equal(missionStars(s)[2].earned,true);if(g.id==='rocks')s.rocks[0].found=false;else s.meters[g.id]--;assert.equal(missionStars(s)[2].earned,false);assert.equal(missionStars(s)[2].reason,'starBonusMiss');}});
test('risky branches are seeded, restored exactly, show their odds, and include both outcomes',()=>{for(const [id,choice]of [['dustdevil','risk'],['filter','shake']]){const outcomes=new Set();for(let seed=1;seed<100;seed++){const s=decision(id);s.rngState=seed*100000;const restored=restoreOutpost(JSON.parse(JSON.stringify(s)));assert.ok(restored);choose(s,choice);choose(restored,choice);assert.deepEqual(restored,s);outcomes.add(s.lastChoice.riskSuccess);assert.ok(s.lastChoice.outcomeKey);}assert.equal(outcomes.size,2);}});
test('critical-reserve help can appear once, never replaces landing or storm, and uses an onboard reserve',()=>{let helped=false;for(let seed=1;seed<100;seed++){const s=createOutpost({seed});s.sol=[2,3,4,5].find(n=>n!==s.stormSol);s.meters.air=15;drawSurprise(s);if(s.deck[s.sol-1]==='help'){helped=true;assert.equal(s.helpUsed,true);s.sol=[2,3,4,5].find(n=>n!==s.stormSol&&s.deck[n-1]===null);assert.notEqual(drawSurprise(s),'help');}assert.equal(s.deck[0],'landing');assert.equal(s.deck[s.stormSol-1],'storm');}assert.ok(helped);assert.match(EN.cards.help.question,/backup crate/);});
test('legacy version-one saves migrate without deleting choices, meters or stored water',()=>{const old=createOutpost({seed:5});old.version=1;old.deck=['landing','dust','storm','greenhouse','sick'];delete old.code;delete old.weather;delete old.bonusGoal;delete old.rngState;const s=restoreOutpost(old);assert.ok(s);assert.equal(s.version,3);assert.equal(s.legacy,true);assert.deepEqual(s.meters,old.meters);assert.deepEqual(s.log,old.log);});

test('new mission codes use a word and exactly two digits, including zero padding',()=>{
 const codes=new Set();
 for(let seed=0;seed<600;seed++){
  const code=codeForSeed(seed);assert.match(code,/^(DUST|NOVA|PAWS|MARS|ORBIT|ROVER)-[0-9]{2}$/);
  assert.equal(createOutpost({seed}).code,code);assert.equal(codeForSeed(seed),code);codes.add(code);
 }
 assert.equal(codes.size,600);assert.equal(codeForSeed(0),'DUST-00');assert.equal(codeForSeed(252),'DUST-42');
 for(const seed of [Date.now(),0xffffffff,-1])assert.match(codeForSeed(seed),/^[A-Z]+-[0-9]{2}$/);
});
test('older long mission codes retain their deterministic mission and saved state',()=>{
 const code='DUST-1DKIDBV';assert.equal(normalizeMissionCode(' dust-1dkidbv '),code);
 const s=play(code),restored=restoreOutpost(JSON.parse(JSON.stringify(s)));
 assert.ok(restored);assert.equal(restored.code,code);assert.deepEqual(restored,s);assert.deepEqual(play(code),play(code));
});
test('the bonus star requires completion even when every target is already met',()=>{
 for(const g of [{id:'rocks',target:2},{id:'food',target:70},{id:'spirit',target:80},{id:'water',target:60},{id:'shielding',target:80},{id:'power',target:50}]){
  const s=createOutpost({code:'DUST-42'});s.bonusGoal=g;
  if(g.id==='rocks')s.rocks.slice(0,2).forEach(x=>x.found=true);else s.meters[g.id]=g.target;
  for(const phase of ['brief','decision','summary','failed']){
   s.phase=phase;assert.equal(missionStars(s)[2].earned,false,`${g.id}: ${phase}`);
   if(phase==='failed')assert.equal(missionStars(s)[2].reason,'starBonusFinish');
  }
  s.phase='complete';assert.equal(missionStars(s)[2].earned,true,g.id);
 }
});
test('every generated short-code mission completes with sensible defaults',()=>{
 for(let seed=0;seed<600;seed++){
  const code=codeForSeed(seed);assert.equal(play(code).phase,'complete',code);
 }
});
