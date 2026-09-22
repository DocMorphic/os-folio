import * as THREE from 'three';
import {yieldLoadingWork} from './loading-work';

/** Upload once, in small batches, instead of all textures in the first draw. */
export async function warmWorldTextures(renderer:THREE.WebGLRenderer,scene:THREE.Scene,cancelled:()=>boolean){
  const textures=new Set<THREE.Texture>();
  const collect=(value:unknown)=>{if(value instanceof THREE.Texture&&!value.isRenderTargetTexture&&value.image)textures.add(value);};
  scene.traverse(object=>{
    if(!(object instanceof THREE.Mesh||object instanceof THREE.Points||object instanceof THREE.Sprite))return;
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      Object.values(material).forEach(collect);
      if(material instanceof THREE.ShaderMaterial)Object.values(material.uniforms).forEach(uniform=>collect(uniform.value));
    }
  });
  for(const texture of textures){
    if(cancelled())return;
    renderer.initTexture(texture);
    await yieldLoadingWork();
  }
}

/** CubeCamera.update does six scene renders synchronously. Spread the same
 * capture across frames so the native dinosaur can paint between faces. */
export async function captureWorldEnvironment(renderer:THREE.WebGLRenderer,scene:THREE.Scene,probe:THREE.CubeCamera,hidden:THREE.Object3D[],cancelled:()=>boolean){
  if(probe.coordinateSystem!==renderer.coordinateSystem){probe.coordinateSystem=renderer.coordinateSystem;probe.updateCoordinateSystem();}
  probe.updateMatrixWorld(true);
  const target=probe.renderTarget,generateMipmaps=target.texture.generateMipmaps;
  for(let face=0;face<6;face++){
    await yieldLoadingWork();if(cancelled())return false;
    const previous=renderer.getRenderTarget(),previousFace=renderer.getActiveCubeFace(),previousMip=renderer.getActiveMipmapLevel();
    const visible=hidden.map(object=>object.visible),xr=renderer.xr.enabled;
    try{
      hidden.forEach(object=>{object.visible=false;});renderer.xr.enabled=false;
      target.texture.generateMipmaps=face===5&&generateMipmaps;
      renderer.setRenderTarget(target,face,probe.activeMipmapLevel);
      renderer.render(scene,probe.children[face] as THREE.Camera);
    }finally{
      renderer.setRenderTarget(previous,previousFace,previousMip);renderer.xr.enabled=xr;
      target.texture.generateMipmaps=generateMipmaps;
      hidden.forEach((object,i)=>{object.visible=visible[i];});
    }
  }
  target.texture.needsPMREMUpdate=true;return true;
}
