import * as THREE from "three";
import { RIPPLE_DOMAIN, RIPPLE_RESOLUTION, RIPPLE_STEP, RIPPLE_IMPULSES, type WaterImpulse } from "./water-interaction";

/** Small fixed-step GPU height field. Heights interact and reflect at the dock;
 * it costs two 384px textures, not a full-resolution fluid simulation. */
export function createWaterRipples(renderer:THREE.WebGLRenderer){
  const supported=renderer.extensions.has("EXT_color_buffer_float");
  const empty=new THREE.DataTexture(new Float32Array(4),1,1,THREE.RGBAFormat,THREE.FloatType);empty.needsUpdate=true;
  let a:THREE.WebGLRenderTarget,b:THREE.WebGLRenderTarget;
  const scene=new THREE.Scene(),camera=new THREE.Camera(),events=Array.from({length:RIPPLE_IMPULSES},()=>new THREE.Vector4());
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{field:{value:empty as THREE.Texture},events:{value:events},eventCount:{value:0}},
    vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`uniform sampler2D field;uniform vec4 events[${RIPPLE_IMPULSES}];uniform int eventCount;varying vec2 v;
      bool solid(vec2 uv){vec2 p=(uv-.5)*${RIPPLE_DOMAIN}.;return abs(p.x)<6.15&&abs(p.y)<3.95;}
      float sampleH(vec2 uv,float center){return solid(uv)?center:texture2D(field,uv).r;}
      void main(){vec2 p=(v-.5)*${RIPPLE_DOMAIN}.;vec2 state=texture2D(field,v).rg;float h=state.r;
        if(solid(v)){gl_FragColor=vec4(0.);return;}
        vec2 d=vec2(1./${RIPPLE_RESOLUTION}.,0.);
        float lap=sampleH(v+d,h)+sampleH(v-d,h)+sampleH(v+d.yx,h)+sampleH(v-d.yx,h)-4.*h;
        float edge=min(min(v.x,1.-v.x),min(v.y,1.-v.y))*${RIPPLE_DOMAIN}.;
        float next=(2.*h-state.g+.12*lap)*mix(.82,.996,smoothstep(0.,3.,edge));
        for(int i=0;i<${RIPPLE_IMPULSES};i++){if(i>=eventCount)break;vec2 delta=p-events[i].xy;next+=exp(-dot(delta,delta)/(events[i].z*events[i].z))*events[i].w;}
        gl_FragColor=vec4(clamp(next,-.3,.3),h,0.,1.);
      }`});
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);quad.frustumCulled=false;scene.add(quad);
  let initialized=false,accumulator=0,remaining=0;
  if(supported){const options={type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false};a=new THREE.WebGLRenderTarget(RIPPLE_RESOLUTION,RIPPLE_RESOLUTION,options);b=a.clone();}
  return {
    get texture(){return supported&&initialized?a.texture:empty;},
    get activity(){return Math.min(1,remaining/3);},
    step(dt:number,impulses:WaterImpulse[]){
      if(!supported)return;
      if(impulses.length){if(remaining<=0)initialized=false;remaining=12;}
      if(remaining<=0&&initialized)return;
      remaining=Math.max(0,remaining-dt);accumulator=Math.min(.1,accumulator+dt);
      const target=renderer.getRenderTarget(),color=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha();
      try{
        if(!initialized){renderer.setClearColor(0,0);renderer.setRenderTarget(a);renderer.clear();renderer.setRenderTarget(b);renderer.clear();initialized=true;}
        material.uniforms.eventCount.value=impulses.length;
        impulses.forEach((p,i)=>events[i].set(p.x,p.z,p.radius,p.strength));
        // Events must be injected exactly once, including a low-delta first frame.
        if(impulses.length)accumulator=Math.max(accumulator,RIPPLE_STEP);
        for(let i=0;i<6&&accumulator>=RIPPLE_STEP;i++){
          material.uniforms.field.value=a.texture;renderer.setRenderTarget(b);renderer.render(scene,camera);
          [a,b]=[b,a];accumulator-=RIPPLE_STEP;material.uniforms.eventCount.value=0;
        }
      }finally{renderer.setRenderTarget(target);renderer.setClearColor(color,alpha);}
    },
    dispose(){if(supported){a.dispose();b.dispose();}empty.dispose();quad.geometry.dispose();material.dispose();},
  };
}
