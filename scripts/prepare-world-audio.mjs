// Run with the extracted CC0 Kenney/Rubberduck packs as the first argument.
// Keep only small, local MP3s; no external audio requests during a visit.
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const input=process.argv[2];
if(!input)throw new Error('Pass the directory containing impact/, interface/, rpg/ and water/');
mkdirSync('public/audio/world',{recursive:true});
const samples={
  'key-1':'interface/Audio/click_001.ogg','key-2':'interface/Audio/click_002.ogg',
  'wood':'impact/Audio/impactWood_medium_001.ogg',
  'paper-1':'rpg/Audio/bookFlip1.ogg','paper-2':'rpg/Audio/bookFlip2.ogg',
  'latch':'rpg/Audio/metalLatch.ogg','window':'rpg/Audio/doorOpen_2.ogg',
  'bell':'impact/Audio/impactBell_heavy_001.ogg',
  'coin':'rpg/Audio/handleCoins.ogg','switch':'interface/Audio/switch_002.ogg',
  'arcade':'interface/Audio/confirmation_002.ogg',
  'splash-1':'water/splash_03.ogg','splash-2':'water/splash_05.ogg','splash-3':'water/splash_07.ogg',
  'water-bed':'water/loop_water_02.ogg',
};
for(const [name,path] of Object.entries(samples)){
  const filter='highpass=f=80,lowpass=f=10000,alimiter=limit=0.85:level=false,afade=t=in:d=0.005';
  const result=spawnSync('ffmpeg',['-v','error','-y','-i',`${input}/${path}`,'-af',filter,'-ar','32000','-ac','1','-c:a','libmp3lame','-b:a','80k',`public/audio/world/${name}.mp3`],{stdio:'inherit'});
  if(result.status!==0)throw new Error(`Failed to convert ${path}`);
}
