import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeEvent,loadSolarEvent} from '../dist/nasa-data.js';
const archive=JSON.parse(await readFile(new URL('../dist/data/donki-events.json',import.meta.url)));
const memory=()=>{let v=null;return{getItem:()=>v,setItem:(k,value)=>{v=value;}};};
test('archive records have genuine catalog identity, dates and primary NASA provenance',()=>{assert.equal(archive.length,9);for(const r of archive){assert.equal(r.flrID.slice(0,16),r.startTime.slice(0,16));assert.ok(normalizeEvent(r));assert.ok(['ccmc.gsfc.nasa.gov','kauai.ccmc.gsfc.nasa.gov','webtools.ccmc.gsfc.nasa.gov'].includes(new URL(r.source).hostname));}});
test('offline mode uses the bundled JSON without making an API request',async()=>{let calls=0;const r=await loadSolarEvent({online:false,storage:memory(),fetcher:async url=>{calls++;assert.ok(String(url).endsWith('donki-events.json'));return{ok:true,json:async()=>archive};}});assert.equal(calls,1);assert.equal(r.mode,'archive');assert.equal(r.startTime,'2026-07-04T01:52:00Z');});
test('rate-limited NASA requests fall back to actual historical events',async()=>{const r=await loadSolarEvent({storage:memory(),fetcher:async url=>String(url).includes('api.nasa.gov')?{ok:false,status:429}:{ok:true,json:async()=>archive}});assert.equal(r.mode,'archive');});
test('an empty or malformed API response uses the archive',async()=>{for(const data of [[],{error:'bad'},[{flrID:'invented',startTime:'yesterday'}]]){const r=await loadSolarEvent({storage:memory(),fetcher:async url=>({ok:true,json:async()=>String(url).includes('api.nasa.gov')?data:archive})});assert.equal(r.mode,'archive');}});
test('live data uses the 30-day DEMO_KEY request and a fresh cached record restores offline',async()=>{
 const storage=memory();let request;const now=new Date('2026-11-06T00:00:00Z');
 const apiRow={flrID:'2026-11-05T21:08:00-FLR-001',beginTime:'2026-11-05T21:08:00Z',classType:'M2.4',link:archive[0].source};
 const live=await loadSolarEvent({storage,now,fetcher:async url=>{if(String(url).includes('api.nasa.gov'))request=String(url);return{ok:true,json:async()=>String(url).includes('api.nasa.gov')?[apiRow]:archive};}});
 assert.equal(live.mode,'live');assert.equal(live.startTime,apiRow.beginTime);assert.match(request,/startDate=2026-10-07&endDate=2026-11-06&api_key=DEMO_KEY/);
 const cached=await loadSolarEvent({online:false,now,storage,fetcher:async()=>{throw Error('offline');}});assert.equal(cached.mode,'cache');assert.equal(cached.flrID,apiRow.flrID);
});
test('storage denial and network failures are safe; untrusted source links cannot execute',async()=>{const r=await loadSolarEvent({storage:{getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');}},fetcher:async url=>{if(String(url).includes('api.nasa.gov'))throw Error('network');return{ok:true,json:async()=>archive};}});assert.equal(r.mode,'archive');assert.equal(normalizeEvent({...archive[0],source:'javascript:bad()'}).source,'https://ccmc.gsfc.nasa.gov/DONKI/');});
test('DONKI webtools link keeps the exact verified NASA hostname and rejects lookalikes',()=>{
 const link='https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/FLR/46774/1';
 const row={flrID:'2026-06-10T23:30:00-FLR-001',beginTime:'2026-06-10T23:30:00Z',link};assert.equal(normalizeEvent(row).source,link);
 for(const bad of ['https://webtools.ccmc.gsfc.nasa.gov.example.com/x','https://example.com/webtools.ccmc.gsfc.nasa.gov','http://webtools.ccmc.gsfc.nasa.gov/x','https://evil.webtools.ccmc.gsfc.nasa.gov/x'])assert.equal(normalizeEvent({...row,link:bad}).source,'https://ccmc.gsfc.nasa.gov/DONKI/');
});
