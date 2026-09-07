// Heights are measured from the paws, in CSS pixels above the floor.
export const CAT_RIM = 55;
export const CAT_HIDDEN = -104;
export const CAT_APEX = 82;

export function smoothStep(t: number) {
  const p = Math.max(0, Math.min(1, t));
  return p * p * (3 - 2 * p);
}

export function sampleCatJump(progress: number, entering: boolean) {
  const p = Math.max(0, Math.min(1, progress));
  const start = entering ? 0 : CAT_HIDDEN;
  const end = entering ? CAT_HIDDEN : 0;
  const rise = Math.sqrt(CAT_APEX - start);
  const fall = Math.sqrt(CAT_APEX - end);
  const gravity = (rise + fall) ** 2;
  const apexTime = rise / (rise + fall);
  const y = start + 2 * rise * (rise + fall) * p - gravity * p * p;
  // Change depth only when the paws clear the rim. The front flap then
  // occludes the descending body, rather than hiding the whole sprite at once.
  const behind = entering ? p >= apexTime : y < CAT_RIM && p < apexTime;
  const travel = entering
    ? smoothStep(p / apexTime)
    : smoothStep((p - 0.38) / 0.62);
  return { y, behind, travel, apexTime };
}
