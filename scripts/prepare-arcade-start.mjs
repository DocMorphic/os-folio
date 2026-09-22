// Plasterbrain — Game Start (CC0)
// https://freesound.org/people/plasterbrain/sounds/243020/
// Source: https://cdn.freesound.org/previews/243/243020_4284968-hq.mp3
// Usage: node scripts/prepare-arcade-start.mjs /path/to/game-start.mp3
import {spawnSync} from 'node:child_process';
const source=process.argv[2];
if(!source)throw new Error('Pass the downloaded CC0 source clip');
const result=spawnSync('ffmpeg',['-v','error','-y','-i',source,'-t','1.05','-af',
  'highpass=f=75,lowpass=f=7500,volume=2,alimiter=limit=0.7:level=false,afade=t=in:d=0.003,afade=t=out:st=0.88:d=0.17',
  '-ar','44100','-ac','1','-c:a','libmp3lame','-b:a','128k','public/audio/world/arcade-start.mp3'],{stdio:'inherit'});
if(result.status!==0)throw new Error('Arcade-start conversion failed');
