/* ELITE — site interactions
   Libraries (loaded in index.html): Bootstrap 5, GSAP + ScrollTrigger, Lenis, Three.js

   1. Setup & smooth scroll     5. 3D model timeline      9. Navigation & menu
   2. Preloader + hero intro    6. Activities (sideways)  10. Enquiry form
   3. Scroll scenes             7. Detail view / lightbox 11. Boot
   4. Villa dive                8. Cursor label                                  */
(function () {
  'use strict';

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;

  // If the animation library failed to load, show the page as a plain document.
  if (!gsap || !ScrollTrigger) {
    document.body.classList.remove('is-loading');
    var pre = $('.preloader'); if (pre) pre.remove();
    $$('.dive-cap').forEach(function (c) { c.style.cssText = 'opacity:1;visibility:visible;position:relative;margin-bottom:60px'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isPhone = function () { return innerWidth < 768; };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  /* ───────── 1. Smooth scroll ───────── */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.25, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  function scrollTo(target) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.8 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* photos: hide the element if it fails so the gradient behind shows instead of a broken icon */
  function watchImage(img) {
    var check = function () { img.classList.toggle('is-missing', !img.naturalWidth); };
    img.addEventListener('error', function () { img.classList.add('is-missing'); });
    img.addEventListener('load', check);
    if (img.complete && img.getAttribute('src')) check();
  }

  /* ───────── 2. Preloader + hero intro ───────── */
  function intro() {
    var num = $('#preloader-num'), counter = { v: 0 };
    var lines = $$('.hero h1 > span > span');
    var fades = ['.eyebrow', '.hero-sub', '.hero-actions', '.hero-footer', '.site-nav'];
    var dur = reduced ? 0.2 : 0.85;
    gsap.set(lines, { yPercent: 115 });
    gsap.set(fades, { autoAlpha: 0 });
    gsap.set('.hero-media', { scale: 1.3 });

    gsap.timeline({
      onComplete: function () {
        document.body.classList.remove('is-loading');
        $('.preloader').remove();
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      }
    })
      .to(counter, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(counter.v); } })
      .to('.preloader-bar i', { scaleX: 1, duration: dur, ease: 'power2.inOut' }, 0)
      .to('.preloader > *:not(.preloader-bar)', { autoAlpha: 0, y: -20, duration: 0.35, stagger: 0.04 })
      .to('.preloader', { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '-=0.1')
      .to('.hero-media', { scale: 1, duration: 1.8, ease: 'expo.out' }, '-=0.6')
      .to(lines, { yPercent: 0, duration: 1.0, ease: 'expo.out', stagger: 0.1 }, '-=1.4')
      .to(fades, { autoAlpha: 1, duration: 0.8, stagger: 0.06 }, '-=0.9');
  }

  /* ───────── 3. Scroll scenes ───────── */
  function scenes() {
    gsap.to('.scroll-progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    // nav: glass after the hero, hides while scrolling down
    var nav = $('.site-nav');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 80);
        nav.classList.toggle('is-hidden', y > innerHeight * 0.6 && self.direction === 1);
      }
    });

    // hero: push into the photo/video while leaving
    var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-image, .hero-video', { scale: 1.15, yPercent: 6, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero-content', { yPercent: -28, autoAlpha: 0, ease: 'none', scrollTrigger: Object.assign({}, heroST, { end: '70% top' }) });
    gsap.to('.hero-footer', { autoAlpha: 0, ease: 'none', scrollTrigger: Object.assign({}, heroST, { end: '25% top' }) });

    // generic reveal
    $$('[data-reveal]').forEach(function (el) {
      gsap.from(el, { autoAlpha: 0, y: 34, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // about photo: curtain reveal + slow zoom-out
    gsap.fromTo('.about-image-clip', { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.about-image-wrap', start: 'top 80%' }
    });
    gsap.fromTo('.about-image-clip img', { scale: 1.35 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.about-image-wrap', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.image-stamp', { autoAlpha: 0, x: -20, duration: 1, delay: 0.9, scrollTrigger: { trigger: '.about-image-wrap', start: 'top 80%' } });

    // stat counters
    $$('[data-count]').forEach(function (el) {
      var o = { v: 0 };
      gsap.to(o, {
        v: +el.dataset.count, duration: 1.8, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });

    dive();
    model();

    orbit();

    day();

    // gallery drift + closing parallax
    var mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', function () {
      $$('.gallery-item').forEach(function (el) {
        var v = +el.dataset.speed;
        gsap.fromTo(el, { y: -v }, { y: v, ease: 'none', scrollTrigger: { trigger: '.gallery-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
    gsap.fromTo('.closing-media', { yPercent: -7, scale: 1.12 }, {
      yPercent: 7, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.closing-cta', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    ScrollTrigger.sort();
  }

  /* ───────── 4. Villa dive: scroll to zoom through the rooms ───────── */
  function dive() {
    var layers = $$('.dive-layer'), caps = $$('.dive .dive-cap');
    var railItems = $$('.dive-rail span'), railFill = $('.dive-rail-line b');
    var n = layers.length, STEP = 1.6, total = 1.3 + (n - 1) * STEP + 0.7;

    gsap.set(layers.slice(1), { autoAlpha: 0 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.dive', start: 'top top',
        end: function () { return '+=' + innerHeight * (n + 1.4); },
        pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var t = self.progress * total;
          var idx = Math.max(0, Math.min(n - 1, Math.floor((t - 1.3) / STEP + 0.55)));
          railItems.forEach(function (s, i) { s.classList.toggle('on', i === idx && t > 0.8); });
          var p = Math.max(0, Math.min(1, (t - 1) / (total - 1.7)));
          gsap.set(railFill, isPhone() ? { scaleX: p, scaleY: 1 } : { scaleY: p, scaleX: 1 });
        }
      }
    });

    // the window opens and we fly into the frame
    tl.to('.dive-word-a', { xPercent: -70, autoAlpha: 0, duration: 0.9 }, 0)
      .to('.dive-word-b', { xPercent: 70, autoAlpha: 0, duration: 0.9 }, 0)
      .to(['.dive-kicker', '.dive-hint'], { autoAlpha: 0, duration: 0.4 }, 0)
      .to('.dive-window', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
      .fromTo(layers[0], { scale: 1.45 }, { scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
      .to('.dive-shade', { opacity: 1, duration: 0.5 }, 0.6)
      .to('.dive-rail', { autoAlpha: 1, duration: 0.3 }, 0.8)
      .fromTo(caps[0], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.8);

    // push through each room into the next
    for (var i = 1; i < n; i++) {
      var t = 1.3 + (i - 1) * STEP + 0.5;
      tl.to(caps[i - 1], { autoAlpha: 0, y: -40, duration: 0.3, ease: 'power2.in' }, t)
        .set(layers[i], { autoAlpha: 1 }, t)
        .to(layers[i - 1], { scale: 3.2, duration: 1, ease: 'power2.in' }, t)
        .to(layers[i - 1], { autoAlpha: 0, duration: 0.45, ease: 'power1.in' }, t + 0.55)
        .fromTo(layers[i], { scale: 1.3 }, { scale: 1, duration: 1.1, ease: 'power2.out', immediateRender: false }, t + 0.2)
        .fromTo(caps[i], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, t + 0.8);
    }
    tl.to({}, { duration: 0.7 });
  }

  /* ───────── 5. 3D model: orbit, explode the levels, then dusk ───────── */
  function model() {
    var root = $('.model'), caps = $$('.dive-cap', root);
    var villa = window.EliteVilla3D ? window.EliteVilla3D.init(root) : null;
    gsap.set(caps[0], { autoAlpha: 1 });
    if (!villa) { root.classList.add('no-webgl'); return; }

    var s = villa.state;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { villa.setActive(es[0].isIntersecting); }, { rootMargin: '150px' }).observe(root);
    } else villa.setActive(true);

    var show = { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' };
    var hide = { autoAlpha: 0, y: -40, duration: 0.3, ease: 'power2.in' };

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root, start: 'top top',
        end: function () { return '+=' + innerHeight * 3.8; },
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (villa && villa.setTimeOfDay) {
            var p = self.progress;
            var h;
            if (p < 0.22) {
              h = 6.5 + (p / 0.22) * (12.0 - 6.5);
            } else if (p < 0.68) {
              h = 12.0 + ((p - 0.22) / 0.46) * (18.25 - 12.0);
            } else {
              h = 18.25 + ((p - 0.68) / 0.32) * (22.5 - 18.25);
            }
            villa.setTimeOfDay(h, 0);
          }
        }
      }
    })
      .to(s, { theta: 0.45, duration: 1.05 }, 0)
      .to(s, { la: 1, duration: 0.3 }, 0.15)
      .to(s, { la: 0, duration: 0.25 }, 0.9)
      .to(caps[0], hide, 1)
      .to('.model-hint', { autoAlpha: 0, duration: 0.3 }, 1)
      // lift the levels apart
      .to(s, { explode: 1, elev: 0.5, radius: 56, targetY: 7.5, duration: 1, ease: 'power2.inOut' }, 1.05)
      .to(s, { theta: 1.3, duration: 1.75 }, 1.05)
      .fromTo(caps[1], { autoAlpha: 0, y: 50 }, show, 1.75)
      .to(s, { lb: 1, duration: 0.3 }, 1.85)
      .to(s, { lb: 0, duration: 0.25 }, 2.7)
      .to(caps[1], hide, 2.75)
      // settle back together as evening falls
      .to(s, { explode: 0, elev: 0.16, radius: 42, targetY: 3, duration: 1, ease: 'power2.inOut' }, 2.8)
      .to(s, { theta: 0.3, duration: 1.7, ease: 'power1.inOut' }, 2.8)
      .to(s, { dusk: 1, duration: 0.9, ease: 'power1.inOut' }, 2.95)
      .fromTo(caps[2], { autoAlpha: 0, y: 50 }, show, 3.6);
  }

  /* ───────── 6. Activities: page scroll moves the day sideways (desktop) ───────── */
  function day() {
    var track = $('.day-track'), fill = $('.day-progress i');
    gsap.matchMedia().add('(min-width: 992px)', function () {
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
      gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '.day', start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { gsap.set(fill, { scaleX: self.progress }); }
        }
      });
    });
  }

  /* ───────── 6b. Amenities: places on a slowly turning circle ───────── */
  function orbit() {
    var box = $('.orbit'); if (!box) return;
    var items = $$('.orbit-item', box), n = items.length, TAU = Math.PI * 2;
    var kicker = $('.orbit-kicker', box), title = $('.orbit-title', box), text = $('.orbit-text', box);
    var ang = -Math.PI / 2, spin = 0, vel = 0, R = 0, active = -1, hoverIndex = -1;
    var visible = false, drag = null, justDragged = false;
    var cruise = reduced ? 0 : 0.16;   // radians per second

    function measure() { R = (box.clientWidth - items[0].offsetWidth) / 2; }
    function setCenter(i) {
      var el = items[i];
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
      gsap.timeline()
        .to([kicker, title, text], { autoAlpha: 0, y: 8, duration: 0.2, overwrite: true })
        .add(function () { kicker.textContent = el.dataset.kicker; title.innerHTML = el.dataset.title; text.textContent = el.dataset.text; })
        .to([kicker, title, text], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
    }
    function place() {
      var best = 0, bestD = 9;
      items.forEach(function (el, i) {
        var a = ang + i * TAU / n;
        var d = Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2));   // distance from the top of the circle
        var k = Math.max(0, Math.cos(d));
        gsap.set(el, { x: Math.cos(a) * R, y: Math.sin(a) * R, scale: 1 + 0.26 * k * k * k, zIndex: k > 0.9 ? 2 : 1 });
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      });
      if (hoverIndex >= 0) best = hoverIndex;
      if (best !== active) { active = best; setCenter(best); }
    }
    gsap.ticker.add(function (time, dt) {
      if (!visible) return;
      var sec = Math.min(dt, 60) / 1000;
      if (!drag) {
        var target = hoverIndex >= 0 ? 0 : cruise;
        spin += (target - spin) * Math.min(1, sec * 3);
        ang += (spin + vel) * sec;
        vel *= Math.pow(0.04, sec);
      }
      place();
    });

    // drag (or swipe sideways) to spin the circle by hand
    var angleAt = function (e) { var r = box.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
    box.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.orbit-open')) return;
      drag = { a: angleAt(e), x: e.clientX, y: e.clientY, moved: false, t: performance.now(), id: e.pointerId };
      justDragged = false;
    });
    addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 8) return;
      drag.moved = true;
      var a = angleAt(e), d = Math.atan2(Math.sin(a - drag.a), Math.cos(a - drag.a)), now = performance.now();
      ang += d; vel = d / Math.max(0.008, (now - drag.t) / 1000); vel = Math.max(-6, Math.min(6, vel));
      drag.a = a; drag.t = now;
    });
    var end = function (e) { if (drag && e.pointerId === drag.id) { justDragged = drag.moved; drag = null; } };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    box.addEventListener('click', function (e) { if (justDragged) { e.stopPropagation(); e.preventDefault(); justDragged = false; } }, true);

    items.forEach(function (el, i) {
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hoverIndex = i; });
      el.addEventListener('pointerleave', function () { hoverIndex = -1; });
      el.addEventListener('focus', function () { hoverIndex = i; });
      el.addEventListener('blur', function () { hoverIndex = -1; });
    });
    $('.orbit-open', box).addEventListener('click', function () { if (active >= 0) items[active].click(); });

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(box);
    else visible = true;
    if (window.ResizeObserver) new ResizeObserver(measure).observe(box);
    measure(); place();
    gsap.from(box, { autoAlpha: 0, scale: 0.9, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: box, start: 'top 85%' } });
  }

  /* ───────── 7. Detail view: live zoom into the photos ─────────
     Wheel / pinch zooms anywhere on the photo, drag moves it, double-click zooms.
     Numbered points jump to a part of the photo. Zooming deep into a point that
     links to another place opens that place's own photo (and zooming back out
     returns), so the island leads into the villas, the restaurant, the suite…   */
  function detailView() {
    var data = window.ELITE_DETAILS || {};
    var root = $('.detail'), media = $('.detail-media'), stage = $('.detail-stage'), img = $('img', media);
    var spotsBox = $('.detail-spots'), cap = $('.detail-spotcap'), backBtn = $('.detail-back');
    var galleryEls = $$('.gallery-item[data-detail]');
    var textEls = ['.detail-kicker', '.detail-title', '.detail-text', '.detail-explore'];
    var origin = null, open = false, busy = false, lastFocus = null, gIndex = 0;
    var key = null, trail = [], spots = [], spotEls = [], cur = -1;
    var view = { x: 0, y: 0, z: 1 }, geo = { ox: 0, oy: 0, dw: 1, dh: 1 }, maxZ = 4, portalZ = 3;
    var pointers = new Map(), pinch = null, pan = null, moved = false, outPull = 0, lastTap = 0, coolUntil = 0;
    watchImage(img);

    /* ── content ── */
    function fill(k) {
      var d = data[k]; key = k;
      $('.detail-kicker').textContent = d.kicker;
      $('.detail-title').innerHTML = d.title;
      $('.detail-text').textContent = d.text;
      var f = d.features || [];
      spots = [];
      f.forEach(function (x, i) { if (x.length > 3) spots.push({ title: x[0], text: x[1], x: x[2], y: x[3], to: x[4] && data[x[4]] ? x[4] : null, row: i }); });
      root.classList.toggle('has-spots', spots.length > 0);
      root.classList.toggle('is-gallery', !!d.gallery);
      $('.detail-count').textContent = spots.length ? 'TAP A NOTE TO ZOOM IN' : pad(f.length) + ' NOTES';
      $('.detail-features').innerHTML = f.map(function (x, i) {
        var s = spots.findIndex(function (p) { return p.row === i; });
        var attrs = s >= 0 ? ' class="is-spot" role="button" tabindex="0" data-spot="' + s + '"' : '';
        return '<li' + attrs + '><i>' + pad(i + 1) + '</i><div><strong>' + x[0] + '</strong><span>' + x[1] + '</span></div></li>';
      }).join('');
      $('.detail-specs').innerHTML = (d.specs || []).map(function (x) {
        return '<div><strong>' + x[0] + '</strong><span>' + x[1] + '</span></div>';
      }).join('');
      img.classList.remove('is-missing');
      img.src = d.image; img.alt = d.alt || '';
      $('.detail-index').textContent = pad(gIndex + 1) + ' / ' + pad(galleryEls.length);
      var parent = trail.length ? data[trail[trail.length - 1].key] : null;
      root.classList.toggle('has-trail', !!parent);
      if (parent) $('b', backBtn).textContent = 'Back to ' + (parent.name || 'previous').toLowerCase();
    }
    var rectOf = function (el) { return (el.querySelector('img, .day-img') || el).getBoundingClientRect(); };
    function whenLoaded(fn) {
      if (img.complete && img.getAttribute('src')) return fn();
      var done = function () { img.removeEventListener('load', done); img.removeEventListener('error', done); fn(); };
      img.addEventListener('load', done); img.addEventListener('error', done);
    }

    /* ── geometry: the stage is the whole photo, so every part of it can be reached ── */
    function layout() {
      var W = innerWidth, H = innerHeight, iw = img.naturalWidth || 1600, ih = img.naturalHeight || 1200;
      var s = Math.max(W / iw, H / ih);
      geo.dw = iw * s; geo.dh = ih * s; geo.ox = (W - geo.dw) / 2; geo.oy = (H - geo.dh) / 2;
      gsap.set(stage, { left: geo.ox, top: geo.oy, right: 'auto', bottom: 'auto', width: geo.dw, height: geo.dh, transformOrigin: '0 0' });
      maxZ = Math.max(2.2, Math.min(6, 2.8 * iw / geo.dw));   // don't magnify past what the photo can take
      portalZ = Math.max(2, maxZ * 0.7);
    }
    var clampZ = function (z) { return Math.max(1, Math.min(maxZ, z)); };
    var clampX = function (x, z) { return Math.max(innerWidth - geo.dw * z - geo.ox, Math.min(-geo.ox, x)); };
    var clampY = function (y, z) { return Math.max(innerHeight - geo.dh * z - geo.oy, Math.min(-geo.oy, y)); };
    function focusPoint() {   // centre of the part of the screen not covered by the side panel
      var wide = innerWidth >= 992 && !root.classList.contains('is-gallery');
      return { x: (innerWidth - (wide ? $('.detail-panel').offsetWidth : 0)) / 2, y: innerHeight * (wide ? 0.46 : 0.4) };
    }
    function render() {
      gsap.set(stage, { x: view.x, y: view.y, scale: view.z });
      if (spotEls.length) gsap.set(spotEls, { scale: 1 / view.z });
      $('.zoom-level').textContent = Math.round(view.z * 100) + '%';
      root.classList.toggle('is-zoomed', view.z > 1.04);
    }
    function setView(x, y, z, dur, ease) {
      z = clampZ(z); x = clampX(x, z); y = clampY(y, z);
      gsap.killTweensOf(view);
      if (!dur) { view.x = x; view.y = y; view.z = z; render(); return; }
      gsap.to(view, { x: x, y: y, z: z, duration: dur, ease: ease || 'power3.out', onUpdate: render });
    }
    function zoomAt(px, py, z, dur) {   // keep the photo point under (px, py) fixed while the zoom changes
      z = clampZ(z);
      var u = (px - geo.ox - view.x) / view.z, v = (py - geo.oy - view.y) / view.z;
      setView(px - geo.ox - u * z, py - geo.oy - v * z, z, dur);
    }
    function userZoomed() {   // after wheel / pinch / buttons
      if (cur >= 0 && view.z < 1.15) clearSpot();
      var c = focusPoint();
      if (busy || view.z < portalZ) return;
      for (var i = 0; i < spots.length; i++) {   // zoomed deep into a linked point: step inside
        var p = spots[i]; if (!p.to) continue;
        var sx = geo.ox + view.x + p.x * geo.dw * view.z, sy = geo.oy + view.y + p.y * geo.dh * view.z;
        if (Math.abs(sx - c.x) < innerWidth * 0.26 && Math.abs(sy - c.y) < innerHeight * 0.3) { enter(i); return; }
      }
    }

    /* ── numbered points ── */
    function buildSpots() {
      spotsBox.innerHTML = spots.map(function (p, i) {
        return '<button type="button" class="spot' + (p.to ? ' is-door' : '') + '" data-spot="' + i + '" style="left:' + (p.x * 100) + '%;top:' + (p.y * 100) + '%" aria-label="Zoom in: ' + p.title + '">' + (i + 1) + '</button>';
      }).join('');
      spotEls = $$('.spot', spotsBox);
      gsap.fromTo(spotEls, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1 / view.z, duration: 0.7, ease: 'back.out(2)', stagger: 0.07 });
    }
    function go(i) {
      if (!open || busy || !spots.length) return;
      i = (i + spots.length) % spots.length;
      var p = spots[i], c = focusPoint(), z = Math.min(2.6, portalZ * 0.86);
      if (innerWidth < 992) root.scrollTo({ top: 0, behavior: 'smooth' });
      setView(c.x - geo.ox - p.x * geo.dw * z, c.y - geo.oy - p.y * geo.dh * z, z, cur < 0 ? 1.4 : 1.2, 'expo.inOut');
      var first = cur < 0; cur = i;
      root.classList.add('is-touring');
      root.classList.toggle('at-door', !!p.to);
      spotEls.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
      $$('.detail-features li').forEach(function (li) { li.classList.toggle('is-active', +li.dataset.spot === i); });
      gsap.timeline()
        .to(cap, { autoAlpha: 0, y: 12, duration: first ? 0 : 0.25, overwrite: true })
        .add(function () {
          $('.spotcap-index').textContent = pad(i + 1) + ' / ' + pad(spots.length);
          $('.spotcap-title').textContent = p.title;
          $('.spotcap-text').textContent = p.text;
        })
        .to(cap, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, first ? 0.6 : '>0.2');
    }
    function clearSpot() {
      if (cur < 0) return;
      cur = -1;
      root.classList.remove('is-touring', 'at-door');
      spotEls.forEach(function (el) { el.classList.remove('is-active'); });
      $$('.detail-features li').forEach(function (li) { li.classList.remove('is-active'); });
      gsap.to(cap, { autoAlpha: 0, y: 12, duration: 0.3, overwrite: true });
    }
    function reset(dur) { clearSpot(); setView(0, 0, 1, dur === undefined ? 1 : dur, 'expo.inOut'); }

    /* ── stepping inside a linked place, and back out ── */
    function swap(k, from, to) {   // fade the photo out, switch place, fade the new one in
      busy = true; clearSpot();
      pointers.clear(); pinch = pan = null;   // the gesture that brought us here is finished
      gsap.killTweensOf(view);
      gsap.timeline()
        .to(stage, { scale: view.z * from.scale, x: from.x, y: from.y, autoAlpha: 0, duration: 0.55, ease: 'power2.in' })
        .to(spotEls, { autoAlpha: 0, duration: 0.2 }, 0)
        .to(textEls, { autoAlpha: 0, duration: 0.2, overwrite: true }, 0)
        .add(function () {
          fill(k);
          whenLoaded(function () {
            layout(); spotsBox.innerHTML = ''; spotEls = [];
            var v = to();
            view.z = clampZ(v.z); view.x = clampX(v.x, view.z); view.y = clampY(v.y, view.z);
            render();
            gsap.fromTo(stage, { scale: view.z * v.start, autoAlpha: 0 }, {
              scale: view.z, autoAlpha: 1, duration: 0.9, ease: 'power3.out',
              onComplete: function () { busy = false; coolUntil = performance.now() + 500; buildSpots(); if (v.spot >= 0) go(v.spot); }
            });
            gsap.to(textEls, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.3 });
          });
        });
    }
    function enter(i) {
      var p = spots[i]; if (!p || !p.to || busy) return;
      var z2 = view.z * 1.7, c = { x: geo.ox + view.x + p.x * geo.dw * view.z, y: geo.oy + view.y + p.y * geo.dh * view.z };
      var u = p.x * geo.dw, v = p.y * geo.dh;
      trail.push({ key: key, spot: i });
      swap(p.to, { scale: 1.7, x: c.x - geo.ox - u * z2, y: c.y - geo.oy - v * z2 }, function () { return { x: 0, y: 0, z: 1, start: 1.25, spot: -1 }; });
    }
    function back() {
      if (!trail.length || busy) return;
      var t = trail.pop();
      swap(t.key, { scale: 0.75, x: view.x + geo.dw * view.z * 0.125, y: view.y + geo.dh * view.z * 0.125 }, function () {
        var p = spots[t.spot], c = focusPoint(), z = Math.min(2.6, portalZ * 0.86);   // land back on the point we left from
        return { x: c.x - geo.ox - p.x * geo.dw * z, y: c.y - geo.oy - p.y * geo.dh * z, z: z, start: 1.35, spot: t.spot };
      });
    }

    /* ── gestures: wheel, pinch, drag, double-tap ── */
    media.addEventListener('wheel', function (e) {
      if (!open) return;
      e.preventDefault();
      var now = performance.now();
      if (busy) { coolUntil = now + 250; return; }
      if (now < coolUntil) { coolUntil = Math.max(coolUntil, now + 160); return; }   // let scroll momentum die out after changing place
      var dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      if (dy > 0 && view.z <= 1.001) {   // already fully out: keep pulling to leave this place
        outPull += dy; if (outPull > 320 && trail.length) { outPull = 0; back(); } return;
      }
      outPull = 0;
      zoomAt(e.clientX, e.clientY, view.z * Math.exp(-dy * (e.ctrlKey ? 0.012 : 0.0022)), 0.25);
      userZoomed();
    }, { passive: false });

    var two = function () { var p = Array.from(pointers.values()); return { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }; };
    media.addEventListener('pointerdown', function (e) {
      if (!open || busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      gsap.killTweensOf(view);
      if (pointers.size === 1) { moved = false; pan = { sx: e.clientX, sy: e.clientY, x: view.x, y: view.y }; }
      else if (pointers.size === 2) {
        var t = two(); moved = true; pan = null;
        pinch = { d: t.d, z: view.z, raw: view.z, u: (t.x - geo.ox - view.x) / view.z, v: (t.y - geo.oy - view.y) / view.z };
      }
    });
    addEventListener('pointermove', function (e) {
      var p = pointers.get(e.pointerId); if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (pinch && pointers.size >= 2) {
        var t = two(); pinch.raw = pinch.z * t.d / pinch.d;
        var z = clampZ(pinch.raw);
        setView(t.x - geo.ox - pinch.u * z, t.y - geo.oy - pinch.v * z, z, 0);
        userZoomed();
      } else if (pan) {
        var dx = e.clientX - pan.sx, dy = e.clientY - pan.sy;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return;
        moved = true; media.classList.add('is-dragging');
        setView(pan.x + dx, pan.y + dy, view.z, 0);
      }
    });
    function release(e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      media.classList.remove('is-dragging');
      if (pinch && pointers.size < 2) {
        if (pinch.raw < 0.7 && trail.length && !busy) back();   // pinched right out: leave this place
        pinch = null;
        var rest = Array.from(pointers.values())[0];
        pan = rest ? { sx: rest.x, sy: rest.y, x: view.x, y: view.y } : null;
        return;
      }
      if (!pointers.size) {
        pan = null;
        if (!moved && e.pointerType !== 'mouse' && !e.target.closest('.spot')) {   // double-tap
          var now = performance.now();
          if (now - lastTap < 320 && !busy) { zoomAt(e.clientX, e.clientY, view.z > 1.6 ? 1 : Math.min(maxZ, 2.4), 0.7); userZoomed(); lastTap = 0; }
          else lastTap = now;
        }
      }
    }
    addEventListener('pointerup', release); addEventListener('pointercancel', release);
    media.addEventListener('dblclick', function (e) {
      if (!open || busy || e.target.closest('.spot')) return;
      zoomAt(e.clientX, e.clientY, view.z > 1.6 ? 1 : Math.min(maxZ, 2.4), 0.7); userZoomed();
    });

    spotsBox.addEventListener('click', function (e) {
      var b = e.target.closest('.spot'); if (!b || moved) return;
      var i = +b.dataset.spot;
      if (cur === i && spots[i].to) enter(i); else go(i);
    });
    $('.detail-features').addEventListener('click', function (e) { var li = e.target.closest('li.is-spot'); if (li) go(+li.dataset.spot); });
    $('.detail-features').addEventListener('keydown', function (e) {
      var li = e.target.closest('li.is-spot');
      if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(+li.dataset.spot); }
    });
    $('.detail-explore').addEventListener('click', function () { go(0); });
    $('.spot-prev').addEventListener('click', function () { go(cur - 1); });
    $('.spot-next').addEventListener('click', function () { go(cur + 1); });
    $('.spot-out').addEventListener('click', function () { reset(); });
    $('.spot-enter').addEventListener('click', function () { enter(cur); });
    backBtn.addEventListener('click', back);
    var centre = function (f) { var c = focusPoint(); zoomAt(c.x, c.y, view.z * f, 0.5); userZoomed(); };
    $('.zoom-plus').addEventListener('click', function () { centre(1.6); });
    $('.zoom-minus').addEventListener('click', function () { if (view.z <= 1.001 && trail.length) back(); else centre(1 / 1.6); });
    $('.zoom-reset').addEventListener('click', function () { reset(); });

    /* ── open / close ── */
    function show(el) {
      var k = el.dataset.detail;
      if (!data[k] || open) return;
      open = busy = true; origin = el; lastFocus = document.activeElement; cur = -1; trail = [];
      gIndex = Math.max(0, galleryEls.indexOf(el));
      root.classList.remove('is-touring', 'is-zoomed', 'at-door');
      spotsBox.innerHTML = ''; spotEls = [];
      gsap.killTweensOf([media, img, stage, view]);
      gsap.set(stage, { clearProps: 'all' });
      view.x = view.y = 0; view.z = 1;
      fill(k);
      var r = rectOf(el), narrow = innerWidth < 992, round = getComputedStyle(el.querySelector('.orbit-thumb') || el).borderRadius;
      if (lenis) lenis.stop();
      document.body.classList.add('is-locked');
      root.scrollTop = 0;
      root.setAttribute('aria-hidden', 'false');
      gsap.set(root, { visibility: 'visible', autoAlpha: 1 });
      gsap.set(media, { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: parseFloat(round) ? r.width / 2 : 0 });
      gsap.set(textEls, { autoAlpha: 0, y: 40 });
      gsap.set('.detail-panel', narrow ? { autoAlpha: 0, y: 60, x: 0 } : { autoAlpha: 0, x: 80, y: 0 });
      gsap.set('.detail-features li, .detail-specs > div', { autoAlpha: 0, y: 24 });
      gsap.set(['.detail-close', '.detail-nav', '.detail-hud', '.detail-hint', cap, backBtn], { autoAlpha: 0 });

      gsap.timeline()
        .to(media, { top: 0, left: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 1.1, ease: 'expo.inOut' })
        .to('.detail-shade', { opacity: 1, duration: 0.7 }, 0.5)
        .to(['.detail-close', '.detail-nav', '.detail-hud'], { autoAlpha: 1, duration: 0.5 }, 0.8)
        .to(textEls, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09 }, 0.75)
        .to('.detail-panel', { autoAlpha: 1, x: 0, y: 0, duration: 1, ease: 'expo.out' }, 0.8)
        .to('.detail-features li, .detail-specs > div', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 1)
        .add(function () {
          gsap.set(media, { width: '100%', height: '100%' });
          whenLoaded(function () {
            layout(); render(); buildSpots(); busy = false;
            gsap.fromTo('.detail-hint', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 });
            gsap.to('.detail-hint', { autoAlpha: 0, duration: 0.8, delay: 4.5 });
          });
          $('.detail-close').focus({ preventScroll: true });
        }, 1.15);
    }

    function hide(after) {
      if (!open || busy) return;
      busy = true; clearSpot();
      var deep = trail.length > 0;
      var finish = function () {
        gsap.set(root, { visibility: 'hidden' });
        root.setAttribute('aria-hidden', 'true');
        root.classList.remove('is-touring', 'is-zoomed', 'has-spots', 'has-trail', 'at-door');
        gsap.set(stage, { clearProps: 'all' }); spotsBox.innerHTML = ''; spotEls = [];
        document.body.classList.remove('is-locked');
        if (lenis) lenis.start();
        open = busy = false; spots = []; trail = []; pointers.clear(); pinch = pan = null;
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        if (after) after();
      };
      var ui = textEls.concat(['.detail-panel', '.detail-close', '.detail-nav', '.detail-hud', '.detail-hint', cap, backBtn]);
      if (deep) {   // we are inside another place: fade the whole view away
        gsap.timeline({ onComplete: finish })
          .to(root, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })
          .set('.detail-shade', { opacity: 0 }).set(ui, { autoAlpha: 0 });
        return;
      }
      setView(0, 0, 1, 0.45, 'power2.inOut');
      gsap.timeline({ onComplete: finish })
        .to(ui, { autoAlpha: 0, duration: 0.35, overwrite: true })
        .to(spotEls, { autoAlpha: 0, duration: 0.3 }, 0)
        .to('.detail-shade', { opacity: 0, duration: 0.5, overwrite: true }, 0)
        .to(root, { scrollTop: 0, duration: 0.3 }, 0)
        .add(function () {   // back to a plain cover image, then the photo flies home to where it came from
          gsap.killTweensOf(view); gsap.set(stage, { clearProps: 'all' }); spotsBox.innerHTML = ''; spotEls = [];
          var r = rectOf(origin), round = parseFloat(getComputedStyle(origin.querySelector('.orbit-thumb') || origin).borderRadius);
          gsap.to(media, { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: round ? r.width / 2 : 0, duration: 0.9, ease: 'expo.inOut' });
        }, 0.5)
        .to({}, { duration: 0.92 }, 0.5);
    }

    // gallery: previous / next
    function step(dir) {
      if (!open || busy || !root.classList.contains('is-gallery')) return;
      busy = true;
      gIndex = (gIndex + dir + galleryEls.length) % galleryEls.length;
      origin = galleryEls[gIndex];
      gsap.killTweensOf(view);
      gsap.timeline()
        .to(textEls, { autoAlpha: 0, y: -20, duration: 0.25, overwrite: true })
        .to(stage, { autoAlpha: 0, duration: 0.3 }, 0)
        .add(function () {
          fill(origin.dataset.detail);
          whenLoaded(function () {
            layout(); view.x = view.y = 0; view.z = 1; render();
            gsap.fromTo(stage, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out', onComplete: function () { busy = false; } });
            gsap.fromTo(textEls, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 });
          });
        });
    }

    $$('[data-detail]').forEach(function (el) {
      el.addEventListener('click', function () { show(el); });
      el.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && el.tagName !== 'BUTTON') { e.preventDefault(); show(el); }
      });
      var im = $('img', el); if (im) watchImage(im);
    });
    $('.detail-close').addEventListener('click', function () { hide(); });
    $('.detail-prev').addEventListener('click', function () { step(-1); });
    $('.detail-next').addEventListener('click', function () { step(1); });
    $('.detail-enquire').addEventListener('click', function () { hide(function () { scrollTo('#enquire'); }); });
    addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { if (trail.length) back(); else if (view.z > 1.04) reset(); else hide(); }
      if (e.key === '+' || e.key === '=') centre(1.6);
      if (e.key === '-' || e.key === '_') centre(1 / 1.6);
      if (e.key === '0') reset();
      if (e.key === 'ArrowRight') { if (cur >= 0) go(cur + 1); else step(1); }
      if (e.key === 'ArrowLeft') { if (cur >= 0) go(cur - 1); else step(-1); }
    });
    addEventListener('resize', function () {
      if (!open || busy) return;
      layout(); if (cur >= 0) go(cur); else setView(view.x, view.y, view.z, 0);
    });
  }

  /* ───────── 8. Cursor label (desktop) ───────── */
  function cursor() {
    if (!finePointer || reduced) return;
    var c = $('.cursor'), label = $('span', c);
    var x = gsap.quickTo(c, 'x', { duration: 0.5, ease: 'power3' });
    var y = gsap.quickTo(c, 'y', { duration: 0.5, ease: 'power3' });
    addEventListener('mousemove', function (e) { x(e.clientX); y(e.clientY); });
    // follow the pointer; show the label only while it is over something explorable
    var shown = null;
    function update(target) {
      var el = target && target.closest ? target.closest('[data-cursor]') : null;
      if (el === shown) return;
      shown = el;
      if (el) label.textContent = el.dataset.cursor;
      gsap.to(c, { scale: el ? 1 : 0, duration: el ? 0.5 : 0.35, ease: 'expo.out', overwrite: true });
    }
    addEventListener('mousemove', function (e) { update(e.target); });
    addEventListener('scroll', function () { update(null); }, { passive: true });
    addEventListener('click', function () { update(null); });
    document.documentElement.addEventListener('mouseleave', function () { update(null); });
  }

  /* ───────── 9. Navigation & menu ───────── */
  function navigation() {
    var menuEl = $('#siteMenu');
    var menu = window.bootstrap ? window.bootstrap.Offcanvas.getOrCreateInstance(menuEl) : null;
    menuEl.addEventListener('show.bs.offcanvas', function () {
      if (lenis) lenis.stop();
      gsap.fromTo('.site-menu-links a', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
    });
    menuEl.addEventListener('hidden.bs.offcanvas', function () { if (lenis) lenis.start(); });

    $$('[data-scroll]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var go = function () {
          if (el.dataset.interest) $('#f-interest').value = el.dataset.interest;
          scrollTo(el.dataset.scroll);
        };
        if (menu && menuEl.classList.contains('show')) {
          menuEl.addEventListener('hidden.bs.offcanvas', go, { once: true });
          menu.hide();
        } else go();
      });
    });
    $$('.media img').forEach(watchImage);
  }

  /* ───────── 10. Enquiry form: validation + confirmation ───────── */
  function enquiry() {
    var form = $('#enquiry-form'), done = $('.confirmation');
    var ci = form.elements.checkin, co = form.elements.checkout;
    var iso = function (d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
    var today = iso(new Date());
    ci.min = today; co.min = today;

    function checkDates() {
      co.setCustomValidity(ci.value && co.value && co.value <= ci.value ? 'Departure must be after arrival' : '');
    }
    ci.addEventListener('change', function () { co.min = ci.value || today; checkDates(); });
    co.addEventListener('change', checkDates);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      checkDates();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        var bad = $(':invalid', form); if (bad) bad.focus();
        return;
      }
      var v = Object.fromEntries(new FormData(form));
      // TODO: send `v` to your backend or form service here (e.g. fetch('/api/enquiry', { method: 'POST', body: JSON.stringify(v) })).
      var nights = Math.round((new Date(v.checkout) - new Date(v.checkin)) / 864e5);
      var from = new Date(v.checkin + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      $('#confirm-name').textContent = v.name.trim().split(/\s+/)[0];
      $('#confirm-summary').textContent = 'We have noted ' + nights + (nights === 1 ? ' night' : ' nights') + ' from ' + from + ' for ' + v.guests.toLowerCase() + ' (' + v.interest.toLowerCase() + '). A reply would go to ' + v.email + '.';
      form.hidden = true; done.hidden = false;
      gsap.from(done.children, { autoAlpha: 0, y: 20, stagger: 0.08, duration: 0.8, ease: 'power3.out' });
    });
    $('#confirm-reset').addEventListener('click', function () {
      form.reset(); form.classList.remove('was-validated'); co.min = today;
      done.hidden = true; form.hidden = false;
    });
  }

  /* ───────── 11. Boot ───────── */
  navigation();
  enquiry();
  scenes();
  detailView();
  cursor();
  intro();
  addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
