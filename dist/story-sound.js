export function createStorySound({AudioClass=globalThis.Audio,ContextClass=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=globalThis.fetch}={}){
 let enabled=true,context=null,available=new Set(),hissNode=null,loaded=false,generation=0;const playing=new Set(),nodes=new Set();
 const urls={yay:new URL('./audio/sfx/yay.mp3',import.meta.url).href,applause:new URL('./audio/sfx/applause.mp3',import.meta.url).href,meow:new URL('./audio/sfx/meow.mp3',import.meta.url).href,purr:new URL('./audio/sfx/purr.mp3',import.meta.url).href};
 async function load(){if(loaded)return;loaded=true;try{const r=await fetcher(new URL('./audio/sfx/manifest.json',import.meta.url));if(r.ok){const data=await r.json();if(Array.isArray(data.files))available=new Set(data.files.filter(f=>Object.keys(urls).some(k=>f===k+'.mp3')));}}catch{}}
 function unlock(){if(!enabled)return;try{context??=new ContextClass();context.resume()?.catch?.(()=>{});}catch{}void load();}
 function tone(freq,delay=0,length=.3,volume=.035,type='sine'){
  if(!enabled||!context)return;try{const o=context.createOscillator(),g=context.createGain(),now=context.currentTime+delay;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(volume,now+.015);g.gain.exponentialRampToValueAtTime(.001,now+length);o.connect(g);g.connect(context.destination);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect();};o.start(now);o.stop(now+length+.03);}catch{}
 }

 function glide(points,{type='sawtooth',volume=.05,q=6,formant=1500,delay=0}={}){
  if(!enabled||!context)return;try{const o=context.createOscillator(),f=context.createBiquadFilter(),g=context.createGain(),now=context.currentTime+delay,end=points[points.length-1][0];o.type=type;f.type='bandpass';f.frequency.value=formant;f.Q.value=q;o.frequency.setValueAtTime(points[0][1],now);for(const [t,hz] of points.slice(1))o.frequency.linearRampToValueAtTime(hz,now+t);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(volume,now+.04);g.gain.setValueAtTime(volume,now+end*.6);g.gain.exponentialRampToValueAtTime(.001,now+end);o.connect(f);f.connect(g);g.connect(context.destination);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();f.disconnect();g.disconnect();};o.start(now);o.stop(now+end+.04);}catch{}
 }
 function burst(delay=0,length=.05,volume=.05,freq=1800){
  if(!enabled||!context)return;try{const n=Math.floor(context.sampleRate*length),b=context.createBuffer(1,n,context.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const src=context.createBufferSource(),f=context.createBiquadFilter(),g=context.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;g.gain.value=volume;src.connect(f);f.connect(g);g.connect(context.destination);nodes.add(src);src.onended=()=>{nodes.delete(src);src.disconnect();f.disconnect();g.disconnect();};src.start(context.currentTime+delay);}catch{}
 }
 let meowTurn=0;
 function synthMeow(){const v=meowTurn++%3,base=[620,700,560][v];glide([[0,base],[.12,base*1.45],[.3,base*1.3],[.5,base*.8]],{formant:1700+v*250,volume:.06});glide([[0,base*2],[.12,base*2.9],[.5,base*1.6]],{formant:2900,volume:.018});}
 function synthPurr(){for(let i=0;i<14;i++)burst(i*.045,.03,.05,170);}
 function synthYay(){[[0,520,880],[.03,640,1040],[.06,430,760]].forEach(([d,a,b])=>glide([[0,a],[.22,b],[.5,b*.96]],{type:'triangle',formant:1300,q:2,volume:.05,delay:d}));[523,659,784,1047].forEach((f,i)=>tone(f,.1+i*.07,.4,.03));}
 function synthApplause(){for(let i=0;i<34;i++)burst(Math.random()*1.1,.035,.035+Math.random()*.03,1300+Math.random()*1600);}
 function synthBuzz(){tone(150,0,.16,.05,'sawtooth');tone(112,.15,.22,.05,'sawtooth');}
 function chime(win=false){[392,494,587].forEach((f,i)=>tone(f*(win?1.25:1),i*.09,.45));}
 function recording(name,fallback){if(!enabled)return;if(!available.has(name+'.mp3')||!AudioClass){fallback();return;}try{const a=new AudioClass(urls[name]);a.volume=name==='applause'?.18:.28;playing.add(a);let failed=false;const token=generation,done=()=>playing.delete(a),fail=()=>{done();if(!failed&&enabled&&token===generation){failed=true;fallback();}};a.onended=done;a.onerror=fail;const p=a.play();p?.catch?.(fail);}catch{fallback();}}
 const synth={yay:synthYay,applause:synthApplause,meow:synthMeow,purr:synthPurr};
 function play(name='yay'){recording(name,()=>(synth[name]??chime)());}
 function finish(){if(!enabled)return;chime(true);recording('applause',synthApplause);recording('meow',synthMeow);}
 function stopAll(){generation++;for(const a of playing){a.pause();try{a.currentTime=0;}catch{}}playing.clear();for(const n of nodes){try{n.stop();}catch{}}nodes.clear();hissNode=null;}
 function setEnabled(value){enabled=!!value;if(!enabled)stopAll();}
 function hiss(on){if(!on){if(hissNode){try{hissNode.stop();}catch{}nodes.delete(hissNode);hissNode=null;}return;}if(!enabled||!context||hissNode)return;
  try{const b=context.createBuffer(1,Math.floor(context.sampleRate*.6),context.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.08;const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=b;source.loop=true;filter.type='lowpass';filter.frequency.value=1100;gain.gain.value=.12;source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();nodes.add(source);hissNode=source;}catch{}
 }
 return{unlock,load,setEnabled,stopAll,play,finish,hiss,chime,buzz:synthBuzz,kitty:()=>play('meow'),purr:()=>play('purr'),click:()=>tone(380,0,.06,.02),thunk:()=>tone(105,0,.12,.035)};
}
