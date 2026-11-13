export const SITE_IDS=['jezero','gale','arcadia'];
export const validSite=value=>SITE_IDS.includes(value);
export function defaultSite(code){let n=0;for(const ch of String(code))n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;return SITE_IDS[n%3];}
export const normalizeSite=(value,code='')=>validSite(value)?value:defaultSite(code);
export const siteRules=id=>({waterBonus:id==='arcadia'?8:0,rockReveal:id==='jezero'?220:155,rockReach:id==='jezero'?44:32});
export function siteWeight(id,card){return id==='jezero'&&['dust','dustdevil'].includes(card)?1.6:id==='arcadia'&&['ice','freeze'].includes(card)?1.7:1;}
export function mapPoint(lat,lon){return{x:((lon+180)%360+360)%360/360*100,y:(90-lat)/180*100};}
