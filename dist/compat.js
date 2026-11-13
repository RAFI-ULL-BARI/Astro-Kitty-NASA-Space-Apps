export function installRoundRect(proto=globalThis.CanvasRenderingContext2D?.prototype){
  if(!proto||proto.roundRect)return;
  proto.roundRect=function(x,y,w,h,r=0){
    const list=Array.isArray(r)?r:[r];if(list.length<1||list.length>4)throw new RangeError('Invalid radii');
    const v=list.map(n=>typeof n==='number'?{x:n,y:n}:n);if(v.some(n=>n.x<0||n.y<0))throw new RangeError('Negative radius');
    let a=v[0],b=v[1]??a,d=v[3]??v[1]??a,e=v[2]??a;
    if(w<0){x+=w;w=-w;[a,b,e,d]=[b,a,d,e];}if(h<0){y+=h;h=-h;[a,b,e,d]=[d,e,b,a];}
    const scale=Math.min(1,w/(a.x+b.x||1),w/(d.x+e.x||1),h/(a.y+d.y||1),h/(b.y+e.y||1));
    const q=[a,b,e,d].map(n=>({x:n.x*scale,y:n.y*scale}));[a,b,e,d]=q;
    this.moveTo(x+a.x,y);this.lineTo(x+w-b.x,y);this.quadraticCurveTo(x+w,y,x+w,y+b.y);
    this.lineTo(x+w,y+h-e.y);this.quadraticCurveTo(x+w,y+h,x+w-e.x,y+h);
    this.lineTo(x+d.x,y+h);this.quadraticCurveTo(x,y+h,x,y+h-d.y);this.lineTo(x,y+a.y);this.quadraticCurveTo(x,y,x+a.x,y);this.closePath();return this;
  };
}
installRoundRect();
export function accessPreferences(){
  try{return JSON.parse(localStorage.getItem('astro-kitty-profile-v1')||'{}')||{};}catch{return{};}
}
if(typeof document!=='undefined'){
  const preferences=accessPreferences();document.body?.classList.toggle('big-text',!!preferences.bigText);document.body?.classList.toggle('reduce-motion',!!preferences.reduceMotion);
}
export function containPoint(clientX,clientY,rect,width,height){
  const scale=Math.min(rect.width/width,rect.height/height),ox=(rect.width-width*scale)/2,oy=(rect.height-height*scale)/2;
  const x=(clientX-rect.left-ox)/scale,y=(clientY-rect.top-oy)/scale;
  return x>=0&&x<=width&&y>=0&&y<=height?{x,y}:null;
}
export async function registerOffline(){
  if(!('serviceWorker'in navigator))return false;
  try{const r=await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{scope:new URL('./',import.meta.url).pathname});let timer;const ready=await Promise.race([navigator.serviceWorker.ready,new Promise(resolve=>{timer=setTimeout(()=>resolve(null),8000);})]);clearTimeout(timer);return !!(r&&ready);}catch{return false;}
}
export function readyVoices(synth=globalThis.speechSynthesis){
  if(!synth)return Promise.resolve([]);const existing=synth.getVoices();if(existing.length)return Promise.resolve(existing);
  return new Promise(resolve=>{
    let timer;const finish=()=>{clearTimeout(timer);synth.removeEventListener?.('voiceschanged',changed);resolve(synth.getVoices());};
    const changed=()=>{if(synth.getVoices().length)finish();};
    synth.addEventListener?.('voiceschanged',changed);timer=setTimeout(finish,1800);changed();
  });
}

const GOOD=/natural|neural|premium|enhanced|online/i,NICE=/Samantha|Ava|Allison|Serena|Karen|Moira|Tessa|Aria|Jenny|Sonia|Libby|Neerja|Google (UK|US) English|Google English/i,BAD=/eSpeak|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|compact/i;
export function pickVoice(voices=[],lang=/^en[-_]/i){
 let best=null,score=-1e9;
 for(const v of voices){if(!lang.test(v.lang||''))continue;let n=0;if(GOOD.test(v.name))n+=60;if(NICE.test(v.name))n+=25;if(BAD.test(v.name))n-=200;if(/^en[-_](US|GB|IN|AU)/i.test(v.lang))n+=4;if(v.default)n+=2;if(n>score){score=n;best=v;}}
 return best;
}
const BN={'Shabbash!':['সাবাশ!','Shah-bahsh!'],'Oshadharon!':['অসাধারণ!','Aw-shah-dhah-ron!']};
const plain=text=>text.replace(/[()]/g,'');

export function voiceParts(line,voices=[]){
 const bn=pickVoice(voices,/^bn[-_]?/i),en=pickVoice(voices),parts=[];let rest=String(line);
 for(const [word,[script,phonetic]] of Object.entries(BN)){if(rest.startsWith(word)){parts.push(bn?{text:script,voice:bn,lang:bn.lang}:{text:phonetic,voice:en,lang:en?.lang||'en-US'});rest=rest.slice(word.length).trim();break;}}
 rest=plain(rest).trim();if(rest)parts.push({text:rest.replace(/\bDhrubo\b/g,'Dhroobo'),voice:en,lang:en?.lang||'en-US'});
 return parts;
}
export function makeUtterances(line,voices=[],{rate=.94,pitch=1.03}={}){
 return voiceParts(line,voices).map(p=>{const u=new SpeechSynthesisUtterance(p.text);u.lang=p.lang;u.voice=p.voice||null;u.rate=rate;u.pitch=pitch;u.volume=1;return u;});
}
