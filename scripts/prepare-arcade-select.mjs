// TheDweebMan, “8-Bit Select Menu - Select”, CC0.
// https://freesound.org/people/TheDweebMan/sounds/277216/
// Source: https://cdn.freesound.org/previews/277/277216_5324223-hq.mp3
// Usage: node scripts/prepare-arcade-select.mjs /path/to/downloaded/select.mp3
import {spawnSync} from 'node:child_process';
const source=process.argv[2];
if(!source)throw new Error('Pass the downloaded CC0 source clip');
const result=spawnSync('ffmpeg',['-v','error','-y','-i',source,'-af',
  'highpass=f=100,lowpass=f=6500,volume=0.7,afade=t=in:d=0.003,afade=t=out:st=0.100:d=0.015',
  '-ar','32000','-ac','1','-c:a','libmp3lame','-b:a','96k','public/audio/world/arcade-select.mp3'],{stdio:'inherit'});
if(result.status!==0)throw new Error('Arcade clip conversion failed');
