export type Point = { x: number; y: number };
export type Bounds = { left: number; right: number; top: number; bottom: number };
const cross = (a: Point, b: Point, c: Point) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
export function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a,b)=>a.x-b.x||a.y-b.y);
  const half = (list: Point[]) => {
    const result: Point[]=[];
    for(const p of list){while(result.length>1&&cross(result.at(-2)!,result.at(-1)!,p)<=0)result.pop();result.push(p);}
    return result;
  };
  return [...half(sorted).slice(0,-1),...half(sorted.reverse()).slice(0,-1)];
}
export function isMousePositionSafe(p: Point, bounds: Bounds, obstacles: Point[][]) {
  return p.x>=bounds.left&&p.x<=bounds.right&&p.y>=bounds.top&&p.y<=bounds.bottom&&
    !obstacles.some(poly=>poly.every((a,i)=>cross(a,poly[(i+1)%poly.length],p)>=-0.001));
}

/** Exact convex silhouette contact: no axis-aligned padding around empty corners. */
export function expandByFootprint(silhouette: Point[], footprint: Point[]): Point[] {
  return convexHull(silhouette.flatMap(p=>footprint.map(f=>({x:p.x-f.x,y:p.y-f.y}))));
}

/** Sweep rather than teleport, sliding against real projected silhouettes.
 * Bounds and obstacles already include the whole mouse's footprint, not just its center. */
export function moveMouseWithinScene(from: Point, to: Point, bounds: Bounds, obstacles: Point[][]): Point | null {
  if(bounds.left>bounds.right||bounds.top>bounds.bottom)return null;
  const clamp=(p:Point)=>({x:Math.max(bounds.left,Math.min(bounds.right,p.x)),y:Math.max(bounds.top,Math.min(bounds.bottom,p.y))});
  const safe=(p:Point)=>isMousePositionSafe(p,bounds,obstacles);
  let current=clamp(from);
  if(!safe(current)){
    // A resize or rotation can move an obstacle onto the resting mouse.
    // Find the nearest visible spot instead of leaving it hidden in the model.
    const candidates:Point[]=[];
    for(const poly of obstacles)for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
      if(!length)continue;
      const t=Math.max(0,Math.min(1,((current.x-a.x)*dx+(current.y-a.y)*dy)/(length*length)));
      candidates.push(clamp({x:a.x+t*dx+dy/length,y:a.y+t*dy-dx/length}));
    }
    // Includes frame corners and narrow free areas alongside the silhouette.
    for(let x=0;x<=16;x++)for(let y=0;y<=16;y++)candidates.push({x:bounds.left+(bounds.right-bounds.left)*x/16,y:bounds.top+(bounds.bottom-bounds.top)*y/16});
    const viable=candidates.filter(safe).sort((a,b)=>Math.hypot(a.x-current.x,a.y-current.y)-Math.hypot(b.x-current.x,b.y-current.y));
    if(!viable.length)return null;
    current=viable[0];
  }
  const target=clamp(to),steps=Math.max(1,Math.ceil(Math.hypot(target.x-current.x,target.y-current.y)/0.25));
  const dx=(target.x-current.x)/steps,dy=(target.y-current.y)/steps;
  for(let i=0;i<steps;i++){
    const next={x:current.x+dx,y:current.y+dy};
    if(safe(next)){current=next;continue;}
    const horizontal={x:next.x,y:current.y},vertical={x:current.x,y:next.y};
    if(safe(horizontal))current=horizontal;
    else if(safe(vertical))current=vertical;
  }
  return current;
}
