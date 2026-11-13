export function normalizeMissionCode(value){const code=String(value??'').trim().toUpperCase().replace(/^([A-Z]{2,12})[ _]?(\d{2})$/,'$1-$2');return/^[A-Z]{2,12}-[A-Z0-9]{2,10}$/.test(code)?code:null;}
export function codeForSeed(seed){const n=Number(seed)>>>0;return ['DUST','NOVA','PAWS','MARS','ORBIT','ROVER'][n%6]+'-'+String(Math.floor(n/6)%100).padStart(2,'0');}
export function hashCode(code){let h=2166136261;for(const ch of code){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
