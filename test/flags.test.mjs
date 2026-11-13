import test from 'node:test';
import assert from 'node:assert/strict';
import {drawBangladeshFlag,validateFlag,profileFlag,FLAGS,flagSVG} from '../dist/flags.js';
test('shared flag helper draws exact 10:6 geometry, off-centre disc, colours and light outline',()=>{
 for(const width of [14,100,240]){const calls=[];const c={save(){},restore(){},beginPath(){},fillRect(...args){calls.push(['rect',this.fillStyle,...args]);},arc(...args){calls.push(['disc',...args]);},fill(){calls.push(['fill',this.fillStyle]);},strokeRect(...args){calls.push(['outline',this.strokeStyle,this.lineWidth,...args]);}};
 drawBangladeshFlag(c,7,11,width);assert.deepEqual(calls[0],['rect','#006a4e',7,11,width,width*.6]);assert.deepEqual(calls[1],['disc',7+.45*width,11+.3*width,width/5,0,Math.PI*2]);assert.deepEqual(calls[2],['fill','#f42a41']);assert.equal(calls[3][1],'#ffffff55');assert.equal(calls[3][2],1);}
});
test('profile validates Bangladesh and no patch, with safe fallback for missing or invalid data',()=>{
 assert.deepEqual(FLAGS.map(f=>f.id),['bd','none']);for(const [input,want]of [['bd','bd'],['none','none'],['BD','bd'],['other','bd'],[null,'bd'],[undefined,'bd'],[{},'bd']])assert.equal(validateFlag(input),want);
 for(const [json,want]of [['{"flag":"bd"}','bd'],['{"flag":"none"}','none'],['{"flag":"bad"}','bd'],['{}','bd'],['broken','bd']])assert.equal(profileFlag({getItem:key=>{assert.equal(key,'astro-kitty-profile-v1');return json;}}),want);
 assert.equal(profileFlag({getItem(){throw Error('storage blocked');}}),'bd');
});
test('HTML flag uses SVG geometry and accessible text without emoji or bitmap flags',()=>{const svg=flagSVG();assert.match(svg,/viewBox="0 0 100 60"/);assert.match(svg,/aria-label="Flag of Bangladesh"/);assert.match(svg,/circle cx="45" cy="30" r="20" fill="#f42a41"/);assert.match(svg,/width="100" height="60" fill="#006a4e"/);assert.doesNotMatch(svg,/<image|🇧🇩/);assert.match(flagSVG('none'),/aria-label="No patch"/);});
