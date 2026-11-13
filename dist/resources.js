import {t} from './strings.js';

export const RESOURCES=[
 ['NASA Open APIs','https://api.nasa.gov/','resApi',true],
 ['Space Weather Database (DONKI)','https://ccmc.gsfc.nasa.gov/tools/DONKI/','resDonki',true],
 ['NASA Open Science Data Repository (OSDR)','https://osdr.nasa.gov/','resOsdr',true],
 ['RadLab radiation dosimetry database','https://visualization.osdr.nasa.gov/radlab/gui/data-api/','resRadlab',true],
 ['Mars Trek','https://trek.nasa.gov/mars/','resTrek',true],
 ['CSA: Space resources for STEM and youth organizations','https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp','resCsaStem',false],
 ['CSA: Food production on the Moon and in remote areas','https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/','resCsaFood',false],
];
export function resourcesHTML(){return `<details class="rules-detail resources-list"><summary>${t('resTitle')}</summary><ul>${RESOURCES.map(([name,url,key])=>`<li><a href="${url}" target="_blank" rel="noopener">${name}</a><small>${t(key)}</small></li>`).join('')}</ul><p class="simple-note">${t('resDisclaimer')}</p></details>`;}
