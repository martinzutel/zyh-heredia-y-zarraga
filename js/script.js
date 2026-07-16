(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---------------- Header + scroll progress ---------------- */
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const progressBar = document.getElementById('progressBar');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------------- Lenis smooth scroll + GSAP ScrollTrigger ---------------- */
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* ---- text split: wraps chars/words in spans for staggered reveal ---- */
    const splitChars = (el) => {
      const text = el.textContent;
      el.textContent = '';
      const frag = document.createDocumentFragment();
      [...text].forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.display = 'inline-block';
        frag.appendChild(span);
      });
      el.appendChild(frag);
      return el.querySelectorAll('span');
    };

    /* ---------------- Hero entrance ---------------- */
    const heroTl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } });
    const titleChars = document.querySelectorAll('.hero-title-line[data-split]');
    titleChars.forEach((el) => {
      const spans = splitChars(el);
      gsap.set(spans, { yPercent: 110, opacity: 0 });
      heroTl.to(spans, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.045 }, 0.3);
    });

    gsap.set('.hero-tag, .hero-sub, .hero-legend li, .btn-line, .hero-media img', { opacity: 0 });
    gsap.set('.hero-tag', { y: -14 });
    gsap.set('.hero-sub', { y: 16 });
    gsap.set('.hero-legend li', { y: 16 });
    gsap.set('.btn-line', { y: 16 });
    gsap.set('.hero-media img', { scale: 1.18 });

    heroTl
      .to('.hero-tag', { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .to('.hero-legend li', { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.7)
      .to('.btn-line', { opacity: 1, y: 0, duration: 0.7 }, 0.95)
      .to('.hero-media img', { opacity: 1, scale: 1.08, duration: 1.6, ease: 'power2.out' }, 0.1);

    /* hero parallax on scroll */
    gsap.to('.hero-media img', {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------------- Scroll reveals ---------------- */
    const revealEls = gsap.utils.toArray('.reveal');
    revealEls.forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 28 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    /* stagger children of grids for a more choreographed feel */
    gsap.utils.toArray('.feature-grid, .specs-list, .units').forEach((grid) => {
      const items = grid.querySelectorAll(':scope > .feature, :scope > .spec, :scope > .unit-card');
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }),
      });
    });

    /* ---------------- Blueprint line-drawing ---------------- */
    const bpPath = document.querySelector('.bp-path');
    if (bpPath) {
      const len = bpPath.getTotalLength ? bpPath.getTotalLength() : 1200;
      gsap.set(bpPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(bpPath, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#proyecto', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
      });
    }

    /* ---------------- Magnetic buttons ---------------- */
    if (window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll('.btn-line, .nav-cta').forEach((btn) => {
        const moveX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        const moveY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          moveX((e.clientX - r.left - r.width / 2) * 0.28);
          moveY((e.clientY - r.top - r.height / 2) * 0.35);
        });
        btn.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
      });
    }
  } else {
    /* ---------------- Fallback: IntersectionObserver ---------------- */
    document.body.classList.add('no-gsap-fallback');
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    document.body.classList.add('cursor-ready');
    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.querySelectorAll('a, button, .gallery-item, .unit-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });
  }

  /* ---------------- Gallery drag-scroll ---------------- */
  const track = document.getElementById('galleryTrack');
  if (track) {
    let isDown = false, startX = 0, scrollStart = 0, moved = false;

    const start = (x) => { isDown = true; moved = false; startX = x; scrollStart = track.scrollLeft; track.classList.add('dragging'); };
    const move = (x) => {
      if (!isDown) return;
      const dx = x - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = scrollStart - dx;
    };
    const end = () => { isDown = false; track.classList.remove('dragging'); };

    track.addEventListener('pointerdown', (e) => { start(e.clientX); track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', (e) => move(e.clientX));
    track.addEventListener('pointerup', end);
    track.addEventListener('pointerleave', end);
    track.addEventListener('click', (e) => { if (moved) e.preventDefault(); });
  }
})();
