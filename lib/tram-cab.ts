import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";

type CabPalette={steel:THREE.Material;dark:THREE.Material;wood:THREE.Material;ivory:THREE.Material;leather:THREE.Material;red:THREE.Material;white:THREE.Material};

/** A single fitted driving bay facing the left end of the carriage (-X).
 * Heritage controller / air-brake layout, not a car steering wheel. */
export function buildTramCab(parent:THREE.Group,p:CabPalette){
  const cab=new THREE.Group();cab.name="Interior / fitted driving cab";parent.add(cab);
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,name?:string)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;if(name)o.name=name;cab.add(o);return o;};
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,r=.015,name?:string)=>mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3)),m,x,y,z,name);
  const cyl=(r:number,h:number,x:number,y:number,z:number,m:THREE.Material)=>mesh(new THREE.CylinderGeometry(r,r,h,20),m,x,y,z);
  const tube=(points:number[][],r:number,m:THREE.Material)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),16,r,6,false),m,0,0,0);
  // Full-height console carcass meets the floor and is recessed from the glass.
  box(.47,1.2,1.71,-3.83,1.54,0,p.ivory,.035,"Cab / floor-mounted console");
  box(.51,.075,1.77,-3.82,2.1775,0,p.dark,.025);
  box(.05,.29,1.61,-3.561,2.04,0,p.wood,.018);
  box(.018,.065,1.62,-3.575,1.01,0,p.dark,.005);
  for(const z of [-.69,.69]){
    box(.023,.83,.024,-3.583,1.5,z,p.wood,.005);
    for(const y of [1.2,1.8])mesh(new THREE.SphereGeometry(.013,8,6),p.steel,-3.531,y,z);
  }
  // Round gauges face the driver (+X), with bezels, needles and printed ticks.
  for(const [i,z] of [-.36,0,.36].entries()){
    const bezel=cyl(i===1?.098:.078,.024,-3.52,2.06,z,p.steel);bezel.rotation.z=Math.PI/2;
    const face=cyl(i===1?.083:.064,.028,-3.509,2.06,z,p.white);face.rotation.z=Math.PI/2;
    for(let n=0;n<9;n++){
      const a=-2.2+n*.55,r=i===1?.067:.05;
      const tick=box(.005,.014,.004,-3.49,2.06+Math.cos(a)*r,z+Math.sin(a)*r,p.dark,.001);tick.rotation.x=-a;
    }
    const needle=box(.008,.059,.007,-3.484,2.07,z+.012,p.red,.002);needle.rotation.x=.5-i*.8;
  }
  // Controller and air-brake handles sit on real shafts, bolted into the desk.
  for(const [z,direction] of [[.59,1],[-.59,-1]]){
    cyl(.113,.055,-3.76,2.24,z,p.steel);
    cyl(.032,.15,-3.76,2.3275,z,p.dark);
    tube([[-3.76,2.398,z],[-3.67,2.398,z+direction*.07],[-3.53,2.398,z+direction*.07]],.021,p.steel);
    cyl(.035,.105,-3.53,2.45,z+direction*.07,p.wood);
    for(let i=0;i<5;i++)box(.01,.007,.045,-3.81+i*.046,2.273,z-.085,p.dark,.001);
  }
  // Bell pedal, dead-man pedal and a ribbed rubber heel rest below the console.
  box(.41,.055,.8,-3.29,.965,0,p.dark,.01);
  for(const z of [-.22,.22]){
    tube([[-3.53,.949,z],[-3.41,1.03,z],[-3.32,1.07,z]],.018,p.steel);
    box(.17,.035,.15,-3.29,1.075,z,p.dark,.009).rotation.z=.15;
    for(let i=0;i<4;i++)box(.017,.008,.13,-3.345+i*.035,1.101,z,p.steel,.001);
  }
  // Chair assembly: base -> telescopic pedestal -> pan -> cushion/backrest.
  box(.57,.045,.59,-2.79,.9575,0,p.dark,.03,"Cab / seat floor plate");
  cyl(.085,.58,-2.79,1.27,0,p.steel);
  cyl(.12,.29,-2.79,1.13,0,p.dark);
  box(.59,.065,.66,-2.79,1.5775,0,p.dark,.03);
  box(.62,.145,.67,-2.79,1.6825,0,p.leather,.065,"Cab / supported seat cushion");
  for(const z of [-.26,.26])tube([[-2.59,1.575,z],[-2.43,1.72,z],[-2.4,2.26,z]],.023,p.steel);
  box(.125,.59,.65,-2.41,2.04,0,p.leather,.055,"Cab / supported backrest").rotation.z=.08;
  for(const z of [-.2,-.1,0,.1,.2])box(.006,.44,.006,-2.479,2.04,z,p.ivory,.002).rotation.z=.08;
  for(const z of [-.36,.36]){
    tube([[-2.59,1.59,z],[-2.59,1.95,z],[-2.98,1.95,z]],.017,p.steel);
    box(.42,.055,.07,-2.81,1.97,z,p.dark,.025);
  }
  // Low service partition and upper grab rail leave a full side passage into
  // the galley; no second bench intersects the driver's chair.
  box(.085,.89,1.15,-2.085,1.385,-.48,p.wood,.018);
  box(.105,.045,1.19,-2.085,1.8525,-.48,p.ivory,.012);
  box(.055,1.81,.055,-2.085,2.79,.115,p.steel,.009);
  tube([[-2.085,3.62,.115],[-2.085,3.62,1.025]],.025,p.steel);
  for(let i=0;i<7;i++)box(.008,.67,.015,-2.137,1.38,-.93+i*.15,p.ivory,.002);
  // Extinguisher is strapped to the partition, with a cradle below the bottle.
  cyl(.087,.41,-1.94,1.36,-.88,p.red);
  cyl(.033,.075,-1.94,1.6025,-.88,p.steel);
  box(.19,.025,.21,-1.94,1.1425,-.88,p.dark,.008);
  for(const y of [1.26,1.5]){const band=mesh(new THREE.TorusGeometry(.09,.009,5,20),p.steel,-1.94,y,-.88);band.rotation.x=Math.PI/2;}
  tube([[-1.93,1.64,-.88],[-1.79,1.62,-.87],[-1.79,1.24,-.87]],.012,p.dark);
  box(.033,.07,.11,-1.94,1.65,-.85,p.dark,.01);
  return cab;
}
