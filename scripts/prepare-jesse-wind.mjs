// LEGACY / UNUSED: stretched variants caused flutter and are no longer loaded.
// Active playback uses jesse-whoosh-original.mp3 at 1x; do not wire these back in.
// Uses the reference recording with the site owner's confirmed permission.
// Original retained byte-for-byte; only playback variants are duration-fitted.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../public/audio/world/jesse-whoosh-original.mp3',import.meta.url));
for(const [name,duration] of [['short',.8],['medium',1.75],['long',3.2]]){
  // Remove the quiet lead-in AND trailing silence before fitting the recording.
  // Otherwise the long variant adds ~0.6 seconds of almost inaudible pre-roll
  // on top of the camera fade, making a normal-speed pass feel late and rushed.
  const tempo=.80/duration;
  const filters=['atrim=start=0.48:end=1.28','asetpts=PTS-STARTPTS',
    ...(tempo<.5?['atempo=0.5',`atempo=${tempo*2}`]:[`atempo=${tempo}`]),
    'loudnorm=I=-27:TP=-9:LRA=5',`apad=whole_dur=${duration}`,`atrim=duration=${duration}`,
    'afade=t=in:d=0.015',`afade=t=out:st=${duration-.08}:d=0.08`];
  execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',source,
    '-af',filters.join(','),'-ar','24000','-c:a','libmp3lame','-b:a','96k',
    fileURLToPath(new URL(`../public/audio/world/jesse-wind-${name}.mp3`,import.meta.url))]);
}
