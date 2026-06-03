/* ═══════════════════════════════════════════════
   IMMERSIVE SCROLL EXPERIENCE
   Branch: feat/gsap-immersive
   Inspired by: noomoagency.com · victorfuruya.com
                lukebaffait.fr

   Stack:
   ─ Lenis   → silky smooth scroll foundation
   ─ GSAP    → all animations
   ─ ScrollTrigger → scroll-driven control

   Key techniques:
   ─ Text mask reveals: overflow:hidden + translateY
   ─ Clip-path sweeps for section entrances
   ─ Image parallax expand (zoom out to natural)
   ─ Depth-of-field blur on exp card flanks
   ─ Hero photo parallax layer
   ─ Magnetic cursor on interactive elements
═══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────
   LENIS SMOOTH SCROLL
   Silky ~0.08 lerp feel; plugs into GSAP ticker
   so ScrollTrigger reads lerped scroll position.
────────────────────────────────────────────── */
const lenis = new Lenis({
  lerp: 0.08,
  smoothWheel: true,
  wheelMultiplier: 0.9,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ──────────────────────────────────────────────
   UTILITY: wrap every .exp-card-img that isn't
   already inside a clip container in .img-frame
────────────────────────────────────────────── */
function wrapCardImages() {
  document.querySelectorAll('.exp-card-img').forEach(img => {
    if (img.closest('.meli-img-wrap') || img.closest('.img-frame')) return;
    const frame = document.createElement('div');
    frame.className = 'img-frame';
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);
  });
}

/* ──────────────────────────────────────────────
   UTILITY: split a heading element into per-word
   mask lines so GSAP can slide each word up from
   behind its overflow:hidden wrapper.
   Preserves child <span> elements (colored dots).
────────────────────────────────────────────── */
function splitWords(el) {
  const nodes  = Array.from(el.childNodes);
  const words  = [];
  el.innerHTML = '';

  nodes.forEach(node => {
    if (node.nodeType === 3) {
      // Plain text — split on whitespace
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part.trim()) { if (part) el.appendChild(document.createTextNode(part)); return; }
        const line = document.createElement('span');
        line.className = 'reveal-line';
        const inner = document.createElement('span');
        inner.className = 'reveal-word';
        inner.textContent = part;
        line.appendChild(inner);
        el.appendChild(line);
        words.push(inner);
      });
    } else {
      // Element node (e.g. <span class="hero-dot">.</span>)
      const line = document.createElement('span');
      line.className = 'reveal-line';
      const inner = document.createElement('span');
      inner.className = 'reveal-word';
      inner.appendChild(node.cloneNode(true));
      line.appendChild(inner);
      el.appendChild(line);
      words.push(inner);
    }
  });

  return words;
}

/* ──────────────────────────────────────────────
   UTILITY: inject hero background photo
────────────────────────────────────────────── */
function addHeroPhoto() {
  const hero = document.getElementById('hero');
  if (!hero || hero.querySelector('.hero-photo-wrap')) return null;

  const wrap  = document.createElement('div');
  wrap.className = 'hero-photo-wrap';
  const img   = document.createElement('img');
  img.src     = './assests/images/ary1.jpg';
  img.className = 'hero-photo';
  img.alt     = '';
  img.setAttribute('aria-hidden', 'true');
  wrap.appendChild(img);
  hero.insertBefore(wrap, hero.firstChild);
  return { wrap, img };
}

/* ──────────────────────────────────────────────
   UTILITY: inject large ghost numbers into each
   exp-card for the editorial depth layer.
   Numbers start hidden; GSAP reveals them when
   the card reaches center position.
────────────────────────────────────────────── */
function injectCardBgNumbers(cards) {
  cards.forEach((card, i) => {
    if (card.querySelector('.exp-card-bg-num')) return;
    const num = document.createElement('div');
    num.className = 'exp-card-bg-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');
    card.appendChild(num);
    gsap.set(num, { opacity: 0, y: 30 });
  });
}

/* ──────────────────────────────────────────────
   UTILITY: inject scrolling marquee strip between
   the hero and the experiencia scroll container.
────────────────────────────────────────────── */
function addMarquee() {
  const target = document.getElementById('experiencia-scroll-container');
  if (!target || document.querySelector('.marquee-strip')) return;

  const text = 'Software Engineer  ·  Java  ·  Go  ·  Spring Boot  ·  Microservices  ·  Backend  ·  Buenos Aires  ·  ';
  const el   = document.createElement('div');
  el.className = 'marquee-strip';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="marquee-track"><span>${text.repeat(5)}</span><span>${text.repeat(5)}</span></div>`;
  target.parentNode.insertBefore(el, target);
}

/* ══════════════════════════════════════════════
   MAIN INIT
   Called 600 ms after DOMContentLoaded so the
   boot-screen CSS entrance animations complete
   before GSAP takes over scroll-exit control.
══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));

function init() {

  wrapCardImages();
  addMarquee();


  /* ════════════════════════════════════════════
     1.  HERO PHOTO — fade in + vertical parallax

     The photo sits behind the hero text; its
     yPercent drifts 25 % downward as the hero
     exits so it "stays behind" while text leaves.
  ════════════════════════════════════════════ */

  const heroPhoto = addHeroPhoto();
  if (heroPhoto) {
    // Fade in after boot screen clears
    gsap.fromTo(heroPhoto.wrap,
      { opacity: 0 },
      { opacity: 1, duration: 1.8, delay: 3.0, ease: 'power2.out' }
    );

    // Parallax: photo moves slower than scroll → depth feeling
    gsap.to(heroPhoto.img, {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }


  /* ════════════════════════════════════════════
     2.  HERO TEXT — word-by-word cascade reveal

     Each heading word sits inside overflow:hidden
     so it slides up from below its container edge.
     The glitch <span> is preserved unchanged.
  ════════════════════════════════════════════ */

  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    const nameWords = splitWords(heroName);
    gsap.set(nameWords, { y: '110%' });
    gsap.to(nameWords, {
      y: '0%',
      duration: 1.0,
      stagger: 0.12,
      delay: 3.1,
      ease: 'expo.out',
    });
  }

  const heroEyebrow = document.querySelector('.hero-eyebrow');
  if (heroEyebrow) {
    gsap.fromTo(heroEyebrow,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, delay: 2.9, ease: 'power3.out' }
    );
  }

  gsap.fromTo('.hero-subtitle',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, delay: 3.5, ease: 'power2.out' }
  );
  gsap.fromTo('.hero-cta',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, delay: 3.8, ease: 'power2.out' }
  );


  /* ════════════════════════════════════════════
     3.  HERO EXIT — multi-depth parallax + blur

     As the hero scrolls away, text layers retreat
     to different Z depths. The whole section gets
     a subtle blur at the end — like looking away.
  ════════════════════════════════════════════ */

  gsap.set(['.hero-eyebrow', '.hero-name', '.hero-subtitle', '.hero-cta'], {
    transformPerspective: 1100,
  });

  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });
  heroTl
    .to('.hero-eyebrow',   { y: -90,  z: -100, opacity: 0, ease: 'none' }, 0)
    .to('.hero-name',      { y: -160, z: -250, ease: 'none' }, 0)
    .to('.hero-subtitle',  { y: -60,  opacity: 0, ease: 'none' }, 0.05)
    .to('.hero-cta',       { y: -30,  opacity: 0, ease: 'none' }, 0.1)
    .to('.scroll-hint',    { opacity: 0, y: -20, ease: 'none' }, 0)
    .to('#hero',           { filter: 'blur(6px)', ease: 'none' }, 0.6);

  // Nebulae at three independent depths
  [
    { sel: '.nebula-1', y: -290, x: -65, scale: 1.55, scrub: 2   },
    { sel: '.nebula-2', y: -185, x:  75, scale: 1.32, scrub: 3.5 },
    { sel: '.nebula-3', y: -115, x:   0, scale: 1.20, scrub: 1.5 },
  ].forEach(({ sel, y, x, scale, scrub }) => {
    gsap.to(sel, {
      y, x, scale, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom -80%', scrub },
    });
  });


  /* ════════════════════════════════════════════
     4.  SECTION TITLES — word mask reveal

     Words slide from translateY(110%) behind an
     overflow:hidden parent to translateY(0%).
     Much more cinematic than a simple fade/slide.
  ════════════════════════════════════════════ */

  gsap.utils.toArray('.section-title').forEach(el => {
    const words = splitWords(el);
    gsap.set(words, { y: '110%' });
    gsap.to(words, {
      y: '0%',
      duration: 1.1,
      stagger: 0.09,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el.closest('.section-header') || el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.section-tag').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });


  /* ════════════════════════════════════════════
     5.  EXPERIENCE — Full-screen scene system

     Scroll progress → scene index mapping.
     Each scene transition fires a GSAP timeline:
       out: old scene lifts up + fades
       in:  new scene rises from below + content
            elements stagger in individually.
     Nav dots highlight the active scene.
     Progress fill bar tracks overall position.
  ════════════════════════════════════════════ */

  const expContainer = document.getElementById('experiencia-scroll-container');
  const expScenes    = gsap.utils.toArray('.exp-scene');
  const expNavDots   = gsap.utils.toArray('.exp-nav-dot');
  const expNavFill   = document.getElementById('exp-nav-fill');
  const expCounter   = document.getElementById('exp-counter');
  const expProgFill  = document.getElementById('exp-progress-fill');

  if (expContainer && expScenes.length) {

    let currentScene  = -1;
    let sceneEntering = false;

    // Pre-hide all scenes; first will be revealed on scroll entry
    gsap.set(expScenes, { opacity: 0, y: 60, pointerEvents: 'none' });

    function animateSceneElements(scene) {
      const meta    = scene.querySelector('.exp-scene-meta');
      const company = scene.querySelector('.exp-scene-company');
      const period  = scene.querySelector('.exp-scene-period');
      const desc    = scene.querySelector('.exp-scene-desc');
      const footer  = scene.querySelector('.exp-scene-footer');
      const imgWrap = scene.querySelector('.exp-scene-img-frame');
      const glyph   = scene.querySelector('.exp-scene-glyph');

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      if (meta)    tl.fromTo(meta,    { opacity: 0, x: -28 },                     { opacity: 1, x: 0, duration: 0.55 }, 0);
      if (company) tl.fromTo(company, { opacity: 0, y: 55, filter: 'blur(12px)' },{ opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85 }, 0.08);
      if (period)  tl.fromTo(period,  { opacity: 0, x: -18 },                     { opacity: 1, x: 0, duration: 0.5 }, 0.28);
      if (desc)    tl.fromTo(desc,    { opacity: 0, y: 22 },                       { opacity: 1, y: 0, duration: 0.6 }, 0.38);
      if (footer)  tl.fromTo(footer,  { opacity: 0 },                              { opacity: 1, duration: 0.5 }, 0.52);
      if (imgWrap) tl.fromTo(imgWrap, { opacity: 0, scale: 0.88, x: 40 },         { opacity: 1, scale: 1, x: 0, duration: 0.9 }, 0.12);
      if (glyph)   tl.fromTo(glyph,   { opacity: 0, scale: 0.7 },                 { opacity: 1, scale: 1, duration: 1.0 }, 0.1);
      return tl;
    }

    function goToScene(nextIdx) {
      if (nextIdx === currentScene) return;

      const isForward = nextIdx > currentScene;

      // Animate out the departing scene
      if (currentScene >= 0 && expScenes[currentScene]) {
        gsap.to(expScenes[currentScene], {
          opacity: 0,
          y: isForward ? -55 : 55,
          duration: 0.42,
          ease: 'expo.in',
          overwrite: true,
          onComplete() { gsap.set(this.targets()[0], { pointerEvents: 'none' }); }
        });
      }

      // Animate in the arriving scene
      const next = expScenes[nextIdx];
      gsap.set(next, { y: isForward ? 65 : -65, pointerEvents: 'auto' });
      gsap.to(next, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out', delay: 0.08, overwrite: true });
      animateSceneElements(next);

      // Nav dots
      expNavDots.forEach((d, i) => d.classList.toggle('active', i === nextIdx));

      // Counter
      if (expCounter) expCounter.textContent = String(nextIdx + 1).padStart(2, '0') + ' / 06';

      currentScene = nextIdx;
    }

    function updateExpScenes() {
      const rect       = expContainer.getBoundingClientRect();
      const containerH = expContainer.offsetHeight;
      const vh         = window.innerHeight;
      const progress   = Math.max(0, Math.min(1, -rect.top / (containerH - vh)));

      // Progress indicators
      if (expProgFill) expProgFill.style.width = (progress * 100) + '%';
      if (expNavFill)  expNavFill.style.height  = (progress * 100) + '%';

      // Scene switching: split 0–1 range into N equal bands
      const idx = Math.min(expScenes.length - 1, Math.floor(progress * expScenes.length));
      goToScene(idx);

      // Subtle parallax on the active image
      const activeScene = expScenes[currentScene];
      if (activeScene) {
        const img = activeScene.querySelector('.exp-scene-img');
        if (img) {
          const band = 1 / expScenes.length;
          const localP = (progress - idx * band) / band;
          img.style.transform = `translateY(${(localP - 0.5) * -12}%)`;
        }
      }
    }

    window.addEventListener('scroll', updateExpScenes, { passive: true });
    // Don't call immediately — wait until user scrolls in (goToScene handles first entry)
  }


  /* ════════════════════════════════════════════
     6.  SKILLS — radial bloom from center

     Chips scale from 0.2 + blur into natural size.
     from: 'center' makes the centre chips appear
     first, spreading outward like stars being born.
  ════════════════════════════════════════════ */

  const chips = gsap.utils.toArray('.skill-chip');
  if (chips.length) {
    gsap.fromTo(chips,
      { opacity: 0, scale: 0.2, filter: 'blur(8px)' },
      {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.65, ease: 'back.out(1.8)',
        stagger: { amount: 1.8, from: 'center', grid: 'auto' },
        scrollTrigger: {
          trigger: '.skills-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  const orbital = document.querySelector('.orbital-system');
  if (orbital) {
    gsap.fromTo(orbital,
      { opacity: 0, scale: 0.55, filter: 'blur(14px)' },
      {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.5, ease: 'expo.out',
        scrollTrigger: { trigger: orbital, start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ════════════════════════════════════════════
     7.  ABOUT — horizontal clip-path "curtain"

     Terminal: curtain sweeps RIGHT from left edge.
     Stat cards: stagger in from right with blur.
  ════════════════════════════════════════════ */

  const terminal = document.querySelector('.about-terminal');
  if (terminal) {
    gsap.fromTo(terminal,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0 0% 0 0)', opacity: 1,
        duration: 1.3, ease: 'expo.inOut',
        scrollTrigger: { trigger: '#sobre-mi', start: 'top 72%', toggleActions: 'play none none none' },
      }
    );
  }

  const statBoxes = gsap.utils.toArray(
    '#sobre-mi .reveal-delay-2 > div[style*="background"]'
  );
  if (statBoxes.length) {
    gsap.fromTo(statBoxes,
      { opacity: 0, x: 70, filter: 'blur(8px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: 0.8, ease: 'expo.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '#sobre-mi', start: 'top 72%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ════════════════════════════════════════════
     8.  CONTACT — links fly in + form sweeps up

     Links: stagger left from slight x offset.
     Form: clip-path inset(0 0 100% 0) → inset(0)
     so the form appears to "rise through the floor".
  ════════════════════════════════════════════ */

  const contactLinks = gsap.utils.toArray('.contact-link');
  if (contactLinks.length) {
    gsap.fromTo(contactLinks,
      { opacity: 0, x: -50, filter: 'blur(4px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: 0.8, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '#contacto', start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    gsap.fromTo(contactForm,
      { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
      {
        opacity: 1, clipPath: 'inset(0 0 0% 0)',
        duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: '#contacto', start: 'top 76%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ════════════════════════════════════════════
     9.  FOOTER
  ════════════════════════════════════════════ */

  const footer = document.querySelector('footer');
  if (footer) {
    gsap.fromTo(footer,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: footer, start: 'top 95%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ════════════════════════════════════════════
     10. WHATSAPP FAB — delayed pop
  ════════════════════════════════════════════ */

  gsap.fromTo('.whatsapp-fab',
    { opacity: 0, scale: 0, rotateZ: -180 },
    { opacity: 1, scale: 1, rotateZ: 0, duration: 0.65, ease: 'back.out(2.2)', delay: 5.2 }
  );


  /* ════════════════════════════════════════════
     11. MAGNETIC CURSOR on exp-cards + contact links

     On mousemove the element drifts ±12 px toward
     the cursor — tactile "pull" like victorfuruya.
     On mouseleave it snaps back with elastic easing.
  ════════════════════════════════════════════ */

  document.querySelectorAll('.contact-link, .btn-primary-futuristic, .btn-ghost-futuristic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.18;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.18;
      gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out', overwrite: true });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: true });
    });
  });

}
