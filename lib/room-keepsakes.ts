import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/** Distinct, hand-assembled props for Dharmay's studio. Groups stay named after
 * batching so geometry tests can verify the room's content, not just its density. */
export function addRoomKeepsakes(scene:THREE.Scene,materials:THREE.Material[],textures:THREE.Texture[]) {
  const material=(color:number)=>{const m=new THREE.MeshLambertMaterial({color});materials.push(m);return m;};
  const ink=material(0x283940),wood=material(0x9a6752),paper=material(0xf5ebd8),rust=material(0xd57551);
  const mint=material(0x91bdb0),blue=material(0x447b93),yellow=material(0xe4b851),pink=material(0xd891a2),silver=material(0xc1c9bd);
  const dark=material(0x192b35),leaf=material(0x5b8d70);
  const root=(name:string,x:number,y:number,z:number,a=0)=>{const g=new THREE.Group();g.name=`Studio / ${name}`;g.position.set(x,y,z);g.rotation.y=a;scene.add(g);return g;};
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,p:THREE.Object3D)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,p:THREE.Object3D,r=.015)=>mesh(r?new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
  const sphere=(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,p:THREE.Object3D)=>{const o=mesh(new THREE.SphereGeometry(1,16,10),m,x,y,z,p);o.scale.set(w,h,d);return o;};
  const cyl=(r:number,h:number,x:number,y:number,z:number,m:THREE.Material,p:THREE.Object3D)=>mesh(new THREE.CylinderGeometry(r,r,h,20),m,x,y,z,p);
  const ring=(r:number,t:number,x:number,y:number,z:number,m:THREE.Material,p:THREE.Object3D)=>mesh(new THREE.TorusGeometry(r,t,6,40),m,x,y,z,p);
  const tube=(points:number[][],r:number,m:THREE.Material,p:THREE.Object3D)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(v[0],v[1],v[2]))),24,r,5,false),m,0,0,0,p);
  const text=(words:string,w:number,h:number,x:number,y:number,z:number,p:THREE.Object3D,color="#283940")=>{
    const c=document.createElement("canvas");c.width=512;c.height=128;const ctx=c.getContext("2d")!;
    ctx.fillStyle=color;ctx.font="bold 42px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(words,256,64,500);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);
    const m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});materials.push(m);
    const o=mesh(new THREE.PlaneGeometry(w,h),m,x,y,z,p);o.castShadow=false;
  };

  // A real spatial diagram: windows are the arena in the user's game Framed.
  const board=root("Framed design board",-4.25,4.45,-6.73);
  box(4.7,1.95,.12,0,0,0,wood,board);box(4.5,1.75,.03,0,0,.085,paper,board);
  text("FRAMED / PLAYTEST 03",2.9,.22,-.4,.61,.11,board);
  for(const [x,y,w,h,m] of [[-1.08,-.04,1.34,.86,blue],[.0,-.22,1.22,.75,rust],[1.14,-.02,.74,.72,mint]] as const){
    box(w,h,.03,x,y,.14,m,board);box(w-.05,.13,.02,x,y+h/2-.085,.17,paper,board);
    text("— □ ×",w*.4,.075,x+w*.23,y+h/2-.09,.19,board);
    box(.12,.12,.02,x-.19,y-.08,.18,yellow,board);box(.12,.12,.02,x+.18,y+.07,.18,pink,board);
  }
  for(const [x,y] of [[-1.6,-.67],[1.84,.5]]){box(.38,.32,.025,x,y,.16,yellow,board).rotation.z=.08;text("TODO",.32,.08,x,y,.185,board);}

  const controller=root("handheld console",-2.62,1.92,-5.27,.25);
  box(.49,.09,.78,0,0,0,mint,controller,.06);box(.36,.018,.35,0,.057,-.12,ink,controller,.025);
  box(.28,.008,.25,0,.07,-.12,blue,controller,.01);box(.05,.025,.17,-.12,.065,.21,ink,controller);box(.16,.025,.05,-.12,.065,.21,ink,controller);
  for(const x of [.09,.18])cyl(.034,.024,x,.067,.18+(x-.09),rust,controller);

  // Turntable with grooves, stylus, controls and an open transparent dust cover.
  const music=root("record player",4.9,0,6.3,Math.PI);
  for(const x of [-1.55,1.55])for(const z of [-.4,.4])box(.09,.43,.09,x,.22,z,ink,music);
  box(3.5,1.25,1.15,0,1.03,0,wood,music,.06);box(3.59,.10,1.22,0,1.7,0,paper,music);
  box(1.6,.8,.035,-.74,1.05,.596,dark,music);box(1.47,.8,.035,.85,1.05,.596,ink,music);
  for(let i=0;i<11;i++){const color=[rust,mint,paper,blue,pink][i%5];box(.055,.67,.045,-1.4+i*.12,1.07,.63,color,music);}
  for(let i=0;i<13;i++)box(.025,.72,.027,.19+i*.10,1.04,.625,wood,music,0);
  box(1.65,.15,.98,-.45,1.84,0,ink,music,.04);
  cyl(.39,.035,-.65,1.94,.02,dark,music);
  for(const r of [.16,.22,.28,.34])ring(r,.003,-.65,1.961,.02,silver,music).rotation.x=Math.PI/2;
  cyl(.12,.005,-.65,1.967,.02,rust,music);cyl(.012,.022,-.65,1.98,.02,silver,music);
  tube([[.17,1.96,-.32],[.17,2.03,-.30],[-.05,2.04,.12],[-.25,1.98,.21]],.018,silver,music);
  box(.11,.03,.055,-.25,1.976,.21,paper,music);cyl(.04,.024,.24,1.94,.31,rust,music);
  const glass=new THREE.MeshLambertMaterial({color:0xc5e9e2,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide});materials.push(glass);
  const lid=box(1.68,.025,.96,-.45,2.31,-.58,glass,music,0);lid.rotation.x=-1.1;lid.castShadow=false;
  const sleeve=box(.67,.73,.02,1.03,2.10,-.29,blue,music);sleeve.rotation.x=-.12;
  ring(.19,.04,1.03,2.14,-.26,yellow,music);text("SIDE A",.45,.10,1.03,1.85,-.24,music,"#f5ebd8");

  // Squash racket: teardrop hoop, actual strings, wrapped grip and loose ball.
  const sports=root("squash and volleyball rack",7.68,0,1.0,-Math.PI/2);
  box(2.35,.17,.16,0,3.62,0,wood,sports);for(const x of [-.8,0,.8])cyl(.05,.22,x,3.55,.14,ink,sports).rotation.x=Math.PI/2;
  const racket=new THREE.Group();racket.position.set(-.6,2.68,.24);racket.rotation.z=-.17;sports.add(racket);
  ring(.44,.035,0,.25,0,rust,racket).scale.y=1.3;
  for(let i=-4;i<=4;i++){
    const x=i*.078,extent=Math.sqrt(Math.max(0,1-(x/.41)**2))*.54;
    tube([[x,.25-extent,0],[x,.25+extent,0]],.004,paper,racket);
    const y=i*.1,span=Math.sqrt(Math.max(0,1-(y/.54)**2))*.41;
    tube([[-span,.25+y,0],[span,.25+y,0]],.004,paper,racket);
  }
  tube([[-.26,-.2,0],[-.12,-.53,0],[0,-.65,0],[.12,-.53,0],[.26,-.2,0]],.024,rust,racket);
  cyl(.047,.55,0,-.88,0,ink,racket);for(let i=0;i<7;i++)ring(.05,.005,0,-1.1+i*.065,0,silver,racket).rotation.x=Math.PI/2;
  box(1.45,.13,.8,.4,.72,.20,wood,sports);for(const x of [-.12,.93])box(.08,.67,.08,x,.34,.35,ink,sports);
  const volleyball=new THREE.Group();volleyball.name="Studio / volleyball";volleyball.position.set(.48,1.12,.23);sports.add(volleyball);
  sphere(0,0,0,.34,.34,.34,paper,volleyball);
  for(let i=0;i<3;i++){const seam=ring(.341,.008,0,0,0,blue,volleyball);seam.rotation.set(i*Math.PI/3,.65,0);}
  sphere(-.08,.825,.39,.07,.07,.07,dark,sports);box(.37,.18,.44,-.01,.88,-.05,pink,sports,.065);

  // Travel keepsakes: a camera, miniature train and stickered suitcase.
  const travel=root("travel cabinet",-6.1,0,5.65,Math.PI);
  box(2.18,.92,1.02,0,.61,0,mint,travel,.06);for(const x of [-.9,.9])for(const z of [-.38,.38])box(.075,.22,.075,x,.11,z,ink,travel);
  box(2.29,.09,1.13,0,1.12,0,paper,travel);box(2.06,.03,.04,0,.62,.53,wood,travel);
  for(const x of [-.65,.65])sphere(x,.73,.57,.05,.026,.028,ink,travel);
  const camera=new THREE.Group();camera.position.set(-.55,1.43,.15);camera.rotation.y=-.18;travel.add(camera);
  box(.63,.35,.24,0,0,0,ink,camera,.04);box(.59,.055,.23,0,.145,0,silver,camera);
  box(.21,.08,.22,-.05,.21,0,ink,camera);cyl(.15,.19,.02,0,.17,ink,camera).rotation.x=Math.PI/2;
  cyl(.119,.018,.02,0,.275,blue,camera).rotation.x=Math.PI/2;ring(.132,.008,.02,0,.292,silver,camera);
  tube([[-.31,.08,0],[-.39,-.12,.05],[-.21,-.29,.19],[.26,-.30,.21],[.40,-.09,.06],[.31,.08,0]],.011,wood,camera);
  const train=new THREE.Group();train.position.set(.49,1.32,-.04);travel.add(train);
  box(.91,.24,.25,0,0,0,rust,train,.03);box(.95,.045,.28,0,.14,0,paper,train,.02);
  for(let i=0;i<5;i++)box(.11,.095,.01,-.32+i*.16,.025,.134,blue,train,.012);
  for(const x of [-.30,.30])for(const z of [-.145,.145])cyl(.065,.035,x,-.13,z,ink,train).rotation.x=Math.PI/2;
  text("MÜNCHEN",.77,.08,.5,1.57,.17,travel);
  const suitcase=root("stickered suitcase",-4.15,0,5.82,-.3);
  box(.9,1.12,.38,0,.59,0,rust,suitcase,.1);for(const x of [-.28,.28])box(.065,1.08,.4,x,.59,0,wood,suitcase,.012);
  tube([[-.17,1.13,0],[-.17,1.29,0],[.17,1.29,0],[.17,1.13,0]],.026,ink,suitcase);
  for(const [x,y,c] of [[-.08,.73,mint],[.08,.41,paper],[.08,.96,yellow]] as const)box(.23,.14,.012,x,y,.2,c,suitcase).rotation.z=x*2;
  text("MUC",.20,.09,-.08,.73,.215,suitcase);text("IND",.20,.09,.08,.41,.215,suitcase);

  // Replace the potting bench with a maker's bench and an exploded game prototype.
  const maker=root("prototype workbench",-7.22,0,.15,Math.PI/2);
  box(3.25,.15,1.17,0,1.48,0,wood,maker,.035);for(const x of [-1.36,1.36])for(const z of [-.43,.43])box(.08,1.42,.08,x,.71,z,ink,maker);
  box(2.85,1.74,.07,0,3.07,-.47,mint,maker);
  for(let row=0;row<6;row++)for(let col=0;col<12;col++)cyl(.014,.012,-1.2+col*.22,2.43+row*.25,-.423,wood,maker).rotation.x=Math.PI/2;
  text("MAKE / BREAK / REPEAT",2.22,.19,0,3.77,-.41,maker);
  box(.84,.045,.70,-.5,1.59,.07,blue,maker);for(const [x,z,m] of [[-.7,-.1,yellow],[-.3,.22,pink],[-.48,.07,mint]] as const)box(.12,.08,.12,x,1.65,z,m,maker);
  box(.64,.12,.43,.70,1.62,0,ink,maker,.04);box(.48,.025,.26,.70,1.696,0,leaf,maker);
  for(let i=0;i<5;i++)box(.035,.02,.11,.53+i*.08,1.72,0,goldMaterial(),maker);
  function goldMaterial(){return yellow;}
  tube([[.84,1.72,.11],[1.09,1.67,.20],[1.17,1.8,-.02],[.83,1.7,-.17]],.012,rust,maker);
  for(const x of [-.92,-.3,.4]){box(.085,.36,.07,x,3.2,-.31,rust,maker,.025);cyl(.025,.26,x,2.9,-.31,silver,maker);}

  // One statement terrarium, rather than a dozen more flowerpots.
  const terrarium=root("glass terrarium",2.65,1.05,-4.85);
  box(.81,.075,.53,0,0,0,wood,terrarium);box(.70,.035,.43,0,.055,0,leaf,terrarium);
  for(const x of [-.37,.37])for(const z of [-.23,.23])box(.025,.56,.025,x,.31,z,ink,terrarium);
  for(const y of [.08,.59]){box(.78,.025,.025,0,y,.23,ink,terrarium);box(.78,.025,.025,0,y,-.23,ink,terrarium);}
  for(const x of [-.37,.37])tube([[x,.59,-.23],[x,.83,0],[x,.59,.23]],.015,ink,terrarium);
  tube([[-.37,.83,0],[.37,.83,0]],.015,ink,terrarium);
  for(let i=0;i<7;i++)sphere(Math.sin(i*2)*.22,.11+i%3*.045,Math.cos(i*2)*.11,.10,.07,.08,i%2?leaf:mint,terrarium);
  for(const z of [-.235,.235]){const pane=box(.72,.49,.005,0,.33,z,glass,terrarium,0);pane.castShadow=false;}

  // Oversized wall clock and asymmetrical pendant mobile anchor the empty height.
  const clock=root("wall clock",7.77,4.65,-2.3,-Math.PI/2);
  cyl(.49,.075,0,0,0,wood,clock).rotation.x=Math.PI/2;cyl(.435,.015,0,0,.05,paper,clock).rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const mark=box(.025,.07,.01,Math.sin(a)*.365,Math.cos(a)*.365,.068,ink,clock,0);mark.rotation.z=-a;}
  box(.025,.29,.015,0,.12,.083,ink,clock).rotation.z=-.65;box(.21,.023,.016,.09,.04,.09,rust,clock);
  const mobile=root("orbital mobile",1.25,5.12,-.12);
  tube([[0,1.2,0],[0,.3,0]],.009,ink,mobile);tube([[-.7,.2,0],[.6,.45,0]],.015,wood,mobile);
  for(const [x,y,c] of [[-.65,-.2,pink],[.5,.02,yellow],[.02,-.4,blue]] as const){tube([[x,.25,0],[x,y,0]],.008,ink,mobile);sphere(x,y-.08,0,.12,.12,.12,c,mobile);}
  ring(.28,.013,.04,-.44,0,wood,mobile).rotation.y=.5;
}
