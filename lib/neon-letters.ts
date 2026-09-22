import * as THREE from "three";
import type {Font} from "three/addons/loaders/FontLoader.js";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";

/** Bent glass tubes follow the actual glyph contours, including letter holes. */
export function neonLetterGeometry(font:Font,text:string,size:number,depth:number,radius=.009){
  const tubes:THREE.BufferGeometry[]=[];
  for(const shape of font.generateShapes(text,size)){
    const {shape:outer,holes}=shape.extractPoints(4);
    for(const loop of [outer,...holes]){
      const points=loop.map(p=>new THREE.Vector3(p.x,p.y,depth));
      if(points.length<3)continue;
      const curve=new THREE.CurvePath<THREE.Vector3>();
      for(let i=0;i<points.length;i++)curve.add(new THREE.LineCurve3(points[i],points[(i+1)%points.length]));
      tubes.push(new THREE.TubeGeometry(curve,Math.max(12,points.length),radius,4,true));
    }
  }
  const geometry=mergeGeometries(tubes);tubes.forEach(t=>t.dispose());
  return geometry??new THREE.BufferGeometry();
}
export function neonMaterials(color:number){
  return {
    core:new THREE.MeshBasicMaterial({color,toneMapped:false}),
    halo:new THREE.MeshBasicMaterial({color,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),
  };
}
