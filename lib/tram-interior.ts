import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {buildTramCab} from "./tram-cab";
import {buildCoffeeCup} from "./tram-coffee";

/** Fitted, correctly supported kitchen equipment in carriage-local coordinates.
 * Static geometry is folded into the world's existing material batches. */
export function buildTramInterior(tram:THREE.Group,materials:THREE.Material[],textures:THREE.Texture[]){
  const root=new THREE.Group();root.name="Tram interior / fitted galley";tram.add(root);
  const mat=(color:number,roughness=.65,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m;};
  const steel=mat(0xaebcb9,.32,.72),dark=mat(0x263535,.6,.25),wood=mat(0xc09159),ivory=mat(0xe1d9be),leather=mat(0x637b61,.88),copper=mat(0xa8673c,.4,.7),red=mat(0xb4442b),mustard=mat(0xd9a244),white=mat(0xf2e7d0,.3),glass=mat(0x647a79,.22,.35);
  const brushed=document.createElement("canvas");brushed.width=128;brushed.height=128;const brush=brushed.getContext("2d")!;
  brush.fillStyle="#a7a7a7";brush.fillRect(0,0,128,128);
  for(let i=0;i<128;i++){const v=140+(i*37)%55;brush.fillStyle=`rgb(${v},${v},${v})`;brush.fillRect(0,i,128,1);}
  const grain=new THREE.CanvasTexture(brushed);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,4);textures.push(grain);steel.roughnessMap=grain;steel.bumpMap=grain;steel.bumpScale=.001;
  const led=mat(0xffdd9f);led.emissive.set(0xffc26d);led.emissiveIntensity=2;
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,r=.012)=>mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3)),m,x,y,z);
  const cyl=(r:number,h:number,x:number,y:number,z:number,m:THREE.Material,top=r)=>mesh(new THREE.CylinderGeometry(top,r,h,20),m,x,y,z);
  const ring=(r:number,t:number,x:number,y:number,z:number,m:THREE.Material)=>mesh(new THREE.TorusGeometry(r,t,6,24),m,x,y,z);
  const tube=(points:number[][],r:number,m:THREE.Material)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,7,false),m,0,0,0);
  // Walnut carriage floor with a washable checker runner in the cooking aisle.
  for(let i=0;i<22;i++)box(.37,.025,2.12,-4.02+i*.375,.922,0,i%3?wood:ivory,.003);
  for(let x=0;x<17;x++)for(let z=0;z<3;z++)box(.3,.009,.3,-1.65+x*.3,.94,-.03+z*.3,(x+z)%2?dark:ivory,.001);
  // Fitted cabinets, recessed kickboards, panel seams and drawer pulls.
  // A real cabinet carcass, not a solid block filling the sink cavity.
  box(5.5,1.18,.045,.95,1.53,-.975,ivory,.012);
  box(5.5,.055,.68,.95,.9675,-.65,ivory,.012);
  for(const x of [-1.8,-.9,0,.9,1.8,2.7,3.7])box(.035,x===0?.98:1.15,.66,x,x===0?1.43:1.57,-.65,ivory,.006);
  box(5.4,.12,.53,.95,.995,-.69,dark);
  for(let i=0;i<6;i++){
    const x=-1.3+i*.9;
    box(.85,1.04,.035,x,1.59,-.288,i===5?steel:leather,.025);
    for(const y of i===0?[1.28,1.6,1.92]:[1.96]){
      box(.72,.012,.012,x,y-.12,-.264,dark,.001);
      tube([[x-.19,y,-.25],[x-.19,y,-.2],[x+.19,y,-.2],[x+.19,y,-.25]],.012,steel);
    }
  }
  // Four pieces surround the opening, with a recessed steel bowl underneath.
  box(1.765,.075,.79,-.9775,2.1625,-.64,steel,.015);
  box(3.105,.075,.79,2.2075,2.1625,-.64,steel,.015);
  box(.75,.075,.19,.28,2.1625,-.94,steel,.008);
  box(.75,.075,.11,.28,2.1625,-.3,steel,.008);
  box(5.58,.17,.03,.95,2.28,-1.03,steel,.008);
  // Individual glazed backsplash tiles and warm under-shelf light channels.
  for(let x=0;x<19;x++)for(let y=0;y<2;y++)box(.282,.145,.018,-1.72+x*.296,2.42+y*.158,-1.085,(x+y)%5?ivory:leather,.006);
  box(4.68,.026,.03,.7,3.145,-.45,led,.005);
  for(const x of [-1.55,.7,2.83]){
    box(.045,.41,.035,x,2.99,-1.065,steel,.008);
    box(.045,.035,.64,x,3.135,-.77,steel,.006);
    tube([[x,2.81,-1.065],[x,3.115,-.48]],.013,steel);
  }
  // Lever espresso machine, group heads, drip tray, pressure gauge and cups.
  const espresso=new THREE.Group();espresso.name="Interior / espresso station";root.add(espresso);
  box(.88,.56,.46,-1.07,2.49,-.57,red,.075);
  box(.77,.34,.035,-1.07,2.43,-.321,steel,.025);
  box(.76,.033,.35,-1.07,2.222,-.31,dark);
  for(let i=0;i<11;i++)box(.026,.01,.26,-1.38+i*.061,2.243,-.31,steel,.002);
  for(const x of [-1.27,-.9]){
    cyl(.065,.07,x,2.59,-.24,steel);tube([[x,2.57,-.24],[x+.15,2.57,-.22]],.018,dark);
  }
  const gauge=cyl(.062,.016,-1.08,2.68,-.327,white);gauge.rotation.x=Math.PI/2;
  box(.006,.061,.01,-1.08,2.69,-.313,dark,.001).rotation.z=-.5;
  tube([[-.67,2.57,-.36],[-.61,2.5,-.23],[-.61,2.32,-.2]],.012,steel);
  buildCoffeeCup(root,materials,[-1.25,2.25,-.27],.65);buildCoffeeCup(root,materials,[-.92,2.25,-.27],.65);buildCoffeeCup(root,materials,[-1.28,2.78,-.58],.65);
  // Compact grinder, with a supported bean hopper and a grounds catcher.
  box(.23,.25,.24,-1.67,2.33,-.68,dark,.025);
  const hopperGlass=new THREE.MeshPhysicalMaterial({color:0xd0ded6,transparent:true,opacity:.23,roughness:.14,clearcoat:1,depthWrite:false});materials.push(hopperGlass);
  cyl(.075,.14,-1.67,2.53,-.68,hopperGlass,.092);cyl(.094,.018,-1.67,2.609,-.68,dark);
  for(let i=0;i<16;i++){const a=i*2.399,r=.055*Math.sqrt(i/16);const bean=mesh(new THREE.SphereGeometry(.015,8,5),wood,-1.67+Math.cos(a)*r,2.49+(i%3)*.023,-.68+Math.sin(a)*r);bean.scale.set(1,.62,.72);}
  box(.07,.04,.09,-1.67,2.43,-.53,steel,.008);cyl(.055,.06,-1.67,2.23,-.46,steel);
  // Gauge bezel, dial graduations and a physical lever pivot.
  ring(.065,.007,-1.08,2.68,-.306,steel);
  for(let i=0;i<11;i++){const a=-2.2+i*.44;box(.004,.012,.002,-1.08+Math.sin(a)*.044,2.68+Math.cos(a)*.044,-.303,dark,.0005).rotation.z=-a;}
  cyl(.018,.01,-1.08,2.68,-.301,dark).rotation.x=Math.PI/2;
  // Deep sink opening, rolled rim, drain and a gooseneck faucet.
  box(.68,.025,.43,.28,1.9875,-.6,steel,.035).name="Galley / recessed sink bottom";
  for(const x of [-.072,.632])box(.024,.2,.45,x,2.1,-.6,steel,.008);
  for(const z of [-.815,-.385])box(.68,.2,.024,.28,2.1,z,steel,.008);
  box(.58,.004,.34,.28,2.003,-.6,glass,.025);
  for(const x of [-.095,.655])box(.035,.035,.49,x,2.222,-.6,steel);
  for(const z of [-.845,-.355])box(.78,.035,.035,.28,2.222,z,steel);
  cyl(.043,.005,.28,2.008,-.6,dark);
  for(let i=0;i<3;i++)box(.008,.003,.06,.258+i*.022,2.012,-.6,steel,.001);
  tube([[.28,2.21,-.92],[.28,2.56,-.92],[.28,2.64,-.7],[.28,2.49,-.58]],.023,steel);
  for(const x of [.08,.48]){cyl(.028,.05,x,2.235,-.92,steel);box(.1,.015,.018,x,2.267,-.92,steel);}
  // Prep board with a knife, tomato slices, condiment bottles and a folded towel.
  box(.58,.025,.4,1.16,2.22,-.58,wood,.035);
  for(let i=0;i<4;i++)cyl(.058,.025,1.03+i*.074,2.247,-.6,red);
  box(.025,.018,.25,1.32,2.255,-.48,steel,.003).rotation.y=.3;
  box(.035,.035,.12,1.36,2.268,-.34,dark).rotation.y=.3;
  for(const [i,m] of [red,mustard].entries()){
    cyl(.065,.22,1.55+i*.16,2.31,-.86,m,.054);cyl(.037,.04,1.55+i*.16,2.44,-.86,ivory);cyl(.012,.065,1.55+i*.16,2.49,-.86,m,.004);
  }
  box(.27,.025,.24,.87,2.23,-.84,ivory,.02);
  for(let i=0;i<4;i++)box(.014,.003,.22,.77+i*.05,2.244,-.84,red,.001);
  // Range, iron skillet, copper stockpot and a vented extractor hood.
  box(1.3,.09,.62,2.73,2.245,-.59,dark,.025);
  for(const x of [2.4,3.04]){
    for(const r of [.11,.16])ring(r,.012,x,2.302,-.61,steel).rotation.x=Math.PI/2;
    box(.38,.025,.025,x,2.32,-.61,dark);box(.025,.025,.38,x,2.32,-.61,dark);
    const knob=cyl(.033,.027,x,2.25,-.253,dark);knob.rotation.x=Math.PI/2;
  }
  cyl(.18,.07,2.4,2.36,-.61,dark,.19);box(.3,.026,.045,2.14,2.39,-.61,dark);
  cyl(.17,.29,3.04,2.49,-.61,copper);cyl(.18,.026,3.04,2.647,-.61,steel,.15);cyl(.038,.04,3.04,2.68,-.61,dark);
  for(const x of [2.81,3.27])ring(.06,.012,x,2.54,-.61,steel);
  box(1.48,.16,.83,2.7,3.49,-.56,steel,.065);box(.66,.17,.45,2.7,3.655,-.72,steel,.035);
  for(let i=0;i<12;i++)box(.075,.018,.55,2.19+i*.09,3.402,-.56,dark,.003);
  box(1.18,.022,.025,2.7,3.395,-.23,led);
  // Plate rack, utensil rail and hanging ladles occupy distinct usable zones.
  for(let i=0;i<7;i++){
    const plate=cyl(.125,.015,1.16,3.255+i*.018,-.66,white);plate.name="Interior / stacked crockery";
  }
  tube([[1.78,2.95,-1.01],[3.48,2.95,-1.01]],.018,steel);
  for(let i=0;i<5;i++){
    const x=1.95+i*.29;tube([[x,2.95,-.98],[x,2.88,-.94],[x,2.63,-.94]],.009,steel);
    if(i%2)box(.07,.1,.018,x,2.59,-.94,steel,.015);else mesh(new THREE.SphereGeometry(.045,12,8),steel,x,2.6,-.94).scale.set(1,1,.35);
  }
  buildTramCab(root,{steel,dark,wood,ivory,leather,red,white});
  // Fine printed equipment plates add legible scale without large decorative text.
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;const ctx=canvas.getContext("2d")!;
  ctx.fillStyle="#ded6b9";ctx.fillRect(0,0,512,128);ctx.fillStyle="#273b38";ctx.font="bold 34px monospace";ctx.fillText("THE GALLEY",24,49);ctx.font="20px monospace";ctx.fillText("COFFEE • GRILL • FRESH DAILY",24,92);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;textures.push(tex);const sign=new THREE.MeshBasicMaterial({map:tex});materials.push(sign);mesh(new THREE.PlaneGeometry(1.1,.275),sign,.7,3.43,-1.1);
  return root;
}
