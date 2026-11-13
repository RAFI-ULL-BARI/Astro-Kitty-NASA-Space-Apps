export const GRID={width:5,height:4,habitat:12};
export const MODULES=['shelter','greenhouse','solar1','solar2','water','garage'];
export const PIP_LAYOUT=Object.freeze({shelter:11,greenhouse:7,solar1:8,solar2:13,water:6,garage:17});
export const POOR_LAYOUT=Object.freeze({shelter:0,greenhouse:4,solar1:9,solar2:19,water:10,garage:1});
export const distance=(a,b)=>Math.abs(a%5-b%5)+Math.abs(Math.floor(a/5)-Math.floor(b/5));
export const adjacent=(a,b)=>distance(a,b)===1;
export function validLayout(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===6&&MODULES.every(k=>Object.hasOwn(value,k)&&Number.isInteger(value[k])&&value[k]>=0&&value[k]<20&&value[k]!==GRID.habitat)&&new Set(MODULES.map(k=>value[k])).size===6;}
export function normalizeLayout(value){return validLayout(value)?Object.fromEntries(MODULES.map(k=>[k,value[k]])):{...PIP_LAYOUT};}
export function encodeLayout(value){const layout=normalizeLayout(value);return MODULES.map(k=>layout[k].toString(20)).join('');}
export function decodeLayout(text){if(typeof text!=='string'||!/^[0-9a-j]{6}$/.test(text))return null;const layout=Object.fromEntries(MODULES.map((k,i)=>[k,parseInt(text[i],20)]));return validLayout(layout)?layout:null;}

export function placementEffects(value){const l=value&&typeof value==='object'?value:{},placed=k=>Number.isInteger(l[k])&&l[k]>=0&&l[k]<20&&l[k]!==GRID.habitat;return {shelterFar:placed('shelter')&&!adjacent(l.shelter,GRID.habitat),windyPanels:['solar1','solar2'].filter(k=>placed(k)&&l[k]%5===4).length,nearPanels:['solar1','solar2'].filter(k=>placed(k)&&adjacent(l[k],GRID.habitat)).length,foodBonus:placed('greenhouse')&&placed('water')&&adjacent(l.greenhouse,l.water)?2:0,roverSafe:placed('garage')&&adjacent(l.garage,GRID.habitat)};}
export function layoutEffects(value){return placementEffects(normalizeLayout(value));}
export function placeModule(value,module,tile){if(!MODULES.includes(module)||!Number.isInteger(tile)||tile<0||tile>=20||tile===GRID.habitat)return null;const l={...value};if(MODULES.some(k=>k!==module&&l[k]===tile))return null;l[module]=tile;return l;}
export function sceneModules(value){const l=normalizeLayout(value);return MODULES.map(id=>({id,tile:l[id],column:l[id]%5,row:Math.floor(l[id]/5)})).sort((a,b)=>a.column-b.column||a.row-b.row||MODULES.indexOf(a.id)-MODULES.indexOf(b.id));}
