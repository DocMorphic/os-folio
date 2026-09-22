import { Vector3 } from "three";

/** Collision correction belongs to direct dragging, not a rotating camera/model.
 * A changing 2D silhouette is not a physical collision on the model's desk.
 * Correcting idle placement against it feeds displacement back into the next
 * frame and eventually sends the mouse (and its cable) away from the computer.
 */
export function stepMousePlacement(
  from:Vector3,
  target:Vector3,
  blend:number,
  dragging:boolean,
  constrain:(from:Vector3,to:Vector3)=>Vector3,
):Vector3 {
  const desired=from.clone().lerp(target,blend);
  return dragging?constrain(from,desired):desired;
}
