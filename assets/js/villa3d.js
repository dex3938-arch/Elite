/* 3D villa model (Three.js). Procedural: no model files to load.
   window.EliteVilla3D.init(sectionEl) -> { state, setActive } or null if WebGL is unavailable.
   `state` is animated from main.js by the scroll timeline. */
(function () {
  'use strict';

  function init(root) {
    var THREE = window.THREE;
    var canvas = root.querySelector('canvas');
    if (!THREE || !canvas) return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0a09, 60, 120);
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);

    /* ── Lights ── */
    var hemi = new THREE.HemisphereLight(0xfff1e0, 0x20343a, 0.55);
    var sun = new THREE.DirectionalLight(0xffe2bd, 1.2);
    sun.position.set(-18, 28, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -26; sun.shadow.camera.right = 26;
    sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 100;
    sun.shadow.bias = -0.0006; sun.shadow.radius = 4;
    var rim = new THREE.DirectionalLight(0x7fb6c9, 0.35);
    rim.position.set(20, 10, -18);
    scene.add(hemi, sun, rim);

    /* ── Materials ── */
    var mat = function (color, o) {
      return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.9, metalness: 0 }, o || {}));
    };
    var M = {
      stone: mat(0xdcc7b3), wall: mat(0xe9ddd0), timber: mat(0x5c4030, { roughness: 0.75 }),
      sand: mat(0xc4a987), green: mat(0x5f7d4c), leaf: mat(0x3d6846), linen: mat(0xf1ebe2),
      sofa: mat(0xc86d51), rug: mat(0xb9a58f), gold: mat(0xd4af37, { roughness: 0.35, metalness: 0.8 }),
      sea: mat(0x123a43, { roughness: 0.55, metalness: 0.1 }),
      shallows: mat(0x3f9aa4, { roughness: 0.6, transparent: true, opacity: 0.32, depthWrite: false }),
      pool: mat(0x55b9c6, { roughness: 0.15, metalness: 0.1, emissive: 0x35c9dd, emissiveIntensity: 0.05 }),
      glass: mat(0xbfe0e4, { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.28, emissive: 0xffb060, emissiveIntensity: 0, depthWrite: false }),
      lantern: mat(0xffd9a0, { emissive: 0xffb45a, emissiveIntensity: 0 })
    };

    /* ── Helpers ── */
    var world = new THREE.Group();
    scene.add(world);
    function box(w, h, d, m, x, y, z, parent, noShadow) {
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      mesh.castShadow = !noShadow; mesh.receiveShadow = true;
      (parent || world).add(mesh);
      return mesh;
    }

    /* ── Site: sea, island, deck, pool, jetty ── */
    var sea = new THREE.Mesh(new THREE.CircleGeometry(160, 72), M.sea);
    sea.rotation.x = -Math.PI / 2; sea.position.y = -0.8; sea.receiveShadow = true;
    world.add(sea);
    var shallows = new THREE.Mesh(new THREE.CircleGeometry(25, 72), M.shallows);
    shallows.rotation.x = -Math.PI / 2; shallows.position.set(-1, -0.72, 0); shallows.scale.y = 0.8;
    world.add(shallows);
    var island = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 17.5, 1.1, 72), M.sand);
    island.position.set(-1, -0.55, 0); island.scale.z = 0.8; island.receiveShadow = true;
    world.add(island);

    box(18, 0.3, 11.5, M.timber, 0.6, 0.15, 0.8);                    // deck
    box(3.4, 0.34, 9, M.pool, 6.9, 0.17, 1.2, null, true);           // pool
    box(3.9, 0.12, 0.25, M.stone, 6.9, 0.34, -3.4);                  // pool rim
    box(3.9, 0.12, 0.25, M.stone, 6.9, 0.34, 5.8);
    box(0.25, 0.12, 9.4, M.stone, 5.05, 0.34, 1.2);
    box(1.8, 0.2, 14, M.timber, 6.9, -0.05, 13.4);                   // jetty
    for (var j = 0; j < 5; j++) {
      box(0.18, 1.2, 0.18, M.timber, 6.1, -0.5, 8 + j * 3);
      box(0.18, 1.2, 0.18, M.timber, 7.7, -0.5, 8 + j * 3);
      var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), M.lantern);
      lamp.position.set(j % 2 ? 6.1 : 7.7, 0.35, 8 + j * 3);
      world.add(lamp);
    }
    for (var l = 0; l < 3; l++) {                                    // loungers
      box(0.8, 0.22, 2, M.linen, 3.6, 0.42, -1.4 + l * 2.1);
      box(0.8, 0.5, 0.2, M.linen, 3.6, 0.6, -2.3 + l * 2.1);
    }

    /* ── Level 01: living & dining ── */
    var L1 = new THREE.Group(); L1.position.set(-3, 0.3, -0.4); world.add(L1);
    box(10, 0.25, 7.6, M.stone, 0, 0.125, 0, L1);
    box(10, 3, 0.3, M.wall, 0, 1.75, -3.65, L1);
    box(0.3, 3, 7.6, M.wall, -4.85, 1.75, 0, L1);
    box(0.3, 3, 3, M.wall, 4.85, 1.75, -2.3, L1);
    box(10, 3, 0.08, M.glass, 0, 1.75, 3.72, L1, true);
    box(0.08, 3, 4.6, M.glass, 4.92, 1.75, 1.5, L1, true);
    for (var m1 = 0; m1 < 5; m1++) box(0.07, 3, 0.14, M.gold, -5 + m1 * 2.5, 1.75, 3.74, L1);
    box(3.6, 0.04, 2.6, M.rug, -1.6, 0.27, 0.6, L1, true);
    box(3, 0.5, 1, M.sofa, -1.6, 0.5, 1.7, L1);
    box(1, 0.5, 2.2, M.sofa, -3.6, 0.5, 0.7, L1);
    box(1.3, 0.3, 0.8, M.timber, -1.5, 0.4, 0.3, L1);
    box(2.6, 0.1, 1.1, M.timber, 2.4, 0.95, 0.4, L1);
    box(0.12, 0.7, 0.12, M.timber, 1.3, 0.6, 0.4, L1); box(0.12, 0.7, 0.12, M.timber, 3.5, 0.6, 0.4, L1);
    for (var c = 0; c < 3; c++) {
      box(0.5, 0.5, 0.5, M.linen, 1.5 + c * 0.9, 0.5, 1.25, L1);
      box(0.5, 0.5, 0.5, M.linen, 1.5 + c * 0.9, 0.5, -0.45, L1);
    }
    box(3, 0.95, 0.8, M.wall, 2.6, 0.72, -2.9, L1);
    for (var s1 = 0; s1 < 8; s1++) box(1.1, 0.2, 0.42, M.timber, -4.1, 0.38 + s1 * 0.37, -3.1 + s1 * 0.44, L1);

    /* ── Level 02: master suite ── */
    var L2 = new THREE.Group(); var L2_Y = 3.55; L2.position.set(-2, L2_Y, -0.4); world.add(L2);
    box(12.4, 0.3, 7, M.stone, 0, 0.15, 0, L2);
    box(12.4, 2.8, 0.3, M.wall, 0, 1.7, -3.35, L2);
    box(0.3, 2.8, 7, M.wall, -6.05, 1.7, 0, L2);
    box(0.08, 2.8, 7, M.glass, 6.15, 1.7, 0, L2, true);
    box(8.2, 2.8, 0.08, M.glass, -2.1, 1.7, 3.42, L2, true);
    box(4.1, 1, 0.06, M.glass, 4.1, 0.8, 3.42, L2, true);
    box(0.2, 2.8, 4.4, M.wall, 2, 1.7, -1.1, L2);
    for (var m2 = 0; m2 < 4; m2++) box(0.07, 2.8, 0.14, M.gold, -6.1 + m2 * 2.73, 1.7, 3.44, L2);
    box(3.4, 0.04, 3.2, M.rug, -2.2, 0.32, -1.3, L2, true);
    box(2.3, 0.5, 2.5, M.linen, -2.2, 0.57, -1.6, L2);
    box(2.7, 1.2, 0.2, M.timber, -2.2, 0.9, -2.95, L2);
    box(0.8, 0.16, 0.5, M.wall, -2.75, 0.9, -2.5, L2); box(0.8, 0.16, 0.5, M.wall, -1.65, 0.9, -2.5, L2);
    box(0.6, 0.5, 0.6, M.timber, -0.6, 0.55, -2.7, L2); box(0.6, 0.5, 0.6, M.timber, -3.8, 0.55, -2.7, L2);
    box(1.9, 0.65, 0.95, M.wall, 4.1, 0.62, -2.2, L2);
    box(0.9, 0.5, 0.9, M.sofa, -4.9, 0.55, 2, L2);
    box(1.6, 0.22, 0.7, M.linen, 4.2, 0.42, 1.6, L2);

    /* ── Roof garden ── */
    var R = new THREE.Group(); var R_Y = 6.65; R.position.set(-2, R_Y, -0.4); world.add(R);
    box(14, 0.35, 8.6, M.stone, 0, 0.175, 0, R);
    box(14.1, 0.07, 8.7, M.gold, 0, 0.02, 0, R);
    box(5.4, 0.22, 4.4, M.green, -3, 0.46, 0.2, R);
    box(2.2, 0.26, 2.2, M.glass, 3.4, 0.48, -1.4, R, true);
    box(2.6, 0.2, 1.2, M.linen, 3.6, 0.45, 2, R);
    box(0.12, 1.9, 0.12, M.timber, 1.6, 1.3, 0.9, R); box(0.12, 1.9, 0.12, M.timber, 5.6, 1.3, 0.9, R);
    box(0.12, 1.9, 0.12, M.timber, 1.6, 1.3, 3.2, R); box(0.12, 1.9, 0.12, M.timber, 5.6, 1.3, 3.2, R);
    for (var p = 0; p < 6; p++) box(4.4, 0.08, 0.14, M.timber, 3.6, 2.28, 0.9 + p * 0.46, R);

    /* ── Palms ── */
    function palm(x, z, h, lean) {
      var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.z = lean;
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, h, 8), M.timber);
      trunk.position.y = h / 2; trunk.castShadow = true; g.add(trunk);
      for (var i = 0; i < 8; i++) {
        var f = new THREE.Group(); f.position.y = h; f.rotation.y = (i / 8) * Math.PI * 2;
        var leaf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 2.8), M.leaf);
        leaf.position.set(0, -0.35, 1.35); leaf.rotation.x = 0.35 + (i % 2) * 0.18; leaf.castShadow = true;
        f.add(leaf); g.add(f);
      }
      world.add(g);
    }
    palm(-10.5, 3.5, 7.5, 0.08); palm(-11.5, -2.5, 6.2, -0.06); palm(-7, -6.2, 8, 0.05);
    palm(2, -6.8, 6.5, -0.07); palm(10.5, -4, 7, 0.1); palm(-9, 6.4, 5.6, 0.12);

    /* ── Warm interior light, used at dusk ── */
    var glow1 = new THREE.PointLight(0xffb066, 0, 22, 2); glow1.position.set(0, 2.2, 1); L1.add(glow1);
    var glow2 = new THREE.PointLight(0xffb066, 0, 22, 2); glow2.position.set(0, 2, 0.5); L2.add(glow2);
    var poolGlow = new THREE.PointLight(0x4fd6e6, 0, 16, 2); poolGlow.position.set(6.9, 1, 1.2); world.add(poolGlow);

    /* ── Labels (HTML, projected from 3D points) ── */
    var anchors = {
      pool: { g: world, p: new THREE.Vector3(6.9, 0.5, 3.5) },
      jetty: { g: world, p: new THREE.Vector3(6.9, 0.4, 16) },
      deck: { g: world, p: new THREE.Vector3(-2, 0.4, 5.6) },
      roof: { g: R, p: new THREE.Vector3(-3, 0.7, 2) },
      l2: { g: L2, p: new THREE.Vector3(-2.2, 1.2, 3.4) },
      l1: { g: L1, p: new THREE.Vector3(-1.6, 1.2, 3.7) }
    };
    var labels = [].slice.call(root.querySelectorAll('.model-label')).map(function (el) {
      return { el: el, a: anchors[el.dataset.anchor], set: el.dataset.set };
    });

    /* ── State driven by scroll (see main.js) ── */
    var state = { theta: -0.9, elev: 0.36, radius: 44, targetY: 3, explode: 0, dusk: 0, la: 0, lb: 0 };
    var drag = { on: false, x: 0, offset: 0, vel: 0 };
    var W = 1, H = 1, active = false, tmp = new THREE.Vector3();
    var cDay = { sun: new THREE.Color(0xffe2bd), sea: new THREE.Color(0x123a43) };
    var cDusk = { sun: new THREE.Color(0xff8a4f), sea: new THREE.Color(0x07151a) };
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    function resize() {
      W = root.clientWidth || 1; H = root.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      // keep the model clear of the caption: right side on wide screens, upper half on tall ones
      if (W / H > 1.15) camera.setViewOffset(W, H, -W * 0.17, -H * 0.02, W, H);
      else camera.setViewOffset(W, H, 0, H * 0.17, W, H);
      camera.updateProjectionMatrix();
    }

    function frame(time) {
      if (!active) return;
      if (!drag.on) { drag.offset += drag.vel; drag.vel *= 0.92; }
      var s = state, d = s.dusk;
      var th = s.theta + drag.offset + Math.sin(time * 0.3) * 0.035;
      var r = s.radius * Math.max(1, 1.12 / camera.aspect);
      scene.fog.near = r * 1.25; scene.fog.far = r * 2.7;
      camera.position.set(Math.sin(th) * Math.cos(s.elev) * r, s.targetY + Math.sin(s.elev) * r, Math.cos(th) * Math.cos(s.elev) * r);
      camera.lookAt(0, s.targetY, 0);

      L2.position.y = L2_Y + s.explode * 3.6;
      R.position.y = R_Y + s.explode * 7.4;

      hemi.intensity = lerp(0.55, 0.16, d);
      sun.intensity = lerp(1.2, 0.3, d);
      sun.color.copy(cDay.sun).lerp(cDusk.sun, d);
      rim.intensity = lerp(0.35, 0.25, d);
      M.shallows.opacity = lerp(0.32, 0.1, d);
      M.sea.color.copy(cDay.sea).lerp(cDusk.sea, d);
      M.glass.emissiveIntensity = d * 1.1; M.glass.opacity = lerp(0.28, 0.6, d);
      M.pool.emissiveIntensity = lerp(0.05, 0.9, d);
      M.lantern.emissiveIntensity = d * 2.4;
      glow1.intensity = d * 2.2; glow2.intensity = d * 2; poolGlow.intensity = d * 1.6;

      renderer.render(scene, camera);

      for (var i = 0; i < labels.length; i++) {
        var L = labels[i];
        tmp.copy(L.a.p); L.a.g.localToWorld(tmp); tmp.project(camera);
        var o = (L.set === 'a' ? s.la : s.lb) * (tmp.z < 1 ? 1 : 0);
        L.el.style.opacity = o;
        if (o > 0.01) L.el.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * W).toFixed(1) + 'px,' + ((-tmp.y * 0.5 + 0.5) * H).toFixed(1) + 'px) translate(-3px,-50%)';
      }
    }

    /* ── Drag to rotate ── */
    canvas.addEventListener('pointerdown', function (e) {
      drag.on = true; drag.x = e.clientX; drag.vel = 0;
      canvas.classList.add('is-dragging');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag.on) return;
      var dx = (e.clientX - drag.x) / W; drag.x = e.clientX;
      drag.vel = -dx * 3.2; drag.offset += drag.vel;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      canvas.addEventListener(t, function () { drag.on = false; canvas.classList.remove('is-dragging'); });
    });

    if (window.ResizeObserver) new ResizeObserver(resize).observe(root);
    window.addEventListener('resize', resize);
    resize();
    if (window.gsap) window.gsap.ticker.add(frame);

    return {
      state: state,
      setActive: function (on) { active = on; },
      renderOnce: function () { var a = active; active = true; frame(0); active = a; }
    };
  }

  window.EliteVilla3D = { init: init };
})();
