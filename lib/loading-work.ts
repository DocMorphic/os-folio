/** Let the browser paint/input between scene-building batches; don't stall in hidden tabs. */
export function yieldLoadingWork():Promise<void>{
  return new Promise(resolve=>{
    let finished=false,frame=0;
    const done=()=>{if(finished)return;finished=true;clearTimeout(fallback);cancelAnimationFrame(frame);resolve();};
    const fallback=setTimeout(done,50);
    frame=requestAnimationFrame(()=>setTimeout(done,0));
  });
}
