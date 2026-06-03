/* ═══════════════════════════════════════════════
   GSAP PARALLAX + 3D SCROLL — Deep Space Journey
   Branch: feat/gsap-parallax

   NOTE: All entrance animations use gsap.fromTo()
   with explicit to-state { opacity:1, ...zeros }.
   This is essential because .reveal elements have
   opacity:0 in CSS — gsap.from() would read that
   as the "to" target and never reach visible state.
═══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));

/* ─── Wrap bare .exp-card-img in .img-frame ───
   Creates a fixed-height overflow:hidden window
   so the taller image can travel up/down inside.  */
function wrapCardImages() {
  document.querySelectorAll('.exp-card-img').forEach(img => {
    if (img.closest('.meli-img-wrap') || img.closest('.img-frame')) return;
    const frame = document.createElement('div');
    frame.className = 'img-frame';
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);
  });
}

/* ─── fromTo shorthand: from = collapsed/rotated,
   to = fully visible at natural position ──────── */
function entrance(targets, fromVars, scrollVars) {
  return gsap.fromTo(
    targets,
    { opacity: 0, ...fromVars },
    {
      opacity: 1,
      rotateX: 0, rotateY: 0, rotateZ: 0,
      x: 0, y: 0, z: 0, scale: 1,
      clearProps: 'transform',   /* hand control back to CSS after finish */
      ease: 'power3.out',
      scrollTrigger: {
        toggleActions: 'play none none none',
        ...scrollVars,
      },
      ...fromVars.dur  && { duration: fromVars.dur  },
      ...fromVars.ease && { ease:     fromVars.ease },
      ...fromVars.stagger && { stagger: fromVars.stagger },
    }
  );
}

/* ─────────────────────────────────────────────────
   MAIN INIT
───────────────────────────────────────────────── */
function init() {

  wrapCardImages();

  /* ══════════════════════════════════════════════
     1.  HERO — Multi-layer depth parallax exit
         Each layer retreats to a different Z depth
         as the user scrolls away. Scrubbed = tied
         directly to scroll position, never "sticks".
  ══════════════════════════════════════════════ */

  gsap.set(['.hero-eyebrow', '.hero-name', '.hero-subtitle', '.hero-cta'], {
    transformPerspective: 1000,
  });

  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  heroTl
    .to('.hero-eyebrow',  { y: -90,  z: -120, opacity: 0, ease: 'none' }, 0)
    .to('.hero-name',     { y: -160, z: -260, scale: 1.04, opacity: 0, ease: 'none' }, 0)
    .to('.hero-subtitle', { y: -55,  z: -70,  opacity: 0, ease: 'none' }, 0.05)
    .to('.hero-cta',      { y: -30,  opacity: 0, ease: 'none' }, 0.1)
    .to('.scroll-hint',   { y: -20,  opacity: 0, ease: 'none' }, 0);

  /* Nebulae — three independent parallax depths */
  gsap.to('.nebula-1', {
    y: -290, x: -65, scale: 1.55, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom -80%', scrub: 2 },
  });
  gsap.to('.nebula-2', {
    y: -185, x: 75, scale: 1.32, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom -80%', scrub: 3.5 },
  });
  gsap.to('.nebula-3', {
    y: -115, scale: 1.2, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom -80%', scrub: 1.5 },
  });


  /* ══════════════════════════════════════════════
     2.  EXPERIENCE CARDS — rotateY barrel + image
         parallax expand

         Cards: perspective in the transform string
         (not on the parent) avoids overflow:hidden
         clipping on the sticky #experiencia section.

         Images: as each card approaches the center
         slot, the image zooms out (imgScale → 1.0).
         Side cards are zoomed-in + drifting, giving
         a "camera panning across scenes" feeling.
  ══════════════════════════════════════════════ */

  const expContainer = document.getElementById('experiencia-scroll-container');
  const expTrack     = document.getElementById('exp-track');
  const expCards     = document.querySelectorAll('.exp-card');

  if (expContainer && expTrack && expCards.length) {

    function updateCards() {
      const rect       = expContainer.getBoundingClientRect();
      const containerH = expContainer.offsetHeight;
      const vh         = window.innerHeight;
      const progress   = Math.max(0, Math.min(1, -rect.top / (containerH - vh)));
      const trackParent = expTrack.parentElement;
      const trackW     = expTrack.scrollWidth - trackParent.offsetWidth;
      const scrolledX  = progress * trackW;
      const viewW      = trackParent.offsetWidth;

      expCards.forEach(card => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const viewCenter = scrolledX + viewW / 2;
        const delta      = cardCenter - viewCenter;
        const ratio      = Math.max(-2, Math.min(2, delta / (viewW * 0.5)));

        /* ── 3D barrel rotation ── */
        if (!card.dataset.gsapHovered) {
          const rotY  = ratio * 20;
          const scale = 1 - Math.abs(ratio) * 0.05;
          const op    = Math.max(0.4, 1 - Math.abs(ratio) * 0.3);
          card.style.transform = `perspective(1000px) rotateY(${rotY}deg) scale(${scale})`;
          card.style.opacity   = op;
        }

        /* ── Image parallax expand ──
           Active (center) card: image at natural zoom.
           Off-center cards: image zoomed-in and drifts,
           like a lens focusing on the active scene.    */
        const imgEl = card.querySelector('.exp-card-img');
        if (imgEl) {
          const imgScale  = 1.0 + Math.abs(ratio) * 0.16;
          const imgDriftX = -ratio * 20;
          const imgDriftY = Math.abs(ratio) * 8;
          imgEl.style.transform =
            `scale(${imgScale}) translate(${imgDriftX}px, ${imgDriftY}px)`;
        }
      });
    }

    window.addEventListener('scroll', updateCards, { passive: true });
    updateCards();

    expCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.dataset.gsapHovered = '1';
        card.classList.add('is-tilting');
      });
      card.addEventListener('mouseleave', () => {
        delete card.dataset.gsapHovered;
        card.classList.remove('is-tilting');
        updateCards();
      });
    });
  }


  /* ══════════════════════════════════════════════
     3.  SECTION TITLES — rotateX flip-up
         "Unfolds" from below viewport into eye line.
         transformOrigin: bottom so it pivots at its
         base, like a sign tilting up toward the viewer.
  ══════════════════════════════════════════════ */

  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.set(el, { transformPerspective: 900, transformOrigin: '50% 100%' });
    gsap.fromTo(el,
      { opacity: 0, rotateX: -80, y: 55 },
      {
        opacity: 1, rotateX: 0, y: 0,
        duration: 1.0, ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  gsap.utils.toArray('.section-tag').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -45 },
      {
        opacity: 1, x: 0,
        duration: 0.7, ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
      }
    );
  });


  /* ══════════════════════════════════════════════
     4.  EXPERIENCE HEADER
  ══════════════════════════════════════════════ */

  const expHeader = document.querySelector('.exp-header');
  if (expHeader) {
    gsap.set(expHeader, { transformPerspective: 800 });
    gsap.fromTo(expHeader,
      { opacity: 0, rotateX: -35, y: 50 },
      {
        opacity: 1, rotateX: 0, y: 0,
        duration: 0.9, ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: expHeader, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ══════════════════════════════════════════════
     5.  SKILLS CHIPS — rotateX tile cascade
         Chips flip down from overhead like floor
         tiles dropping in. Grid-aware stagger fills
         each row left→right, top→bottom.
  ══════════════════════════════════════════════ */

  const chips = gsap.utils.toArray('.skill-chip');
  if (chips.length) {
    gsap.fromTo(chips,
      { opacity: 0, rotateX: 88, y: 45 },
      {
        opacity: 1, rotateX: 0, y: 0,
        duration: 0.55, ease: 'back.out(1.5)',
        stagger: { amount: 1.6, from: 'start', grid: 'auto' },
        clearProps: 'transform',
        scrollTrigger: {
          trigger: '.skills-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  const orbital = document.querySelector('.orbital-system');
  if (orbital) {
    gsap.set(orbital, { transformPerspective: 1100 });
    gsap.fromTo(orbital,
      { opacity: 0, rotateY: -38, z: -80 },
      {
        opacity: 1, rotateY: 0, z: 0,
        duration: 1.35, ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: orbital, start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ══════════════════════════════════════════════
     6.  ABOUT — Terminal "door open" + stat cards
  ══════════════════════════════════════════════ */

  const terminal = document.querySelector('.about-terminal');
  if (terminal) {
    gsap.set(terminal, { transformPerspective: 950 });
    gsap.fromTo(terminal,
      { opacity: 0, rotateY: -22, x: -75, z: -100 },
      {
        opacity: 1, rotateY: 0, x: 0, z: 0,
        duration: 1.2, ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: '#sobre-mi', start: 'top 74%', toggleActions: 'play none none none' },
      }
    );
  }

  const statBoxes = gsap.utils.toArray(
    '#sobre-mi .reveal-delay-2 > div[style*="background"]'
  );
  if (statBoxes.length) {
    gsap.set(statBoxes, { transformPerspective: 700 });
    gsap.fromTo(statBoxes,
      { opacity: 0, rotateY: 28, x: 60 },
      {
        opacity: 1, rotateY: 0, x: 0,
        duration: 0.7, ease: 'back.out(1.3)',
        stagger: 0.18,
        clearProps: 'transform',
        scrollTrigger: { trigger: '#sobre-mi', start: 'top 72%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ══════════════════════════════════════════════
     7.  CONTACT — rotateX flip-up links + form
  ══════════════════════════════════════════════ */

  const contactLinks = gsap.utils.toArray('.contact-link');
  if (contactLinks.length) {
    gsap.set(contactLinks, { transformPerspective: 700 });
    gsap.fromTo(contactLinks,
      { opacity: 0, rotateX: 55, y: 50 },
      {
        opacity: 1, rotateX: 0, y: 0,
        duration: 0.65, ease: 'back.out(1.6)',
        stagger: 0.13,
        clearProps: 'transform',
        scrollTrigger: { trigger: '#contacto', start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    gsap.set(contactForm, { transformPerspective: 900 });
    gsap.fromTo(contactForm,
      { opacity: 0, rotateY: 18, x: 65, z: -70 },
      {
        opacity: 1, rotateY: 0, x: 0, z: 0,
        duration: 1.1, ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: '#contacto', start: 'top 76%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ══════════════════════════════════════════════
     8.  FOOTER
  ══════════════════════════════════════════════ */

  const footer = document.querySelector('footer');
  if (footer) {
    gsap.set(footer, { transformPerspective: 800 });
    gsap.fromTo(footer,
      { opacity: 0, rotateX: -20, y: 30 },
      {
        opacity: 1, rotateX: 0, y: 0,
        duration: 0.8, ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: footer, start: 'top 95%', toggleActions: 'play none none none' },
      }
    );
  }


  /* ══════════════════════════════════════════════
     9.  WHATSAPP FAB — pop entrance after boot
  ══════════════════════════════════════════════ */

  gsap.fromTo('.whatsapp-fab',
    { opacity: 0, scale: 0, rotateZ: -180 },
    { opacity: 1, scale: 1, rotateZ: 0, duration: 0.65, ease: 'back.out(2.2)', delay: 5.2 }
  );

}
