/**
 * ELITE — Dedicated 3D Residence Architectural Inspector & Real Estate Showcase
 * Dual-Mode Experience:
 * 1. Editorial Architectural Photography with room highlights
 * 2. High-Fidelity 3D Spatial Walkthrough with procedural textures, 3D pins, and solar simulator
 *
 * 4 Distinct Architectural Residences:
 * - Villa 01: Lagoon Suite (Overwater single-level with plunge pool, hammock & ocean access)
 * - Villa 02: Sunset Residence (2-storey duplex with spiral stair & exploded cutaway)
 * - Grand Presidential Compound (762m² estate with in-pool sunken fire pit lounge)
 * - Garden Wellness Sanctuary (Organic biophilic pavilion with stone hydrotherapy bath & zen bamboo garden)
 */
(function () {
  'use strict';

  var modal = document.getElementById('residence-inspect-modal');
  var canvas = document.getElementById('residence-inspect-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  var isStandalone = !modal;

  // UI Elements
  var titleEl = document.getElementById('inspect-title');
  var badgeEl = document.getElementById('inspect-badge');
  var specCardName = document.getElementById('spec-card-name');
  var specArea = document.getElementById('spec-area');
  var specPool = document.getElementById('spec-pool');
  var specCeiling = document.getElementById('spec-ceiling');
  var specFrontage = document.getElementById('spec-frontage');
  var specOrientation = document.getElementById('spec-orientation');
  var specPrice = document.getElementById('spec-price');
  var specFeatures = document.getElementById('spec-features');
  var levelSwitch = document.getElementById('inspect-level-switch');
  var closeBtn = document.getElementById('inspect-close-btn');
  var autoRotateBtn = document.getElementById('inspect-btn-autorotate');
  var resetBtn = document.getElementById('inspect-btn-reset');
  var inquireBtn = document.getElementById('inspect-inquire-btn');
  var navBtns = modal ? modal.querySelectorAll('.inspect-nav-btn') : document.querySelectorAll('.inspect-nav-btn');
  var solarBtns = document.querySelectorAll('.solar-btn, .single-solar-btn');
  var levelBtns = document.querySelectorAll('.inspect-level-btn, .level-tab-btn');
  var modeBtns = document.querySelectorAll('.mode-tab-btn, .single-tab-btn');
  var photoStage = document.getElementById('inspect-photo-stage');
  var photoImg = document.getElementById('inspect-photo-img') || document.getElementById('single-main-img');
  var photoGalleryStrip = document.getElementById('inspect-photo-thumbs');
  var stepInto3dBtn = document.getElementById('inspect-step-3d-btn');
  var pinsContainer = document.getElementById('inspect-pins-container');

  // Residence Data with verified Real Estate Specs & Editorial Imagery
  var RESIDENCES = {
    villa1: {
      id: 'villa1',
      title: 'Villa 01 — Lagoon Suite',
      badge: '220 m² · 2 BEDS · $4,850,000 USD',
      price: '$4,850,000 USD',
      area: '220 m² / 2,368 sq ft',
      pool: '8.5m Ocean Plunge',
      ceiling: '3.6m Cantilevered',
      frontage: '24m Private Lagoon',
      orientation: '240° WSW Sunset',
      image: 'assets/img/villa.jpg',
      gallery: [
        { src: 'assets/img/villa.jpg', label: 'Overwater Sunset Facade' },
        { src: 'assets/img/lagoon.jpg', label: 'Lagoon Plunge Pool' },
        { src: 'assets/img/bedroom.jpg', label: 'Master Suite Interior' }
      ],
      features: [
        'Cantilevered weathered Burmese teak sun deck',
        'Floor-to-ceiling frameless sliding glass facade',
        'Sub-floor marine stilts with direct ocean swim ladder',
        'Overwater net hammock suspended above lagoon water',
        'Master king suite with illuminated acoustic wood headboard'
      ],
      camDist: 22,
      camPitch: 0.38,
      camYaw: -0.6,
      pins: [
        { id: 'v1_bed', label: 'Master Suite (68 m²)', pos: new THREE.Vector3(-2.0, 2.2, -1.8) },
        { id: 'v1_pool', label: 'Infinity Plunge Pool', pos: new THREE.Vector3(3.8, 1.4, 2.8) },
        { id: 'v1_net', label: 'Overwater Hammock', pos: new THREE.Vector3(-5.5, 1.1, 3.5) },
        { id: 'v1_sea', label: 'Ocean Swim Ladder', pos: new THREE.Vector3(7.5, 0.4, 2.7) }
      ]
    },
    villa2: {
      id: 'villa2',
      title: 'Villa 02 — Sunset Residence',
      badge: '440 m² · 4 BEDS · $7,450,000 USD',
      price: '$7,450,000 USD',
      area: '440 m² / 4,736 sq ft',
      pool: '12m Infinity Lap Pool',
      ceiling: '6.4m Double Height',
      frontage: '32m Panoramic Lagoon',
      orientation: '270° Due West Sunset',
      image: 'assets/img/bedroom.jpg',
      gallery: [
        { src: 'assets/img/bedroom.jpg', label: 'Upper Penthouse Suite' },
        { src: 'assets/img/bath.jpg', label: 'Artisan Stone Soaking Tub' },
        { src: 'assets/img/pool.jpg', label: 'Ground Lap Pool & Deck' }
      ],
      features: [
        'Two-storey contemporary modernist duplex structure',
        'Cantilevered upper master penthouse with glass balustrade',
        'Exterior architectural spiral staircase connecting levels',
        'Artisan stone soaking plunge tub on upper sunset terrace',
        'Full interactive floor-by-floor spatial cutaway inspection'
      ],
      camDist: 26,
      camPitch: 0.42,
      camYaw: 0.75,
      pins: [
        { id: 'v2_pent', label: 'Level 2 Penthouse (180 m²)', pos: new THREE.Vector3(-2.8, 5.8, -0.6) },
        { id: 'v2_tub', label: 'Sunset Soaking Tub', pos: new THREE.Vector3(4.2, 5.0, 3.6) },
        { id: 'v2_stair', label: 'Spiral Staircase', pos: new THREE.Vector3(4.8, 2.8, 1.8) },
        { id: 'v2_pool', label: 'Ground Lap Pool (12m)', pos: new THREE.Vector3(1.5, 0.8, 4.5) }
      ]
    },
    compound: {
      id: 'compound',
      title: 'Grand Presidential Compound',
      badge: '762 m² · 6 BEDS · $14,200,000 USD',
      price: '$14,200,000 USD',
      area: '762 m² / 8,200 sq ft',
      pool: '25m Private Infinity Lap Pool',
      ceiling: '6.8m Cathedral Vault',
      frontage: 'Private Beach Parcel & Yacht Mooring',
      orientation: '225° SW Sunset',
      image: 'assets/img/pavilion.jpg',
      gallery: [
        { src: 'assets/img/pavilion.jpg', label: 'Vaulted Great Hall Pavilion' },
        { src: 'assets/img/table.jpg', label: 'Alfresco Dining Colonnade' },
        { src: 'assets/img/night-pool.jpg', label: '25m Pool & Sunken Fire Pit' }
      ],
      features: [
        'Triple-pavilion estate: Grand Hall, West Master & East VIP wings',
        'Central in-pool sunken fire pit lounge with dancing ember glow',
        'Covered timber-slat breezeway colonnades linking all wings',
        'Private beach parcel with 4 luxury cabanas & dining pergola',
        'Private deep-water yacht pier & private helicopter arrival option'
      ],
      camDist: 38,
      camPitch: 0.52,
      camYaw: 0.45,
      pins: [
        { id: 'cp_hall', label: 'Cathedral Great Hall (6.8m)', pos: new THREE.Vector3(0, 4.2, -6.5) },
        { id: 'cp_fire', label: 'Sunken Fire Pit Lounge', pos: new THREE.Vector3(0, 0.6, 3.5) },
        { id: 'cp_pool', label: '25m Infinity Lap Pool', pos: new THREE.Vector3(8.0, 0.5, 3.5) },
        { id: 'cp_west', label: 'Master Suite Wing', pos: new THREE.Vector3(-14, 2.2, -4) }
      ]
    },
    spa: {
      id: 'spa',
      title: 'Garden Wellness Sanctuary',
      badge: '310 m² · 3 BEDS · $4,600,000 USD',
      price: '$4,600,000 USD',
      area: '310 m² / 3,337 sq ft',
      pool: 'Stone Hydrotherapy Plunge & Reflection Bath',
      ceiling: '3.4m Timber Pergola',
      frontage: 'Private Botanical Garden & Zen Courtyard',
      orientation: '180° South Garden',
      image: 'assets/img/garden-pool.jpg',
      gallery: [
        { src: 'assets/img/garden-pool.jpg', label: 'Stone Hydrotherapy Plunge' },
        { src: 'assets/img/bath.jpg', label: 'Garden Bath Pavilion' },
        { src: 'assets/img/about.jpg', label: 'Zen Botanical Courtyard' }
      ],
      features: [
        'Organic Japanese-Nordic biophilic architecture with timber eaves',
        'Hand-carved organic stone hydrotherapy plunge & mirror pond',
        'Open-air yoga & meditation pavilion with tatami mats & tea table',
        'Stepping-stone flagstone pathway with glowing Japanese stone lanterns',
        'Surrounding botanical bamboo grove & tropical frangipani bonsai'
      ],
      camDist: 24,
      camPitch: 0.45,
      camYaw: -0.4,
      pins: [
        { id: 'sp_yoga', label: 'Yoga & Meditation Pavilion', pos: new THREE.Vector3(-0.5, 1.4, -3.5) },
        { id: 'sp_bath', label: 'Hydrotherapy Stone Bath', pos: new THREE.Vector3(5.5, 1.0, 2.5) },
        { id: 'sp_pond', label: 'Dark Reflection Pond', pos: new THREE.Vector3(-5.5, 0.5, 3.2) },
        { id: 'sp_path', label: 'Stone Lantern Pathway', pos: new THREE.Vector3(1.2, 0.6, 1.5) }
      ]
    }
  };

  // State
  var activeResidenceId = 'villa1';
  var currentMode = 'photo'; // 'photo' or '3d'
  var solarPhase = 'day'; // 'day', 'sunset', 'night'
  var isAutoRotate = true;
  var currentLevelMode = 'all'; // 'all', 'level1', 'level2', 'cutaway'
  var isModalOpen = false;
  var animFrameId = null;

  // Three.js Core
  var scene, camera, renderer;
  var residenceRoot = new THREE.Group();
  var lights = {};
  var animatedElements = [];
  var cutawayRefs = { upperGroup: null, roofGroup: null };
  var currentPins = [];

  // Orbit & Camera Controls
  var orbit = {
    distance: 24,
    targetDistance: 24,
    pitch: 0.4,
    targetPitch: 0.4,
    yaw: -0.6,
    targetYaw: -0.6,
    panX: 0,
    targetPanX: 0,
    panY: 0,
    targetPanY: 0,
    panZ: 0,
    targetPanZ: 0
  };

  var pointer = { isDown: false, button: 0, startX: 0, startY: 0, lastX: 0, lastY: 0 };

  /* ─────────────────────────────────────────────────────────────
     Procedural Architectural Textures (Canvas Generated)
     Gives authentic realism to wood planks, stone, and water
     ───────────────────────────────────────────────────────────── */
  var textures = {};
  function generateProceduralTextures() {
    // 1. Teak Decking Texture (Realistic planks with micro-grain and bevel gap)
    var cTeak = document.createElement('canvas');
    cTeak.width = 512;
    cTeak.height = 512;
    var ctxT = cTeak.getContext('2d');
    ctxT.fillStyle = '#65432b';
    ctxT.fillRect(0, 0, 512, 512);
    // Draw wood grain stripes
    for (var i = 0; i < 512; i += 2) {
      var n = Math.sin(i * 0.12) * 8 + (Math.random() - 0.5) * 6;
      ctxT.fillStyle = 'rgba(' + (110 + n) + ',' + (75 + n * 0.8) + ',' + (48 + n * 0.6) + ', 0.35)';
      ctxT.fillRect(0, i, 512, 2);
    }
    // Draw plank separation grooves every 32px
    ctxT.fillStyle = 'rgba(20, 14, 10, 0.75)';
    for (var p = 0; p < 512; p += 32) {
      ctxT.fillRect(0, p, 512, 2);
    }
    textures.teak = new THREE.CanvasTexture(cTeak);
    textures.teak.wrapS = THREE.RepeatWrapping;
    textures.teak.wrapT = THREE.RepeatWrapping;
    textures.teak.repeat.set(4, 4);

    // 2. Travertine / Sandstone Texture
    var cStone = document.createElement('canvas');
    cStone.width = 512;
    cStone.height = 512;
    var ctxS = cStone.getContext('2d');
    ctxS.fillStyle = '#dcd4c8';
    ctxS.fillRect(0, 0, 512, 512);
    for (var s = 0; s < 1500; s++) {
      var sx = Math.random() * 512;
      var sy = Math.random() * 512;
      var sr = Math.random() * 3 + 1;
      var col = Math.random() > 0.5 ? 'rgba(180, 170, 155, 0.25)' : 'rgba(240, 235, 225, 0.3)';
      ctxS.fillStyle = col;
      ctxS.beginPath();
      ctxS.arc(sx, sy, sr, 0, Math.PI * 2);
      ctxS.fill();
    }
    textures.stone = new THREE.CanvasTexture(cStone);
    textures.stone.wrapS = THREE.RepeatWrapping;
    textures.stone.wrapT = THREE.RepeatWrapping;
    textures.stone.repeat.set(3, 3);

    // 3. Water Caustics Normal Map
    var cWater = document.createElement('canvas');
    cWater.width = 256;
    cWater.height = 256;
    var ctxW = cWater.getContext('2d');
    ctxW.fillStyle = '#8080ff'; // Neutral normal base
    ctxW.fillRect(0, 0, 256, 256);
    for (var w = 0; w < 300; w++) {
      var wx = Math.random() * 256;
      var wy = Math.random() * 256;
      var wr = Math.random() * 16 + 8;
      var grad = ctxW.createRadialGradient(wx, wy, 1, wx, wy, wr);
      grad.addColorStop(0, 'rgba(180, 180, 255, 0.45)');
      grad.addColorStop(1, 'rgba(128, 128, 255, 0)');
      ctxW.fillStyle = grad;
      ctxW.beginPath();
      ctxW.arc(wx, wy, wr, 0, Math.PI * 2);
      ctxW.fill();
    }
    textures.waterNormal = new THREE.CanvasTexture(cWater);
    textures.waterNormal.wrapS = THREE.RepeatWrapping;
    textures.waterNormal.wrapT = THREE.RepeatWrapping;
    textures.waterNormal.repeat.set(5, 5);
  }

  // Material Library
  var mats = {};
  function initMaterials() {
    generateProceduralTextures();

    mats.waterOcean = new THREE.MeshPhysicalMaterial({
      color: 0x126278,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      opacity: 0.88,
      transparent: true,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    mats.waterPool = new THREE.MeshPhysicalMaterial({
      color: 0x24bed8,
      roughness: 0.04,
      metalness: 0.15,
      transmission: 0.88,
      opacity: 0.92,
      transparent: true,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03
    });

    mats.waterDark = new THREE.MeshPhysicalMaterial({
      color: 0x0c1e24,
      roughness: 0.02,
      metalness: 0.3,
      transmission: 0.6,
      opacity: 0.96,
      transparent: true,
      clearcoat: 1.0
    });

    mats.teakDeck = new THREE.MeshStandardMaterial({
      map: textures.teak,
      color: 0xa87a55,
      roughness: 0.55,
      metalness: 0.05
    });

    mats.darkTimber = new THREE.MeshStandardMaterial({
      color: 0x231a14,
      roughness: 0.6,
      metalness: 0.05
    });

    mats.lightWood = new THREE.MeshStandardMaterial({
      color: 0xcfb493,
      roughness: 0.48,
      metalness: 0.02
    });

    mats.concretePlinth = new THREE.MeshStandardMaterial({
      map: textures.stone,
      color: 0xe0d9cf,
      roughness: 0.8,
      metalness: 0.05
    });

    mats.darkBasalt = new THREE.MeshStandardMaterial({
      color: 0x1b1c1e,
      roughness: 0.65,
      metalness: 0.15
    });

    mats.glass = new THREE.MeshPhysicalMaterial({
      color: 0xe8f7fa,
      roughness: 0.02,
      metalness: 0.1,
      transmission: 0.94,
      opacity: 0.3,
      transparent: true,
      reflectivity: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    mats.whiteFabric = new THREE.MeshStandardMaterial({
      color: 0xf7f5f0,
      roughness: 0.95,
      metalness: 0.0
    });

    mats.goldAccent = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    mats.bronzeMullion = new THREE.MeshStandardMaterial({
      color: 0x2b2520,
      roughness: 0.4,
      metalness: 0.6
    });

    mats.sand = new THREE.MeshStandardMaterial({
      map: textures.stone,
      color: 0xe5dbc8,
      roughness: 0.96,
      metalness: 0.0
    });

    mats.foliageGreen = new THREE.MeshStandardMaterial({
      color: 0x285433,
      roughness: 0.75,
      metalness: 0.0
    });

    mats.fireEmber = new THREE.MeshBasicMaterial({
      color: 0xff6200
    });

    mats.lanternGlow = new THREE.MeshBasicMaterial({
      color: 0xffd37a
    });
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdceef8);
    scene.fog = new THREE.FogExp2(0xdceef8, 0.009);

    camera = new THREE.PerspectiveCamera(40, 1, 0.5, 300);
    camera.position.set(0, 10, 25);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    initMaterials();

    // Lighting setup
    lights.ambient = new THREE.AmbientLight(0xfff8ee, 0.9);
    scene.add(lights.ambient);

    lights.sun = new THREE.DirectionalLight(0xfffaec, 1.7);
    lights.sun.position.set(30, 48, 25);
    lights.sun.castShadow = true;
    lights.sun.shadow.mapSize.width = 2048;
    lights.sun.shadow.mapSize.height = 2048;
    lights.sun.shadow.camera.near = 1;
    lights.sun.shadow.camera.far = 160;
    lights.sun.shadow.camera.left = -40;
    lights.sun.shadow.camera.right = 40;
    lights.sun.shadow.camera.top = 40;
    lights.sun.shadow.camera.bottom = -40;
    lights.sun.shadow.bias = -0.0003;
    scene.add(lights.sun);

    lights.fill = new THREE.DirectionalLight(0x8bc0db, 0.45);
    lights.fill.position.set(-25, 22, -25);
    scene.add(lights.fill);

    // Warm Interior Point Light
    lights.interior = new THREE.PointLight(0xffb766, 2.2, 35, 1.2);
    lights.interior.position.set(0, 3, 0);
    scene.add(lights.interior);

    scene.add(residenceRoot);
  }

  /* ─────────────────────────────────────────────────────────────
     RESIDENCE 1: Villa 01 — Lagoon Suite
     Architectural cantilevered overwater villa, plunge pool, hammock, master suite
     ───────────────────────────────────────────────────────────── */
  function buildVilla1() {
    var group = new THREE.Group();
    cutawayRefs.upperGroup = null;
    cutawayRefs.roofGroup = null;

    // Ocean Water Surface
    var oceanGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    oceanGeo.rotateX(-Math.PI / 2);
    var ocean = new THREE.Mesh(oceanGeo, mats.waterOcean);
    ocean.position.y = -2.2;
    ocean.receiveShadow = true;
    group.add(ocean);
    animatedElements.push({ type: 'oceanWave', mesh: ocean, baseGeo: oceanGeo.clone() });

    // 16 Marine Timber Piles with Cross-Braces
    var stiltGeo = new THREE.CylinderGeometry(0.2, 0.24, 3.4, 10);
    for (var ix = -3; ix <= 3; ix += 2) {
      for (var iz = -2; iz <= 2; iz += 1.3) {
        var stilt = new THREE.Mesh(stiltGeo, mats.darkBasalt);
        stilt.position.set(ix * 2.3, -0.5, iz * 2.5);
        stilt.castShadow = true;
        group.add(stilt);
      }
    }

    // Main Teak Deck Platform with Bronze Trim
    var deckGeo = new THREE.BoxGeometry(15.2, 0.45, 11.2);
    var deck = new THREE.Mesh(deckGeo, mats.teakDeck);
    deck.position.set(0, 1.0, 0);
    deck.receiveShadow = true;
    deck.castShadow = true;
    group.add(deck);

    var deckFascia = new THREE.Mesh(new THREE.BoxGeometry(15.35, 0.12, 11.35), mats.bronzeMullion);
    deckFascia.position.set(0, 0.8, 0);
    group.add(deckFascia);

    // Private Plunge Pool (8.5m x 3.5m)
    var poolOuter = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.85, 3.6), mats.concretePlinth);
    poolOuter.position.set(3.8, 1.1, 2.8);
    poolOuter.castShadow = true;
    group.add(poolOuter);

    var poolWater = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.2).rotateX(-Math.PI / 2), mats.waterPool);
    poolWater.position.set(3.8, 1.42, 2.8);
    group.add(poolWater);
    animatedElements.push({ type: 'poolRipple', mesh: poolWater, speed: 2.2 });

    // Underwater step bench
    var poolStep = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.25, 0.6), mats.concretePlinth);
    poolStep.position.set(3.8, 1.25, 1.5);
    group.add(poolStep);

    // Overwater Net Hammock
    var hammockFrame = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.14, 2.5), mats.bronzeMullion);
    hammockFrame.position.set(-5.5, 0.9, 3.5);
    group.add(hammockFrame);

    var hammockNet = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.2).rotateX(-Math.PI / 2), mats.whiteFabric);
    hammockNet.position.set(-5.5, 0.92, 3.5);
    group.add(hammockNet);

    // Luxury Teak Sun Loungers with Plush White Cushions & Drinks Table
    for (var l = -1; l <= 1; l += 2) {
      var lBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.2, 2.2), mats.teakDeck);
      lBase.position.set(l * 1.3 - 1.2, 1.32, 3.0);
      lBase.castShadow = true;
      group.add(lBase);

      var lCushion = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 2.1), mats.whiteFabric);
      lCushion.position.set(l * 1.3 - 1.2, 1.5, 3.0);
      group.add(lCushion);

      var lPillow = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.45), mats.whiteFabric);
      lPillow.position.set(l * 1.3 - 1.2, 1.62, 2.2);
      group.add(lPillow);
    }

    var sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.45, 12), mats.concretePlinth);
    sideTable.position.set(-1.2, 1.45, 3.0);
    group.add(sideTable);

    // Swim Ladder (Descending to crystal ocean water)
    var railL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), mats.goldAccent);
    railL.position.set(7.5, 0.0, 2.2);
    var railR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), mats.goldAccent);
    railR.position.set(7.5, 0.0, 3.2);
    group.add(railL); group.add(railR);
    for (var r = 0; r < 4; r++) {
      var rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), mats.goldAccent);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(7.5, 0.8 - r * 0.45, 2.7);
      group.add(rung);
    }

    // Villa Enclosure: Rear and side acoustic timber walls
    var backWall = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 0.35), mats.darkTimber);
    backWall.position.set(-1.2, 2.8, -4.5);
    backWall.castShadow = true;
    group.add(backWall);

    var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 7.5), mats.darkTimber);
    leftWall.position.set(-6.7, 2.8, -0.75);
    leftWall.castShadow = true;
    group.add(leftWall);

    // Architectural Bronze Mullion Window Frames
    for (var m = -6.5; m <= 4.5; m += 2.2) {
      var mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.08), mats.bronzeMullion);
      mullion.position.set(m, 2.7, 1.2);
      group.add(mullion);
    }

    // Front Sliding Glass Panels
    var frontGlass = new THREE.Mesh(new THREE.BoxGeometry(11.2, 2.95, 0.06), mats.glass);
    frontGlass.position.set(-1.2, 2.7, 1.2);
    group.add(frontGlass);

    // Cantilevered Roof with Under-Eave Recessed Soffit
    var roof = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.4, 9.8), mats.darkBasalt);
    roof.position.set(-1.0, 4.45, -0.6);
    roof.castShadow = true;
    group.add(roof);

    var soffit = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.06, 9.2), mats.lightWood);
    soffit.position.set(-1.0, 4.22, -0.6);
    group.add(soffit);

    // Master Bedroom Interior: Platform King Bed, Acoustic Slat Wall, Bedside Pendants
    var bedBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 2.8), mats.darkTimber);
    bedBase.position.set(-2.0, 1.4, -2.2);
    bedBase.castShadow = true;
    group.add(bedBase);

    var mattress = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 2.5), mats.whiteFabric);
    mattress.position.set(-2.0, 1.75, -2.1);
    group.add(mattress);

    var headboard = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.6, 0.15), mats.lightWood);
    headboard.position.set(-2.0, 2.3, -3.5);
    group.add(headboard);

    // Bedside Nightstands & Suspended Pendants
    for (var n = -1; n <= 1; n += 2) {
      var stand = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), mats.darkTimber);
      stand.position.set(-2.0 + n * 2.1, 1.45, -3.2);
      group.add(stand);

      var cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6), mats.goldAccent);
      cord.position.set(-2.0 + n * 2.1, 3.4, -3.2);
      group.add(cord);

      var pendant = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), mats.lanternGlow);
      pendant.position.set(-2.0 + n * 2.1, 2.65, -3.2);
      group.add(pendant);
    }

    lights.interior.position.set(-2.0, 3.2, -1.8);
    lights.interior.color.setHex(0xffb25a);
    lights.interior.intensity = 2.4;

    return group;
  }

  /* ─────────────────────────────────────────────────────────────
     RESIDENCE 2: Villa 02 — Sunset Residence
     Two-Storey Modernist Duplex with Cantilever & Spiral Staircase
     ───────────────────────────────────────────────────────────── */
  function buildVilla2() {
    var group = new THREE.Group();

    // Ocean Water Base
    var oceanGeo = new THREE.PlaneGeometry(90, 90, 36, 36);
    oceanGeo.rotateX(-Math.PI / 2);
    var ocean = new THREE.Mesh(oceanGeo, mats.waterOcean);
    ocean.position.y = -2.0;
    ocean.receiveShadow = true;
    group.add(ocean);
    animatedElements.push({ type: 'oceanWave', mesh: ocean, baseGeo: oceanGeo.clone() });

    // Ground Concrete Plinth with Recessed Shadow Gap
    var plinth = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.6, 14.2), mats.concretePlinth);
    plinth.position.set(0, 0.3, 0);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    group.add(plinth);

    // Ground Lap Pool (12m x 3.8m)
    var poolOuter = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.65, 4.2), mats.darkBasalt);
    poolOuter.position.set(1.5, 0.48, 4.5);
    group.add(poolOuter);

    var poolWater = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 3.8).rotateX(-Math.PI / 2), mats.waterPool);
    poolWater.position.set(1.5, 0.75, 4.5);
    group.add(poolWater);
    animatedElements.push({ type: 'poolRipple', mesh: poolWater, speed: 2.5 });

    // Ground Floor Living Pavilion Walls & Bronze Columns
    var gFloorWalls = new THREE.Mesh(new THREE.BoxGeometry(12, 3.2, 8), mats.darkTimber);
    gFloorWalls.position.set(-2, 2.2, -2);
    gFloorWalls.castShadow = true;
    group.add(gFloorWalls);

    var gFloorGlass = new THREE.Mesh(new THREE.BoxGeometry(10.2, 3.0, 0.08), mats.glass);
    gFloorGlass.position.set(-2, 2.1, 2.05);
    group.add(gFloorGlass);

    // Poolside Sunken Modular Lounge
    var loungeSofa = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.45, 2.4), mats.whiteFabric);
    loungeSofa.position.set(-5.5, 0.8, 3.5);
    group.add(loungeSofa);

    var fireTable = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 1.1), mats.darkBasalt);
    fireTable.position.set(-5.5, 0.8, 1.8);
    group.add(fireTable);

    // Exterior Architectural Spiral Staircase
    var stairPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.4, 12), mats.darkBasalt);
    stairPillar.position.set(4.8, 2.4, 1.8);
    group.add(stairPillar);
    for (var s = 0; s < 13; s++) {
      var step = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.36), mats.teakDeck);
      var angle = s * 0.46;
      step.position.set(4.8 + Math.cos(angle) * 0.58, 0.6 + s * 0.28, 1.8 + Math.sin(angle) * 0.58);
      step.rotation.y = -angle;
      step.castShadow = true;
      group.add(step);
    }

    // UPPER LEVEL GROUP (For exploded cutaway & level switching)
    var upperGroup = new THREE.Group();
    upperGroup.position.set(0, 0, 0);

    // Cantilevered Upper Floor Slab (Projects 3.5m over pool deck)
    var upperSlab = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.45, 10.4), mats.concretePlinth);
    upperSlab.position.set(-1.0, 4.0, 0.5);
    upperSlab.castShadow = true;
    upperGroup.add(upperSlab);

    // Upper Master Penthouse Suite Walls
    var upperWalls = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.1, 6.8), mats.lightWood);
    upperWalls.position.set(-2.8, 5.75, -0.8);
    upperWalls.castShadow = true;
    upperGroup.add(upperWalls);

    // Upper Glass Balustrade (Balcony)
    var upperGlass = new THREE.Mesh(new THREE.BoxGeometry(14.0, 1.1, 0.08), mats.glass);
    upperGlass.position.set(-1.0, 4.75, 5.3);
    upperGroup.add(upperGlass);

    // Upper Balcony Artisan Stone Soaking Plunge Tub
    var tubOuter = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.0, 0.9, 20), mats.darkBasalt);
    tubOuter.position.set(4.2, 4.65, 3.6);
    tubOuter.castShadow = true;
    upperGroup.add(tubOuter);

    var tubWater = new THREE.Mesh(new THREE.CircleGeometry(0.98, 16).rotateX(-Math.PI / 2), mats.waterPool);
    tubWater.position.set(4.2, 5.0, 3.6);
    upperGroup.add(tubWater);

    // Upper Master Bed
    var upBed = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.4, 2.5), mats.whiteFabric);
    upBed.position.set(-3.5, 4.5, -0.6);
    upperGroup.add(upBed);

    group.add(upperGroup);
    cutawayRefs.upperGroup = upperGroup;

    // ROOF GROUP (Lifts higher during cutaway)
    var roofGroup = new THREE.Group();
    var upperRoof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.4, 11.2), mats.darkBasalt);
    upperRoof.position.set(-1.0, 7.45, 0.5);
    upperRoof.castShadow = true;
    roofGroup.add(upperRoof);

    group.add(roofGroup);
    cutawayRefs.roofGroup = roofGroup;

    lights.interior.position.set(-1.5, 5.8, 0.5);
    lights.interior.color.setHex(0xffaa50);
    lights.interior.intensity = 2.8;

    return group;
  }

  /* ─────────────────────────────────────────────────────────────
     RESIDENCE 3: Grand Presidential Compound
     Triple Pavilion Estate (762m²) with In-Pool Sunken Fire Pit Lounge
     ───────────────────────────────────────────────────────────── */
  function buildCompound() {
    var group = new THREE.Group();
    cutawayRefs.upperGroup = null;
    cutawayRefs.roofGroup = null;

    // Sandy Beach Parcel
    var beach = new THREE.Mesh(new THREE.BoxGeometry(44, 0.8, 36), mats.sand);
    beach.position.set(0, -0.4, 0);
    beach.receiveShadow = true;
    group.add(beach);

    // Ocean Water Edge
    var ocean = new THREE.Mesh(new THREE.PlaneGeometry(65, 26, 32, 20).rotateX(-Math.PI / 2), mats.waterOcean);
    ocean.position.set(0, -0.3, 17);
    ocean.receiveShadow = true;
    group.add(ocean);
    animatedElements.push({ type: 'oceanWave', mesh: ocean, baseGeo: ocean.geometry.clone() });

    // Enormous Central Infinity Pool (25m x 8.5m)
    var poolOuter = new THREE.Mesh(new THREE.BoxGeometry(25.4, 0.65, 8.8), mats.darkBasalt);
    poolOuter.position.set(0, 0.15, 3.5);
    group.add(poolOuter);

    var poolWater = new THREE.Mesh(new THREE.PlaneGeometry(24.6, 8.0).rotateX(-Math.PI / 2), mats.waterPool);
    poolWater.position.set(0, 0.42, 3.5);
    group.add(poolWater);
    animatedElements.push({ type: 'poolRipple', mesh: poolWater, speed: 2.8 });

    // CENTERPIECE: In-Pool Sunken Fire Pit Lounge
    var pitOuter = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.95, 28), mats.concretePlinth);
    pitOuter.position.set(0, 0.22, 3.5);
    group.add(pitOuter);

    var pitBench = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.38, 8, 28).rotateX(Math.PI / 2), mats.whiteFabric);
    pitBench.position.set(0, 0.42, 3.5);
    group.add(pitBench);

    // Granite Fire Table with Dancing Embers
    var fireTable = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.52, 18), mats.darkBasalt);
    fireTable.position.set(0, 0.38, 3.5);
    group.add(fireTable);

    var emberMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 14), mats.fireEmber);
    emberMesh.position.set(0, 0.76, 3.5);
    group.add(emberMesh);

    var fireLight = new THREE.PointLight(0xff5500, 3.2, 18, 1.5);
    fireLight.position.set(0, 1.2, 3.5);
    group.add(fireLight);
    animatedElements.push({ type: 'fireFlicker', light: fireLight, mesh: emberMesh });

    // 1. Central Great Hall Pavilion (Cathedral Double Height 6.8m)
    var mainPavilion = new THREE.Mesh(new THREE.BoxGeometry(14.5, 5.0, 9.5), mats.darkTimber);
    mainPavilion.position.set(0, 2.5, -6.5);
    mainPavilion.castShadow = true;
    group.add(mainPavilion);

    // Vaulted Cathedral Pitched Roof
    var pitchedRoofGeo = new THREE.ConeGeometry(11, 2.8, 4).rotateY(Math.PI / 4);
    var mainRoof = new THREE.Mesh(pitchedRoofGeo, mats.darkBasalt);
    mainRoof.position.set(0, 6.1, -6.5);
    mainRoof.scale.set(1.12, 1, 0.78);
    mainRoof.castShadow = true;
    group.add(mainRoof);

    // 2. West Master Presidential Wing
    var westWing = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.5, 8.5), mats.lightWood);
    westWing.position.set(-14, 1.75, -4);
    westWing.castShadow = true;
    group.add(westWing);
    var westRoof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.4, 9.5), mats.darkBasalt);
    westRoof.position.set(-14, 3.65, -4);
    group.add(westRoof);

    // 3. East VIP Guest Wing
    var eastWing = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.5, 8.5), mats.lightWood);
    eastWing.position.set(14, 1.75, -4);
    eastWing.castShadow = true;
    group.add(eastWing);
    var eastRoof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.4, 9.5), mats.darkBasalt);
    eastRoof.position.set(14, 3.65, -4);
    group.add(eastRoof);

    // Covered Breezeway Colonnades
    var colonnadeW = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.22, 2.5), mats.darkBasalt);
    colonnadeW.position.set(-7.5, 3.3, -5.5);
    group.add(colonnadeW);
    var colonnadeE = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.22, 2.5), mats.darkBasalt);
    colonnadeE.position.set(7.5, 3.3, -5.5);
    group.add(colonnadeE);

    // 4 Beachfront Cabanas
    for (var c = -2; c <= 2; c++) {
      if (c === 0) continue;
      var cBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.26, 2.5), mats.teakDeck);
      cBase.position.set(c * 5.6, 0.2, 9.8);
      group.add(cBase);

      var cRoof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 2.6), mats.whiteFabric);
      cRoof.position.set(c * 5.6, 2.2, 9.8);
      group.add(cRoof);
    }

    lights.interior.position.set(0, 3.5, -5.0);
    lights.interior.color.setHex(0xffcb75);
    lights.interior.intensity = 3.2;

    return group;
  }

  /* ─────────────────────────────────────────────────────────────
     RESIDENCE 4: Garden Wellness Sanctuary
     Organic Japanese-Nordic Biophilic Pavilion with Hydrotherapy
     ───────────────────────────────────────────────────────────── */
  function buildSanctuary() {
    var group = new THREE.Group();
    cutawayRefs.upperGroup = null;
    cutawayRefs.roofGroup = null;

    // Lush Garden Ground Base
    var gardenBase = new THREE.Mesh(new THREE.BoxGeometry(28, 0.65, 24), mats.sand);
    gardenBase.position.set(0, 0, 0);
    gardenBase.receiveShadow = true;
    group.add(gardenBase);

    // Stone Stepping-Stone Pathway
    for (var st = -4; st <= 4; st++) {
      var stepStone = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.65, 0.14, 8), mats.darkBasalt);
      stepStone.position.set(Math.sin(st * 0.8) * 1.6, 0.38, st * 2.3);
      stepStone.rotation.y = st * 0.4;
      group.add(stepStone);
    }

    // Carved River-Stone Hydrotherapy Plunge Bath
    var hydroOuter = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.3, 0.95, 18), mats.darkBasalt);
    hydroOuter.position.set(5.5, 0.48, 2.5);
    hydroOuter.castShadow = true;
    group.add(hydroOuter);

    var hydroWater = new THREE.Mesh(new THREE.CircleGeometry(2.3, 18).rotateX(-Math.PI / 2), mats.waterPool);
    hydroWater.position.set(5.5, 0.86, 2.5);
    group.add(hydroWater);
    animatedElements.push({ type: 'poolRipple', mesh: hydroWater, speed: 2.0 });

    // Mirror-Flat Dark Reflection Pond
    var pond = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4.8).rotateX(-Math.PI / 2), mats.waterDark);
    pond.position.set(-5.5, 0.35, 3.2);
    group.add(pond);

    // Main Open-Air Yoga & Meditation Pavilion
    var deck = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.45, 9.5), mats.teakDeck);
    deck.position.set(-0.5, 0.48, -3.5);
    deck.receiveShadow = true;
    group.add(deck);

    // Timber Pergola Posts & Slats
    for (var px = -5.0; px <= 4.0; px += 4.5) {
      for (var pz = -7.5; pz <= 0.5; pz += 4.0) {
        var post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.3, 8), mats.darkTimber);
        post.position.set(px, 2.0, pz);
        post.castShadow = true;
        group.add(post);
      }
    }

    // Slatted Eaves Roof Overhang
    var pergolaRoof = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.26, 11.0), mats.darkBasalt);
    pergolaRoof.position.set(-0.5, 3.6, -3.5);
    pergolaRoof.castShadow = true;
    group.add(pergolaRoof);

    // Tatami Mats & Low Tea Table
    var tatami = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.08, 4.2), mats.lightWood);
    tatami.position.set(-0.5, 0.72, -3.5);
    group.add(tatami);

    var teaTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.95), mats.darkTimber);
    teaTable.position.set(-0.5, 0.88, -3.5);
    group.add(teaTable);

    // Glowing Japanese Stone Lanterns (Tōrō) along path
    var lanternCoords = [
      { x: -2.8, z: 1.5 },
      { x: 2.8, z: 4.5 },
      { x: 3.5, z: -2.0 },
      { x: -4.0, z: -1.0 }
    ];
    for (var lk = 0; lk < lanternCoords.length; lk++) {
      var coord = lanternCoords[lk];
      var lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.7, 6), mats.darkBasalt);
      lBase.position.set(coord.x, 0.6, coord.z);
      group.add(lBase);

      var lCap = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.35, 4).rotateY(Math.PI / 4), mats.darkBasalt);
      lCap.position.set(coord.x, 1.25, coord.z);
      group.add(lCap);

      var lCore = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), mats.lanternGlow);
      lCore.position.set(coord.x, 0.98, coord.z);
      group.add(lCore);

      var lLight = new THREE.PointLight(0xffbe6b, 1.3, 9, 2);
      lLight.position.set(coord.x, 1.0, coord.z);
      group.add(lLight);
    }

    // Bamboo Grove & Volcanic Boulders
    var bambooGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.8, 6);
    for (var b = 0; b < 22; b++) {
      var bamboo = new THREE.Mesh(bambooGeo, mats.foliageGreen);
      var bx = -9.5 + (b % 7) * 0.75 + (Math.random() - 0.5) * 0.4;
      var bz = -6.5 + Math.floor(b / 7) * 1.6 + (Math.random() - 0.5) * 0.4;
      bamboo.position.set(bx, 2.4, bz);
      bamboo.rotation.z = (Math.random() - 0.5) * 0.12;
      group.add(bamboo);
    }

    var boulderGeo = new THREE.DodecahedronGeometry(1.2, 1);
    var b1 = new THREE.Mesh(boulderGeo, mats.darkBasalt);
    b1.position.set(9.0, 0.55, -4);
    group.add(b1);
    var b2 = new THREE.Mesh(boulderGeo, mats.darkBasalt);
    b2.position.set(-8.5, 0.45, 6.8);
    b2.scale.set(0.75, 0.75, 0.75);
    group.add(b2);

    lights.interior.position.set(-0.5, 2.2, -3.5);
    lights.interior.color.setHex(0xffbe68);
    lights.interior.intensity = 2.0;

    return group;
  }

  /* ─────────────────────────────────────────────────────────────
     Interactive 3D Spatial Room Pins System
     ───────────────────────────────────────────────────────────── */
  function renderSpatialPins(pins) {
    currentPins = pins || [];
    if (!pinsContainer) return;
    pinsContainer.innerHTML = '';

    for (var p = 0; p < currentPins.length; p++) {
      (function (pin) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'inspect-spatial-pin';
        el.innerHTML = '<i class="pin-pulse"></i><span>' + pin.label + '</span>';
        el.addEventListener('click', function () {
          // Smoothly fly camera to frame this room/feature
          focusPin(pin);
        });
        pinsContainer.appendChild(el);
        pin.dom = el;
      })(currentPins[p]);
    }
  }

  function updatePinsProjection() {
    if (!pinsContainer || currentMode !== '3d' || !currentPins.length || !camera) return;
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    var halfW = w / 2;
    var halfH = h / 2;

    for (var i = 0; i < currentPins.length; i++) {
      var pin = currentPins[i];
      if (!pin.dom) continue;
      var vec = pin.pos.clone().project(camera);

      // Check if pin is behind camera
      if (vec.z > 1.0) {
        pin.dom.style.display = 'none';
        continue;
      }
      pin.dom.style.display = 'flex';
      var screenX = (vec.x * halfW) + halfW;
      var screenY = -(vec.y * halfH) + halfH;
      pin.dom.style.transform = 'translate3d(' + Math.round(screenX) + 'px,' + Math.round(screenY) + 'px, 0)';
    }
  }

  function focusPin(pin) {
    isAutoRotate = false;
    updateAutoRotateUI();
    if (window.gsap) {
      window.gsap.to(orbit, {
        targetPanX: pin.pos.x * 0.7,
        targetPanY: pin.pos.y * 0.5,
        targetPanZ: pin.pos.z * 0.7,
        targetDistance: Math.max(14, orbit.distance * 0.75),
        duration: 1.2,
        ease: 'power2.out'
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     Load and Swap Residence
     ───────────────────────────────────────────────────────────── */
  function loadResidence(resId) {
    if (!RESIDENCES[resId]) resId = 'villa1';
    activeResidenceId = resId;
    var data = RESIDENCES[resId];

    // Clear previous 3D meshes and animations
    while (residenceRoot.children.length > 0) {
      residenceRoot.remove(residenceRoot.children[0]);
    }
    animatedElements = [];

    // Build specific 3D model
    var modelGroup;
    if (resId === 'villa1') modelGroup = buildVilla1();
    else if (resId === 'villa2') modelGroup = buildVilla2();
    else if (resId === 'compound') modelGroup = buildCompound();
    else if (resId === 'spa') modelGroup = buildSanctuary();

    residenceRoot.add(modelGroup);

    // Update Photo Stage
    if (photoImg) photoImg.src = data.image;
    if (photoGalleryStrip) {
      photoGalleryStrip.innerHTML = '';
      for (var g = 0; g < data.gallery.length; g++) {
        (function (item) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thumb-pill' + (item.src === data.image ? ' active' : '');
          btn.textContent = item.label;
          btn.addEventListener('click', function () {
            photoImg.src = item.src;
            var siblings = photoGalleryStrip.querySelectorAll('.thumb-pill');
            for (var k = 0; k < siblings.length; k++) siblings[k].classList.remove('active');
            btn.classList.add('active');
          });
          photoGalleryStrip.appendChild(btn);
        })(data.gallery[g]);
      }
    }

    // Update UI Meta & Spec Drawer
    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (specCardName) specCardName.textContent = data.title;
    if (specArea) specArea.textContent = data.area;
    if (specPool) specPool.textContent = data.pool;
    if (specCeiling) specCeiling.textContent = data.ceiling;
    if (specFrontage) specFrontage.textContent = data.frontage;
    if (specOrientation) specOrientation.textContent = data.orientation;
    if (specPrice) specPrice.textContent = data.price;

    if (specFeatures) {
      specFeatures.innerHTML = '';
      for (var f = 0; f < data.features.length; f++) {
        var li = document.createElement('li');
        li.textContent = data.features[f];
        specFeatures.appendChild(li);
      }
    }

    // Level controls visibility (Villa 02 duplex)
    if (levelSwitch) {
      levelSwitch.hidden = (resId !== 'villa2');
      if (resId === 'villa2') {
        currentLevelMode = 'all';
        for (var lb = 0; lb < levelBtns.length; lb++) {
          levelBtns[lb].classList.toggle('active', levelBtns[lb].dataset.inspectLevel === 'all');
        }
      }
    }

    // Update Nav buttons
    for (var nb = 0; nb < navBtns.length; nb++) {
      navBtns[nb].classList.toggle('active', navBtns[nb].dataset.residence === resId);
    }

    // Setup 3D Pins
    renderSpatialPins(data.pins);

    // Reset Camera preset
    orbit.targetDistance = data.camDist;
    orbit.targetPitch = data.camPitch;
    orbit.targetYaw = data.camYaw;
    orbit.targetPanX = 0;
    orbit.targetPanY = 0;
    orbit.targetPanZ = 0;

    applySolarLighting(solarPhase);
  }

  /* ─────────────────────────────────────────────────────────────
     Switch Between Editorial Photo & 3D Walkthrough
     ───────────────────────────────────────────────────────────── */
  function setMode(mode) {
    currentMode = mode;
    var allModeBtns = document.querySelectorAll('.mode-tab-btn, .single-tab-btn');
    for (var mb = 0; mb < allModeBtns.length; mb++) {
      var isTarget = (allModeBtns[mb].dataset.mode === mode || allModeBtns[mb].dataset.targetMode === mode);
      allModeBtns[mb].classList.toggle('active', isTarget);
      allModeBtns[mb].setAttribute('aria-selected', String(isTarget));
    }

    var pStage = document.getElementById('single-photo-stage') || photoStage;
    var sStage = document.getElementById('single-3d-stage');
    var sBar = document.getElementById('single-solar-bar');

    if (mode === 'photo') {
      if (pStage) pStage.classList.remove('is-hidden');
      if (sStage) sStage.classList.add('is-hidden');
      if (sBar) sBar.classList.remove('is-visible');
      if (pinsContainer) pinsContainer.style.display = 'none';
    } else {
      if (pStage) pStage.classList.add('is-hidden');
      if (sStage) sStage.classList.remove('is-hidden');
      if (sBar) sBar.classList.add('is-visible');
      if (pinsContainer) pinsContainer.style.display = 'block';
      onResize();
      // Brief cinematic intro sweep
      isAutoRotate = true;
      updateAutoRotateUI();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     24-Hour Solar Lighting Engine for Inspector
     ───────────────────────────────────────────────────────────── */
  function applySolarLighting(phase) {
    solarPhase = phase;
    for (var sb = 0; sb < solarBtns.length; sb++) {
      solarBtns[sb].classList.toggle('active', solarBtns[sb].dataset.solar === phase);
    }

    if (phase === 'day') {
      scene.background.setHex(0xdbeef8);
      scene.fog.color.setHex(0xdbeef8);
      lights.ambient.color.setHex(0xffffff);
      lights.ambient.intensity = 0.95;
      lights.sun.color.setHex(0xfff8ee);
      lights.sun.intensity = 1.7;
      lights.sun.position.set(30, 48, 25);
      lights.fill.color.setHex(0x90c8e8);
      lights.fill.intensity = 0.5;
      lights.interior.intensity = 1.2;
    } else if (phase === 'sunset') {
      scene.background.setHex(0x281920);
      scene.fog.color.setHex(0x281920);
      lights.ambient.color.setHex(0xffd5b3);
      lights.ambient.intensity = 0.7;
      lights.sun.color.setHex(0xff8b44);
      lights.sun.intensity = 2.1;
      lights.sun.position.set(45, 12, 10);
      lights.fill.color.setHex(0x8a4568);
      lights.fill.intensity = 0.6;
      lights.interior.intensity = 2.8;
    } else if (phase === 'night') {
      scene.background.setHex(0x07090d);
      scene.fog.color.setHex(0x07090d);
      lights.ambient.color.setHex(0x182436);
      lights.ambient.intensity = 0.35;
      lights.sun.color.setHex(0x3e5e88);
      lights.sun.intensity = 0.4;
      lights.sun.position.set(-20, 30, -20);
      lights.fill.color.setHex(0x121e2c);
      lights.fill.intensity = 0.2;
      lights.interior.intensity = 3.6;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     Level & Spatial Cutaway for Villa 02
     ───────────────────────────────────────────────────────────── */
  function setLevelMode(mode) {
    currentLevelMode = mode;
    for (var i = 0; i < levelBtns.length; i++) {
      levelBtns[i].classList.toggle('active', levelBtns[i].dataset.inspectLevel === mode);
    }

    if (!cutawayRefs.upperGroup || !cutawayRefs.roofGroup) return;

    var targetRoofY = 0;
    var targetUpperY = 0;
    var targetCameraY = 0;

    if (mode === 'all') {
      targetRoofY = 0;
      targetUpperY = 0;
      targetCameraY = 0;
    } else if (mode === 'level1') {
      targetRoofY = 7.5;
      targetUpperY = 6.0;
      targetCameraY = -1.5;
    } else if (mode === 'level2') {
      targetRoofY = 5.5;
      targetUpperY = 0;
      targetCameraY = 2.2;
    } else if (mode === 'cutaway') {
      targetRoofY = 6.4;
      targetUpperY = 3.4;
      targetCameraY = 0.5;
    }

    if (window.gsap) {
      window.gsap.to(cutawayRefs.roofGroup.position, { y: targetRoofY, duration: 1.1, ease: 'power2.out' });
      window.gsap.to(cutawayRefs.upperGroup.position, { y: targetUpperY, duration: 1.1, ease: 'power2.out' });
      window.gsap.to(orbit, { targetPanY: targetCameraY, duration: 1.0, ease: 'power2.out' });
    } else {
      cutawayRefs.roofGroup.position.y = targetRoofY;
      cutawayRefs.upperGroup.position.y = targetUpperY;
      orbit.targetPanY = targetCameraY;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     Pointer & Orbit Mechanics
     ───────────────────────────────────────────────────────────── */
  function handlePointerDown(e) {
    pointer.isDown = true;
    pointer.button = e.button || 0;
    pointer.startX = e.clientX;
    pointer.startY = e.clientY;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    isAutoRotate = false;
    updateAutoRotateUI();
  }

  function handlePointerMove(e) {
    if (!pointer.isDown) return;
    var dx = e.clientX - pointer.lastX;
    var dy = e.clientY - pointer.lastY;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;

    if (pointer.button === 0) {
      // Orbit
      orbit.targetYaw += dx * 0.007;
      orbit.targetPitch = Math.max(0.08, Math.min(1.4, orbit.targetPitch + dy * 0.007));
    } else if (pointer.button === 2) {
      // Pan
      orbit.targetPanX -= dx * 0.02;
      orbit.targetPanY += dy * 0.02;
    }
  }

  function handlePointerUp() {
    pointer.isDown = false;
  }

  function handleWheel(e) {
    e.preventDefault();
    var delta = Math.sign(e.deltaY);
    orbit.targetDistance = Math.max(10, Math.min(65, orbit.targetDistance + delta * 2.5));
  }

  function updateAutoRotateUI() {
    if (autoRotateBtn) {
      autoRotateBtn.setAttribute('aria-pressed', String(isAutoRotate));
      var span = autoRotateBtn.querySelector('span');
      if (span) span.textContent = 'Auto Orbit: ' + (isAutoRotate ? 'ON' : 'OFF');
      autoRotateBtn.classList.toggle('active', isAutoRotate);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     Render Loop & Responsiveness
     ───────────────────────────────────────────────────────────── */
  function onResize() {
    if (!renderer || !canvas) return;
    var wrap = canvas.parentElement;
    var w = wrap.clientWidth || window.innerWidth;
    var h = wrap.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function tick(timestamp) {
    if (!isModalOpen && !isStandalone) return;
    var time = timestamp * 0.001;

    if (currentMode === '3d') {
      // Smooth Orbit Inertia
      if (isAutoRotate) {
        orbit.targetYaw += 0.0022;
      }
      orbit.yaw += (orbit.targetYaw - orbit.yaw) * 0.08;
      orbit.pitch += (orbit.targetPitch - orbit.pitch) * 0.08;
      orbit.distance += (orbit.targetDistance - orbit.distance) * 0.08;
      orbit.panX += (orbit.targetPanX - orbit.panX) * 0.08;
      orbit.panY += (orbit.targetPanY - orbit.panY) * 0.08;
      orbit.panZ += (orbit.targetPanZ - orbit.panZ) * 0.08;

      var cy = Math.sin(orbit.pitch) * orbit.distance;
      var horiz = Math.cos(orbit.pitch) * orbit.distance;
      var cx = Math.sin(orbit.yaw) * horiz;
      var cz = Math.cos(orbit.yaw) * horiz;

      camera.position.set(cx + orbit.panX, cy + orbit.panY, cz + orbit.panZ);
      camera.lookAt(orbit.panX, orbit.panY + 1.2, orbit.panZ);

      // Water ripple & fire animations
      for (var i = 0; i < animatedElements.length; i++) {
        var elem = animatedElements[i];
        if (elem.type === 'poolRipple') {
          elem.mesh.position.y += Math.sin(time * elem.speed) * 0.0006;
        } else if (elem.type === 'oceanWave' && elem.baseGeo) {
          var pos = elem.mesh.geometry.attributes.position;
          var bPos = elem.baseGeo.attributes.position;
          for (var j = 0; j < pos.count; j++) {
            var u = bPos.getX(j);
            var v = bPos.getZ(j);
            var waveY = Math.sin(u * 0.35 + time * 1.6) * 0.18 + Math.cos(v * 0.35 + time * 1.2) * 0.14;
            pos.setY(j, waveY);
          }
          pos.needsUpdate = true;
        } else if (elem.type === 'fireFlicker') {
          elem.light.intensity = 2.4 + Math.sin(time * 18.0) * 0.6 + (Math.random() - 0.5) * 0.4;
          elem.mesh.scale.setScalar(0.95 + Math.sin(time * 22.0) * 0.12);
        }
      }

      updatePinsProjection();
      renderer.render(scene, camera);
    }

    animFrameId = requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────────────────────────────
     Modal Open / Close Lifecycle
     ───────────────────────────────────────────────────────────── */
  function openModal(residenceId, preferredMode) {
    if (!scene) initScene();
    isModalOpen = true;
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
    }

    loadResidence(residenceId || 'villa1');
    setMode(preferredMode || 'photo');
    onResize();

    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(tick);
  }

  function closeModal() {
    if (modal) {
      isModalOpen = false;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────
     Event Listeners
     ───────────────────────────────────────────────────────────── */
  canvas.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('wheel', handleWheel, { passive: false });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  window.addEventListener('resize', onResize);

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isModalOpen && modal) closeModal();
  });

  if (autoRotateBtn) {
    autoRotateBtn.addEventListener('click', function () {
      isAutoRotate = !isAutoRotate;
      updateAutoRotateUI();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      var data = RESIDENCES[activeResidenceId];
      if (data) {
        orbit.targetDistance = data.camDist;
        orbit.targetPitch = data.camPitch;
        orbit.targetYaw = data.camYaw;
        orbit.targetPanX = 0;
        orbit.targetPanY = 0;
        orbit.targetPanZ = 0;
      }
    });
  }

  // Mode Tabs (Photo vs 3D)
  for (var mb = 0; mb < modeBtns.length; mb++) {
    modeBtns[mb].addEventListener('click', function () {
      setMode(this.dataset.mode || this.dataset.targetMode);
    });
  }

  // "Step Inside 3D View" button on photo overlay
  if (stepInto3dBtn) {
    stepInto3dBtn.addEventListener('click', function () {
      setMode('3d');
    });
  }

  // Residence Nav Buttons
  for (var nb = 0; nb < navBtns.length; nb++) {
    navBtns[nb].addEventListener('click', function () {
      loadResidence(this.dataset.residence);
    });
  }

  // Solar Lighting Buttons
  for (var sb = 0; sb < solarBtns.length; sb++) {
    solarBtns[sb].addEventListener('click', function () {
      applySolarLighting(this.dataset.solar);
    });
  }

  // Level Buttons (Villa 02)
  for (var lb = 0; lb < levelBtns.length; lb++) {
    levelBtns[lb].addEventListener('click', function () {
      setLevelMode(this.dataset.inspectLevel);
    });
  }

  // Inquire CTA in modal
  if (inquireBtn) {
    inquireBtn.addEventListener('click', function () {
      var data = RESIDENCES[activeResidenceId];
      closeModal();
      var formInterest = document.getElementById('f-interest');
      if (formInterest && data) {
        formInterest.value = 'Private Viewing — ' + data.title;
      }
      var enquireSec = document.getElementById('enquire');
      if (enquireSec) {
        enquireSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Wire up property cards:
  // Direct investors cleanly to their dedicated separate residence page layouts!
  document.addEventListener('click', function (e) {
    var inspectBtn = e.target.closest('.inspect-property-btn');
    if (inspectBtn) {
      var view = inspectBtn.dataset.inspectView || inspectBtn.dataset.inspectResidence || 'villa1';
      var pageMap = {
        villa1: 'villa-01.html?mode=3d',
        villa2: 'villa-02.html?mode=3d',
        compound: 'compound.html?mode=3d',
        spa: 'garden-sanctuary.html?mode=3d'
      };
      if (modal && modal.contains(inspectBtn)) {
        e.preventDefault();
        e.stopPropagation();
        openModal(view, '3d');
        return;
      }
      if (pageMap[view]) {
        window.location.href = pageMap[view];
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      openModal(view, '3d');
      return;
    }

    var cardImg = e.target.closest('.residence-image');
    var cardTitle = e.target.closest('.residence-card-heading');
    if (cardImg || cardTitle) {
      var card = (cardImg || cardTitle).closest('.residence-card');
      if (card && (!modal || !modal.contains(card))) {
        var btnInCard = card.querySelector('.inspect-property-btn');
        var rView = btnInCard ? (btnInCard.dataset.inspectView || btnInCard.dataset.inspectResidence) : 'villa1';
        var pageMap2 = {
          villa1: 'villa-01.html',
          villa2: 'villa-02.html',
          compound: 'compound.html',
          spa: 'garden-sanctuary.html'
        };
        if (pageMap2[rView]) {
          window.location.href = pageMap2[rView];
          return;
        }
        openModal(rView, 'photo');
      }
    }
  });

  // Auto-run if on standalone residence page
  if (isStandalone) {
    var params = new URLSearchParams(window.location.search);
    var targetId = params.get('id') || (window.location.hash ? window.location.hash.replace('#', '') : null) || window.RESIDENCE_ID || 'villa1';
    var targetMode = params.get('mode') === '3d' ? '3d' : 'photo';
    openModal(targetId, targetMode);
  }

  // Expose globally
  window.residenceInspector = {
    open: openModal,
    close: closeModal,
    load: loadResidence,
    mode: setMode,
    solar: applySolarLighting,
    level: setLevelMode
  };

})();
