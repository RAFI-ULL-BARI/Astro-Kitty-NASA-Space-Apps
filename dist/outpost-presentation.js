import {t,copy} from './strings.js';
export const REFLECTION_KEY='astro-kitty-storm-answer-v1';
export const REFLECTION_ANSWERS=['water','food','signal'];
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function truthBadge(kind){const key=kind==='real'?'real':'game';return `<span class="truth-badge truth-${key}" title="${esc(t(key+'Tooltip'))}" aria-label="${esc(t(key+'Badge')+'. '+t(key+'Tooltip'))}">${t(key+'Badge')}</span>`;}
export function eventDate(event){return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(event.startTime));}
export function stormPlayLabel(event,now=Date.now()){const age=Number(now)-Date.parse(event.startTime);return event.mode==='live'&&age>=0&&age<=7*86400000?t('playToday',{date:eventDate(event)}):t('playDated',{date:eventDate(event)});}
export function visualMeter(label,value){const n=Math.max(0,Math.min(100,Number(value)||0));return `<div class="simple-gauge" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n}" aria-valuetext="${esc(t('gaugeValue',{label,n}))}"><span aria-hidden="true">${esc(label)}</span><span class="gauge-track" aria-hidden="true"><i style="width:${n}%"></i></span></div>`;}
export const panelDustHTML=clean=>visualMeter(t('clean'),100-clean);
export function oddsHTML(probability){const n=Math.round(probability*100),dots=Array.from({length:10},(_,i)=>`<i class="${n/10>=i+1?'full':n/10>i?'half':''}"></i>`).join('');return `<span class="odds-picture" role="img" aria-label="${t('oddsExact',{n})}"><span aria-hidden="true">${t(n===65?'oddsAbout':'oddsTen',{n:n/10})}</span><span class="odds-dots" aria-hidden="true">${dots}</span></span>`;}
export function wallStatusHTML(s,goal){return `<p class="wall-status" role="status">${t(s.meters.shielding>=goal?'wallSafe':'wallGoal',{wall:Math.round(s.meters.shielding),goal})}</p>`;}
export function saveReflectionAnswer(storage,answer){if(!REFLECTION_ANSWERS.includes(answer))return false;try{storage.setItem(REFLECTION_KEY,answer);return true;}catch{return false;}}

export function learnedIdeas(s){const plans=s.log.map((r,index)=>({r,index})).filter(x=>x.r.type==='plan'),storm=s.log.findIndex(r=>r.type==='decision'&&r.id==='storm'),radio=s.log.findIndex(r=>r.type==='decision'&&r.id==='storm'&&r.choice==='radio');
 return [['Water',plans.find(x=>x.r.plan.wall>0)?.index??plans[0]?.index],['Storm',storm],['Earth',radio>=0?radio:storm]].map(([idea,index])=>{const row=s.log[index],choice=row?(row.type==='plan'?t('learnedWaterPlan',row.plan):copy('cards')[row.id].choices.find(c=>c.id===row.choice)?.label):null;
 const feedback=idea==='Storm'&&row?t(row.choice==='finish'?'learnedFinish':row.choice==='shelter'?'learnedShelter':'learnedRadio'):idea==='Earth'&&row&&radio<0?t('learnedOwnDecision'):'';
 return {text:t('learned'+idea)+(feedback?' '+feedback:''),index:row?index:null,choice:row?t('learnedChoice',{sol:row.sol,choice}):t('learnedWaiting')};});}

export function learnedHTML(s){return `<section class="learned-box"><h3>${t('learnedTitle')}</h3>${learnedIdeas(s).map(x=>`<article><p>${esc(x.text)}</p>${x.index!==null?`<a href="#choice-${x.index}">${esc(x.choice)}</a>`:`<small>${esc(x.choice)}</small>`}</article>`).join('')}</section>`;}
