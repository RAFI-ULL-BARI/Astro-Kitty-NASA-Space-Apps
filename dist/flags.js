import {t} from './strings.js';

export const BANGLADESH_FLAG={ratio:.6,discX:.45,discY:.3,radius:.2,green:'#006a4e',red:'#f42a41',outline:'#ffffff55'};
export function drawBangladeshFlag(ctx,x,y,width){
  if(!Number.isFinite(width)||width<=0)return;
  const g=BANGLADESH_FLAG,height=width*g.ratio;
  ctx.save();ctx.fillStyle=g.green;ctx.fillRect(x,y,width,height);
  ctx.beginPath();ctx.arc(x+width*g.discX,y+height/2,width/5,0,Math.PI*2);ctx.fillStyle=g.red;ctx.fill();
  ctx.strokeStyle=g.outline;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,Math.max(0,width-1),Math.max(0,height-1));ctx.restore();
}
export const FLAGS=[{id:'bd',nameKey:'flagBangladesh',draw:drawBangladeshFlag},{id:'none',nameKey:'flagNone',draw:()=>{}}];
export const validateFlag=value=>FLAGS.some(flag=>flag.id===value)?value:'bd';
export function profileFlag(storage){try{const store=storage??globalThis.localStorage;return validateFlag(JSON.parse(store?.getItem('astro-kitty-profile-v1')||'{}')?.flag);}catch{return'bd';}}
let sharedFlag=profileFlag();
globalThis.addEventListener?.('storage',event=>{if(event.key===null||event.key==='astro-kitty-profile-v1')sharedFlag=profileFlag();});
export const currentFlag=()=>sharedFlag;
export function flagSVG(id='bd',width=24){
  if(validateFlag(id)==='none')return `<svg viewBox="0 0 100 60" role="img" aria-label="${t('flagNone')}" style="width:${width}px;height:${width*.6}px;stroke:none;flex:none"><rect x="1" y="1" width="98" height="58" rx="5" fill="none" stroke="#acbacb" stroke-width="2"/><path d="M28 46 72 14" fill="none" stroke="#acbacb" stroke-width="3"/></svg>`;
  return `<svg class="flag-svg" viewBox="0 0 100 60" role="img" aria-label="${t('flagLabel')}" style="width:${width}px;height:${width*.6}px;stroke:none;flex:none;vertical-align:middle"><rect width="100" height="60" fill="#006a4e"/><circle cx="45" cy="30" r="20" fill="#f42a41"/><rect x=".5" y=".5" width="99" height="59" fill="none" stroke="#ffffff55" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
}
export function teamCreditHTML(){return `<footer class="team-credit"><span>${t('teamCredit')}</span>${flagSVG('bd')}</footer>`;}
