// Cutsway prototypes: the phone menu, the no-3D watchdog and small pointer touches (classic script, load after the markup).
// [data-magnet] elements lean toward the pointer; the footer carries a light that follows it.
(function () {
  // the phone menu: a full-screen sheet; Escape or a link closes it
  const burger = document.querySelector('.nav__burger'), menu = document.getElementById('menu');
  if (burger && menu) {
    const set = open => {
      burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open); menu.inert = !open;
      if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) menu.querySelector('a').focus();
    };
    menu.inert = true;
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); burger.focus(); } });
    matchMedia('(min-width: 821px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  // if the 3D world has not started a few seconds in (blocked CDN, no WebGL), show the poster instead of a black page
  if (document.getElementById('world')) setTimeout(() => { if (!document.documentElement.classList.contains('world-on')) document.documentElement.classList.add('no-webgl'); }, 9000);

  // the enquiry sheet: every "Book a call" opens it. It sends the details to SITE.formUrl (tools/enquiry-form.gs: an email
  // to Cutsway's Gmail under its own label, plus a row in a Google Sheet); without one it opens an email with them filled in.
  const SITE = window.CUTSWAY || {};
  const wa = SITE.whatsapp && `https://wa.me/${SITE.whatsapp}${SITE.whatsappText ? `?text=${encodeURIComponent(SITE.whatsappText)}` : ''}`;
  const NEEDS = ['Long-form editing', 'Shorts & reels', 'Podcast editing', 'Thumbnails', 'Posting & scheduling', 'Something else'];
  const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#arrow"/></svg>';
  const sheet = document.createElement('dialog');
  sheet.className = 'enq'; sheet.id = 'enquire'; sheet.setAttribute('aria-labelledby', 'enq-h');
  sheet.innerHTML = `
    <form class="enq__form" novalidate>
      <div class="enq__head"><h2 class="display" id="enq-h">book a call</h2><button class="enq__x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.2" fill="none"/></svg></button></div>
      <p class="enq__lede">Tell us about your channel. We'll get back to you within a day with a time for a twenty-minute call.</p>
      <div class="enq__grid">
        <label class="fld"><span>Name</span><input name="name" autocomplete="name" required maxlength="80"></label>
        <label class="fld"><span>Gmail or email</span><input name="email" type="email" autocomplete="email" required maxlength="120" placeholder="you@gmail.com"></label>
        <label class="fld"><span>WhatsApp <em>optional</em></span><input name="whatsapp" type="tel" autocomplete="tel" maxlength="40" placeholder="+91 98765 43210"></label>
        <label class="fld"><span>Your channel <em>optional</em></span><input name="channel" maxlength="200" autocomplete="url" placeholder="youtube.com/@yourchannel"></label>
      </div>
      <fieldset class="enq__needs" aria-describedby="enq-needs-hint"><legend>What are you here for? <em id="enq-needs-hint">pick at least one</em></legend>${NEEDS.map(n => `<label class="need"><input type="checkbox" name="needs" value="${n}"><span>${n}</span></label>`).join('')}</fieldset>
      <label class="fld"><span>Anything else <em>optional</em></span><textarea name="message" rows="3" maxlength="2000" placeholder="Upload schedule, how long your videos run, a video whose edit you like…"></textarea></label>
      <input class="enq__hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="enq__foot"><button class="pill pill--solid" type="submit">Send ${arrow}</button>
        <p class="enq__alt">${wa ? `Or <a href="${wa}" target="_blank" rel="noopener">WhatsApp us</a>` : ''}${wa && SITE.email ? ' · ' : ''}${SITE.email ? `<a href="mailto:${SITE.email}">email</a>` : ''}</p></div>
      <p class="enq__status" role="status" aria-live="polite"></p>
      <p class="enq__note">We only use your details to get back to you.</p>
    </form>
    <div class="enq__done" hidden tabindex="-1">
      <div class="enq__head"><h2 class="display">sent.</h2><button class="enq__x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.2" fill="none"/></svg></button></div>
      <p class="enq__lede" data-done-text></p>
      <div class="enq__foot">${SITE.bookingUrl ? `<a class="pill pill--solid" href="${SITE.bookingUrl}" target="_blank" rel="noopener">Pick a time now ${arrow}</a>` : ''}${wa ? `<a class="pill" href="${wa}" target="_blank" rel="noopener">WhatsApp us ${arrow}</a>` : ''}</div>
    </div>`;
  document.body.appendChild(sheet);
  const form = sheet.querySelector('form'), done = sheet.querySelector('.enq__done'), status = sheet.querySelector('.enq__status'), sendBtn = form.querySelector('[type=submit]');
  let lastFocus = null;
  const lock = on => { if (window.lenis) on ? window.lenis.stop() : window.lenis.start(); document.documentElement.style.overflow = on ? 'hidden' : ''; };
  const openSheet = () => {
    if (sheet.open) return;
    lastFocus = document.activeElement; form.hidden = false; done.hidden = true; status.textContent = '';
    sheet.showModal(); lock(true); form.querySelector('input').focus();
  };
  sheet.addEventListener('close', () => { lock(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('.enq__x')) sheet.close(); });   // the backdrop, or ×
  document.addEventListener('click', e => { const a = e.target.closest('[data-book]'); if (!a) return; e.preventDefault(); openSheet(); });
  form.addEventListener('input', e => {
    if (e.target.getAttribute('aria-invalid') === 'true') { e.target.removeAttribute('aria-invalid'); status.textContent = ''; }
    if (e.target.name === 'needs') { form.querySelector('.enq__needs').removeAttribute('data-invalid'); status.textContent = ''; }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form), f = k => String(d.get(k) || '').trim();
    const name = f('name'), email = f('email'), okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), needs = d.getAll('needs');
    const nameEl = form.elements.namedItem('name'), emailEl = form.elements.namedItem('email');   // (form.name is the form's own name)
    nameEl.setAttribute('aria-invalid', !name); emailEl.setAttribute('aria-invalid', !okEmail);
    const needsEl = form.querySelector('.enq__needs'); needsEl.toggleAttribute('data-invalid', !needs.length);
    if (!name || !okEmail) { status.textContent = !name ? 'Add your name so we know who to reply to.' : 'Add your Gmail or email so we can reply.'; (!name ? nameEl : emailEl).focus(); return; }
    if (!needs.length) { status.textContent = 'Pick what you’re here for, so we come back with the right person.'; needsEl.querySelector('input').focus(); return; }
    const data = { name, email, whatsapp: f('whatsapp'), channel: f('channel'), needs: needs.join(', '), message: f('message'), company: f('company'), page: `${document.title} (${location.pathname})` };
    const thanks = () => {
      form.hidden = true; done.hidden = false;
      done.querySelector('[data-done-text]').textContent = `Thanks, ${name.split(' ')[0]}. Your details are with us, and we'll be in touch within a day${data.whatsapp ? ' on WhatsApp or by email' : ' by email'}.`;
      done.focus(); form.reset();
    };
    if (!SITE.formUrl) {                                    // not connected yet: an email with everything filled in
      const lines = [['Name', name], ['Gmail / email', email], ['Here for', data.needs], ['WhatsApp', data.whatsapp], ['Channel', data.channel], ['Message', data.message]].filter(r => r[1]).map(r => `${r[0]}: ${r[1]}`);
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Cutsway enquiry: ${name} (${email}), here for ${data.needs}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
      return thanks();
    }
    sendBtn.disabled = true; status.textContent = 'Sending…';
    // the Apps Script web app answers from another origin; its reply is not needed, only that the request went through
    fetch(SITE.formUrl, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) })
      .then(() => { status.textContent = ''; thanks(); })
      .catch(() => { status.textContent = "That didn't send. Check your connection, or message us on WhatsApp or by email."; })
      .finally(() => { sendBtn.disabled = false; });
  });

  if (!matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-magnet]').forEach(el => {
    const pull = parseFloat(el.dataset.magnet) || 0.3;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * pull}px, ${y * pull}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const foot = document.querySelector('.foot');
  if (foot) {
    foot.addEventListener('pointermove', e => {
      const r = foot.getBoundingClientRect();
      foot.style.setProperty('--fx', `${((e.clientX - r.left) / r.width) * 100}%`);
      foot.style.setProperty('--fy', `${((e.clientY - r.top) / r.height) * 100}%`);
      foot.style.setProperty('--fire', 1);
    });
    foot.addEventListener('pointerleave', () => foot.style.setProperty('--fire', 0));
  }
})();
