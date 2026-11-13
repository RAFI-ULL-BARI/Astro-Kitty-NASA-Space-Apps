import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ARCHIVE_EVENTS,archiveStormForCode} from '../dist/solar-archive.js';
import {normalizeMissionCode,createOutpost,choiceEffects,restoreOutpost,confirmPlan,defaultPlan,choose} from '../dist/outpost-engine.js';
import {PIP_LAYOUT,POOR_LAYOUT} from '../dist/base-design.js';
import {EN} from '../dist/strings.js';
import {mapPoint} from '../dist/landing-sites.js';
import {stormPlayLabel,eventDate,oddsHTML,panelDustHTML,visualMeter,wallStatusHTML,truthBadge,REFLECTION_KEY,saveReflectionAnswer,learnedIdeas,learnedHTML} from '../dist/outpost-presentation.js';
test('normal missions seed-pick all nine real archive events and share overrides win',async()=>{
 assert.deepEqual(JSON.parse(await readFile(new URL('../dist/data/donki-events.json',import.meta.url))),ARCHIVE_EVENTS);
 const ids=new Set(),tiers=new Set();for(let seed=0;seed<600;seed++){const a=createOutpost({seed}),b=createOutpost({code:a.code});assert.deepEqual(a,b);assert.equal(a.stormEvent.flrID,archiveStormForCode(a.code).flrID);ids.add(a.stormEvent.flrID);tiers.add(a.stormGoal);const override=ARCHIVE_EVENTS[(seed+1)%9],c=createOutpost({code:a.code,stormEvent:override});assert.equal(c.stormEvent.flrID,override.flrID);assert.deepEqual(c.weather,a.weather);assert.equal(restoreOutpost(JSON.parse(JSON.stringify(c))).stormGoal,c.stormGoal);}
 assert.equal(ids.size,9);assert.deepEqual([...tiers].sort(),[30,40,50]);
 assert.equal(ARCHIVE_EVENTS.filter(x=>x.startTime.startsWith('2024-05-')).length,3);
});
test('friendly code spellings share the exact seed and older codes still work',()=>{
 for(const v of ['dust 42','DUST42','dust_42',' dust-42 ']){assert.equal(normalizeMissionCode(v),'DUST-42');assert.deepEqual(createOutpost({code:v}),createOutpost({code:'DUST-42'}));}
 assert.equal(normalizeMissionCode('DUST-1DKIDBV'),'DUST-1DKIDBV');for(const v of ['DUST__42','DUST 4 2','DUST/42','<script>42'])assert.equal(normalizeMissionCode(v),null);
});
test('radio pays far-shelter cost as well as the separate delay cost at every tier',()=>{
 for(const shielding of [0,19,20,29,30,39,40,49,50,100])for(const stormGoal of [30,40,50]){
  const near=createOutpost({code:'DUST-42',layout:PIP_LAYOUT,stormGoal}),far=createOutpost({code:'DUST-42',layout:POOR_LAYOUT,stormGoal});near.meters.shielding=far.meters.shielding=shielding;
  const n=choiceEffects(near,'storm','shelter'),f=choiceEffects(far,'storm','shelter'),r=choiceEffects(far,'storm','radio');assert.equal(f.spirit,n.spirit-5);assert.equal(r.spirit,f.spirit-5);assert.deepEqual({...r,spirit:f.spirit},f);
 }
});
test('weekly label is only fresh live data; all buttons include an event date',()=>{
 const now=Date.parse('2026-11-07T12:00:00Z'),event={...ARCHIVE_EVENTS[0],startTime:'2026-11-07T01:00:00Z',mode:'live'};
 assert.equal(stormPlayLabel(event,now),EN.ui.playToday.replace('{date}','7 November 2026'));
 for(const mode of ['archive','cache'])assert.match(stormPlayLabel({...event,mode},now),/7 November 2026/);
 for(const startTime of ['2026-10-30T01:00:00Z','2026-11-08T00:00:00Z'])assert.ok(!stormPlayLabel({...event,startTime},now).includes("week's"));
 assert.equal(eventDate(ARCHIVE_EVENTS[2]),'10 May 2024');
});
test('visual gauges keep precise values for screen readers and odds keep the original 65% rule',()=>{
 const odds=oddsHTML(.65);assert.equal((odds.match(/class="full"/g)||[]).length,6);assert.equal((odds.match(/class="half"/g)||[]).length,1);assert.match(odds,/65 out of 100/);assert.match(oddsHTML(.6),/6 out of 10 times/);
 assert.match(panelDustHTML(83),/aria-valuenow="17"/);assert.match(visualMeter('Sunlight',55),/55 out of 100/);
 assert.match(wallStatusHTML({meters:{shielding:54}},50),/Safe at 50/);assert.match(wallStatusHTML({meters:{shielding:32}},50),/Goal 50/);assert.match(truthBadge('real'),/title=/);assert.match(truthBadge('game'),/aria-label=/);
});
test('Arcadia uses the official USGS regional centre and moves east',()=>{
 assert.equal(EN.sites.arcadia.lat,47);assert.equal(EN.sites.arcadia.lon,192);assert.equal(EN.sites.arcadia.coordinates,'about 47°N, 192°E');assert.ok(mapPoint(47,192).x>mapPoint(47,184).x);assert.equal(EN.sites.arcadia.coordinateSource,'https://planetarynames.wr.usgs.gov/Feature/348');
});
test('reflection stores only a whitelisted answer string, never the crew profile',()=>{
 const saved=[];const storage={setItem:(key,value)=>saved.push({key,value})};for(const answer of ['water','food','signal'])assert.equal(saveReflectionAnswer(storage,answer),true);
 assert.deepEqual(saved.map(x=>x.value),['water','food','signal']);assert.ok(saved.every(x=>x.key===REFLECTION_KEY));assert.equal(saveReflectionAnswer(storage,'Kitty'),false);assert.equal(saveReflectionAnswer({setItem(){throw Error('denied');}},'water'),false);assert.equal(saved.length,3);
});
test('learning links quote the actual plan and storm choice, even when the player chose finish',()=>{
 const s=createOutpost({code:'DUST-42'});confirmPlan(s,defaultPlan(s));choose(s,'balance');s.phase='brief';s.sol=s.stormSol;confirmPlan(s,defaultPlan(s));choose(s,'finish');const ideas=learnedIdeas(s);assert.equal(ideas.length,3);for(const idea of ideas){assert.ok(s.log[idea.index]);assert.match(learnedHTML(s),new RegExp('href="#choice-'+idea.index+'"'));}assert.match(ideas[1].choice,/Finish the outside job/);assert.match(ideas[2].choice,/Finish the outside job/);
 assert.ok(learnedIdeas(createOutpost({code:'DUST-42'})).every(x=>x.index===null));assert.match(EN.facts.marsStorm.text,/20 May 2024/);assert.match(EN.facts.marsStorm.text,/different event/);
});

import {readingReport} from '../scripts/reading-level.mjs';
test('all measured English outpost prose groups stay at grade five or below',()=>{for(const [group,stats] of Object.entries(readingReport()))assert.ok(stats.grade<=5,group+': '+stats.grade);});
