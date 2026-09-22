import test from 'node:test';
import assert from 'node:assert/strict';
import {navigateImmersive,routeReady,isReturningToDesktop,journeyPresented,journeyStore,finishJourney,beginWorldVisit,journeyGameReady,journeyGamePainted} from './route-transition.ts';
test('loader holds entrance until both the route and presentation are ready',async()=>{
  let path,visible=false;navigateImmersive('/v2',p=>{path=p;});
  assert.equal(path,undefined,'route construction waits for the first game frame');assert.equal(journeyStore.snapshot().ready,false);
  let painted=false;const game=journeyGamePainted().then(()=>{painted=true;});
  await Promise.resolve();assert.equal(painted,false);journeyGameReady();await game;assert.equal(painted,true);
  assert.equal(path,'/v2');
  const presentation=journeyPresented().then(()=>{visible=true;});
  finishJourney();await Promise.resolve();assert.equal(visible,false,'cannot dismiss an unready route');
  routeReady('desktop');assert.equal(journeyStore.snapshot().ready,false);
  routeReady('world');await Promise.resolve();assert.equal(visible,false,'camera waits for the loader fade, not just loading');
  finishJourney();await presentation;assert.equal(visible,true);assert.equal(journeyStore.snapshot(),null);
});
test('direct visits and return trips share one loader without duplicate journeys',async()=>{
  beginWorldVisit();const first=journeyStore.snapshot();beginWorldVisit();assert.equal(journeyStore.snapshot(),first);
  routeReady('world');finishJourney();
  let path;navigateImmersive('/',p=>{path=p;});assert.equal(path,undefined);journeyGameReady();await journeyGamePainted();assert.equal(path,'/');assert.equal(isReturningToDesktop(),true);
  routeReady('desktop');finishJourney();assert.equal(isReturningToDesktop(),false);
});
