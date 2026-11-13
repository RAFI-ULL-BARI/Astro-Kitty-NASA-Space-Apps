import {teamCreditHTML} from './flags.js';
import {t,copy,setLanguage} from './strings.js';
import {registerOffline} from './compat.js';
let settings={};try{settings=JSON.parse(localStorage.getItem('astro-kitty-profile-v1')||'{}')??{};}catch{}
const preferences=[['bigText','bigText'],['reduceMotion','reduced'],['captions','captions'],['voice','voice']];
const page=document.getElementById('teacherPage');
setLanguage(settings.language);
function applyPreferences(){
 document.body.classList.toggle('big-text',settings.bigText===true);
 document.body.classList.toggle('reduce-motion',settings.reduceMotion===true);
}
applyPreferences();
page.innerHTML=`<nav><a href="./">${t('brand')}</a><a href="./outpost.html">${t('outpost')}</a><a href="./?training=1">${t('train')}</a></nav><h1>${t('lessonTitle')}</h1><p>${t('lessonIntro')}</p><section><h2>${t('goals')}</h2><ul>${[1,2,3,4,5,6].map(n=>`<li>${t('goal'+n)}</li>`).join('')}</ul></section><section><h2>${t('teacherFieldTitle')}</h2><p>${t('teacherCommands')}</p><a href="./classic/?mission=commands">${t('commandsName')}</a><p>${t('teacherGeology')}</p><a href="./classic/?mission=geology">${t('geologyName')}</a></section><section><h2>${t('activity')}</h2><ol>${[1,2,3,4].map(n=>`<li>${t('minute'+n)}</li>`).join('')}</ol></section><section><h2>${t('questions')}</h2><ol>${[1,2,3].map(n=>`<li>${t('question'+n)}</li>`).join('')}</ol></section><section><h2>${t('accessibility')}</h2><p>${t('teacherTogether')}</p><a class="chip-button" href="./outpost.html">${t('outpost')}</a></section><section><h2>${t('teacherAccessTitle')}</h2><p>${t('teacherAccessText')}</p><div class="teacher-settings">${preferences.map(([key,label])=>`<label class="checkbox-row"><input type="checkbox" data-preference="${key}" ${(settings[key]??(key==='voice'||key==='captions'))?'checked':''}>${t(label)}</label>`).join('')}</div></section><section><h2>${t('honest')}</h2><p>${t('honesty')}</p>${Object.values(copy('facts')).map(f=>`<aside class="fact-box"><strong>${t('fact')}</strong><p>${f.text}</p><a href="${f.url}" target="_blank" rel="noopener">${t('source')}</a></aside>`).join('')}</section><p class="simple-note">${t('noEndorsement')}</p>${teamCreditHTML()}`;
page.addEventListener('change',event=>{
 const key=event.target.dataset.preference;
 if(!preferences.some(([name])=>name===key))return;
 settings[key]=event.target.checked;
 applyPreferences();
 try{localStorage.setItem('astro-kitty-profile-v1',JSON.stringify(settings));}catch{}
});
registerOffline();
