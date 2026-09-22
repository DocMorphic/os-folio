import { Matrix4, Plane, Ray, Vector3 } from "three";

/** Keep the actual grabbed surface point on the cursor ray, including the lift. */
export function mouseDragTarget(ray: Ray, rigMatrix: Matrix4, grabOffset: Vector3, height: number): Vector3 | null {
  const localRay = ray.clone().applyMatrix4(rigMatrix.clone().invert());
  const plane = new Plane(new Vector3(0, 1, 0), -(height + grabOffset.y));
  const point = localRay.intersectPlane(plane, new Vector3());
  return point ? point.sub(grabOffset).setY(height) : null;
}
