import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {truthBadge,learnedIdeas,stormPlayLabel} from '../dist/outpost-presentation.js';
import {createOutpost,choiceEffects,choose,missionStars} from '../dist/outpost-engine.js';
import {PIP_LAYOUT,POOR_LAYOUT} from '../dist/base-design.js';
import {createSolarLoader,FALLBACK_EVENT,CACHE_MS} from '../dist/nasa-data.js';
import {ARCHIVE_EVENTS} from '../dist/solar-archive.js';
import {EN} from '../dist/strings.js';
const now=new Date('2026-11-08T03:00:00Z'),live={flrID:'2026-11-07T09:00:00-FLR-001',beginTime:'2026-11-07T09:00:00Z',classType:'M2.4',link:'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/47310/-1'};
const storage=()=>{const values={};return {getItem:k=>values[k]??null,setItem:(k,v)=>values[k]=v};};
const response=rows=>({ok:true,json:async()=>rows});
const isArchive=url=>String(url).endsWith('donki-events.json');
test('the game class belongs only to the main game container, never science badges',async()=>{
 for(const kind of ['game','real']){const classes=/class="([^"]+)"/.exec(truthBadge(kind))[1].split(/\s+/);assert.ok(!classes.includes('game'));assert.ok(classes.includes('truth-'+kind));}
 const matches=[];async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await scan(url);else if(/\.(?:html|js)$/.test(entry.name)){const source=await readFile(url,'utf8');for(const tag of source.matchAll(/<[^>]*\bclass=["']([^"']*)["'][^>]*>/g))if(tag[1].split(/\s+/).includes('game'))matches.push({file:url.pathname,tag:tag[0]});}}}await scan(new URL('../dist/',import.meta.url));
 assert.equal(matches.length,1);assert.match(matches[0].file,/\/dist\/index.html$/);assert.match(matches[0].tag,/^<main\b/);assert.match(matches[0].tag,/id="game"/);
 const css=await readFile(new URL('../dist/outpost.css',import.meta.url),'utf8');assert.ok(css.includes('.truth-badge.truth-game{'));assert.ok(!css.includes('.truth-badge.game{'));
});
test('finish always includes the current shelter tier and walk, plus Air −10 and Spirit −5',()=>{
 for(const layout of [PIP_LAYOUT,POOR_LAYOUT])for(const stormGoal of [30,40,50])for(const shielding of [0,19,20,29,30,39,40,49,50,100]){
 const s=createOutpost({code:'DUST-42',layout,stormGoal});s.meters.shielding=shielding;const shelter=choiceEffects(s,'storm','shelter');assert.deepEqual(choiceEffects(s,'storm','finish'),{...shelter,air:-10,spirit:shelter.spirit-5});
 s.phase='decision';s.sol=s.stormSol;choose(s,'finish');assert.equal(s.lastChoice.outcomeKey,'stormFinish');assert.equal(missionStars(s)[1].earned,false);
 }
 assert.match(EN.ui.stormFinish,/Real crews stop and go to shelter right away/);assert.equal(EN.ui.reflectQuestion,'How does a water wall help?');
});
test('learning feedback follows the actual storm response and prefers the radio row',()=>{
 for(const choice of ['finish','shelter','radio']){const s=createOutpost({code:'DUST-42'});s.log=[{type:'decision',id:'sick',choice:'doctor',sol:1},{type:'decision',id:'storm',choice,sol:3}];const ideas=learnedIdeas(s);assert.equal(ideas[2].index,1);assert.match(ideas[2].choice,choice==='radio'?/Radio Mission Control/:choice==='finish'?/Finish the outside job/:/water-wall shelter/);assert.ok(ideas[1].text.includes(EN.ui[choice==='finish'?'learnedFinish':choice==='shelter'?'learnedShelter':'learnedRadio']));assert.equal(ideas[2].text.includes(EN.ui.learnedOwnDecision),choice!=='radio');}
 const s=createOutpost({code:'DUST-42'});s.log=[{type:'decision',id:'storm',choice:'shelter',sol:2},{type:'decision',id:'storm',choice:'radio',sol:4}];assert.equal(learnedIdeas(s)[2].index,1);
});
test('all archive links and the built-in reference use the current latest-version URL',()=>{
 const numbers=[30601,30605,30666,28511,28512,28513,28514,23243,47310];ARCHIVE_EVENTS.forEach((r,i)=>assert.equal(r.source,`https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/${numbers[i]}/-1`));assert.equal(FALLBACK_EVENT.source,ARCHIVE_EVENTS[2].source);assert.equal(stormPlayLabel({...ARCHIVE_EVENTS[0],mode:'live',startTime:live.beginTime},now),"Play this week's real storm (7 November 2026)");
});
test('NASA gateway success makes one request and never contacts the backup',async()=>{
 const calls=[],r=await createSolarLoader()({now,storage:storage(),fetcher:async url=>{calls.push(String(url));return response(isArchive(url)?ARCHIVE_EVENTS:[live]);}});assert.equal(r.event.mode,'live');assert.equal(r.requests,1);assert.equal(calls.length,2);assert.ok(calls[1].startsWith('https://api.nasa.gov/DONKI/FLR?'));assert.ok(calls.every(url=>!url.includes('DONKI-API')));
});
for(const failure of ['429','offline','timeout','empty','malformed','stale'])test(`CCMC backs up a ${failure} gateway response, without an API key`,async()=>{
 const calls=[],load=createSolarLoader(),store=storage();const fetcher=async url=>{calls.push(String(url));if(isArchive(url))return response(ARCHIVE_EVENTS);if(String(url).includes('api.nasa.gov')){if(failure==='429')return{ok:false,status:429};if(failure==='offline')throw new TypeError('Failed to fetch');if(failure==='timeout')return new Promise(()=>{});if(failure==='empty')return response([]);if(failure==='stale')return response([FALLBACK_EVENT]);return response([{wrong:true}]);}return response([live]);};
 const r=await load({now,storage:store,timeoutMs:5,fetcher});assert.equal(r.event.mode,'live');assert.equal(r.event.flrID,live.flrID);assert.equal(r.requests,2);assert.match(calls[2],/^https:\/\/ccmc\.gsfc\.nasa\.gov\/DONKI-API\/get\/FLR\?startDate=2026-10-09&endDate=2026-11-08$/);assert.ok(!calls[2].includes('api_key'));
 const cached=await createSolarLoader()({now:new Date(+now+CACHE_MS-1),storage:store,fetcher});assert.equal(cached.event.mode,'cache');assert.equal(calls.filter(x=>!isArchive(x)).length,2);
});
test('both hosts failing, including CORS-like rejection, uses the archive and caches failure',async()=>{
 for(const failure of ['http','cors','timeout','empty','malformed']){const store=storage(),calls=[];const fetcher=async url=>{calls.push(String(url));if(isArchive(url))return response(ARCHIVE_EVENTS);if(String(url).includes('api.nasa.gov'))return{ok:false,status:503};if(failure==='cors')throw new TypeError('Failed to fetch');if(failure==='timeout')return new Promise(()=>{});if(failure==='empty')return response([]);if(failure==='malformed')return response({error:'bad'});return{ok:false,status:503};};const r=await createSolarLoader()({now,storage:store,timeoutMs:5,fetcher});assert.equal(r.event.mode,'archive');assert.equal(r.requests,2);await createSolarLoader()({now,storage:store,fetcher});assert.equal(calls.filter(x=>!isArchive(x)).length,2);}
});
test('both hosts share the three-request cap and historical CCMC recovery works within it',async()=>{
 const historical={...live,flrID:'2025-01-02T09:00:00-FLR-001',beginTime:'2025-01-02T09:00:00Z'};const r=await createSolarLoader()({now,storage:storage(),eventId:historical.flrID,fetcher:async url=>{if(isArchive(url))return response(ARCHIVE_EVENTS);if(String(url).includes('2025-01-02'))return String(url).includes('api.nasa.gov')?{ok:false,status:503}:response([historical]);return response([live]);}});assert.equal(r.event.flrID,historical.flrID);assert.equal(r.requests,3);assert.equal(r.replacement,false);
 const load=createSolarLoader(),store=storage();let count=0;const fetcher=async url=>{if(isArchive(url))return response(ARCHIVE_EVENTS);count++;return{ok:false,status:503};};for(let n=0;n<5;n++)await load({now:new Date(+now+n*CACHE_MS),storage:store,fetcher});assert.equal(count,3);
});
