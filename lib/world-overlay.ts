export type WorldPhase = "warming" | "entering" | "live" | "leaving";

/** Covered scenes stay idle, except for preparation and one entrance-pose frame. */
export function worldFrameAllowed(active:boolean,preparing:boolean,covered:boolean,entranceSnapshot=false){
  return (active||preparing)&&(!covered||preparing||entranceSnapshot);
}

/** This unanimated outer boundary must not rely on a stylesheet or inherited
 * visibility: the projected screen explicitly sets its own visibility. */
export function worldOverlayGate(active:boolean,phase:WorldPhase) {
  const visible=active&&phase!=="warming";
  return {
    inert:!visible,
    "aria-hidden":!visible,
    style:{position:"fixed" as const,inset:0,zIndex:100000,opacity:visible?1:0,pointerEvents:visible?"auto" as const:"none" as const},
  };
}
