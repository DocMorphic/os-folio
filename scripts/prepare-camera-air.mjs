// Usage: node scripts/prepare-camera-air.mjs /path/to/844817_15082088-hq.mp3
// rubindaniel, CC0: https://freesound.org/people/rubindaniel/sounds/844817/
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const source=process.argv[2];
if(!source)throw new Error('Pass the original Soft breeze at Budaorsi koparok - No1 recording');
for(const [name,duration] of [['short',.8],['medium',1.75],['long',3.2]]){
  const attack=duration*.45/1.75;
  // Rounded low air, not bright hiss. Keep the original recording at natural
  // speed; runtime camera velocity supplies the final spatial swell.
  const filters=['highpass=f=65:p=2','lowpass=f=900:p=2','loudnorm=I=-30:TP=-9:LRA=5',
    `afade=t=in:d=${attack}:curve=hsin`,`afade=t=out:st=${attack}:d=${duration-attack}:curve=hsin`];
  execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-ss','12','-i',source,'-t',String(duration),
    '-af',filters.join(','),'-ar','48000','-c:a','libmp3lame','-b:a','192k',
    fileURLToPath(new URL(`../public/audio/world/camera-breeze-${name}.mp3`,import.meta.url))]);
}
