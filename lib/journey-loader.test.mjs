import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {createLoadingRun,loadingScore} from './journey-progress.ts';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('runner and sprite sheets are unchanged upstream Chromium assets',()=>{
  for(const [name,hash] of Object.entries({
    'offline.js':'f1275743c71905a6dc1e32f6f94fcc2c4c529aff6f4eec66d7025a90e4a3069e',
    '100-offline-sprite.png':'01c3692a6901b3e64b5a297e838cadc207368b096a1491de6373e43ed776c9a5',
    '200-offline-sprite.png':'016bddc0a087eca7a304a7952bf57f01a0106b4ce64881399db7ea1ef40d1678',
  }))assert.equal(createHash('sha256').update(readFileSync(new URL(`../public/vendor/chromium-dino/${name}`,import.meta.url))).digest('hex'),hash);
  assert.match(read('../public/vendor/chromium-dino/LICENSE'),/Redistribution and use/);
});
test('loading removes the game before showing Begin, and readiness never automatically enters',()=>{
  const source=read('../components/JourneyLoader.tsx');
  assert.match(source,/canBegin\s*\?\s*<button/);
  assert.match(source,/aria-label="Begin".*onClick=\{begin\}/);
  assert.match(source,/<iframe/);assert.match(source,/sandbox="allow-scripts"/);
  assert.doesNotMatch(source,/1100|createRunner|drawRunner|DD \/ TRANSIT|Continue without sound/);
  assert.match(source,/if\(!canBegin\|\|leaving.current\)return/);
  assert.match(source,/const canBegin=journey.ready&&minimumPassed/);
  assert.match(source,/onLoad=\{gameLoaded\}/);
  assert.match(source,/journey.ready\?100:99/);
  assert.match(source,/role="progressbar"/);
  assert.match(source,/now-gameStarted>=run.duration/);
  assert.match(source,/const audioReady=journey.destination==="world"\?worldSound.unlock\(\)/);
  assert.match(source,/primed.then\(\(\)=>\{if\(!root.current\)return;worldSound.hold\(false\);finishJourney\(\)/);
  assert.equal((source.match(/finishJourney\(\)/g)||[]).length,1);
});
test('embedding starts varied native runs with obstacles and hands demo controls to the player',()=>{
  const scores=new Set(),positions=new Set();
  // Exercise the real Chromium method: a no-op mock hides its toggle behavior.
  const nativeDuck=runInNewContext(read('../public/vendor/chromium-dino/offline.js')+';Trex.prototype.setDuck',{
    window:{devicePixelRatio:1,navigator:{userAgent:''}},
  });
  for(let i=0;i<24;i++){
    const handlers={},docHandlers={};let instance;
    class FakeRunner{
      constructor(){instance=this;this.canvas={dataset:{}};this.config={CLEAR_TIME:3000};this.dimensions={WIDTH:600};
        this.canvasCtx={clearRect(){}};
        this.distanceMeter={config:{COEFFICIENT:.025},update(delta,distance){this.drawnDistance=distance;}};
        this.tRex={config:{START_X_POS:50},jumping:false,ducking:false,status:'RUNNING',duckChanges:0,
          update(delta,status){if(status){this.status=status;this.duckChanges++;}},setDuck:nativeDuck,
          startJump(){this.jumps=(this.jumps||0)+1;},reset(){this.xPos=this.xInitialPos;this.ducking=false;this.status='RUNNING';}};
        this.horizon={spritePos:{PTERODACTYL:{}},gapCoefficient:.6,obstacles:[],reset(){this.obstacles=[];},addNewObstacle(){this.obstacles.push({xPos:600,width:25,gap:175,typeConfig:{type:'CACTUS_SMALL'}});}};
      }
      stop(){this.playing=false;}startGame(){}setSpeed(speed){this.currentSpeed=speed;}restart(){this.crashed=false;}
      update(){}play(){this.playing=true;this.update();}onKeyDown(){}onKeyUp(){}stopListening(){this.cleaned=true;}
    }
    class NativeObstacle{
      static types=[{type:'PTERODACTYL',frameRate:1000/6}];
      constructor(ctx,type){this.typeConfig=type;this.width=46;this.gap=170;}
    }
    const messages=[],frames=[];
    const window={parent:{postMessage:message=>messages.push(message)},addEventListener:(name,fn)=>{handlers[name]=fn;}};
    runInNewContext(read('../public/vendor/chromium-dino/adapter.js'),{Runner:FakeRunner,Obstacle:NativeObstacle,window,
      document:{addEventListener:(name,fn)=>{docHandlers[name]=fn;}},matchMedia:()=>({matches:false}),Math,
      getTimeStamp:()=>1000,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}});
    handlers.load();
    assert.equal(messages.length,0,'readiness waits for a painted native frame');
    frames.shift()();frames.shift()();assert.equal(messages[0].type,'runner-ready');
    instance.time=1;instance.update();assert.equal(instance.time,950,'large stalls never become huge physics steps');
    scores.add(instance.canvas.dataset.startScore);positions.add(instance.horizon.obstacles[0].xPos);
    assert.ok(instance.distanceRan*.025>=150&&instance.distanceRan*.025<1450);
    assert.ok(instance.runningTime>3000);assert.equal(instance.activated,true);assert.equal(instance.playing,true);
    instance.tRex.reset();assert.equal(instance.tRex.xPos,50,'landing keeps the dinosaur inset, not at the clipped edge');
    assert.equal(instance.distanceMeter.drawnDistance,0,'visible score starts at zero, independently of native distance');
    assert.equal(instance.distanceMeter.drawHighScore(),undefined);
    handlers.message({source:window.parent,data:{type:'runner-progress',score:63}});
    instance.distanceMeter.update(0,50000);assert.equal(instance.distanceMeter.drawnDistance*.025,63);
    instance.playing=false;handlers.message({source:window.parent,data:{type:'runner-progress',score:100}});
    assert.equal(instance.distanceMeter.drawnDistance*.025,100,'progress redraws while game is paused/crashed');instance.playing=true;
    assert.equal(instance.horizon.obstacles.length,3);assert.ok(instance.horizon.obstacles[0].xPos>=250);
    const birds=instance.horizon.obstacles.filter(item=>item.typeConfig.type==='PTERODACTYL');
    assert.ok(birds.length===1||birds.length===2);assert.equal(birds.length,Number(instance.canvas.dataset.birdCount));
    assert.equal(birds[0].yPos,50);assert.ok(birds.every(bird=>bird.currentFrame===0||bird.currentFrame===1));
    assert.ok(instance.horizon.obstacles[1].xPos>instance.horizon.obstacles[0].xPos+175);
    const firstBird=instance.horizon.obstacles[0];firstBird.yPos=75;firstBird.xPos=140;
    const changes=instance.tRex.duckChanges;
    for(let frame=0;frame<90;frame++){instance.update();assert.equal(instance.tRex.ducking,true,'hold the duck pose instead of alternating every frame');}
    assert.equal(instance.tRex.duckChanges,changes+1,'duck animation is entered once, not restarted each frame');
    firstBird.xPos=-100;const nextX=instance.horizon.obstacles[1].xPos;instance.horizon.obstacles[1].xPos=500;
    for(let frame=0;frame<30;frame++){instance.update();assert.equal(instance.tRex.ducking,false);}
    assert.equal(instance.tRex.duckChanges,changes+2,'stand up exactly once when the bird clears');
    instance.horizon.obstacles[1].xPos=nextX;
    instance.horizon.obstacles[0].xPos=-100;instance.horizon.obstacles[1].xPos=120;instance.update();assert.equal(instance.tRex.jumps,1);
    handlers.message({source:window.parent,data:{type:'runner-key',key:' ',down:true}});
    instance.update();assert.equal(instance.tRex.jumps,1,'manual input disables demo assistance');
    instance.restart();assert.ok(instance.distanceRan>0,'native restart is seeded too');
    handlers.pagehide();assert.equal(instance.cleaned,true);assert.equal(instance.playing,false);
  }
  assert.ok(scores.size>10);assert.ok(positions.size>10);
});
test('loader warms small assets, deduplicates score messages and yields world construction',()=>{
  const source=read('../components/JourneyLoader.tsx'),room=read('./portfolio-room.ts');
  assert.match(source,/cache:"force-cache",priority:"low"/);
  assert.match(source,/score!==lastScore/);
  assert.match(source,/gameHasStarted.current/);
  assert.match(read('../components/PortfolioRoom.tsx'),/journeyGamePainted\(\).then/);
  assert.match(room,/await buildSideQuestWorldAsync/);
  assert.match(room,/worldFrameAllowed\(active,preparing,entranceHeld\|\|!!journeyStore.snapshot\(\),entranceSnapshot\)/);
  assert.match(read('./side-quest-world-model.ts'),/yield\* batchRoomGeometrySteps/);
});
test('loading score advances unevenly from 0 to 100 within a random 3–5 second run',()=>{
  for(let i=0;i<50;i++){
    const run=createLoadingRun();assert.ok(run.duration>=3000&&run.duration<=5000);
    assert.equal(loadingScore(0,run),0);assert.equal(loadingScore(run.duration-200,run),100);
    let previous=0;
    for(let time=0;time<=6000;time+=17){const score=loadingScore(time,run);assert.ok(score>=previous&&score<=100);previous=score;}
    assert.equal(loadingScore(6000,run),100);
  }
  assert.equal(createLoadingRun(()=>0).duration,3000);
  assert.equal(createLoadingRun(()=>.999999).duration,5000);
});
