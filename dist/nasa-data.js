export const NASA_API_KEY='DEMO_KEY';
export const CACHE_KEY='astro-kitty-donki-v1';
export const CACHE_MS=3*60*60*1000;
export const FALLBACK_EVENT=Object.freeze({flrID:'2024-05-10T06:27:00-FLR-001',startTime:'2024-05-10T06:27:00Z',classType:'X3.9',source:'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30666/-1'});
export function validEventId(id){return typeof id==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?-FLR-\d{1,6}$/.test(id)&&Number.isFinite(Date.parse(id.split('-FLR-')[0]+'Z'));}
export function normalizeEvent(row){
 const rawTime=row?.beginTime??row?.startTime;
 const startTime=typeof rawTime==='string'&&!/(?:Z|[+-]\d\d:\d\d)$/i.test(rawTime)?rawTime+'Z':rawTime;
 if(!row||!validEventId(row.flrID)||typeof startTime!=='string'||!Number.isFinite(Date.parse(startTime)))return null;
 let source='https://ccmc.gsfc.nasa.gov/DONKI/';
 try{const u=new URL(String(row.source??row.link??source));if(u.protocol==='https:'&&!u.username&&!u.password&&['ccmc.gsfc.nasa.gov','kauai.ccmc.gsfc.nasa.gov','webtools.ccmc.gsfc.nasa.gov'].includes(u.hostname))source=u.href;}catch{}
 const rawClass=String(row.classType??'').trim().toUpperCase();
 return{flrID:row.flrID,startTime,classType:/^[ABCMX]\d+(?:\.\d+)?$/.test(rawClass)?rawClass:'?',source};
}
export function flareStrength(event){const letter=event?.classType?.[0],level='ABCMX'.indexOf(letter)+1;return {level,letter:level?letter:'?',tier:letter==='X'?'huge':letter==='M'?'strong':level?'small':'unknown',goal:letter==='X'?50:letter==='M'?40:level?30:40};}
function storage(){try{return globalThis.localStorage;}catch{return null;}}
export function createSolarLoader(){
 let requests=0,localArchive=null,memory=null,inflight=null;
 return async function load({fetcher=globalThis.fetch,storage:store=storage(),now=new Date(),online=true,eventId=null,timeoutMs=6000}={}){
  const time=now.getTime();
  if(!localArchive){try{const r=await fetcher(new URL('./data/donki-events.json',import.meta.url));const rows=r.ok?await r.json():[];localArchive=Array.isArray(rows)?rows.map(normalizeEvent).filter(Boolean):[];}catch{localArchive=[];}if(!localArchive.length)localArchive=[{...FALLBACK_EVENT}];}
  const archive=[...localArchive].sort((a,b)=>Date.parse(b.startTime)-Date.parse(a.startTime));
  if(!memory){try{const c=JSON.parse(store?.getItem(CACHE_KEY)??'null');if(c?.version===2&&Number.isFinite(c.fetchedAt)&&Array.isArray(c.events)){memory={...c,events:c.events.map(normalizeEvent).filter(Boolean)};}}catch{}}
  async function endpoint(url){
   if(!online||requests>=3)return null;requests++;
   const controller=new AbortController();let timer;
   try{
    const request=(async()=>{const r=await fetcher(url,{signal:controller.signal});if(!r.ok)return null;const rows=await r.json();return Array.isArray(rows)?rows.map(normalizeEvent).filter(Boolean):null;})();
    const timed=new Promise(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(null);},timeoutMs);});
    return await Promise.race([request,timed]);
   }catch{return null;}finally{clearTimeout(timer);}
  }
  async function api(start,end,accept){
   const query=`startDate=${start}&endDate=${end}`;
   for(const url of [`https://api.nasa.gov/DONKI/FLR?${query}&api_key=${encodeURIComponent(NASA_API_KEY)}`,`https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?${query}`]){
    if(!online||requests>=3)break;
    const rows=(await endpoint(url))?.filter(accept);
    if(rows?.length)return rows;
   }
   return null;
  }
  const start=new Date(time-30*86400000).toISOString().slice(0,10),end=now.toISOString().slice(0,10);
  let rows=null,mode='archive';
  const fresh=memory&&time>=memory.fetchedAt&&time-memory.fetchedAt<CACHE_MS;
  if(fresh){rows=memory.events;mode=rows.length?'cache':'archive';}
  else if(online){
   if(!inflight)inflight=api(start,end,e=>Date.parse(e.startTime)>=time-30*86400000&&Date.parse(e.startTime)<=time);
   const result=await inflight;inflight=null;
   rows=result?.filter(e=>Date.parse(e.startTime)>=time-30*86400000&&Date.parse(e.startTime)<=time);
   if(rows?.length){mode='live';memory={version:2,fetchedAt:time,events:rows,shared:memory?.shared??{}};try{store?.setItem(CACHE_KEY,JSON.stringify(memory));}catch{}}
   else{memory={version:2,fetchedAt:time,events:[],shared:memory?.shared??{}};try{store?.setItem(CACHE_KEY,JSON.stringify(memory));}catch{}}
  }
  const latest=rows?.length?[...rows].sort((a,b)=>Date.parse(b.startTime)-Date.parse(a.startTime))[0]:archive[0];
  if(!rows?.length)mode='archive';
  let selected=latest,selectedMode=mode,replacement=false;
  if(eventId){
   selected=[...(rows??[]),...archive].find(e=>e.flrID===eventId);
   if(selected)selectedMode=archive.some(e=>e.flrID===eventId)&&!(rows??[]).some(e=>e.flrID===eventId)?'archive':mode;
   else if(validEventId(eventId)){
    const cached=memory?.shared?.[eventId],freshShared=cached&&time>=cached.fetchedAt&&time-cached.fetchedAt<CACHE_MS;
    if(freshShared){selected=normalizeEvent(cached.event);selectedMode='cache';}
    else{
     const date=eventId.slice(0,10),found=await api(date,date,e=>e.flrID===eventId);selected=found?.find(e=>e.flrID===eventId);selectedMode='live';
     if(memory){memory.shared??={};memory.shared[eventId]={event:selected??null,fetchedAt:time};try{store?.setItem(CACHE_KEY,JSON.stringify(memory));}catch{}}
    }
   }
   if(!selected){selected=archive[0];selectedMode='archive';replacement=true;}
  }
  return {event:{...selected,mode:selectedMode},latest:{...latest,mode},quiet:mode!=='archive'&&Date.parse(latest.startTime)<time-7*86400000,replacement,requestedEventId:eventId,requests};
 };
}
const sessionLoader=createSolarLoader();
export const loadSpaceWeather=options=>sessionLoader(options);

export async function loadSolarEvent(options={}){return (await createSolarLoader()(options)).event;}
