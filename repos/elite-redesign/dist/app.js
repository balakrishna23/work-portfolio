(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('.motion-toggle');
  let paused = reduced.matches;
  const applyMotion = () => {  document.body.classList.toggle('motion-paused', paused); motion.setAttribute('aria-pressed', String(paused)); motion.setAttribute('aria-label', paused ? 'Resume visual motion' : 'Pause visual motion'); motion.innerHTML = `${paused ? '▷' : 'Ⅱ'} <span>${paused ? 'RESUME MOTION' : 'PAUSE MOTION'}</span>`; window.dispatchEvent(new CustomEvent('motionchange',{detail:{paused}})); };
  applyMotion(); motion.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', event => { paused = event.matches; applyMotion(); });
  const header = document.querySelector('.header'), menu = document.querySelector('.menu-toggle');
  const closeMenu = () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); };
  menu.addEventListener('click', () => { const open = header.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
  document.querySelectorAll('header nav a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.querySelectorAll('.service-list details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll('.service-list details').forEach(other=>{if(other!==detail)other.open=false;});}));
  document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{document.querySelector('select[name="service"]').value=link.dataset.service;}));
  document.querySelector('#project-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);const text=`Hi Elite VFX!\n\nName: ${data.get('name').trim()}\nEmail: ${data.get('email').trim()}\nService: ${data.get('service')}\n\nProject brief:\n${data.get('brief').trim()}`;window.open(`https://wa.me/919949567831?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');});
  const progress=document.querySelector('.progress');let scheduled=false;const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?scrollY/max*100:0}%`;scheduled=false;};window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});updateProgress();
  if(window.gsap && window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{gsap.from('.hero-copy > *',{y:24,duration:1,stagger:.12,ease:'power2.out',clearProps:'all'});gsap.utils.toArray('.reveal').forEach(element=>{gsap.from(element,{y:25,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 92%',once:true},clearProps:'all'});});});}
})();
