export async function checkVisibleBadges(page){
 const result=await page.locator('body').evaluate(body=>{
  const doc=body.ownerDocument,win=doc.defaultView;
  const visible=el=>{const rect=el.getBoundingClientRect();return rect.width>0&&rect.height>0&&win.getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length>0;};
  return {width:win.innerWidth,height:win.innerHeight,overflow:doc.documentElement.scrollWidth>win.innerWidth,badges:[...doc.querySelectorAll('.truth-badge')].filter(visible).map(el=>({text:el.textContent,height:el.getBoundingClientRect().height})),gameElements:[...doc.querySelectorAll('.game')].filter(visible).map(el=>({tag:el.tagName,id:el.id})),allocations:[...doc.querySelectorAll('[data-alloc]')].map(el=>{const r=el.getBoundingClientRect();return {height:r.height,width:r.width};})};
 });
 if(!result.badges.length)throw Error('Expected at least one visible science badge');
 if(result.badges.some(x=>x.height>=40))throw Error('Science badge must be shorter than 40px: '+JSON.stringify(result));
 if(result.gameElements.some(x=>x.tag!=='MAIN'||x.id!=='game'))throw Error('The game class is reserved for the main story container');
 if(result.overflow)throw Error('Horizontal overflow: '+JSON.stringify(result));
 if(result.allocations.some(x=>x.height<44||x.width<44))throw Error('Sunshine controls must retain 44px touch targets');
 return result;
}
