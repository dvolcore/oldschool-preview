(function () {
  // mobile menu
  var mb = document.querySelector('.menu-btn'), mn = document.getElementById('mnav');
  if (mb && mn) mb.addEventListener('click', function () {
    var open = mn.hidden; mn.hidden = !open; mb.setAttribute('aria-expanded', String(open));
  });

  // reveal on scroll: content is visible at rest, the class only adds the motion
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('rise'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-rise]').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.top > innerHeight) io.observe(el);
    });
  }

  // service finder
  var finder = document.querySelector('[data-finder]');
  if (finder) {
    var card = finder.querySelector('.finder-card'), img = finder.querySelector('.finder-a img');
    var title = card.querySelector('[data-t]'), body = card.querySelector('[data-b]'), link = card.querySelector('[data-l]');
    finder.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        finder.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        title.textContent = b.dataset.title; body.textContent = b.dataset.body;
        link.href = b.dataset.href; link.querySelector('span').textContent = b.dataset.cta;
        img.src = b.dataset.img; img.alt = b.dataset.alt;
        card.classList.toggle('is-urgent', b.dataset.urgent === '1');
      });
    });
  }

  // gallery lightbox
  var lb = document.getElementById('lb');
  if (lb) {
    var li = lb.querySelector('img');
    document.querySelectorAll('.gal button').forEach(function (b) {
      b.addEventListener('click', function () { var i = b.querySelector('img'); li.src = i.src; li.alt = i.alt; lb.hidden = false; lb.querySelector('button').focus(); });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('button')) lb.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
  }

  // quote forms: no back end yet, so a valid submit goes to the thank-you page
  document.querySelectorAll('form[data-quote]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); if (f.reportValidity()) location.href = 'thank-you.html'; });
  });
})();

// ---- motion layer (GSAP + ScrollTrigger + Lenis); the page is complete without it ----
window.addEventListener('DOMContentLoaded', function () {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var g = window.gsap;
  if (window.ScrollTrigger) g.registerPlugin(ScrollTrigger);

  // smooth scroll on desktop pointers only; touch keeps native scrolling
  if (window.Lenis && matchMedia('(pointer: fine)').matches) {
    var lenis = new Lenis({ lerp: 0.11, anchors: true });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    g.ticker.add(function (t) { lenis.raf(t * 1000); });
    g.ticker.lagSmoothing(0);
  }

  // headline: each line rises out of its own mask
  var lines = document.querySelectorAll('.h-display .ln > span');
  if (lines.length) g.from(lines, { yPercent: 105, duration: 1, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
  g.from('.hero-copy .lead, .hero-ctas, .hero .chips, .hero-copy .eyebrow', { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.45 });
  g.from('.hero-art', { scale: 0.92, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 });
  g.from('.hero-art .badge, .hero-brush', { y: 14, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.15, delay: 0.9 });

  if (!window.ScrollTrigger) return;
  // hero depth: mascot drifts slower than the page, the background plate slower still
  g.to('.hero-art', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  g.to('.hero-plate', { yPercent: 18, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // giant type rows slide in opposite directions with the scroll
  document.querySelectorAll('[data-bt]').forEach(function (r) {
    var d = +r.dataset.bt;
    g.fromTo(r, { xPercent: d < 0 ? 4 : -22 }, { xPercent: d < 0 ? -22 : 4, ease: 'none',
      scrollTrigger: { trigger: '.bigtype', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // rating counts up once when it comes into view
  var big = document.querySelector('.rv-big b');
  if (big) {
    var end = parseFloat(big.textContent) || 20, dec = (big.textContent.split('.')[1] || '').length, o = { v: 0 };
    ScrollTrigger.create({ trigger: big, start: 'top 88%', once: true, onEnter: function () {
      g.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: function () { big.textContent = o.v.toFixed(dec); } });
    } });
  }

  // job photos ease up inside their frames
  g.utils.toArray('.reel img').forEach(function (im) {
    g.fromTo(im, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
});

// reviews: "read more" only where the text is clamped; drag to scroll on desktop
document.querySelectorAll('.rv').forEach(function (card) {
  var q = card.querySelector('blockquote');
  if (q && q.scrollHeight > q.clientHeight + 4) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-more'; b.textContent = 'Read more';
    b.addEventListener('click', function () { var o = card.classList.toggle('open'); b.textContent = o ? 'Show less' : 'Read more'; });
    card.appendChild(b);
  }
});
document.querySelectorAll('[data-rv]').forEach(function (t) {
  var down = false, x0 = 0, s0 = 0;
  t.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.target.closest('button,a')) return; down = true; x0 = e.clientX; s0 = t.scrollLeft; t.style.scrollSnapType = 'none'; });
  window.addEventListener('pointermove', function (e) { if (down) t.scrollLeft = s0 - (e.clientX - x0); });
  window.addEventListener('pointerup', function () { if (down) { down = false; t.style.scrollSnapType = ''; } });
});
