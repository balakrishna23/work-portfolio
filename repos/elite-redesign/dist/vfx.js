(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('#hero-video');
  const frame = document.querySelector('#breakdown-frame');
  const section = document.querySelector('.craft-scroll');
  const slider = document.querySelector('#layer-scrubber');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  let motionPaused = document.body.classList.contains('motion-paused'), heroVisible=true;
  let lenis;
  if (window.Lenis && window.gsap && !reduced.matches) {
    lenis = new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,anchors:true});
    lenis.on('scroll', () => window.ScrollTrigger?.update());
    gsap.ticker.add(time => lenis?.raf(time*1000));
    gsap.ticker.lagSmoothing(0);
  }
  const descriptions = [
    ['Start with a grey-shaded model.','Build the light, material and atmosphere.'],
    ['The camera captures the set.','Set extension creates the world beyond it.'],
    ['Plate. CG. Sparks. Atmosphere.','Separate elements become one believable shot.']
  ];
  let progress=0, frameRequest=0, targetFrame=0, imageBusy=false;
  function paintLatest() {
    if(imageBusy || Number(frame.dataset.frame)===targetFrame)return;
    imageBusy=true;
    const requested=targetFrame, image=new Image();
    image.src=`assets/layers/${String(requested).padStart(3,'0')}.webp`;
    image.decode().then(()=>{
      frame.src=image.src;frame.dataset.frame=String(requested);
      document.querySelector('#frame-time').textContent=`FRAME ${String(requested+1).padStart(3,'0')}`;
      document.querySelector('#viewer-loading').classList.add('loaded');
      imageBusy=false;if(targetFrame!==requested)paintLatest();
    }).catch(()=>{imageBusy=false;document.querySelector('#viewer-loading').textContent='FRAME UNAVAILABLE — TRY THE COMPLETE FILM BELOW';});
  }
  function setProgress(value) {
    progress=Math.min(1,Math.max(0,value));
    targetFrame=Math.round(progress*164);paintLatest();
    slider.value=String(Math.round(progress*1000));
    const chapter=progress<.35?0:progress<.70?1:2;
    chapters.forEach((button,index)=>{button.classList.toggle('active',index===chapter);button.setAttribute('aria-pressed',String(index===chapter));});
    slider.setAttribute('aria-valuetext',`${['CGI and 3D','Set extension','FX and compositing'][chapter]}, ${Math.round(progress*100)} percent through breakdown`);
    document.querySelector('#chapter-description').replaceChildren(document.createTextNode(descriptions[chapter][0]),document.createElement('br'),document.createTextNode(descriptions[chapter][1]));
  }
  paintLatest();
  function measure(){const rect=section.getBoundingClientRect();return {top:scrollY+rect.top,distance:Math.max(1,section.offsetHeight-innerHeight)};}
  function syncScroll(){frameRequest=0;if(reduced.matches||motionPaused)return;const {top,distance}=measure();if(scrollY>=top-innerHeight*.3&&scrollY<=top+distance+innerHeight*.3)setProgress((scrollY-top)/distance);}
  function schedule(){if(!frameRequest)frameRequest=requestAnimationFrame(syncScroll);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);schedule();
  function goToProgress(p){
    if(reduced.matches||motionPaused){setProgress(p);return;}
    const {top,distance}=measure();const target=top+p*distance;
    if(lenis)lenis.scrollTo(target,{duration:.8});else scrollTo({top:target,behavior:'smooth'});
  }
  const chapterStarts=[.015,.385,.75];
  chapters.forEach((button,index)=>button.addEventListener('click',()=>goToProgress(chapterStarts[index])));
  slider.addEventListener('input',()=>{
    const value=Number(slider.value)/1000;setProgress(value);
    if(!reduced.matches&&!motionPaused){const {top,distance}=measure();if(lenis)lenis.scrollTo(top+value*distance,{immediate:true});else scrollTo({top:top+value*distance,behavior:'instant'});}
  });
  function applyMotion(){
    motionPaused=document.body.classList.contains('motion-paused');
    section.classList.toggle('manual-mode',reduced.matches||motionPaused);
    if(motionPaused||reduced.matches||document.hidden||!heroVisible)hero.pause();else hero.play().catch(()=>{});
    if(reduced.matches&&lenis){lenis.destroy();lenis=undefined;}
    schedule();
  }
  addEventListener('motionchange',applyMotion);reduced.addEventListener('change',applyMotion);document.addEventListener('visibilitychange',applyMotion);
  new IntersectionObserver(entries=>{for(const entry of entries){heroVisible=entry.isIntersecting;applyMotion();}},{threshold:.05}).observe(hero);
  applyMotion();
  const dialog=document.querySelector('.reel-dialog'),promo=document.querySelector('#promo-video');
  document.querySelectorAll('[data-reel]').forEach(button=>button.addEventListener('click',()=>{
    const portrait=matchMedia('(max-width:650px)').matches;
    const cut=button.dataset.reel;
    promo.src=`assets/promo-${cut==='15'?'15-':''}${portrait?'portrait':'landscape'}.mp4`;
    document.querySelector('#reel-title').textContent=`ELITE VFX / ${cut} SECOND STUDIO PROMO`;
    dialog.showModal();lenis?.stop();hero.pause();promo.play().catch(()=>{});
  }));
  document.querySelector('#close-reel').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{promo.pause();promo.removeAttribute('src');promo.load();lenis?.start();applyMotion();});
})();
