// Reference recording used with user-confirmed permission. Preserve pitch and
// the falling texture; fade the quiet return to match the 2.8-second animation.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error',
  '-i',fileURLToPath(new URL('../public/audio/world/jesse-hologram-original.mp3',import.meta.url)),
  '-t','2.8','-af','loudnorm=I=-25:TP=-9:LRA=5,afade=t=in:d=0.008,afade=t=out:st=2.55:d=0.25',
  '-ar','44100','-c:a','libmp3lame','-b:a','128k',
  fileURLToPath(new URL('../public/audio/world/jesse-hologram.mp3',import.meta.url))]);
