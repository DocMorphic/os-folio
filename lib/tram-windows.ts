import * as THREE from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";

export function createTramWindows(materials:THREE.Material[]){
  const metal=new THREE.MeshStandardMaterial({color:0xc6a76d,metalness:.65,roughness:.3});
  const glass=new THREE.MeshStandardMaterial({color:0xc3e0d8,transparent:true,opacity:.2,roughness:.12,metalness:.12,depthWrite:false});
  // These are single flat panes, not volumes needing back/front transparency passes.
  glass.forceSinglePass=true;
  materials.push(metal,glass);
  const windows:{sash:THREE.Group;hit:THREE.Mesh;open:boolean;amount:number;height:number;outward:number}[]=[];
  const add=(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,yaw=0)=>{
    const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=yaw;parent.add(frame);
    const sash=new THREE.Group();sash.name=`Tram window / outward hinged sash ${windows.length+1}`;sash.position.y=h/2;sash.userData.dynamic=true;frame.add(sash);
    const pieces:THREE.BufferGeometry[]=[];
    const part=(w:number,h:number,d:number,x:number,y:number,z:number)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);pieces.push(g);};
    for(const dx of [-w/2+.055,w/2-.055])part(.034,h-.065,.04,dx,0,0);
    for(const dy of [-h/2+.045,h/2-.045])part(w-.075,.035,.04,0,dy,0);
    part(.2,.027,.08,0,-h*.34,.06);part(.2,.027,.08,0,-h*.34,-.06);
    const geometry=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());
    const hardware=new THREE.Mesh(geometry,metal);hardware.position.y=-h/2;hardware.castShadow=true;sash.add(hardware);
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(w-.12,h-.1),glass);pane.position.y=-h/2;glass.side=THREE.DoubleSide;sash.add(pane);
    // Top-hinged awning sash: the lower edge swings outside on every tram face.
    // Keep the opening clickable even while the glass projects away from it.
    const hit=new THREE.Mesh(new THREE.BoxGeometry(w-.04,h-.035,.16),metal);
    const state={sash,hit,open:false,amount:0,height:h,outward:Math.sign(z*Math.cos(yaw)+x*Math.sin(yaw))||1};windows.push(state);
    frame.updateWorldMatrix(true,false);hit.applyMatrix4(frame.matrixWorld);hit.updateMatrixWorld();
    return state;
  };
  return {windows,add,toggle:(index:number)=>{if(windows[index])windows[index].open=!windows[index].open;},
    update:(dt:number,reduced=false)=>{
      let changed=false;
      for(const state of windows){
        const target=Number(state.open);if(Math.abs(state.amount-target)<.0001)continue;
        state.amount=reduced?target:THREE.MathUtils.damp(state.amount,target,7,dt);
        if(Math.abs(state.amount-target)<.0001)state.amount=target;
        state.sash.rotation.x=-state.outward*state.amount*Math.PI*.34;state.sash.updateMatrix();state.sash.updateMatrixWorld(true);changed=true;
      }
      return changed;
    },dispose:()=>windows.forEach(w=>w.hit.geometry.dispose())};
}
