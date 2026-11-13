import test from 'node:test';import assert from 'node:assert/strict';
import {createSolarLoader,flareStrength,normalizeEvent,FALLBACK_EVENT,CACHE_KEY,CACHE_MS} from '../dist/nasa-data.js';
const now=new Date('2026-11-07T12:00:00Z'),row={flrID:'2026-11-06T09:00:00-FLR-001',beginTime:'2026-11-06T09:00:00Z',classType:'M2.4',link:'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/123/1'};
const memory=()=>{const data={};return{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=v};};
const fetcher=(rows,status=200)=>async url=>({ok:String(url).includes('api.nasa.gov')?status===200:true,status,json:async()=>String(url).includes('api.nasa.gov')?rows:[FALLBACK_EVENT]});
test('newest valid flare, known/unknown classes and all game storm strengths',async()=>{
 const load=createSolarLoader(),r=await load({now,storage:memory(),fetcher:fetcher([{...row,beginTime:'2026-11-05T09:00:00Z'},row])});assert.equal(r.event.mode,'live');assert.equal(r.event.startTime,row.beginTime);assert.equal(r.quiet,false);
 for(const [c,level,goal]of [['A1.2',1,30],['B2.4',2,30],['C2.4',3,30],['M2.4',4,40],['X2.4',5,50],['Z2.4',0,40],['?',0,40]]){const e=normalizeEvent({...row,classType:c}),s=flareStrength(e);assert.equal(s.level,level);assert.equal(s.goal,goal);}
});
test('429, offline, empty, malformed, stale and timeout always show a named real archive',async()=>{
 for(const [rows,status,online]of [[[],200,true],[[{wrong:true}],200,true],[{error:'bad'},200,true],[[row],429,true],[[row],200,false],[[{...row,beginTime:'2000-01-01T00:00:00Z'}],200,true]]){
 const r=await createSolarLoader()({now,online,storage:memory(),fetcher:fetcher(rows,status)});assert.equal(r.event.mode,'archive');assert.equal(r.event.flrID,FALLBACK_EVENT.flrID);assert.equal(r.quiet,false);
 }
 const r=await createSolarLoader()({now,storage:memory(),timeoutMs:5,fetcher:async url=>String(url).includes('api.nasa.gov')?new Promise(()=>{}):{ok:true,json:async()=>[FALLBACK_EVENT]}});assert.equal(r.event.mode,'archive');
 const noFiles=await createSolarLoader()({now,online:false,storage:memory(),fetcher:async()=>{throw Error('all unavailable');}});assert.equal(noFiles.event.flrID,FALLBACK_EVENT.flrID);
});
test('quiet-week statement uses a successful recent window, not an old archive',async()=>{
 const r=await createSolarLoader()({now,storage:memory(),fetcher:fetcher([{...row,beginTime:'2026-10-25T09:00:00Z'}])});assert.equal(r.quiet,true);assert.equal(r.event.mode,'live');
});
test('three-hour cache and three-request visit ceiling include manual refresh attempts',async()=>{
 const store=memory(),load=createSolarLoader();let calls=0;const f=async url=>{if(String(url).includes('api.nasa.gov'))calls++;return{ok:true,json:async()=>String(url).includes('api.nasa.gov')?[row]:[FALLBACK_EVENT]};};
 assert.equal((await load({now,storage:store,fetcher:f})).event.mode,'live');assert.equal((await load({now:new Date(+now+CACHE_MS-1),storage:store,fetcher:f})).event.mode,'cache');assert.equal(calls,1);
 await load({now:new Date(+now+CACHE_MS),storage:store,fetcher:f});assert.equal(calls,2);
 for(let n=2;n<8;n++)await load({now:new Date(+now+n*CACHE_MS),storage:store,fetcher:f});assert.equal(calls,3);
});
test('shared historical event is recovered by its day, or replaced explicitly by the archive',async()=>{
 const shared={...row,flrID:'2025-01-02T09:00:00-FLR-001',beginTime:'2025-01-02T09:00:00Z'};let requests=[];
 const r=await createSolarLoader()({now,storage:memory(),eventId:shared.flrID,fetcher:async url=>{requests.push(String(url));return{ok:true,json:async()=>String(url).includes('2025-01-02')?[shared]:String(url).includes('api.nasa.gov')?[row]:[FALLBACK_EVENT]};}});
 assert.equal(r.event.flrID,shared.flrID);assert.equal(r.replacement,false);assert.ok(requests.some(x=>x.includes('startDate=2025-01-02&endDate=2025-01-02')));
 for(const id of ['2025-01-02T09:00:00-FLR-999','<script>']){const fallback=await createSolarLoader()({now,storage:memory(),eventId:id,fetcher:fetcher([row])});assert.equal(fallback.replacement,true);assert.equal(fallback.event.flrID,FALLBACK_EVENT.flrID);assert.equal(fallback.event.mode,'archive');}
});
test('shared lookups and failed visits are cached for three hours across reloads',async()=>{
 const store=memory(),shared={...row,flrID:'2025-01-02T09:00:00-FLR-001',beginTime:'2025-01-02T09:00:00Z'};let calls=0;
 const f=async url=>{if(String(url).includes('api.nasa.gov'))calls++;return{ok:true,json:async()=>String(url).includes('2025-01-02')?[shared]:String(url).includes('api.nasa.gov')?[row]:[FALLBACK_EVENT]};};
 await createSolarLoader()({now,storage:store,eventId:shared.flrID,fetcher:f});assert.equal(calls,2);
 const cached=await createSolarLoader()({now,storage:store,eventId:shared.flrID,fetcher:f});assert.equal(calls,2);assert.equal(cached.event.mode,'cache');assert.equal(cached.event.flrID,shared.flrID);
 const failedStore=memory();let failed=0;const limited=async url=>{if(String(url).includes('api.nasa.gov')){failed++;return{ok:false,status:429};}return{ok:true,json:async()=>[FALLBACK_EVENT]};};
 await createSolarLoader()({now,storage:failedStore,fetcher:limited});await createSolarLoader()({now,storage:failedStore,fetcher:limited});assert.equal(failed,1);
});
test('DONKI times without a timezone are treated as UTC',()=>{assert.equal(normalizeEvent({...row,beginTime:'2026-11-06T09:00:00'}).startTime,'2026-11-06T09:00:00Z');});
