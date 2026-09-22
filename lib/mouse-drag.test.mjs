import assert from "node:assert/strict";
import { test } from "node:test";
import { Euler, Matrix4, OrthographicCamera, Quaternion, Raycaster, Vector2, Vector3 } from "three";
import { mouseDragTarget } from "./mouse-drag.ts";

for (const aspect of [1, 5]) for (const yaw of [0, 1.2, -2]) {
  test(`grab point stays under pointer at aspect ${aspect}, rotation ${yaw}`, () => {
    const camera = new OrthographicCamera(-2*aspect, 2*aspect, 2, -2, 0.1, 50);
    camera.position.set(4.2, 3.1, 7); camera.lookAt(0, 0.8, 0.35); camera.updateMatrixWorld();
    const rig = new Matrix4().compose(new Vector3(0, 0.2, 0), new Quaternion().setFromEuler(new Euler(0.04, yaw, 0)), new Vector3(1, 1, 1));
    const grab = new Vector3(0.1, 0.12, -0.08);
    const ray = new Raycaster();
    // Returning after a blocked/beyond-frame target must not retain an offset.
    for (const pointer of [new Vector2(0.3, -0.4), new Vector2(1.3, -0.5), new Vector2(0.3, -0.4)]) {
      ray.setFromCamera(pointer, camera);
      const target = mouseDragTarget(ray.ray, rig, grab, 0.25);
      assert.ok(target);
      const contact = target.clone().add(grab).applyMatrix4(rig).project(camera);
      assert.ok(Math.abs(contact.x-pointer.x) < 1e-9);
      assert.ok(Math.abs(contact.y-pointer.y) < 1e-9);
      assert.equal(target.y, 0.25);
    }
  });
}
