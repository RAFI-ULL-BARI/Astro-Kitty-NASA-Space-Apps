import {sceneModules} from './base-design.js';

export const SURFACE_ROCKS=[
  {x:615,y:550,r:32},{x:620,y:322,r:28},{x:965,y:585,r:27}
];
export const KITTY_RADIUS=12;
export const ROVER_RADIUS=23;
export const OUTPOST_START={x:355,y:570};
const bounds={left:60,right:1220,top:280,bottom:660};
const step=20;
const rect=(left,top,right,bottom)=>({left,top,right,bottom});
const panelFootprint=(x,y)=>rect(x-94,y-41,x+95,y+34);

export function visibleBaseModules(layout){
  return sceneModules(layout)
    .filter(module=>['shelter','greenhouse','solar1','solar2'].includes(module.id))
    .map(module=>({...module,x:150+module.column*240,y:360+module.row*42}));
}

export function surfaceObstacles({panels=[],layout=null}={}){
  const objects=[rect(226,471,334,565),rect(889,204,1201,429),...SURFACE_ROCKS];
  if(!layout)return objects.concat(panels.map(({x,y})=>panelFootprint(x,y)));
  for(const {id,x,y} of visibleBaseModules(layout)){
    if(id.startsWith('solar'))objects.push(panelFootprint(x,y));
    else if(id==='shelter')objects.push(rect(x-65,y-50,x+69,y+37));
    else objects.push(rect(x-55,y-53,x+55,y+16));
  }
  return objects;
}

function insideBounds({x,y}){
  return x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom;
}
function withinReach(point,object,radius){
  if('r' in object)return Math.hypot(point.x-object.x,point.y-object.y)<object.r+radius;
  const dx=Math.max(object.left-point.x,0,point.x-object.right);
  const dy=Math.max(object.top-point.y,0,point.y-object.bottom);
  return Math.hypot(dx,dy)<radius;
}
export function freeGround(point,objects,radius){
  return insideBounds(point)&&!objects.some(object=>withinReach(point,object,radius));
}
export function clampToGround({x,y},top=bounds.top){
  return {x:Math.min(bounds.right,Math.max(bounds.left,x)),y:Math.min(bounds.bottom,Math.max(top,y))};
}
export function nearestFreeGround(point,objects,radius,top=bounds.top){
  const origin=clampToGround(point,top);
  if(freeGround(origin,objects,radius))return origin;
  for(let gap=5;gap<=400;gap+=5){
    for(let i=0;i<16;i++){
      const angle=i*Math.PI/8;
      const candidate={x:origin.x+Math.cos(angle)*gap,y:origin.y+Math.sin(angle)*gap};
      if(candidate.y>=top&&freeGround(candidate,objects,radius))return candidate;
    }
  }
  return origin;
}

function clearSegment(from,to,objects,radius){
  const count=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/4));
  for(let i=1;i<=count;i++){
    const t=i/count;
    if(!freeGround({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t},objects,radius))return false;
  }
  return true;
}

export function moveOnGround(from,to,objects,radius,top=bounds.top){
  const end=clampToGround(to,top);
  if(clearSegment(from,end,objects,radius))return end;
  const across={x:end.x,y:from.y};
  const along={x:from.x,y:end.y};
  let point=from;
  if(clearSegment(from,across,objects,radius))point=across;
  const slide={x:point.x,y:along.y};
  return clearSegment(point,slide,objects,radius)?slide:point;
}

export function groundRoute(from,requested,objects,radius,top=bounds.top){
  const to=nearestFreeGround(requested,objects,radius,top);
  if(clearSegment(from,to,objects,radius))return [to];

  const columns=Math.floor((bounds.right-bounds.left)/step)+1;
  const rows=Math.floor((bounds.bottom-top)/step)+1;
  const cells=Array.from({length:columns*rows},(_,i)=>({
    x:bounds.left+i%columns*step,y:top+Math.floor(i/columns)*step
  }));
  const walkable=cells.map(point=>freeGround(point,objects,radius));
  const parent=new Int16Array(cells.length).fill(-2);
  const frontier=[];
  for(let i=0;i<cells.length;i++){
    const point=cells[i];
    if(walkable[i]&&Math.hypot(point.x-from.x,point.y-from.y)<=step*2&&clearSegment(from,point,objects,radius)){
      parent[i]=-1;
      frontier.push(i);
    }
  }
  const directions=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
  for(let head=0;head<frontier.length;head++){
    const index=frontier[head],point=cells[index];
    if(clearSegment(point,to,objects,radius)){
      const path=[to];
      for(let i=index;i>=0;i=parent[i])path.push(cells[i]);
      path.reverse();

      const route=[];
      let start=from;
      for(let i=0;i<path.length;i++){
        while(i+1<path.length&&clearSegment(start,path[i+1],objects,radius))i++;
        route.push(path[i]);start=path[i];
      }
      return route;
    }
    for(const [dx,dy] of directions){
      const x=index%columns+dx,y=Math.floor(index/columns)+dy;
      if(x<0||x>=columns||y<0||y>=rows)continue;
      const next=y*columns+x;
      if(parent[next]!==-2||!walkable[next]||!clearSegment(point,cells[next],objects,radius))continue;
      parent[next]=index;
      frontier.push(next);
    }
  }
  return [];
}
