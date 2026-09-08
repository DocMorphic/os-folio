import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type ComputerControls = { power(): void; disk(): void; screen(): void; dispose(): void };
type ComputerState = { powered: boolean; ejected: boolean; message: string };

/** A self-contained desk toy: no model downloads, audio, or physics worker. */
export function createComputer(host: HTMLElement, onState: (state: ComputerState) => void): ComputerControls {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 2, -2, 0.1, 50);
  camera.position.set(4.2, 3.1, 7);
  camera.lookAt(0, 1.1, 0.35);
  const rig = new THREE.Group();
  scene.add(rig);
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const material = (color: number, roughness = 0.7, metalness = 0) => {
    const result = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.push(result); return result;
  };
  const cream = material(0xe6d4ac);
  const edge = material(0xbca783);
  const ivory = material(0xf4e7ce);
  const charcoal = material(0x292d28);
  const green = material(0x63866a);
  const metal = material(0xaaa99c, 0.4, 0.45);
  const keyMat = material(0xeee0c2);
  const box = (parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, radius = 0.035) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w/3, h/3, d/3)), mat);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const texture = (canvas: HTMLCanvasElement) => {
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; textures.push(tex); return tex;
  };
  const label = (text: string, w: number, h: number, x: number, y: number, z: number) => {
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#5c604e"; ctx.font = "bold 48px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 256, 48);
    const mat = new THREE.MeshBasicMaterial({ map: texture(canvas), transparent: true, depthWrite: false }); materials.push(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat); mesh.position.set(x,y,z); rig.add(mesh);
  };

  // A deep CRT shell, recessed glass, separate pedestal, and low system unit.
  box(rig, 2.25, 0.42, 1.42, 0, 0.4, 0.12, cream, 0.08);
  box(rig, 2.1, 0.06, 1.25, 0, 0.17, 0.12, edge);
  box(rig, 0.8, 0.13, 0.7, 0, 0.67, 0, edge);
  box(rig, 0.42, 0.28, 0.4, 0, 0.8, -0.05, cream);
  box(rig, 2.1, 1.62, 1.25, 0, 1.65, -0.08, cream, 0.16);
  box(rig, 2.13, 1.64, 0.22, 0, 1.65, 0.57, ivory, 0.14);
  box(rig, 1.84, 1.29, 0.075, 0, 1.73, 0.705, edge, 0.1);
  box(rig, 1.73, 1.18, 0.055, 0, 1.73, 0.752, charcoal, 0.095);
  label("D D — 0 1", 0.48, 0.085, -0.54, 1.025, 0.69);
  for (let i=0;i<8;i++) {
    box(rig, 0.014, 0.49, 0.038, 1.052, 1.7, -0.42+i*0.09, charcoal, 0.005);
    box(rig, 0.025, 0.07, 0.01, 0.39+i*0.045, 1.035, 0.688, edge, 0.004);
  }
  box(rig, 0.86, 0.067, 0.05, 0.49, 0.44, 0.844, charcoal, 0.014);
  const ejectButton = box(rig, 0.16, 0.08, 0.065, 0.99, 0.44, 0.86, edge, 0.018);
  const powerButton = box(rig, 0.2, 0.17, 0.07, -0.85, 0.44, 0.865, green, 0.025);
  label("I", 0.045, 0.075, -0.85, 0.44, 0.903);
  const ledMat = material(0x96dc91); ledMat.emissive.set(0x578844); ledMat.emissiveIntensity = 0.8;
  const led = box(rig, 0.035, 0.035, 0.015, -0.64, 0.44, 0.86, ledMat, 0.005);

  const disk = new THREE.Group(); rig.add(disk); disk.position.set(0.48, 0.435, 0.45);
  box(disk, 0.72, 0.038, 0.69, 0, 0, 0, green, 0.014);
  box(disk, 0.36, 0.006, 0.24, 0.04, 0.023, -0.2, metal, 0.004);
  box(disk, 0.48, 0.007, 0.29, 0, 0.023, 0.12, ivory, 0.003);
  box(disk, 0.33, 0.008, 0.019, 0, 0.029, 0.06, green, 0.002);
  box(disk, 0.23, 0.008, 0.012, -0.05, 0.029, 0.13, edge, 0.002);

  const keyboard = new THREE.Group(); rig.add(keyboard); keyboard.position.set(-0.1, 0.09, 1.4); keyboard.rotation.x = 0.08;
  box(keyboard, 2.13, 0.13, 0.77, 0, 0, 0, cream, 0.06);
  box(keyboard, 1.96, 0.03, 0.6, 0, 0.075, -0.025, edge, 0.025);
  for(let row=0;row<4;row++) for(let col=0;col<12;col++) {
    if(row===3 && col>2 && col<9) continue;
    box(keyboard, 0.135, 0.065, 0.116, -0.9+col*0.162, 0.117, -0.25+row*0.15,
      row===0 && col===0 ? green : col===11 ? edge : keyMat, 0.016);
  }
  box(keyboard, 0.95, 0.062, 0.116, 0, 0.117, 0.2, keyMat, 0.016);
  const mouse = new THREE.Group(); rig.add(mouse); mouse.position.set(1.36,0.1,1.35); mouse.rotation.y=-0.15;
  box(mouse,0.32,0.17,0.5,0,0,0,cream,0.08);
  box(mouse,0.013,0.009,0.19,0,0.085,-0.1,edge,0.003);
  const cable = new THREE.CatmullRomCurve3([new THREE.Vector3(1.36,0.07,1.12),new THREE.Vector3(1.52,0.05,0.7),new THREE.Vector3(1.4,0.05,0.25),new THREE.Vector3(0.98,0.2,0.2)]);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(cable,32,0.017,6,false),edge);rig.add(wire);

  const screenCanvas = document.createElement("canvas"); screenCanvas.width=512; screenCanvas.height=352;
  const ctx = screenCanvas.getContext("2d")!;
  const screenTexture=texture(screenCanvas);
  const screenMat=new THREE.MeshBasicMaterial({map:screenTexture,toneMapped:false});materials.push(screenMat);
  const glassGeometry=new THREE.PlaneGeometry(1.62,1.07,32,24);
  const positions=glassGeometry.attributes.position;
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i), y=positions.getY(i);
    const corner=Math.max(0,Math.abs(y)-0.44);
    positions.setXYZ(i,x*(1-corner*0.5),y,0.045*(1-(x/0.81)**2)*(1-(y/0.535)**2));
  }
  glassGeometry.computeVertexNormals();
  const screen=new THREE.Mesh(glassGeometry,screenMat);screen.position.set(0,1.73,0.787);rig.add(screen);

  scene.add(new THREE.HemisphereLight(0xfff5dd,0x726956,2.6));
  const light=new THREE.DirectionalLight(0xffefd6,2.5);light.position.set(-3,10,3);light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-4;light.shadow.camera.right=4;light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=0.035;light.shadow.bias=-0.0001;
  scene.add(light);
  const fill=new THREE.DirectionalLight(0xc6e1e0,1.2);fill.position.set(4,2,-2);scene.add(fill);
  const shadowMat=new THREE.ShadowMaterial({opacity:0.18});materials.push(shadowMat);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),shadowMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

  let powered=true,ejected=false,boot=-10,wake=-10,time=0,previous=0,lastDraw=-1,frame=0,visible=true,disposed=false;
  let targetX=0,targetY=0;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const notify=(message:string)=>onState({powered,ejected,message});
  const power=()=>{powered=!powered;if(powered){boot=time;wake=time;}notify(powered?"Booting DD-01…":"Computer asleep.");invalidate();};
  const eject=()=>{ejected=!ejected;notify(ejected?"Floppy disk ejected. Click again to insert.":"Floppy disk inserted.");invalidate();};
  const wakeScreen=()=>{if(!powered){powered=true;boot=time;}wake=time;notify("Welcome to the tiny portfolio.");invalidate();};
  const drawScreen=()=>{
    ctx.fillStyle=powered?"#17352a":"#16221e";ctx.fillRect(0,0,512,352);
    if(powered) {
      ctx.fillStyle="#b3e6a2";ctx.font="20px monospace";
      if(!reduced.matches && time-boot<1.8) {
        const lines=["DD-01 PERSONAL COMPUTER","64K MEMORY ........ OK","MOUNTING PORTFOLIO","READY."];
        lines.slice(0,Math.min(4,Math.floor((time-boot)*2.5)+1)).forEach((line,i)=>ctx.fillText(line,30,65+i*48));
      } else if(time-wake<8) {
        ctx.fillStyle="#608866";ctx.fillRect(0,0,512,352);
        ctx.fillStyle="#e2d7b6";ctx.fillRect(0,0,512,30);ctx.fillStyle="#293b2c";ctx.font="bold 18px monospace";ctx.fillText("DD / Portfolio",18,22);
        ctx.fillStyle="#213829";ctx.fillRect(94,84,342,212);ctx.fillStyle="#f0e5c7";ctx.fillRect(88,78,342,212);
        ctx.fillStyle="#b6c09b";ctx.fillRect(88,78,342,29);ctx.fillStyle="#263d2e";ctx.fillText("hello.txt",104,100);
        ctx.font="bold 29px monospace";ctx.fillText("Hello, world.",112,156);
        ctx.font="18px monospace";ctx.fillText("I'm Dharmay.",112,195);ctx.fillText("I build things.",112,224);
        if(reduced.matches||Math.floor(time*2)%2===0)ctx.fillRect(112,246,12,20);
      } else {
        // A genuine animated wireframe screensaver, drawn into the CRT texture.
        const angle=reduced.matches?0.4:time*0.62;
        const points=Array.from({length:8},(_,i)=>{
          const x=(i&1?1:-1),y=(i&2?1:-1),z=(i&4?1:-1);
          const rx=x*Math.cos(angle)-z*Math.sin(angle),rz=x*Math.sin(angle)+z*Math.cos(angle);
          const ry=y*Math.cos(angle*0.7)-rz*Math.sin(angle*0.7);
          return [256+rx*69+(reduced.matches?0:Math.sin(time*0.4)*78),167+ry*63+(reduced.matches?0:Math.cos(time*0.31)*27)];
        });
        ctx.lineWidth=3;ctx.strokeStyle="#a8df93";ctx.shadowColor="#8bdd83";ctx.shadowBlur=8;
        for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit)){ctx.beginPath();ctx.moveTo(...points[i] as [number,number]);ctx.lineTo(...points[i|bit] as [number,number]);ctx.stroke();}
        ctx.shadowBlur=0;ctx.font="16px monospace";ctx.fillStyle="#86ac7d";ctx.fillText("CLICK TO WAKE",194,317);
      }
      ctx.fillStyle="rgba(5,20,12,.15)";for(let y=0;y<352;y+=4)ctx.fillRect(0,y,512,1);
      const vignette=ctx.createRadialGradient(256,176,90,256,176,300);vignette.addColorStop(0,"transparent");vignette.addColorStop(1,"rgba(0,15,8,.48)");ctx.fillStyle=vignette;ctx.fillRect(0,0,512,352);
      ctx.fillStyle="rgba(255,255,225,.035)";ctx.beginPath();ctx.ellipse(122,52,180,28,-0.25,0,Math.PI*2);ctx.fill();
    }
    screenTexture.needsUpdate=true;
  };
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  const hit=(event:PointerEvent)=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects([powerButton,ejectButton,disk,screen],true)[0]?.object;};
  const move=(event:PointerEvent)=>{const r=host.getBoundingClientRect();targetX=((event.clientX-r.left)/r.width-0.5)*0.22;targetY=((event.clientY-r.top)/r.height-0.5)*0.06;renderer.domElement.style.cursor=hit(event)?"pointer":"default";invalidate();};
  const leave=()=>{targetX=0;targetY=0;invalidate();};
  const click=(event:PointerEvent)=>{const object=hit(event);if(object===powerButton)power();else if(object===ejectButton||object?.parent===disk)eject();else if(object===screen)wakeScreen();};
  renderer.domElement.addEventListener("pointermove",move);renderer.domElement.addEventListener("pointerleave",leave);renderer.domElement.addEventListener("pointerup",click);
  function render(now:number){
    frame=0;if(disposed||!visible||document.hidden)return;
    const dt=previous?Math.min((now-previous)/1000,0.05):0;previous=now;time+=dt;
    const blend=reduced.matches?1:1-Math.exp(-dt*9);
    rig.rotation.y+=(targetX-rig.rotation.y)*blend;rig.rotation.x+=(targetY-rig.rotation.x)*blend;
    disk.position.z+=((ejected?1.26:0.45)-disk.position.z)*blend;
    led.visible=powered;
    if(time-lastDraw>1/24||reduced.matches){drawScreen();lastDraw=time;}
    renderer.render(scene,camera);
    if(!reduced.matches)frame=requestAnimationFrame(render);
  }
  function invalidate(){if(!disposed&&!frame&&visible&&!document.hidden){previous=0;frame=requestAnimationFrame(render);}}
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const vertical=Math.max(3.25,3.9*h/w);camera.left=-vertical*w/h/2;camera.right=vertical*w/h/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();invalidate();};
  const observer=new ResizeObserver(resize);observer.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else invalidate();});intersection.observe(host);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};
  document.addEventListener("visibilitychange",visibility);reduced.addEventListener("change",invalidate);
  drawScreen();resize();invalidate();
  return {power,disk:eject,screen:wakeScreen,dispose:()=>{
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener("visibilitychange",visibility);reduced.removeEventListener("change",invalidate);
    renderer.domElement.removeEventListener("pointermove",move);renderer.domElement.removeEventListener("pointerleave",leave);renderer.domElement.removeEventListener("pointerup",click);
    scene.traverse(object=>{if(object instanceof THREE.Mesh)object.geometry.dispose();});materials.forEach(mat=>mat.dispose());textures.forEach(tex=>tex.dispose());renderer.dispose();renderer.domElement.remove();
  }};
}
