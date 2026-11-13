import {EN} from '../dist/strings.js';
const exceptions={nasa:2,pip:1,rad:1,maven:2,crew:1,water:2,fire:1,every:2,our:1,science:1,real:1,astronaut:3,astronauts:3};
export function syllables(word){const w=word.toLowerCase();if(exceptions[w])return exceptions[w];if(w.length<4)return 1;const trimmed=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'');return Math.max(1,(trimmed.match(/[aeiouy]{1,2}/g)||[]).length);}
const clean=text=>String(text).replace(/https?:\S+/g,'').replace(/\{\w+\}/g,'').replace(/<[^>]*>/g,'').replace(/\b\d+(?:\.\d+)?\b/g,'');
export function measure(texts){const text=texts.map(clean).join('\n'),words=text.match(/[A-Za-z]+(?:['’][a-z]+)?/g)||[],sentences=text.split(/[.!?]+|\n/).filter(s=>/[A-Za-z]/.test(s)).length,syllableCount=words.reduce((n,w)=>n+syllables(w),0);return {words:words.length,sentences,syllables:syllableCount,grade:Number((.39*words.length/sentences+11.8*syllableCount/words.length-15.59).toFixed(2))};}
export function readingReport(copy=EN){return Object.fromEntries(Object.entries({
 ui:Object.values(copy.ui).filter(x=>typeof x==='string'&&!/https?:|<[^>]*>/.test(x)&&(x.match(/[A-Za-z]+/g)||[]).length>=6),
 cards:Object.values(copy.cards).flatMap(c=>[c.question,...c.choices.map(x=>x.outcome)]),
 facts:Object.values(copy.facts).map(f=>f.text),
 sites:Object.values(copy.sites).flatMap(s=>[s.story,s.fact]),
 storyExtras:[...Object.values(copy.eventScenes).map(s=>s.line),...copy.rocks,...copy.jokes],
 storyUpgrade:Object.entries(copy.ui).filter(([k,v])=>k.startsWith('upgrade')&&(v.match(/[A-Za-z]+/g)||[]).length>=6).map(([,v])=>v).concat(copy.trainingCheers),
 launchSimulator:[...Object.values(copy.launch.pip),...Object.values(copy.launch.descriptions),...Object.values(copy.launch.terms),...copy.launch.facts.map(f=>f.line)],
 fieldTraining:Object.entries(copy.ui).filter(([k,v])=>/^(?:command|geology|clue|pick|trainingKey)/.test(k)&&(v.match(/[A-Za-z]+/g)||[]).length>=6).map(([,v])=>v).concat(['roverPlans','autoNav','streambed','jezeroLayers','lavaHoles','marsSalt','marsMeteorite','rockContext'].map(k=>copy.facts[k].text))
}).map(([group,texts])=>[group,measure(texts)]));}
if(process.argv[1]?.endsWith('reading-level.mjs'))console.log(JSON.stringify(readingReport(),null,2));
