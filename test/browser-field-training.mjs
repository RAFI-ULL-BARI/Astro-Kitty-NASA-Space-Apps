export async function checkFieldTraining(page,{width,height}){
 const r=await page.locator('html').evaluate(root=>{
  const d=root.querySelector('dialog.extra-training[open]'),box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  return {overflow:root.scrollWidth-root.clientWidth,view:d.dataset.view,dialog:box(d),dialogScroll:d.scrollHeight-d.clientHeight,buttons:[...d.querySelectorAll('button')].map(e=>({text:e.textContent,...box(e)})),badges:[...d.querySelectorAll('.truth-badge')].map(box)};
 });
 if(r.overflow>0||r.dialogScroll>0)throw Error('Activity overflow: '+JSON.stringify(r));
 if(r.buttons.some(b=>b.width<44||b.height<44||b.x<0||b.y<0||b.right>width+.5||b.bottom>height+.5))throw Error('A training control is small or clipped: '+JSON.stringify(r));
 if(r.badges.some(b=>b.height>=40))throw Error('Science badges must be under 40px');
 return r;
}
