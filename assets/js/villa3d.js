/* ══════════════════════════════════════════════════════════════════════════
   ELITE — Luxury Real Estate Archipelago Showcase (Three.js)
   - Expansive multi-residence archipelago:
     * Grand Central Club & Dining Pavilion with 22m Main Infinity Pool
     * In-pool sunken conversation lounge with fire pit
     * Villa 01 & Villa 03: South & North Lagoon Overwater Suites with private plunge pools
     * Villa 02 & Villa 04: Two-Storey Sunset & Sunrise Ocean Residences with private pools
     * Villa 05 & Villa 06: Outer Atoll Panoramic Suites with private sundecks
     * Tropical Garden Island with freeform beach pool & lush palm groves
     * Wellness & Spa Garden Pavilion with hydrotherapy plunge pool
     * Beachfront cabanas with flowing white linen canopies
     * Extended overwater arrival pier & lantern walkway network
   - Automatic ambient cinematic drift + seamless manual orbit, drag, and zoom
   - Automatic Dawn -> Zenith -> Golden Hour -> Nocturne lighting driven by scroll & orbit
   - Architectural spatial cutaway & spec drawer
   - Cinematic Autopilot Tour
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var activeTimeSetter = null;
  var activeInstance = null;

  function init(root) {
    var THREE = window.THREE;
    var canvas = root.querySelector('canvas');
    if (!THREE || !canvas) return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return null; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x140d0e, 90, 260);
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 650);

    /* ── Procedural PBR Textures ── */
    function createWoodTexture() {
      var c = document.createElement('canvas'); c.width = 512; c.height = 512;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#654832'; ctx.fillRect(0, 0, 512, 512);
      var plankH = 32;
      for (var y = 0; y < 512; y += plankH) {
        var shade = (Math.random() - 0.5) * 26;
        ctx.fillStyle = 'rgba(' + (115 + shade) + ',' + (80 + shade * 0.7) + ',' + (55 + shade * 0.5) + ', 0.4)';
        ctx.fillRect(0, y, 512, plankH - 2);
        ctx.fillStyle = '#261810'; ctx.fillRect(0, y + plankH - 2, 512, 2);
      }
      ctx.strokeStyle = 'rgba(35, 20, 10, 0.14)';
      for (var i = 0; i < 160; i++) {
        var gx = Math.random() * 512;
        ctx.beginPath(); ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + Math.random() * 12, 170, gx - Math.random() * 12, 340, gx, 512);
        ctx.stroke();
      }
      var tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    }

    function createStoneTexture() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 256;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#dfd3c4'; ctx.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 350; i++) {
        var rad = 2 + Math.random() * 10;
        var v = 205 + Math.floor(Math.random() * 40);
        ctx.fillStyle = 'rgba(' + v + ',' + (v - 10) + ',' + (v - 22) + ', 0.35)';
        ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 256, rad, 0, Math.PI * 2); ctx.fill();
      }
      var tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      return tex;
    }

    function createPoolTileTexture() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 256;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#1e7f8c'; ctx.fillRect(0, 0, 256, 256);
      var sz = 16;
      for (var x = 0; x < 256; x += sz) {
        for (var y = 0; y < 256; y += sz) {
          if ((x + y) % (sz * 2) === 0) {
            ctx.fillStyle = 'rgba(65, 205, 225, 0.35)';
            ctx.fillRect(x + 1, y + 1, sz - 2, sz - 2);
          }
        }
      }
      ctx.strokeStyle = '#124c54'; ctx.lineWidth = 1;
      for (var i = 0; i <= 256; i += sz) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
      }
      var tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    }

    function createWaterNormalTexture() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 256;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(160, 160, 255, 0.45)';
      for (var i = 0; i < 40; i++) {
        var cx = Math.random() * 256, cy = Math.random() * 256, r = 8 + Math.random() * 45;
        ctx.lineWidth = 2 + Math.random() * 3;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      var tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    }

    var woodTex = createWoodTexture();
    var stoneTex = createStoneTexture();
    var poolTileTex = createPoolTileTexture();
    var waterNormTex = createWaterNormalTexture();

    /* ── Lights ── */
    var hemi = new THREE.HemisphereLight(0xffa86b, 0x0a1c24, 0.65);
    var sun = new THREE.DirectionalLight(0xff7e33, 1.45);
    sun.position.set(-35, 38, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -65; sun.shadow.camera.right = 65;
    sun.shadow.camera.top = 65; sun.shadow.camera.bottom = -65;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 240;
    sun.shadow.bias = -0.0004; sun.shadow.radius = 3;

    var rim = new THREE.DirectionalLight(0x7ac4d6, 0.4);
    rim.position.set(35, 18, -35);
    scene.add(hemi, sun, rim);

    /* ── PBR Materials ── */
    var M = {
      stone: new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xdfd2c4, roughness: 0.8, metalness: 0.05 }),
      wall: new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xede5dc, roughness: 0.88, metalness: 0 }),
      timber: new THREE.MeshStandardMaterial({ map: woodTex, color: 0x6e4e39, roughness: 0.6, metalness: 0.08 }),
      darkTimber: new THREE.MeshStandardMaterial({ color: 0x342419, roughness: 0.75, metalness: 0.1 }),
      sand: new THREE.MeshStandardMaterial({ color: 0xd6c2a8, roughness: 0.95, metalness: 0 }),
      green: new THREE.MeshStandardMaterial({ color: 0x3d5c32, roughness: 0.82, metalness: 0 }),
      leaf: new THREE.MeshStandardMaterial({ color: 0x2e5234, roughness: 0.65, metalness: 0.05, side: THREE.DoubleSide }),
      linen: new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.85, metalness: 0 }),
      sofa: new THREE.MeshStandardMaterial({ color: 0xc86f52, roughness: 0.8, metalness: 0.05 }),
      cushion: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.7, metalness: 0.2 }),
      rug: new THREE.MeshStandardMaterial({ color: 0xc4b29e, roughness: 0.95, metalness: 0 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xd8b548, roughness: 0.28, metalness: 0.85 }),
      sea: new THREE.MeshStandardMaterial({ color: 0x59443a, roughness: 0.16, metalness: 0.2, normalMap: waterNormTex }),
      shallows: new THREE.MeshStandardMaterial({ color: 0x3cbacb, roughness: 0.26, metalness: 0.12, transparent: true, opacity: 0.42, depthWrite: false, normalMap: waterNormTex }),
      pool: new THREE.MeshStandardMaterial({ color: 0x48cadb, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.76, depthWrite: false, normalMap: waterNormTex, emissive: 0x22c2d6, emissiveIntensity: 0.45 }),
      poolTiles: new THREE.MeshStandardMaterial({ map: poolTileTex, color: 0x1fa3b5, roughness: 0.4, metalness: 0.1 }),
      glass: new THREE.MeshStandardMaterial({ color: 0xcfe8ed, roughness: 0.04, metalness: 0.12, transparent: true, opacity: 0.32, depthWrite: false, emissive: 0xffb060, emissiveIntensity: 0.35 }),
      balustrade: new THREE.MeshStandardMaterial({ color: 0xe2f2f5, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
      lantern: new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffaf40, emissiveIntensity: 1.0 })
    };

    var FINISHES = {
      stone: {
        travertine: { color: 0xdfd2c4, roughness: 0.8, name: 'Roman Travertine' },
        basalt: { color: 0x2b2d30, roughness: 0.72, name: 'Charcoal Basalt' },
        thassos: { color: 0xf4f2ee, roughness: 0.58, name: 'Grecian Thassos' }
      },
      timber: {
        teak: { color: 0x6e4e39, roughness: 0.6, name: 'Smoked Teak' },
        driftwood: { color: 0x968a7c, roughness: 0.75, name: 'Bleached Driftwood' },
        wenge: { color: 0x261a14, roughness: 0.5, name: 'Wenge Noir' }
      },
      pool: {
        turquoise: { color: 0x48cadb, tiles: 0x1fa3b5, emissive: 0x22c2d6, name: 'Maldivian Cyan' },
        emerald: { color: 0x2ec492, tiles: 0x18805e, emissive: 0x1ab880, name: 'Emerald Lagoon' },
        sapphire: { color: 0x2462b8, tiles: 0x163f78, emissive: 0x1b52a3, name: 'Midnight Sapphire' }
      }
    };

    function tweenMaterialColor(material, hex, roughness) {
      var targetColor = new THREE.Color(hex);
      if (window.gsap) {
        window.gsap.killTweensOf(material.color);
        window.gsap.to(material.color, {
          r: targetColor.r, g: targetColor.g, b: targetColor.b,
          duration: 0.6, ease: 'power2.inOut'
        });
        if (typeof roughness === 'number') {
          window.gsap.killTweensOf(material, 'roughness');
          window.gsap.to(material, { roughness: roughness, duration: 0.6, ease: 'power2.inOut' });
        }
      } else {
        material.color.copy(targetColor);
        if (typeof roughness === 'number') material.roughness = roughness;
      }
    }

    function applyFinish(category, finishKey) {
      var group = FINISHES[category];
      var finish = group && group[finishKey];
      if (!finish) return false;

      if (category === 'stone') {
        tweenMaterialColor(M.stone, finish.color, finish.roughness);
        tweenMaterialColor(M.wall, finish.color, finish.roughness);
      } else if (category === 'timber') {
        tweenMaterialColor(M.timber, finish.color, finish.roughness);
      } else if (category === 'pool') {
        tweenMaterialColor(M.pool, finish.color);
        tweenMaterialColor(M.poolTiles, finish.tiles);
        var targetEmissive = new THREE.Color(finish.emissive);
        if (window.gsap) {
          window.gsap.killTweensOf(M.pool.emissive);
          window.gsap.to(M.pool.emissive, {
            r: targetEmissive.r, g: targetEmissive.g, b: targetEmissive.b,
            duration: 0.6, ease: 'power2.inOut'
          });
        } else {
          M.pool.emissive.copy(targetEmissive);
        }
      }
      return true;
    }

    var world = new THREE.Group();
    scene.add(world);

    // Separable groups for spatial cutaway
    var roofGroup = new THREE.Group();
    var upperFloorGroup = new THREE.Group();
    var interiorGroup = new THREE.Group();
    var baseGroup = new THREE.Group();
    world.add(roofGroup, upperFloorGroup, interiorGroup, baseGroup);

    function pavilionPart(group, position) {
      var part = new THREE.Group();
      part.position.copy(position);
      group.add(part);
      return part;
    }

    function box(w, h, d, m, x, y, z, parent, noShadow) {
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      mesh.castShadow = !noShadow; mesh.receiveShadow = true;
      (parent || world).add(mesh);
      return mesh;
    }

    /* ── 1. The Ocean Lagoon & Expansive Island Terrain ── */
    var sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 64, 64), M.sea);
    sea.rotation.x = -Math.PI / 2; sea.position.y = -0.85; sea.receiveShadow = true;
    world.add(sea);

    var shallows = new THREE.Mesh(new THREE.CircleGeometry(75, 64), M.shallows);
    shallows.rotation.x = -Math.PI / 2; shallows.position.set(-4, -0.76, 4); shallows.scale.set(1.25, 0.95, 1);
    world.add(shallows);

    // Main Island Sand Dune
    var island = new THREE.Mesh(new THREE.CylinderGeometry(36, 44, 1.4, 64), M.sand);
    island.position.set(-8, -0.65, 14); island.scale.set(1.15, 1, 0.9); island.receiveShadow = true;
    world.add(island);

    // Lush Island Garden Lawn Overlay
    var gardenTerrain = new THREE.Mesh(new THREE.CylinderGeometry(28, 35, 0.25, 64), M.green);
    gardenTerrain.position.set(-8, -0.48, 14); gardenTerrain.scale.set(1.1, 1, 0.85); gardenTerrain.receiveShadow = true;
    world.add(gardenTerrain);

    // Freeform Island Beach Lagoon Pool
    var gardenPoolBase = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8.2, 0.35, 32), M.poolTiles);
    gardenPoolBase.position.set(-15, -0.42, 18); gardenPoolBase.scale.set(1.2, 1, 0.8);
    var gardenPoolWater = new THREE.Mesh(new THREE.CylinderGeometry(7.3, 8.0, 0.32, 32), M.pool);
    gardenPoolWater.position.set(-15, -0.38, 18); gardenPoolWater.scale.set(1.2, 1, 0.8);
    baseGroup.add(gardenPoolBase, gardenPoolWater);

    /* ── 2. Interconnecting Overwater Boardwalk Network & Pier ── */
    function boardwalk(x1, z1, x2, z2, w) {
      var dx = x2 - x1, dz = z2 - z1;
      var len = Math.sqrt(dx * dx + dz * dz);
      var angle = Math.atan2(dx, dz);
      var b = box(w || 2.0, 0.22, len, M.timber, (x1 + x2) / 2, -0.04, (z1 + z2) / 2);
      b.rotation.y = angle;
      var steps = Math.max(2, Math.floor(len / 4.0));
      for (var i = 1; i < steps; i++) {
        var px = x1 + (dx / steps) * i, pz = z1 + (dz / steps) * i;
        box(0.28, 1.4, 0.28, M.darkTimber, px, -0.65, pz);
      }
      return b;
    }

    // Main spine & arrival
    boardwalk(2, 26, 0, 5, 2.6);        // Arrival Pier to Center
    boardwalk(0, 5, -15, -6, 2.2);      // Spine to Villa 01
    boardwalk(-15, -6, -17, -22, 2.0);  // Branch to Villa 05
    boardwalk(0, 5, 16, 2, 2.2);        // Spine to Villa 02
    boardwalk(16, 2, 25, -10, 2.0);     // Branch to Villa 04
    boardwalk(25, -10, 13, -24, 2.0);   // Branch to Villa 06
    boardwalk(0, 5, -8, 14, 2.4);       // Spine to Island Garden & Spa
    boardwalk(-8, 14, -25, 6, 2.0);     // Island to Villa 03

    // Grand Arrival Pier Head
    box(5.5, 0.25, 5.5, M.timber, 2, -0.04, 27);
    for (var pierLamp = 0; pierLamp < 6; pierLamp++) {
      var plX = 2 + (pierLamp % 2 ? 2.3 : -2.3);
      var plZ = 25 + Math.floor(pierLamp / 2) * 2.2;
      box(0.08, 0.95, 0.08, M.gold, plX, 0.45, plZ);
      var lBulb = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 12), M.lantern);
      lBulb.position.set(plX, 0.98, plZ); world.add(lBulb);
    }

    /* ── 3. Modular Overwater Villa Construction ── */
    var allGlowLights = [];

    function buildOverwaterVilla(cfg) {
      // cfg: { x, z, rotY, isTwoStorey, poolSide, w, d, name }
      var V = new THREE.Group();
      V.position.set(cfg.x, 0.2, cfg.z);
      if (cfg.rotY) V.rotation.y = cfg.rotY;
      world.add(V);

      var vBase = pavilionPart(baseGroup, V.position);
      vBase.rotation.y = V.rotation.y;
      var vInterior = pavilionPart(interiorGroup, V.position);
      vInterior.rotation.y = V.rotation.y;
      var vRoof = pavilionPart(roofGroup, V.position);
      vRoof.rotation.y = V.rotation.y;

      var w = cfg.w || 11.5, d = cfg.d || 9.5;
      // Stilt Pilings
      for (var sx = -w * 0.4; sx <= w * 0.4; sx += w * 0.4) {
        for (var sz = -d * 0.4; sz <= d * 0.4; sz += d * 0.4) {
          box(0.35, 1.8, 0.35, M.darkTimber, sx, -0.8, sz, vBase);
        }
      }
      // Timber Deck
      box(w, 0.28, d, M.timber, 0, 0.15, 0, V);

      // Private Plunge Pool with Glass Edge
      var pSide = cfg.poolSide === 'left' ? -1 : 1;
      var poolX = pSide * (w * 0.32);
      box(3.2, 0.34, 4.8, M.poolTiles, poolX, 0.16, 1.8, vBase, true);
      box(3.1, 0.36, 4.7, M.pool, poolX, 0.18, 1.8, vBase, true);
      box(0.08, 0.55, 4.7, M.glass, poolX + pSide * 1.6, 0.45, 1.8, vBase, true);

      // Ocean ladder into lagoon
      box(0.06, 1.1, 0.4, M.gold, poolX + pSide * 1.4, -0.38, 4.2, V, true);

      // Suite Pavilion Structure
      var pavX = -pSide * 1.8;
      box(7.4, 0.25, 6.4, M.stone, pavX, 0.25, -1.2, V);
      box(7.4, 2.9, 0.28, M.wall, pavX, 1.7, -4.3, V);
      box(0.28, 2.9, 6.4, M.wall, pavX - pSide * 3.6, 1.7, -1.2, V);
      box(7.1, 2.9, 0.08, M.glass, pavX, 1.7, 1.9, V, true);
      box(0.08, 2.9, 6.2, M.glass, pavX + pSide * 3.6, 1.7, -1.2, V, true);

      // Luxury Interior Furnishings
      box(2.2, 0.5, 2.4, M.linen, pavX, 0.55, -2.2, vInterior);
      box(2.5, 1.1, 0.18, M.timber, pavX, 0.85, -3.4, vInterior);
      box(2.2, 0.45, 0.9, M.sofa, pavX, 0.5, 0.2, vInterior);
      // Deck Loungers
      box(0.8, 0.22, 1.9, M.timber, poolX - pSide * 1.4, 0.42, -1.5, vInterior);
      box(0.75, 0.4, 0.2, M.linen, poolX - pSide * 1.4, 0.65, -2.2, vInterior);

      // Cantilevered Roof with Gold Fascia
      box(8.5, 0.22, 7.8, M.stone, pavX, 3.25, -1.2, vRoof);
      box(8.6, 0.06, 7.9, M.gold, pavX, 3.15, -1.2, vRoof);
      for (var l = 0; l < 4; l++) {
        box(4.2, 0.06, 0.12, M.timber, poolX, 2.95, -2.0 + l * 1.0, vRoof);
      }

      // Warm Amber Interior Light & Cyan Pool Light
      var gInt = new THREE.PointLight(0xffb066, 0.45, 24, 2);
      gInt.position.set(pavX, 2.2, -1.2); V.add(gInt);
      var gPool = new THREE.PointLight(0x38d9e0, 0.35, 14, 2);
      gPool.position.set(poolX, 1.0, 1.8); V.add(gPool);
      allGlowLights.push({ light: gInt, type: 'interior' }, { light: gPool, type: 'pool' });

      return { group: V, base: vBase, interior: vInterior, roof: vRoof, pool: gPool, intLight: gInt };
    }

    // Villa 01: South Lagoon Suite
    var V1Data = buildOverwaterVilla({ x: -15, z: -6, rotY: 0.12, poolSide: 'right', name: 'Villa 01' });
    var V1 = V1Data.group, V1Interior = V1Data.interior;

    // Villa 03: North Lagoon Suite
    var V3Data = buildOverwaterVilla({ x: -25, z: 6, rotY: 0.32, poolSide: 'left', name: 'Villa 03' });

    // Villa 04: Sunrise Ocean Villa
    var V4Data = buildOverwaterVilla({ x: 25, z: -10, rotY: -0.28, poolSide: 'left', name: 'Villa 04' });

    // Villa 05: Outer Atoll Sunset Villa
    var V5Data = buildOverwaterVilla({ x: -17, z: -22, rotY: -0.2, poolSide: 'right', name: 'Villa 05' });

    // Villa 06: Sunset Horizon Suite
    var V6Data = buildOverwaterVilla({ x: 13, z: -24, rotY: 0.18, poolSide: 'left', name: 'Villa 06' });

    /* ── 4. Villa 02: Two-Storey Sunset Residence (Master Penthouse) ── */
    var V2 = new THREE.Group(); V2.position.set(16, 0.2, 2); world.add(V2);
    var V2Base = pavilionPart(baseGroup, V2.position);
    var V2Interior = pavilionPart(interiorGroup, V2.position);
    for (var s2x = -4.5; s2x <= 4.5; s2x += 4.5) {
      for (var s2z = -4; s2z <= 4; s2z += 4) box(0.35, 1.8, 0.35, M.darkTimber, s2x, -0.8, s2z, V2Base);
    }
    // Level 1: Living & Plunge Pool
    box(12.5, 0.3, 10.5, M.timber, 0, 0.15, 0, V2);
    box(3.5, 0.36, 6.0, M.poolTiles, -4.2, 0.16, 1.8, V2Base, true);
    box(3.4, 0.38, 5.9, M.pool, -4.2, 0.18, 1.8, V2Base, true);
    box(0.08, 0.55, 5.9, M.glass, -5.9, 0.45, 1.8, V2Base, true);
    box(7.6, 2.9, 6.5, M.stone, 2.2, 1.6, -1.2, V2);
    box(7.4, 2.8, 0.08, M.glass, 2.2, 1.6, 2.0, V2, true);
    box(0.08, 2.8, 6.3, M.glass, -1.5, 1.6, -1.2, V2, true);
    box(2.2, 0.5, 2.4, M.linen, 2.2, 0.55, -2.0, V2Interior);

    // Level 2: Upper Master Penthouse & Terrace
    upperFloorGroup.position.set(V2.position.x + 2.2, V2.position.y + 3.1, V2.position.z - 1.2);
    var V2_L2 = new THREE.Group(); upperFloorGroup.add(V2_L2);
    var V2Roof = pavilionPart(roofGroup, upperFloorGroup.position);
    var V2L2Interior = pavilionPart(interiorGroup, upperFloorGroup.position);
    box(8.2, 0.25, 7.2, M.stone, 0, 0.12, 0, V2_L2);
    box(8.2, 2.7, 0.25, M.wall, 0, 1.5, -3.4, V2_L2);
    box(0.25, 2.7, 7.2, M.wall, 3.9, 1.5, 0, V2_L2);
    box(8.0, 2.7, 0.08, M.glass, 0, 1.5, 3.4, V2_L2, true);
    box(0.08, 2.7, 7.0, M.glass, -3.9, 1.5, 0, V2_L2, true);
    box(4.5, 1.0, 0.08, M.balustrade, 0, 0.7, 3.5, V2_L2, true);
    box(2.3, 0.5, 2.5, M.linen, 0.5, 0.5, -1.4, V2L2Interior);
    // Sculptural Soaking Tub on upper terrace
    var v2Tub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.68, 0.72, 20), M.linen);
    v2Tub.position.set(-2.4, 0.55, 1.8); v2Tub.scale.set(1.3, 1, 0.85); v2Tub.castShadow = true;
    V2L2Interior.add(v2Tub);
    // Roof Canopy
    box(9.2, 0.22, 8.2, M.stone, 0, 3.0, 0, V2Roof);
    box(9.3, 0.06, 8.3, M.gold, 0, 2.9, 0, V2Roof);

    var glowV2 = new THREE.PointLight(0xffb066, 0.45, 26, 2); glowV2.position.set(2, 2.4, -1.2); V2.add(glowV2);
    allGlowLights.push({ light: glowV2, type: 'interior' });

    /* ── 5. Grand Central Club, Dining Colonnade & 22m Main Infinity Pool ── */
    var Club = new THREE.Group(); Club.position.set(0, 0.3, 0); world.add(Club);
    var ClubBase = pavilionPart(baseGroup, Club.position);
    var ClubInterior = pavilionPart(interiorGroup, Club.position);
    var ClubRoof = pavilionPart(roofGroup, Club.position);

    // Main 22m Infinity Pool with Sunken Lounge & Glass Horizon
    box(20, 0.32, 14.5, M.timber, 0, 0.16, 0, Club);
    box(5.5, 0.36, 12.5, M.poolTiles, 6.8, 0.14, 0.8, ClubBase, true);
    box(5.4, 0.38, 12.4, M.pool, 6.8, 0.17, 0.8, ClubBase, true);
    box(0.08, 0.62, 12.4, M.glass, 9.5, 0.45, 0.8, ClubBase, true);

    // Sunken Fire Pit Lounge inside the main pool
    box(2.8, 0.34, 2.8, M.stone, 6.8, 0.18, 0.8, ClubInterior);
    box(2.6, 0.25, 2.6, M.timber, 6.8, 0.25, 0.8, ClubInterior);
    box(0.6, 0.18, 0.6, M.gold, 6.8, 0.38, 0.8, ClubInterior);

    // Grand Dining & Bar Architecture
    box(11.5, 0.26, 9.2, M.stone, -3.2, 0.26, -1.5, Club);
    box(11.5, 3.6, 0.3, M.wall, -3.2, 2.0, -6.0, Club);
    box(0.3, 3.6, 9.2, M.wall, -8.8, 2.0, -1.5, Club);
    box(11.2, 3.5, 0.08, M.glass, -3.2, 2.0, 3.0, Club, true);
    box(0.08, 3.5, 9.0, M.glass, 2.5, 2.0, -1.5, Club, true);
    // Gourmet Dining Colonnade
    box(5.2, 0.14, 1.6, M.timber, -3.2, 1.0, -1.5, ClubInterior);
    for (var cI = 0; cI < 5; cI++) {
      box(0.5, 0.5, 0.5, M.linen, -5.0 + cI * 0.95, 0.5, -0.6, ClubInterior);
      box(0.5, 0.5, 0.5, M.linen, -5.0 + cI * 0.95, 0.5, -2.4, ClubInterior);
    }
    box(4.5, 1.1, 0.9, M.stone, -3.2, 0.8, -4.8, ClubInterior);
    // Grand Cantilevered Roof
    box(13.8, 0.34, 11.4, M.stone, -3.2, 3.9, -1.5, ClubRoof);
    box(13.9, 0.08, 11.5, M.gold, -3.2, 3.75, -1.5, ClubRoof);
    // Loungers along the pool
    for (var mL = 0; mL < 5; mL++) {
      box(0.85, 0.22, 2.0, M.timber, 3.2, 0.42, -4.0 + mL * 2.0, ClubInterior);
      box(0.78, 0.45, 0.22, M.linen, 3.2, 0.72, -4.9 + mL * 2.0, ClubInterior);
    }

    var glowClub = new THREE.PointLight(0xffb066, 0.45, 30, 2); glowClub.position.set(-2, 2.5, 0); Club.add(glowClub);
    var poolMainGlow = new THREE.PointLight(0x38d9e0, 0.6, 24, 2); poolMainGlow.position.set(6.8, 1.2, 0.8); Club.add(poolMainGlow);
    allGlowLights.push({ light: glowClub, type: 'interior' }, { light: poolMainGlow, type: 'pool' });

    /* ── 6. Island Wellness Spa & Hydrotherapy Sanctuary ── */
    var Spa = new THREE.Group(); Spa.position.set(-8, 0.2, 14); world.add(Spa);
    var SpaBase = pavilionPart(baseGroup, Spa.position);
    var SpaInterior = pavilionPart(interiorGroup, Spa.position);
    var SpaRoof = pavilionPart(roofGroup, Spa.position);
    box(9.5, 0.25, 8.5, M.timber, 0, 0.15, 0, Spa);
    box(2.8, 0.3, 2.8, M.pool, -3.0, 0.25, 2.2, SpaBase, true);
    box(7.5, 2.6, 6.2, M.stone, 0.4, 1.5, -0.6, Spa);
    box(7.3, 2.5, 0.08, M.glass, 0.4, 1.5, 2.4, Spa, true);
    box(1.0, 0.65, 2.1, M.linen, -1.2, 0.6, -0.6, SpaInterior);
    box(1.0, 0.65, 2.1, M.linen, 1.8, 0.6, -0.6, SpaInterior);
    box(9.2, 0.2, 7.8, M.darkTimber, 0.4, 2.9, -0.6, SpaRoof);
    for (var sl = 0; sl < 7; sl++) box(0.12, 0.08, 7.6, M.timber, -3.0 + sl * 1.0, 3.05, -0.6, SpaRoof);

    var glowSpa = new THREE.PointLight(0xffb066, 0.35, 20, 2); glowSpa.position.set(0, 2.0, 0); Spa.add(glowSpa);
    allGlowLights.push({ light: glowSpa, type: 'interior' });

    /* ── 7. Beach Cabanas with Shaded White Linen Canopies ── */
    function buildCabana(x, z, rotY) {
      var cab = new THREE.Group(); cab.position.set(x, -0.2, z); if (rotY) cab.rotation.y = rotY;
      box(3.2, 0.22, 3.2, M.timber, 0, 0.1, 0, cab);
      // 4 timber corner posts
      for (var px = -1.4; px <= 1.4; px += 2.8) {
        for (var pz = -1.4; pz <= 1.4; pz += 2.8) box(0.14, 2.2, 0.14, M.darkTimber, px, 1.1, pz, cab);
      }
      // Linen canopy
      box(3.4, 0.08, 3.4, M.linen, 0, 2.2, 0, cab);
      // Double daybed
      box(2.2, 0.45, 2.2, M.linen, 0, 0.35, 0, cab);
      world.add(cab);
    }
    buildCabana(-18, 9, 0.4);
    buildCabana(-16, 24, -0.2);
    buildCabana(-2, 24, 0.1);
    buildCabana(8, 18, -0.5);

    /* ── 8. Tropical Coconut Palm Grove (26 swaying palms) ── */
    var palms = [];
    function palm(x, z, h, lean, rotY) {
      var g = new THREE.Group(); g.position.set(x, -0.2, z); g.rotation.z = lean; g.rotation.y = rotY || 0;
      var segs = 6;
      for (var s = 0; s < segs; s++) {
        var tPart = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, h / segs, 10), M.darkTimber);
        tPart.position.y = (s + 0.5) * (h / segs); tPart.castShadow = true;
        g.add(tPart);
      }
      for (var i = 0; i < 9; i++) {
        var f = new THREE.Group(); f.position.y = h; f.rotation.y = (i / 9) * Math.PI * 2;
        var leaf = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 3.4), M.leaf);
        leaf.position.set(0, -0.38, 1.6); leaf.rotation.x = 0.32 + (i % 2) * 0.18; leaf.castShadow = true;
        f.add(leaf); g.add(f);
      }
      world.add(g);
      palms.push({ group: g, baseLean: lean });
    }

    var palmCoords = [
      [-13.5, 9.5, 7.8, 0.09, 0.4], [-15.8, 14.5, 6.5, -0.07, 1.2], [-4.2, 16.4, 8.2, 0.06, 2.1],
      [2.5, 12.0, 6.8, -0.06, 0.8], [-7.8, 4.2, 7.2, 0.11, 2.8], [9.5, 8.6, 6.2, 0.08, 1.5],
      [-20.2, 12.0, 7.5, 0.12, 0.9], [-18.5, 19.5, 8.0, -0.09, 2.4], [-11.0, 22.0, 7.1, 0.07, 1.7],
      [-5.5, 23.5, 6.8, -0.08, 0.3], [4.5, 19.0, 7.6, 0.10, 1.1], [11.2, 14.0, 6.4, -0.06, 2.9],
      [-14.0, 5.0, 7.0, 0.08, 0.5], [6.0, 5.5, 7.4, -0.11, 1.8], [-2.0, 8.5, 8.5, 0.05, 0.2]
    ];
    for (var pIdx = 0; pIdx < palmCoords.length; pIdx++) {
      var pC = palmCoords[pIdx];
      palm(pC[0], pC[1], pC[2], pC[3], pC[4]);
    }

    /* ── 9. Interactive Projected Room Pins ── */
    var anchors = {
      overview: { g: world, p: new THREE.Vector3(0, 2.5, 0) },
      pavilion: { g: Club, p: new THREE.Vector3(-3.2, 2.5, 1.0) },
      pool: { g: Club, p: new THREE.Vector3(6.8, 0.8, 2.5) },
      villa1: { g: V1, p: new THREE.Vector3(0, 2.2, 0) },
      villa2: { g: V2, p: new THREE.Vector3(2.2, 3.5, 0) },
      spa: { g: Spa, p: new THREE.Vector3(0, 2.0, 1.0) },
      jetty: { g: world, p: new THREE.Vector3(2, 0.6, 26) }
    };
    var labels = [].slice.call(root.querySelectorAll('.model-label')).map(function (el) {
      return { el: el, a: anchors[el.dataset.anchor], set: el.dataset.set };
    });

    /* ── 10. Multi-Room Camera Orbit & Smooth Zooming Engine ── */
    var state = { theta: -0.65, elev: 0.38, radius: 55, targetY: 2.5, explode: 0, dusk: 0, la: 0, lb: 0 };
    var cutaway = { progress: 0, activeLevel: 'all', activeVilla: 'overview' };
    var solarTime = { hour: 17.5 };
    var baseRoofY = roofGroup.position.y;
    var baseL2Y = upperFloorGroup.position.y;
    var userOrbit = {
      yawOffset: 0, yawVel: 0,
      pitchOffset: 0, pitchVel: 0,
      zoomCurrent: 1.0, zoomTarget: 1.0,
      targetXCurrent: 0, targetXTarget: 0,
      targetYCurrent: 0, targetYTarget: 0,
      targetZCurrent: 0, targetZTarget: 0
    };
    var drag = { on: false, x: 0, y: 0 };
    var touchDist = 0;

    // Ambient automatic cinematic cruise
    var ambientMotion = {
      enabled: true,
      idleTimeout: null,
      pause: function () {
        ambientMotion.enabled = false;
        clearTimeout(ambientMotion.idleTimeout);
        ambientMotion.idleTimeout = setTimeout(function () {
          if (!drag.on && !tourPlaying) ambientMotion.enabled = true;
        }, 2200);
      }
    };

    var W = 1, H = 1, active = false, tmp = new THREE.Vector3();
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    var solarProfiles = [
      {
        hour: 6.5, sunColor: new THREE.Color(0xffb88c), sunIntensity: 0.85,
        hemiSky: new THREE.Color(0xffdfd0), hemiGround: new THREE.Color(0x182530), hemiIntensity: 0.65,
        fogColor: new THREE.Color(0x0e1217), rimColor: new THREE.Color(0x7ac4d6), rimIntensity: 0.35,
        interiorColor: new THREE.Color(0xffb066), interiorGlow: 0.35,
        poolColor: new THREE.Color(0x38d9e0), poolIntensity: 0.35, poolEmissive: 0.15,
        waterColor: new THREE.Color(0x28505a), waterRoughness: 0.2, shallowsOpacity: 0.36,
        glassGlow: 0.18, lanternGlow: 0.3, rimHeight: 16
      },
      {
        hour: 12.0, sunColor: new THREE.Color(0xffffff), sunIntensity: 1.45,
        hemiSky: new THREE.Color(0xfff8f0), hemiGround: new THREE.Color(0x113b45), hemiIntensity: 0.85,
        fogColor: new THREE.Color(0x0a0908), rimColor: new THREE.Color(0x7ac4d6), rimIntensity: 0.2,
        interiorColor: new THREE.Color(0xffb066), interiorGlow: 0.1,
        poolColor: new THREE.Color(0x38d9e0), poolIntensity: 0.25, poolEmissive: 0.08,
        waterColor: new THREE.Color(0x113b45), waterRoughness: 0.22, shallowsOpacity: 0.48,
        glassGlow: 0.08, lanternGlow: 0.1, rimHeight: 16
      },
      {
        hour: 18.25, sunColor: new THREE.Color(0xff7e33), sunIntensity: 1.5,
        hemiSky: new THREE.Color(0xffa86b), hemiGround: new THREE.Color(0x0a1c24), hemiIntensity: 0.62,
        fogColor: new THREE.Color(0x140d0e), rimColor: new THREE.Color(0x7ac4d6), rimIntensity: 0.4,
        interiorColor: new THREE.Color(0xffb066), interiorGlow: 1.8,
        poolColor: new THREE.Color(0x38d9e0), poolIntensity: 0.7, poolEmissive: 0.55,
        waterColor: new THREE.Color(0x59443a), waterRoughness: 0.12, shallowsOpacity: 0.34,
        glassGlow: 0.55, lanternGlow: 1.2, rimHeight: 16
      },
      {
        hour: 22.5, sunColor: new THREE.Color(0xff7e33), sunIntensity: 0,
        hemiSky: new THREE.Color(0x0b1a24), hemiGround: new THREE.Color(0x03080c), hemiIntensity: 0.18,
        fogColor: new THREE.Color(0x04080c), rimColor: new THREE.Color(0x3b6d8c), rimIntensity: 0.3,
        interiorColor: new THREE.Color(0xffaa44), interiorGlow: 2.5,
        poolColor: new THREE.Color(0x00f0ff), poolIntensity: 2.2, poolEmissive: 1.25,
        waterColor: new THREE.Color(0x06141a), waterRoughness: 0.2, shallowsOpacity: 0.2,
        glassGlow: 1.25, lanternGlow: 2.5, rimHeight: -12
      }
    ];

    var solarBlend = {
      sunColor: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color(),
      fogColor: new THREE.Color(), rimColor: new THREE.Color(), interiorColor: new THREE.Color(),
      poolColor: new THREE.Color(), waterColor: new THREE.Color()
    };

    var solarSegmentResult = { from: solarProfiles[0], to: solarProfiles[1], progress: 0 };
    function solarSegment(hour) {
      var adjustedHour = hour < solarProfiles[0].hour ? hour + 24 : hour;
      for (var i = 0; i < solarProfiles.length; i++) {
        var next = solarProfiles[(i + 1) % solarProfiles.length];
        var startHour = solarProfiles[i].hour;
        var endHour = next.hour + (i === solarProfiles.length - 1 ? 24 : 0);
        if (adjustedHour <= endHour) {
          solarSegmentResult.from = solarProfiles[i];
          solarSegmentResult.to = next;
          solarSegmentResult.progress = (adjustedHour - startHour) / (endHour - startHour);
          return solarSegmentResult;
        }
      }
      solarSegmentResult.from = solarProfiles[0];
      solarSegmentResult.to = solarProfiles[1];
      solarSegmentResult.progress = 0;
      return solarSegmentResult;
    }

    function blendSolarColor(target, key, from, to, progress) {
      target.copy(from[key]).lerp(to[key], progress);
    }

    function updateSolarLighting() {
      var hour = solarTime.hour;
      var segment = solarSegment(hour);
      var from = segment.from, to = segment.to, progress = segment.progress;
      blendSolarColor(solarBlend.sunColor, 'sunColor', from, to, progress);
      blendSolarColor(solarBlend.hemiSky, 'hemiSky', from, to, progress);
      blendSolarColor(solarBlend.hemiGround, 'hemiGround', from, to, progress);
      blendSolarColor(solarBlend.fogColor, 'fogColor', from, to, progress);
      blendSolarColor(solarBlend.rimColor, 'rimColor', from, to, progress);
      blendSolarColor(solarBlend.interiorColor, 'interiorColor', from, to, progress);
      blendSolarColor(solarBlend.poolColor, 'poolColor', from, to, progress);
      blendSolarColor(solarBlend.waterColor, 'waterColor', from, to, progress);

      sun.position.x = -Math.cos((hour - 6) / 12 * Math.PI) * 60;
      sun.position.y = Math.sin((hour - 6) / 12 * Math.PI) * 50;
      sun.position.z = 25;
      sun.color.copy(solarBlend.sunColor);
      sun.intensity = lerp(from.sunIntensity, to.sunIntensity, progress);
      hemi.color.copy(solarBlend.hemiSky);
      hemi.groundColor.copy(solarBlend.hemiGround);
      hemi.intensity = lerp(from.hemiIntensity, to.hemiIntensity, progress);
      scene.fog.color.copy(solarBlend.fogColor);
      rim.color.copy(solarBlend.rimColor);
      rim.intensity = lerp(from.rimIntensity, to.rimIntensity, progress);
      rim.position.y = lerp(from.rimHeight, to.rimHeight, progress);

      var cutawayGlow = 1 + cutaway.progress * 0.8;
      var interiorGlow = lerp(from.interiorGlow, to.interiorGlow, progress) * cutawayGlow;
      var poolGlow = lerp(from.poolIntensity, to.poolIntensity, progress);

      for (var lI = 0; lI < allGlowLights.length; lI++) {
        var gEntry = allGlowLights[lI];
        if (gEntry.type === 'interior') {
          gEntry.light.color.copy(solarBlend.interiorColor);
          gEntry.light.intensity = interiorGlow;
        } else if (gEntry.type === 'pool') {
          gEntry.light.color.copy(solarBlend.poolColor);
          gEntry.light.intensity = poolGlow;
        }
      }

      M.pool.emissive.copy(solarBlend.poolColor);
      M.pool.emissiveIntensity = lerp(from.poolEmissive, to.poolEmissive, progress);
      M.sea.color.copy(solarBlend.waterColor);
      M.sea.roughness = lerp(from.waterRoughness, to.waterRoughness, progress);
      M.shallows.opacity = lerp(from.shallowsOpacity, to.shallowsOpacity, progress);
      M.glass.emissiveIntensity = Math.max(state.dusk * 1.25, lerp(from.glassGlow, to.glassGlow, progress));
      M.glass.opacity = lerp(0.26, 0.62, state.dusk);
      M.lantern.emissiveIntensity = lerp(from.lanternGlow, to.lanternGlow, progress);
    }

    function syncSolarHud(hour) {
      var minutes = Math.round(hour * 60);
      var hh = Math.floor(minutes / 60) % 24;
      var mm = minutes % 60;
      var timeStr = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');

      var phaseName = 'GOLDEN HOUR';
      if (hour >= 5.0 && hour < 9.5) phaseName = 'DAWN';
      else if (hour >= 9.5 && hour < 16.0) phaseName = 'ZENITH';
      else if (hour >= 16.0 && hour < 20.2) phaseName = 'GOLDEN HOUR';
      else phaseName = 'NOCTURNE';

      var pill = root.querySelector('#solar-status-pill');
      if (pill) {
        var pName = pill.querySelector('.solar-phase-name');
        var pTime = pill.querySelector('.solar-phase-time');
        if (pName) pName.textContent = phaseName;
        if (pTime) pTime.textContent = timeStr;
      }
    }

    function setTimeOfDay(hour, duration) {
      var targetHour = Number(hour);
      if (!isFinite(targetHour)) return;
      targetHour = Math.max(0, Math.min(24, targetHour));
      var tweenDuration = duration === undefined ? 0.65 : Number(duration);

      if (window.gsap && tweenDuration > 0) {
        window.gsap.killTweensOf(solarTime, 'hour');
        window.gsap.to(solarTime, {
          hour: targetHour,
          duration: tweenDuration,
          ease: 'power2.inOut',
          onUpdate: function () { syncSolarHud(solarTime.hour); }
        });
      } else {
        solarTime.hour = targetHour;
        syncSolarHud(solarTime.hour);
      }
    }
    activeTimeSetter = setTimeOfDay;
    syncSolarHud(solarTime.hour);
    updateSolarLighting();

    function resize() {
      W = root.clientWidth || 1; H = root.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      if (W / H > 1.15) camera.setViewOffset(W, H, -W * 0.17, -H * 0.02, W, H);
      else camera.setViewOffset(W, H, 0, H * 0.17, W, H);
      camera.updateProjectionMatrix();
    }

    var isModelVisible = true;
    if ('IntersectionObserver' in window && root) {
      var modelObserver = new IntersectionObserver(function (entries) {
        if (entries && entries[0]) {
          isModelVisible = entries[0].isIntersecting;
        }
      }, { rootMargin: '150px' });
      modelObserver.observe(root);
    }

    function frame(time) {
      if (!active || !isModelVisible) return;

      // Ambient cinematic continuous cruise when user is idle
      if (ambientMotion.enabled && !drag.on && !tourPlaying) {
        userOrbit.yawOffset += 0.00065;
      }

      if (!drag.on) {
        userOrbit.yawOffset += userOrbit.yawVel; userOrbit.yawVel *= 0.92;
        userOrbit.pitchOffset += userOrbit.pitchVel; userOrbit.pitchVel *= 0.92;
      }
      userOrbit.zoomCurrent = lerp(userOrbit.zoomCurrent, userOrbit.zoomTarget, 0.1);
      userOrbit.targetXCurrent = lerp(userOrbit.targetXCurrent, userOrbit.targetXTarget, 0.08);
      userOrbit.targetYCurrent = lerp(userOrbit.targetYCurrent, userOrbit.targetYTarget, 0.08);
      userOrbit.targetZCurrent = lerp(userOrbit.targetZCurrent, userOrbit.targetZTarget, 0.08);

      var s = state;
      var currentSec = (time || performance.now()) * 0.001;

      // Animated ocean wave normal displacement
      waterNormTex.offset.x = (currentSec * 0.018) % 1;
      waterNormTex.offset.y = (currentSec * 0.012) % 1;

      // Palm tree natural breeze
      for (var pI = 0; pI < palms.length; pI++) {
        var pData = palms[pI];
        pData.group.rotation.z = pData.baseLean + Math.sin(currentSec * 1.5 + pI) * 0.012;
      }

      // Camera positioning
      var th = s.theta + userOrbit.yawOffset + Math.sin(currentSec * 0.35) * 0.018;
      var el = Math.max(0.04, Math.min(1.22, s.elev + userOrbit.pitchOffset));
      var r = (s.radius / userOrbit.zoomCurrent) * Math.max(1, 1.12 / camera.aspect);

      var cx = userOrbit.targetXCurrent;
      var cy = s.targetY + userOrbit.targetYCurrent;
      var cz = userOrbit.targetZCurrent;

      scene.fog.near = r * 1.3; scene.fog.far = r * 3.2;
      camera.position.set(
        cx + Math.sin(th) * Math.cos(el) * r,
        cy + Math.sin(el) * r,
        cz + Math.cos(th) * Math.cos(el) * r
      );
      camera.lookAt(cx, cy, cz);

      // Scroll Explode / Cutaway Timeline
      V1.position.y = 0.2 + s.explode * 3.5;
      V1Interior.position.y = V1.position.y;
      ClubInterior.position.y = 0.3 + s.explode * 2.8;
      baseRoofY = s.explode * 2.8;
      roofGroup.position.y = baseRoofY + cutaway.progress * 4.2;
      baseL2Y = 3.3 + s.explode * 4.0;
      upperFloorGroup.position.y = baseL2Y +
        (cutaway.activeVilla === 'villa2' && cutaway.activeLevel === 'level2' ? cutaway.progress * 2.8 : 0);
      V2L2Interior.position.y = upperFloorGroup.position.y;
      Club.position.y = 0.3 + s.explode * 2.8;

      updateSolarLighting();

      renderer.render(scene, camera);

      // Project Labels in 3D Screen Space
      for (var i = 0; i < labels.length; i++) {
        var L = labels[i];
        if (!L.a) continue;
        tmp.copy(L.a.p); L.a.g.localToWorld(tmp); tmp.project(camera);
        var o = (L.set === 'a' ? s.la : s.lb) * (tmp.z < 1 ? 1 : 0);
        L.el.style.opacity = o;
        if (o > 0.01) {
          L.el.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * W).toFixed(1) + 'px,' + ((-tmp.y * 0.5 + 0.5) * H).toFixed(1) + 'px) translate(-3px,-50%)';
        }
      }
    }

    /* ── Touch & Mouse Drag (Orbit) ── */
    canvas.addEventListener('pointerdown', function (e) {
      ambientMotion.pause();
      stopTour();
      drag.on = true; drag.x = e.clientX; drag.y = e.clientY;
      userOrbit.yawVel = 0; userOrbit.pitchVel = 0;
      canvas.classList.add('is-dragging');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!drag.on) return;
      var dx = (e.clientX - drag.x) / W;
      var dy = (e.clientY - drag.y) / H;
      drag.x = e.clientX; drag.y = e.clientY;
      userOrbit.yawVel = -dx * 3.4; userOrbit.yawOffset += userOrbit.yawVel;
      userOrbit.pitchVel = dy * 2.2; userOrbit.pitchOffset += userOrbit.pitchVel;
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      canvas.addEventListener(t, function () { drag.on = false; canvas.classList.remove('is-dragging'); });
    });

    /* ── Smooth Mouse Wheel Zoom ── */
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      ambientMotion.pause();
      var step = e.deltaY > 0 ? 0.9 : 1.11;
      userOrbit.zoomTarget = Math.max(0.5, Math.min(3.2, userOrbit.zoomTarget * step));
    }, { passive: false });

    /* ── Pinch-to-zoom ── */
    canvas.addEventListener('touchstart', function (e) {
      ambientMotion.pause();
      if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && touchDist > 0) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var newDist = Math.sqrt(dx * dx + dy * dy);
        userOrbit.zoomTarget = Math.max(0.5, Math.min(3.2, userOrbit.zoomTarget * (newDist / touchDist)));
        touchDist = newDist;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', function () { touchDist = 0; }, { passive: true });
    window.addEventListener('scroll', function () { ambientMotion.pause(); }, { passive: true });

    /* ── Camera Presets & Room Navigation ── */
    var btnZoomIn = root.querySelector('#btn-zoom-in');
    var btnZoomOut = root.querySelector('#btn-zoom-out');
    var btnReset = root.querySelector('#btn-reset-cam');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', function () {
        ambientMotion.pause();
        userOrbit.zoomTarget = Math.min(3.2, userOrbit.zoomTarget * 1.25);
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', function () {
        ambientMotion.pause();
        userOrbit.zoomTarget = Math.max(0.5, userOrbit.zoomTarget * 0.8);
      });
    }
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        flyToRoom('overview');
      });
    }

    var roomPresets = {
      overview: { yaw: 0, pitch: 0, zoom: 1.0, tx: 0, ty: 0, tz: 0 },
      villa1: { yaw: -0.75, pitch: -0.05, zoom: 2.2, tx: -15, ty: 0.5, tz: -6 },
      villa2: { yaw: 0.82, pitch: 0.08, zoom: 2.1, tx: 16, ty: 2.2, tz: 2 },
      compound: { yaw: 0.82, pitch: 0.08, zoom: 2.1, tx: 16, ty: 2.2, tz: 2 },
      pavilion: { yaw: 0.15, pitch: -0.02, zoom: 1.9, tx: -2, ty: 1.2, tz: 0 },
      spa: { yaw: -0.35, pitch: 0.12, zoom: 2.1, tx: -8, ty: 0.8, tz: 14 },
      jetty: { yaw: 0.1, pitch: 0.12, zoom: 2.1, tx: 2, ty: 0.6, tz: 26 }
    };

    var tourWaypoints = [
      { title: '01 · LAGOON ARRIVAL', yaw: -0.65, pitch: 0.38, zoom: 1.0, tx: 0, ty: 2.5, tz: 0, duration: 4.5 },
      { title: '02 · THE ARRIVAL PIER & WATERLINE', yaw: -0.15, pitch: 0.12, zoom: 1.8, tx: 2, ty: 1.0, tz: 20, duration: 4.0 },
      { title: '03 · GRAND PAVILION & 22M INFINITY POOL', yaw: 0.22, pitch: 0.08, zoom: 2.0, tx: -2, ty: 1.2, tz: 2, duration: 4.5 },
      { title: '04 · TWO-STOREY SUNSET RESIDENCE', yaw: 0.85, pitch: 0.18, zoom: 2.3, tx: 16, ty: 2.6, tz: 2, duration: 4.5 },
      { title: '05 · OVERWATER LAGOON SUITE 01', yaw: -0.82, pitch: 0.06, zoom: 2.4, tx: -15, ty: 0.8, tz: -6, duration: 4.5 }
    ];
    var tourTimeline = null;
    var tourPlaying = false;
    var tourLetterbox = root.querySelector('#tour-letterbox');
    var tourCaption = root.querySelector('#tour-caption');
    var tourProgressBar = root.querySelector('#tour-progress-fill');
    var playTourButton = root.querySelector('#btn-play-tour');

    function stopTour() {
      var tourWasActive = tourPlaying || (tourLetterbox && tourLetterbox.classList.contains('is-active'));
      if (tourTimeline) {
        tourTimeline.kill();
        tourTimeline = null;
      }
      if (tourWasActive) {
        userOrbit.yawVel = 0;
        userOrbit.pitchVel = 0;
        userOrbit.zoomTarget = userOrbit.zoomCurrent;
        userOrbit.targetXTarget = userOrbit.targetXCurrent;
        userOrbit.targetYTarget = userOrbit.targetYCurrent;
        userOrbit.targetZTarget = userOrbit.targetZCurrent;
      }
      tourPlaying = false;
      root.classList.remove('tour-playing');
      if (tourLetterbox) {
        tourLetterbox.classList.remove('is-active');
        tourLetterbox.setAttribute('aria-hidden', 'true');
      }
      if (tourProgressBar) tourProgressBar.style.transform = 'scaleX(0)';
      if (playTourButton) playTourButton.setAttribute('aria-pressed', 'false');
    }

    function startTour() {
      if (!window.gsap) return;
      ambientMotion.pause();
      if (tourTimeline) tourTimeline.kill();
      tourTimeline = null;
      window.gsap.killTweensOf(userOrbit);
      userOrbit.yawVel = 0;
      userOrbit.pitchVel = 0;
      tourPlaying = true;
      root.classList.add('tour-playing');
      if (tourLetterbox) {
        tourLetterbox.classList.add('is-active');
        tourLetterbox.setAttribute('aria-hidden', 'false');
      }
      if (playTourButton) playTourButton.setAttribute('aria-pressed', 'true');
      if (tourCaption) tourCaption.textContent = tourWaypoints[0].title;
      if (tourProgressBar) tourProgressBar.style.transform = 'scaleX(0)';
      if (exitTourButton) exitTourButton.focus();

      var timeline = window.gsap.timeline({
        onUpdate: function () {
          if (tourProgressBar) tourProgressBar.style.transform = 'scaleX(' + timeline.progress() + ')';
        },
        onComplete: function () {
          if (tourTimeline === timeline) tourTimeline = null;
          tourPlaying = false;
          root.classList.remove('tour-playing');
          if (playTourButton) playTourButton.setAttribute('aria-pressed', 'false');
          if (tourProgressBar) tourProgressBar.style.transform = 'scaleX(1)';
          if (tourLetterbox) {
            tourLetterbox.classList.remove('is-active');
            tourLetterbox.setAttribute('aria-hidden', 'true');
          }
        }
      });
      tourTimeline = timeline;

      for (var i = 0; i < tourWaypoints.length; i++) {
        (function (waypoint) {
          timeline.to(userOrbit, {
            yawOffset: waypoint.yaw - state.theta,
            pitchOffset: waypoint.pitch - state.elev,
            zoomTarget: waypoint.zoom,
            targetXTarget: waypoint.tx,
            targetYTarget: waypoint.ty - state.targetY,
            targetZTarget: waypoint.tz,
            duration: waypoint.duration,
            ease: 'power2.inOut',
            onStart: function () {
              if (tourCaption) tourCaption.textContent = waypoint.title;
            }
          });
        })(tourWaypoints[i]);
      }
    }

    if (playTourButton) playTourButton.addEventListener('click', startTour);
    var exitTourButton = root.querySelector('#btn-exit-tour');
    if (exitTourButton) exitTourButton.addEventListener('click', stopTour);
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && (tourPlaying || (tourLetterbox && tourLetterbox.classList.contains('is-active')))) {
        stopTour();
      }
    });

    /* ── Spatial Cutaway & Specification Drawer ── */
    function setCutaway(isOpen, villaId, level) {
      cutaway.activeVilla = villaId || cutaway.activeVilla;
      cutaway.activeLevel = level || cutaway.activeLevel;
      var targetProgress = isOpen ? 1 : 0;
      if (window.gsap) {
        window.gsap.to(cutaway, { progress: targetProgress, duration: 1.2, ease: 'power3.inOut' });
      } else {
        cutaway.progress = targetProgress;
      }
      var toggle = root.querySelector('#btn-toggle-cutaway');
      if (toggle) {
        toggle.classList.toggle('is-active', isOpen);
        toggle.setAttribute('aria-pressed', String(isOpen));
        var toggleLabel = toggle.querySelector('span');
        if (toggleLabel) toggleLabel.textContent = isOpen ? 'Restore Roof' : 'Inspect Spatial Plan';
      }
    }

    var drawer = root.querySelector('#arch-spec-drawer');
    var levelControls = drawer ? drawer.querySelector('.spec-level-switch') : null;
    var specFields = {
      title: drawer ? drawer.querySelector('.spec-title') : null,
      area: drawer ? drawer.querySelector('[data-spec="area"]') : null,
      ceiling: drawer ? drawer.querySelector('[data-spec="ceiling"]') : null,
      frontage: drawer ? drawer.querySelector('[data-spec="frontage"]') : null,
      orientation: drawer ? drawer.querySelector('[data-spec="orientation"]') : null
    };

    var roomSpecs = {
      villa1: { title: 'Villa 01 — Lagoon Suite', area: '220 m² / 2,368 sq ft', ceiling: '3.6m Cantilevered', frontage: '24m Private Lagoon', orientation: '240° WSW Sunset' },
      villa2: { title: 'Villa 02 — Sunset Residence', area: '440 m² / 4,736 sq ft', ceiling: '6.4m Double Height', frontage: '32m Panoramic Lagoon', orientation: '270° West Sunset' },
      compound: { title: 'Grand Presidential Compound', area: '762 m² / 8,200 sq ft', ceiling: '6.4m Double Height', frontage: 'Private Beach & Yacht Mooring', orientation: '225° SW Sunset' },
      pavilion: { title: 'The Grand Pavilion & 22m Pool', area: '680 m² / 7,319 sq ft', ceiling: '4.8m Double Height', frontage: '36m Main Ocean Edge', orientation: '225° SW Lagoon' },
      spa: { title: 'Garden Sanctuary & Spa', area: '310 m² / 3,337 sq ft', ceiling: '3.4m Timber Canopy', frontage: 'Private Hydrotherapy Bay', orientation: '180° South Garden' },
      jetty: { title: 'Arrival Pier & Mooring Lounge', area: '120m Overwater Pier', ceiling: 'Open Air Canopy', frontage: '360° Ocean Approach', orientation: '020° NNE Arrival' }
    };

    function showDrawer(viewName) {
      if (!drawer) return;
      var spec = roomSpecs[viewName];
      if (!spec) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        return;
      }
      specFields.title.textContent = spec.title;
      specFields.area.textContent = spec.area;
      specFields.ceiling.textContent = spec.ceiling;
      specFields.frontage.textContent = spec.frontage;
      specFields.orientation.textContent = spec.orientation;
      if (levelControls) levelControls.hidden = viewName !== 'villa2';
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
    }

    function flyToRoom(viewName) {
      ambientMotion.pause();
      stopTour();
      var target = roomPresets[viewName] || roomPresets.overview;
      var villaId = viewName === 'compound' ? 'villa2' : (roomSpecs[viewName] ? viewName : 'overview');
      var activeView = viewName === 'compound' ? 'villa2' : viewName;
      var pills = root.querySelectorAll('.model-view-pill');
      for (var p = 0; p < pills.length; p++) {
        pills[p].classList.toggle('active', pills[p].dataset.view === activeView);
      }
      showDrawer(viewName);
      setCutaway(false, villaId, 'all');
      if (viewName === 'villa2' && levelPills.length) {
        for (var levelIndex = 0; levelIndex < levelPills.length; levelIndex++) {
          levelPills[levelIndex].classList.toggle('active', levelPills[levelIndex].dataset.level === 'all');
        }
      }
      if (window.gsap) {
        window.gsap.to(userOrbit, {
          yawOffset: target.yaw,
          pitchOffset: target.pitch,
          zoomTarget: target.zoom,
          targetXTarget: target.tx,
          targetYTarget: target.ty,
          targetZTarget: target.tz,
          duration: 1.2,
          ease: 'power2.inOut'
        });
      } else {
        userOrbit.yawOffset = target.yaw; userOrbit.pitchOffset = target.pitch;
        userOrbit.zoomTarget = target.zoom;
        userOrbit.targetXTarget = target.tx; userOrbit.targetYTarget = target.ty; userOrbit.targetZTarget = target.tz;
      }
    }

    var levelPills = drawer ? drawer.querySelectorAll('[data-level]') : [];
    for (var levelIndex = 0; levelIndex < levelPills.length; levelIndex++) {
      levelPills[levelIndex].addEventListener('click', function () {
        ambientMotion.pause();
        for (var i = 0; i < levelPills.length; i++) levelPills[i].classList.toggle('active', levelPills[i] === this);
        var level = this.dataset.level;
        setCutaway(level !== 'all', 'villa2', level);
      });
    }

    var cutawayButton = root.querySelector('#btn-toggle-cutaway');
    if (cutawayButton) {
      cutawayButton.addEventListener('click', function () {
        ambientMotion.pause();
        setCutaway(!cutawayButton.classList.contains('is-active'), cutaway.activeVilla, cutaway.activeLevel);
      });
    }
    var closeDrawer = root.querySelector('.spec-close');
    if (closeDrawer) closeDrawer.addEventListener('click', function () { flyToRoom('overview'); });

    var viewPills = root.querySelectorAll('.model-view-pill');
    for (var vIdx = 0; vIdx < viewPills.length; vIdx++) {
      viewPills[vIdx].addEventListener('click', function () {
        flyToRoom(this.dataset.view);
      });
    }

    for (var lIdx = 0; lIdx < labels.length; lIdx++) {
      (function (labelObj) {
        labelObj.el.style.cursor = 'pointer';
        labelObj.el.addEventListener('click', function () {
          var a = this.dataset.anchor;
          if (a === 'villa1') flyToRoom('villa1');
          else if (a === 'villa2') flyToRoom('villa2');
          else if (a === 'pavilion' || a === 'pool') flyToRoom('pavilion');
          else if (a === 'spa') flyToRoom('spa');
          else if (a === 'jetty') flyToRoom('jetty');
          else flyToRoom('overview');
        });
      })(labels[lIdx]);
    }

    var finishButtons = root.querySelectorAll('.swatch');
    for (var finishIndex = 0; finishIndex < finishButtons.length; finishIndex++) {
      finishButtons[finishIndex].addEventListener('click', function () {
        var category = this.dataset.cat;
        if (!applyFinish(category, this.dataset.key)) return;
        var categoryGroup = this.closest('.finish-group');
        var categoryButtons = categoryGroup ? categoryGroup.querySelectorAll('.swatch') : [];
        for (var buttonIndex = 0; buttonIndex < categoryButtons.length; buttonIndex++) {
          var isActive = categoryButtons[buttonIndex] === this;
          categoryButtons[buttonIndex].classList.toggle('active', isActive);
          categoryButtons[buttonIndex].setAttribute('aria-pressed', String(isActive));
        }
      });
    }

    if (window.ResizeObserver) new window.ResizeObserver(resize).observe(root);
    window.addEventListener('resize', resize);
    resize();
    if (window.gsap) window.gsap.ticker.add(frame);

    var instance = {
      state: state,
      cutaway: cutaway,
      solarTime: solarTime,
      setCutaway: setCutaway,
      setTimeOfDay: setTimeOfDay,
      flyToRoom: flyToRoom,
      applyFinish: applyFinish,
      startTour: startTour,
      stopTour: stopTour,
      setActive: function (on) { active = on; },
      renderOnce: function () { var a = active; active = true; frame(0); active = a; }
    };
    activeInstance = instance;
    return instance;
  }

  window.EliteVilla3D = {
    init: init,
    setTimeOfDay: function (hour, duration) {
      if (activeTimeSetter) activeTimeSetter(hour, duration);
    },
    applyFinish: function (category, finishKey) {
      return activeInstance ? activeInstance.applyFinish(category, finishKey) : false;
    },
    flyToRoom: function (viewName) {
      if (activeInstance) activeInstance.flyToRoom(viewName);
    }
  };

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('.inspect-property-btn') : null;
    if (button) {
      if (button.tagName === 'A' && button.getAttribute('href')) {
        return; // Allow direct navigation to dedicated standalone residence page
      }
      if (activeInstance && button.dataset.inspectView) {
        activeInstance.flyToRoom(button.dataset.inspectView);
      }
    }
  });

  var propertyFilter = document.querySelector('#property-filter-form');
  if (propertyFilter) {
    propertyFilter.addEventListener('submit', function (event) {
      event.preventDefault();
      var selectedType = document.querySelector('#filter-type').value;
      var selectedBudget = document.querySelector('#filter-budget').value;
      var selectedBeds = document.querySelector('#filter-beds').value;
      var cards = document.querySelectorAll('.residence-card');
      var visibleCount = 0;
      var isFiltered = selectedType !== 'all' || selectedBudget !== 'any' || selectedBeds !== 'any';

      for (var cardIndex = 0; cardIndex < cards.length; cardIndex++) {
        var card = cards[cardIndex];
        var price = Number(card.dataset.price);
        var beds = Number(card.dataset.beds);
        var matchesType = selectedType === 'all' || card.dataset.category === selectedType;
        var matchesBudget = selectedBudget === 'any' ||
          (selectedBudget === '3-5' && price >= 3000000 && price <= 5000000) ||
          (selectedBudget === '5-10' && price > 5000000 && price <= 10000000) ||
          (selectedBudget === '10+' && price > 10000000);
        var matchesBeds = selectedBeds === 'any' ||
          (selectedBeds === '2' && beds === 2) ||
          (selectedBeds === '3-4' && beds >= 3 && beds <= 4) ||
          (selectedBeds === '5+' && beds >= 5);
        var matches = matchesType && matchesBudget && matchesBeds;
        card.hidden = !matches;
        if (matches) visibleCount++;
      }

      var emptyMessage = document.querySelector('#catalog-empty');
      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
      var submitButton = propertyFilter.querySelector('.filter-search-btn');
      if (submitButton && submitButton.firstChild) {
        submitButton.firstChild.nodeValue = isFiltered
          ? 'Explore ' + visibleCount + (visibleCount === 1 ? ' Featured Estate' : ' Featured Estates') + ' '
          : 'Explore 18 Estates ';
      }
    });
  }
})();
