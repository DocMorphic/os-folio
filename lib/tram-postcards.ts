import * as THREE from "three";

/** Original files are sampled on the GPU; the print treatment never alters the photograph. */
export const TRAM_POSTCARDS = [
  {folder:"austria",index:0}, {folder:"india",index:1},
  {folder:"germany",index:2}, {folder:"austria",index:2},
  {folder:"india",index:5}, {folder:"germany",index:6},
] as const;

export function createIndigoPostcard(folder:string,index:number,textures:THREE.Texture[],materials:THREE.Material[]) {
  const fallback = new THREE.DataTexture(new Uint8Array([190,183,163,255]),1,1);
  fallback.needsUpdate=true;textures.push(fallback);
  const material=new THREE.ShaderMaterial({
    uniforms:{photograph:{value:fallback},imageAspect:{value:1},cardAspect:{value:1.42}},
    vertexShader:`varying vec2 printUV; void main(){printUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`
      uniform sampler2D photograph; uniform float imageAspect; uniform float cardAspect; varying vec2 printUV;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=printUV-.5;
        if(imageAspect>cardAspect)uv.x*=cardAspect/imageAspect;else uv.y*=imageAspect/cardAspect;
        vec3 source=texture2D(photograph,uv+.5).rgb;
        float luminance=dot(source,vec3(.2126,.7152,.0722));
        float fibre=hash(floor(printUV*vec2(950.,680.)))-.5;
        float density=smoothstep(.025,.91,luminance+fibre*.085);
        vec3 ink=vec3(.065,.105,.29),paper=vec3(.91,.895,.82);
        vec3 color=mix(ink,paper,density);
        color+=fibre*.045;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  materials.push(material);
  let disposed=false;
  // Geometry-only tests intentionally do not provide browser image decoding.
  const ready=typeof document.createElementNS!=="function"?Promise.resolve():new Promise<void>(resolve=>{
    new THREE.TextureLoader().load(`/photos/${folder}/${folder}-${index+1}.jpg`,texture=>{
      if(disposed){texture.dispose();resolve();return;}
      texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures.push(texture);
      material.uniforms.photograph.value=texture;
      material.uniforms.imageAspect.value=texture.image.width/texture.image.height;
      resolve();
    },undefined,()=>resolve());
  });
  return {material,ready,dispose:()=>{disposed=true;}};
}
