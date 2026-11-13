import test from 'node:test';
import assert from 'node:assert/strict';
import {PIP_LAYOUT,POOR_LAYOUT,validLayout,normalizeLayout,encodeLayout,decodeLayout,layoutEffects,placeModule,sceneModules} from '../dist/base-design.js';
import {SITE_IDS,defaultSite,normalizeSite,siteWeight,siteRules,mapPoint} from '../dist/landing-sites.js';
import {parseMissionLink,missionLink} from '../dist/mission-link.js';
import {createOutpost,restoreOutpost,defaultPlan,previewPlan,confirmPlan,choose,choiceEffects,drawSurprise,showSummary,nextSol,missionStars} from '../dist/outpost-engine.js';
import {FALLBACK_EVENT,flareStrength} from '../dist/nasa-data.js';
import {EN} from '../dist/strings.js';
test('layout codec accepts only six unique in-range non-home module tiles',()=>{
 assert.ok(validLayout(PIP_LAYOUT));assert.equal(encodeLayout(PIP_LAYOUT).length,6);assert.deepEqual(decodeLayout(encodeLayout(PIP_LAYOUT)),PIP_LAYOUT);
 for(const x of [null,[],{...PIP_LAYOUT,shelter:-1},{...PIP_LAYOUT,shelter:20},{...PIP_LAYOUT,shelter:12},{...PIP_LAYOUT,shelter:6},{...PIP_LAYOUT,unknown:2},Object.fromEntries(Object.entries(PIP_LAYOUT).slice(0,5)),{...PIP_LAYOUT,solar1:8.5}]){assert.equal(validLayout(x),false);assert.deepEqual(normalizeLayout(x),PIP_LAYOUT);}
 for(const text of ['','b78d6hX','aaaaaa','c78d6h','z78d6h','../<script>','%6278d6h'])assert.equal(decodeLayout(text),null);
 assert.equal(placeModule(PIP_LAYOUT,'water',11),null);assert.equal(placeModule(PIP_LAYOUT,'unknown',2),null);assert.equal(placeModule(PIP_LAYOUT,'water',12),null);assert.deepEqual(placeModule(PIP_LAYOUT,'water',1),{...PIP_LAYOUT,water:1});
});
test('adjacency rules change exactly the promised small quantities',()=>{
 const a=createOutpost({code:'DUST-42',site:'gale',layout:PIP_LAYOUT}),b=createOutpost({code:'DUST-42',site:'gale',layout:POOR_LAYOUT});
 assert.deepEqual(layoutEffects(PIP_LAYOUT),{shelterFar:false,windyPanels:0,nearPanels:1,foodBonus:2,roverSafe:true});
 assert.deepEqual(layoutEffects(POOR_LAYOUT),{shelterFar:true,windyPanels:2,nearPanels:0,foodBonus:0,roverSafe:false});
 const p={air:2,water:1,food:1,shield:1,wall:0};assert.equal(previewPlan(a,p).meters.food,previewPlan(b,p).meters.food+2);
 assert.equal(previewPlan(a,{...p,food:0}).meters.food,previewPlan(b,{...p,food:0}).meters.food);
 a.meters.shielding=b.meters.shielding=50;assert.equal(choiceEffects(a,'storm','shelter').spirit,choiceEffects(b,'storm','shelter').spirit+5);
 assert.equal(choiceEffects(a,'storm','finish').spirit,choiceEffects(b,'storm','finish').spirit+5);
 assert.equal(choiceEffects(a,'dust','rover').power,choiceEffects(b,'dust','rover').power+1);
 a.weather[0]=b.weather[0]='dusty';confirmPlan(a,p);confirmPlan(b,p);assert.equal(a.cleanliness,b.cleanliness+2);
 for(let n=1;n<200;n++){const s=createOutpost({seed:n,layout:PIP_LAYOUT});s.sol=[2,3,4,5].find(x=>x!==s.stormSol);assert.notEqual(drawSurprise(s),'sand');}
});
test('share settings validate tampering, round-trip site/layout/event, and migrate old saves safely',()=>{
 const s=createOutpost({code:'DUST-42',site:'arcadia',layout:POOR_LAYOUT,stormEvent:FALLBACK_EVENT}),url=missionLink('https://example.test/outpost.html?qa=x',s),read=parseMissionLink(url);
 assert.deepEqual(read,{site:s.site,layout:s.layout,eventId:s.stormEvent.flrID,invalid:false});assert.ok(!url.includes('qa='));
 assert.deepEqual(parseMissionLink('https://x.test/?site=<script>&base=aaaaaa&event=oops'),{site:null,layout:null,eventId:null,invalid:true});
 const old={...s,version:2};for(const k of ['site','layout','stormGoal'])delete old[k];const r=restoreOutpost(old);assert.ok(r);assert.equal(r.version,3);assert.equal(r.site,'gale');assert.deepEqual(r.layout,PIP_LAYOUT);assert.deepEqual(r.meters,old.meters);assert.deepEqual(r.log,old.log);assert.equal(r.legacyRules,true);
 const fixed=restoreOutpost({...s,site:'oops',layout:{shelter:12}});assert.equal(fixed.site,defaultSite(s.code));assert.deepEqual(fixed.layout,PIP_LAYOUT);
});
test('sites have validated defaults, real fact links and precise small game effects',()=>{
 const chosen=new Set();for(let n=0;n<100;n++)chosen.add(defaultSite('DUST-'+n));assert.equal(chosen.size,3);
 for(const site of SITE_IDS){assert.equal(normalizeSite(site),site);const s=createOutpost({code:'DUST-42',site});assert.equal(s.site,site);assert.equal(s.meters.water,site==='arcadia'?80:72);assert.match(EN.sites[site].url,/^https:\/\/(science|www\.jpl)\.nasa\.gov\//);}
 assert.equal(normalizeSite('bad','DUST-42'),defaultSite('DUST-42'));
 assert.equal(siteWeight('jezero','dust'),1.6);assert.equal(siteWeight('jezero','dustdevil'),1.6);assert.equal(siteWeight('arcadia','ice'),1.7);assert.equal(siteWeight('arcadia','freeze'),1.7);assert.equal(siteWeight('gale','ice'),1);
 assert.ok(siteRules('jezero').rockReveal>siteRules('gale').rockReveal);assert.ok(siteRules('jezero').rockReach>siteRules('gale').rockReach);
 assert.deepEqual(mapPoint(0,0),{x:50,y:50});assert.deepEqual(mapPoint(90,180),{x:0,y:0});assert.ok(mapPoint(47,192).x<5);
});
test('same code, site, base and event reproduce mission state and previews',()=>{
 for(const site of SITE_IDS)for(const layout of [PIP_LAYOUT,POOR_LAYOUT])for(const classType of ['C2.4','M2.4','X2.4']){
 const options={code:'DUST-42',site,layout,stormEvent:{...FALLBACK_EVENT,classType}},a=createOutpost(options),b=createOutpost(options);
 assert.deepEqual(a,b);assert.equal(a.stormGoal,flareStrength(a.stormEvent).goal);confirmPlan(a,defaultPlan(a));confirmPlan(b,defaultPlan(b));choose(a,'balance');choose(b,'balance');assert.deepEqual(a,b);assert.deepEqual(restoreOutpost(JSON.parse(JSON.stringify(a))),a);
 }
 const modules=sceneModules(POOR_LAYOUT);for(let i=1;i<modules.length;i++)assert.ok(modules[i].column>=modules[i-1].column);
});
test('storm protection and star use the selected event goal at all three tier boundaries',()=>{
 for(const [letter,goal]of [['C',30],['M',40],['X',50]]){
 const s=createOutpost({code:'DUST-42',site:'gale',stormEvent:{...FALLBACK_EVENT,classType:letter+'2.4'}});s.phase='decision';s.sol=s.stormSol;s.meters.shielding=goal-1;assert.ok(choiceEffects(s,'storm','shelter').spirit<0);s.meters.shielding=goal;assert.equal(choiceEffects(s,'storm','shelter').spirit,10);choose(s,'shelter');assert.equal(missionStars(s)[1].earned,true);assert.equal(s.lastChoice.goal,goal);
 }
});

import {placementEffects} from '../dist/base-design.js';
import {layoutHint} from '../dist/outpost-setup.js';
test('after Reset, hints use only the modules actually placed',()=>{
 const empty=placementEffects({});assert.deepEqual(empty,{shelterFar:false,windyPanels:0,nearPanels:0,foodBonus:0,roverSafe:false});
 assert.equal(layoutHint({shelter:0},'shelter'),EN.ui.shelterFar);
 assert.equal(layoutHint({garage:0},'garage'),EN.ui.garageFar);
 assert.equal(layoutHint({greenhouse:7},'greenhouse'),EN.ui.greenhouseFar);
 assert.equal(layoutHint({water:6},'water'),EN.ui.greenhouseFar);
 assert.equal(layoutHint({greenhouse:7,water:6},'water'),EN.ui.greenhouseNear);
 assert.equal(layoutHint({garage:17},'garage'),EN.ui.garageNear);
 assert.equal(layoutHint({shelter:11},'shelter'),EN.ui.shelterNear);
});
test('complete layouts keep their exact gameplay effects while invalid missions retain Pip repair',()=>{
 for(const layout of [PIP_LAYOUT,POOR_LAYOUT])assert.deepEqual(placementEffects(layout),layoutEffects(layout));
 assert.deepEqual(placementEffects({solar1:9,solar2:19}),{shelterFar:false,windyPanels:2,nearPanels:0,foodBonus:0,roverSafe:false});
 assert.equal(placementEffects({greenhouse:-1,water:0,solar1:20}).foodBonus,0);
 assert.deepEqual(layoutEffects({shelter:0}),layoutEffects(PIP_LAYOUT));
});
