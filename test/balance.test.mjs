import {simulate} from './simulation.mjs';
import {missionStars} from '../dist/outpost-engine.js';
import test from 'node:test';
import assert from 'node:assert/strict';
for(const policy of ['default','noShield','random','ignoreAir','ignoreFood'])test(`5,000 seeded missions: ${policy}`,()=>{
 let fails=0,stormStars=0,mornings=0;
 for(let seed=1;seed<=5000;seed++){const run=simulate(seed,policy),s=run.s;mornings+=run.mornings;if(s.phase==='failed')fails++;if(missionStars(s)[1].earned)stormStars++;}
 console.log(JSON.stringify({policy,runs:5000,failures:fails,failurePercent:fails/50,stormStars,mornings}));
 if(policy==='default'){assert.equal(fails,0);assert.equal(mornings,25000);}if(policy==='noShield')assert.equal(stormStars,0);
 if(policy==='random')assert.ok(fails>=1250&&fails<=2500,`Random failure rate ${fails/50}% outside 25–50%`);
 if(policy==='ignoreAir'||policy==='ignoreFood')assert.equal(fails,5000);
});

import {ARCHIVE_EVENTS} from '../dist/solar-archive.js';
import {PIP_LAYOUT,POOR_LAYOUT} from '../dist/base-design.js';
for(const site of ['jezero','gale','arcadia'])for(const stormGoal of [30,40,50])for(const [layoutName,layout] of [['Pip',PIP_LAYOUT],['maximum penalties',POOR_LAYOUT]])test(`5,000 default missions: ${site}, goal ${stormGoal}, ${layoutName}`,()=>{
 let failures=0,stormStars=0;for(let seed=1;seed<=5000;seed++){const {s}=simulate(seed,'default',{site,layout,stormEvent:ARCHIVE_EVENTS.find(e=>e.classType[0]===({30:'C',40:'M',50:'X'})[stormGoal])});if(s.phase==='failed')failures++;if(missionStars(s)[1].earned)stormStars++;}
 console.log(JSON.stringify({site,stormGoal,layout:layoutName,runs:5000,failures,stormStars}));assert.equal(failures,0);assert.equal(stormStars,5000);
});
test('good layout earns more storm stars than maximum-penalty layout for identical random policies',()=>{
 const stars={good:0,poor:0},failures={good:0,poor:0};for(let seed=1;seed<=5000;seed++)for(const [name,layout]of [['good',PIP_LAYOUT],['poor',POOR_LAYOUT]]){
  const {s}=simulate(seed,'random',{site:'gale',layout,stormGoal:40});if(missionStars(s)[1].earned)stars[name]++;if(s.phase==='failed')failures[name]++;
 }
 console.log(JSON.stringify({comparison:'identical random policies',runsPerLayout:5000,stars,failures}));assert.ok(stars.good>stars.poor,JSON.stringify(stars));
});
