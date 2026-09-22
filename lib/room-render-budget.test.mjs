import test from "node:test";
import assert from "node:assert/strict";
import {roomRenderSize} from "./room-render-budget.ts";

test("pixel-art raster stays bounded from phone through 4K without changing aspect",()=>{
  for(const [w,h] of [[390,844],[801,707],[1440,900],[2560,1440],[3840,2160]]){
    const size=roomRenderSize(w,h);
    assert.ok(size.width<=960&&size.height<=600);
    assert.ok(Math.abs(size.width/size.height-w/h)<.005);
    assert.ok(size.width<w&&size.height<h);
  }
});
