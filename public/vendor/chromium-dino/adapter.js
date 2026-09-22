/* Embedding adapter only. offline.js and its sprite sheets are unmodified Chromium. */
window.loadTimeData = {valueExists: () => false};
window.addEventListener('load', () => {
  const runner = new Runner('.interstitial-wrapper');
  // A separate game audio context would bypass the site's master mute.
  // Physics, sprites, score, collision and restart are all native Chromium.
  runner.loadSounds = () => {};
  runner.isDarkMode = false;
  let loadingScore=0;
  // Chromium's default highScore is the string '0'. This loader has no high
  // score table, so omit that separate readout entirely (also after a crash).
  runner.distanceMeter.drawHighScore=()=>{};
  runner.distanceMeter.config={...runner.distanceMeter.config,ACHIEVEMENT_DISTANCE:Infinity};
  const nativeMeterUpdate=runner.distanceMeter.update.bind(runner.distanceMeter);
  runner.distanceMeter.update=delta=>nativeMeterUpdate(delta,loadingScore/runner.distanceMeter.config.COEFFICIENT);
  let manual=false;
  const seedRun=()=>{
    const score=150+Math.floor(Math.random()*1300);
    // Native landing/reset uses xInitialPos, not just xPos. Keep both inset.
    runner.tRex.xInitialPos=runner.tRex.config.START_X_POS;
    runner.tRex.xPos=runner.tRex.xInitialPos;
    runner.distanceRan=score/runner.distanceMeter.config.COEFFICIENT;
    runner.runningTime=runner.config.CLEAR_TIME+1;
    runner.setSpeed(6.2+Math.random()*1.1);
    runner.horizon.reset();
    runner.horizon.obstacleHistory=[];
    const birdCount=1+Math.floor(Math.random()*2);
    const birdType=Obstacle.types.find(type=>type.type==='PTERODACTYL');
    let x=Math.max(250,runner.dimensions.WIDTH*(.48+Math.random()*.16));
    for(let i=0;i<3;i++){
      // Use Chromium's own type, size, flying-height and gap randomization.
      if(i===0||(i===2&&birdCount===2)){
        // Seed birds even at the loader's gentler speed; Chromium normally
        // withholds them until 8.5. Sprites, wing animation and physics stay native.
        const bird=new Obstacle(runner.canvasCtx,birdType,runner.horizon.spritePos.PTERODACTYL,runner.dimensions,runner.horizon.gapCoefficient,runner.currentSpeed);
        bird.yPos=i===0?50:75;
        bird.currentFrame=Math.floor(Math.random()*2);
        bird.timer=Math.random()*birdType.frameRate;
        runner.horizon.obstacles.push(bird);
      }else runner.horizon.addNewObstacle(runner.currentSpeed);
      const obstacle=runner.horizon.obstacles[i];
      obstacle.xPos=x;obstacle.followingObstacleCreated=i<2;
      x+=obstacle.width+Math.max(210,obstacle.gap)+Math.random()*90;
    }
    runner.distanceMeter.update(0,runner.distanceRan);
    runner.canvas.dataset.startScore=String(score);
    runner.canvas.dataset.birdCount=String(birdCount);
  };
  // Start mid-run instead of repeating Chromium's empty, zero-score intro.
  runner.stop();runner.activated=true;runner.startGame();
  seedRun();
  const nativeRestart=runner.restart.bind(runner);
  runner.restart=()=>{nativeRestart();if(!runner.crashed)seedRun();};
  const nativeUpdate=runner.update.bind(runner);
  runner.update=()=>{
    // A shader compile/route task can delay a frame. Don't integrate that whole
    // pause as one enormous physics step (which teleports obstacles and the rex).
    const now=getTimeStamp();
    if(runner.time)runner.time=Math.max(runner.time,now-50);
    // Demo jumps still use the real engine's physics and collision detection.
    // Any player input hands control over immediately.
    if(!manual&&runner.playing&&!runner.crashed){
      const obstacle=runner.horizon.obstacles.find(item=>item.xPos+item.width>runner.tRex.xPos);
      const gap=obstacle?obstacle.xPos-runner.tRex.xPos:Infinity;
      const midBird=obstacle?.typeConfig.type==='PTERODACTYL'&&obstacle.yPos===75;
      const shouldDuck=!!midBird&&gap<180&&!runner.tRex.jumping;
      // Chromium's setDuck(true) toggles OUT of DUCKING when called again.
      // Invoke only on an edge so the native two-frame duck animation can run.
      if(shouldDuck!==runner.tRex.ducking)runner.tRex.setDuck(shouldDuck);
      if(obstacle&&!midBird&&!(obstacle.typeConfig.type==='PTERODACTYL'&&obstacle.yPos===50)&&gap<runner.currentSpeed*19&&!runner.tRex.jumping)runner.tRex.startJump(runner.currentSpeed);
    }
    nativeUpdate();
  };
  const key = (code, down) => {
    manual=true;
    const event = {keyCode:code,type:down?'keydown':'keyup',preventDefault(){},target:runner.canvas};
    if(down)runner.onKeyDown(event);else runner.onKeyUp(event);
  };
  window.addEventListener('message', event => {
    if(event.source!==window.parent)return;
    if(event.data?.type==='runner-ready-request'){
      requestAnimationFrame(()=>window.parent.postMessage({type:'runner-ready'},'*'));return;
    }
    if(event.data?.type==='runner-progress'){
      if(Number.isFinite(event.data.score)){
        loadingScore=Math.max(loadingScore,Math.min(100,Math.floor(event.data.score)));
        runner.canvas.dataset.loadingScore=String(loadingScore);
        // Loading keeps progressing even if a player crashes or motion is paused.
        if(!runner.playing){runner.canvasCtx.clearRect(0,0,runner.dimensions.WIDTH,30);runner.distanceMeter.update(0);}
      }
      return;
    }
    if(event.data?.type!=='runner-key')return;
    const code={' ':32,ArrowUp:38,ArrowDown:40,Enter:13}[event.data.key];
    if(code)key(code,!!event.data.down);
  });
  // Keep Chromium keyboard input; translate taps to that same input.
  document.addEventListener('pointerdown', event => {event.preventDefault();key(32,true);});
  document.addEventListener('pointerup', () => key(32,false));
  document.addEventListener('pointercancel', () => key(32,false));
  document.addEventListener('keydown', event => {if(event.key==='Tab')event.preventDefault();else manual=true;},true);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)runner.play();
  // Signal a real painted game, not merely the iframe's document load event.
  requestAnimationFrame(()=>requestAnimationFrame(()=>window.parent.postMessage({type:'runner-ready'},'*')));
  window.addEventListener('pagehide', () => {runner.stop();runner.stopListening();});
});
