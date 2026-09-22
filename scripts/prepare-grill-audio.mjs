// BenjaminNelan, CC0: https://freesound.org/people/BenjaminNelan/sounds/353124/
// Usage: node scripts/prepare-grill-audio.mjs /path/to/353124_1196020-hq.mp3
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(!process.argv[2])throw new Error('Pass the original Frying Pan Sizzle recording');
// Join the last second to the first, then put that crossfade after the middle.
// The loop boundary remains continuous without a recurring fade to silence.
const graph='[0:a]atrim=start=6:duration=12,asetpts=PTS-STARTPTS,highpass=f=240,lowpass=f=3800,acompressor=threshold=0.12:ratio=3:attack=8:release=100,loudnorm=I=-24:TP=-9:LRA=5,asplit=3[h][m][t];[h]atrim=duration=1,asetpts=PTS-STARTPTS[head];[m]atrim=start=1:end=11,asetpts=PTS-STARTPTS[middle];[t]atrim=start=11,asetpts=PTS-STARTPTS[tail];[tail][head]acrossfade=d=1:c1=tri:c2=tri[seam];[middle][seam]concat=n=2:v=0:a=1[out]';
execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',process.argv[2],'-filter_complex',graph,'-map','[out]','-ar','32000','-ac','1','-b:a','96k',fileURLToPath(new URL('../public/audio/world/grill-sizzle.mp3',import.meta.url))]);
