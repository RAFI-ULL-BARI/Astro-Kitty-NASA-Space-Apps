export const CABLES=Object.freeze([
 {id:'p1plus',panel:1,shape:'circle',color:'#ef726e',sign:'+'},
 {id:'p1minus',panel:1,shape:'square',color:'#263343',sign:'−'},
 {id:'p2plus',panel:2,shape:'triangle',color:'#edac67',sign:'+'},
 {id:'p2minus',panel:2,shape:'diamond',color:'#aab6c2',sign:'−'}
]);
export const DEVICES=Object.freeze([{id:'air',cost:1},{id:'radio',cost:1},{id:'rover',cost:2},{id:'heater',cost:1},{id:'lights',cost:1}]);
const PLUG_ORDER=CABLES.map(cable=>cable.id);
export const STORM_ARRIVAL=.95;
export const STORM_DURATION=7.8;
export const ROVER_GUIDE_FADE=.4;

export function shuffledSockets(seed,previous=[]){
 const order=[...PLUG_ORDER];
 for(let i=order.length-1;i>0;i--){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const j=Math.floor(seed/2**32*(i+1));
  [order[i],order[j]]=[order[j],order[i]];
 }
 while([PLUG_ORDER,previous].some(other=>order.every((id,i)=>id===other[i]))){
  order.push(order.shift());
 }
 return order;
}

export function roverGuideOpacity(state,reduced=false){
 if(state.scene!=='rover')return 0;
 const inputAt=state.rover.inputAt;
 if(inputAt==null)return 1;
 return reduced?0:Math.max(0,1-(state.sceneTime-inputAt)/ROVER_GUIDE_FADE);
}

export function trainingLayout(width,height,scene,socketOrder=PLUG_ORDER){
 const narrow=width<700,left=narrow?14:Math.max(30,(width-1040)/2),top=narrow?156:142,w=width-left*2,h=Math.max(240,height-top-(narrow?155:170));
 const sources=scene==='connect'?CABLES.map((c,i)=>({...c,x:w*(i%2?.37:.15),y:h*(i<2?.29:.73)})):[{id:'cell0',x:w*.16,y:h*.32},{id:'cell1',x:w*.16,y:h*.68}];
 const targets=scene==='connect'?socketOrder.map((id,i)=>({...CABLES.find(c=>c.id===id),x:w*.80,y:h*(.13+i*.235)})):DEVICES.map((d,i)=>({...d,x:w*([.55,.84,.55,.84,.70][i]),y:h*([.19,.19,.52,.52,.83][i])}));
 return{left,top,width:w,height:h,narrow,sources,targets};
}
export function feedbackPose(age,reduced=false){
 const p=Math.max(0,Math.min(1,age/.36)),wave=Math.sin(p*Math.PI);
 return{scale:reduced?1:1+.12*wave,angle:reduced||p===1?0:Math.sin(p*Math.PI*4)*.055*(1-p),glow:age<.7?1-age/.7:0};
}
export function dangerOffset(left,strength,clock,reduced=false){return reduced||left<=0?{x:0,y:0}:{x:Math.sin(clock*91)*Math.min(6,strength),y:Math.sin(clock*73)*Math.min(6,strength)*.45};}
