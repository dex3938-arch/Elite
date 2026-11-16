/**
 * ELITE — Dedicated 3D Residence Architectural Inspector
 * Provides 4 distinct, custom-built 3D animated architectural scenes:
 * 1. Villa 01 — Lagoon Suite (Overwater single-level with plunge pool & hammock)
 * 2. Villa 02 — Sunset Residence (2-storey duplex with spiral stair & exploded cutaway)
 * 3. Grand Presidential Compound (762m² multi-pavilion with in-pool sunken fire pit)
 * 4. Garden Wellness Sanctuary (Organic biophilic pavilion with stone hydrotherapy pool & zen bamboo garden)
 */
(function () {
  'use strict';

  var modal = document.getElementById('residence-inspect-modal');
  var canvas = document.getElementById('residence-inspect-canvas');
  if (!modal || !canvas || typeof THREE === 'undefined') return;

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
  var navBtns = modal.querySelectorAll('.inspect-nav-btn');
  var solarBtns = modal.querySelectorAll('.solar-btn');
  var levelBtns = modal.querySelectorAll('.inspect-level-btn');

  // Residence Data
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
      features: [
        'Cantilevered weathered Burmese teak sun deck',
        'Floor-to-ceiling frameless sliding glass facade',
        'Sub-floor marine stilts with direct ocean swim ladder',
        'Overwater net hammock suspended above lagoon water',
        'Master king suite with illuminated acoustic wood headboard'
      ],
      camDist: 22,
      camPitch: 0.38,
      camYaw: -0.6
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
      features: [
        'Two-storey contemporary modernist duplex structure',
        'Cantilevered upper master penthouse with glass balustrade',
        'Exterior architectural spiral staircase connecting levels',
        'Artisan stone soaking plunge tub on upper sunset terrace',
        'Full interactive floor-by-floor spatial cutaway inspection'
      ],
      camDist: 26,
      camPitch: 0.42,
      camYaw: 0.75
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
      features: [
        'Triple-pavilion estate: Grand Hall, West Master & East VIP wings',
        'Central in-pool sunken fire pit lounge with dancing ember glow',
        'Covered timber-slat breezeway colonnades linking all wings',
        'Private beach parcel with 4 luxury cabanas & dining pergola',
        'Private deep-water yacht pier & private helicopter arrival option'
      ],
      camDist: 38,
      camPitch: 0.52,
      camYaw: 0.45
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
      features: [
        'Organic Japanese-Nordic biophilic architecture with timber eaves',
        'Hand-carved organic stone hydrotherapy plunge & mirror pond',
        'Open-air yoga & meditation pavilion with tatami mats & tea table',
        'Stepping-stone flagstone pathway with glowing Japanese stone lanterns',
        'Surrounding botanical bamboo grove & tropical frangipani bonsai'
      ],
      camDist: 24,
      camPitch: 0.45,
      camYaw: -0.4
    }
  };

  // State
  var activeResidenceId = 'villa1';
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

  // Material Library
  var mats = {};
  function initMaterials() {
    mats.waterOcean = new THREE.MeshPhysicalMaterial({
      color: 0x165b6d,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.75,
      opacity: 0.88,
      transparent: true,
      reflectivity: 0.9
    });
    mats.waterPool = new THREE.MeshPhysicalMaterial({
      color: 0x3ac4d6,
      roughness: 0.05,
      metalness: 0.15,
      transmission: 0.8,
      opacity: 0.92,
      transparent: true
    });
    mats.waterDark = new THREE.MeshPhysicalMaterial({
      color: 0x112830,
      roughness: 0.03,
      metalness: 0.2,
      transmission: 0.5,
      opacity: 0.95,
      transparent: true
    });
    mats.teakDeck = new THREE.MeshStandardMaterial({
      color: 0x6e4e39,
      roughness: 0.65,
      metalness: 0.05
    });
    mats.darkTimber = new THREE.MeshStandardMaterial({
      color: 0x2e231c,
      roughness: 0.55,
      metalness: 0.05
    });
    mats.lightWood = new THREE.MeshStandardMaterial({
      color: 0xc8a882,
      roughness: 0.5,
      metalness: 0.02
    });
    mats.concretePlinth = new THREE.MeshStandardMaterial({
      color: 0xd6cfc7,
      roughness: 0.85,
      metalness: 0.05
    });
    mats.darkBasalt = new THREE.MeshStandardMaterial({
      color: 0x222426,
      roughness: 0.7,
      metalness: 0.1
    });
    mats.glass = new THREE.MeshPhysicalMaterial({
      color: 0xdff5fa,
      roughness: 0.02,
      metalness: 0.1,
      transmission: 0.92,
      opacity: 0.35,
      transparent: true,
      reflectivity: 0.95
    });
    mats.whiteFabric = new THREE.MeshStandardMaterial({
      color: 0xf5f3ee,
      roughness: 0.9,
      metalness: 0.0
    });
    mats.goldAccent = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8
    });
    mats.sand = new THREE.MeshStandardMaterial({
      color: 0xe5d8c3,
      roughness: 0.95,
      metalness: 0.0
    });
    mats.foliageGreen = new THREE.MeshStandardMaterial({
      color: 0x2e5c38,
      roughness: 0.8,
      metalness: 0.0
    });
    mats.fireEmber = new THREE.MeshBasicMaterial({
      color: 0xff6a00
    });
    mats.lanternGlow = new THREE.MeshBasicMaterial({
      color: 0xffd175
    });
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1114);

    camera = new THREE.PerspectiveCamera(42, 1, 0.5, 300);
    camera.position.set(0, 10, 25);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    initMaterials();

    // Lighting setup
    lights.ambient = new THREE.AmbientLight(0xfff6ea, 0.85);
    scene.add(lights.ambient);

    lights.sun = new THREE.DirectionalLight(0xfff8e8, 1.6);
    lights.sun.position.set(30, 45, 25);
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

    lights.fill = new THREE.DirectionalLight(0x7fb8d8, 0.4);
    lights.fill.position.set(-25, 20, -25);
    scene.add(lights.fill);

    // Warm Interior Point Light
    lights.interior = new THREE.PointLight(0xffb766, 1.8, 30, 1.2);
    lights.interior.position.set(0, 3, 0);
    scene.add(lights.interior);

    scene.add(residenceRoot);
  }

  /* ─────────────────────────────────────────────────────────────
     RESIDENCE 1: Villa 01 — Lagoon Suite
     Overwater cantilevered suite on stilts, plunge pool, hammock
     ───────────────────────────────────────────────────────────── */
  function buildVilla1() {
    var group = new THREE.Group();
    cutawayRefs.upperGroup = null;
    cutawayRefs.roofGroup = null;

    // Ocean Water Surface
    var oceanGeo = new THREE.PlaneGeometry(70, 70, 32, 32);
    oceanGeo.rotateX(-Math.PI / 2);
    var ocean = new THREE.Mesh(oceanGeo, mats.waterOcean);
    ocean.position.y = -2.2;
    ocean.receiveShadow = true;
    group.add(ocean);
    animatedElements.push({ type: 'oceanWave', mesh: ocean, baseGeo: oceanGeo.clone() });

    // Timber Sub-piles (16 stilts)
    var stiltGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.2, 8);
    for (var ix = -3; ix <= 3; ix += 2) {
      for (var iz = -2; iz <= 2; iz += 1.3) {
        var stilt = new THREE.Mesh(stiltGeo, mats.darkBasalt);
        stilt.position.set(ix * 2.3, -0.6, iz * 2.5);
        stilt.castShadow = true;
        group.add(stilt);
      }
    }

    // Main Teak Deck Platform (15m x 11m)
    var deckGeo = new THREE.BoxGeometry(15, 0.4, 11);
    var deck = new THREE.Mesh(deckGeo, mats.teakDeck);
    deck.position.set(0, 1.0, 0);
    deck.receiveShadow = true;
    deck.castShadow = true;
    group.add(deck);

    // Private Plunge Pool (Carved in deck)
    var poolOuterGeo = new THREE.BoxGeometry(6.4, 0.8, 3.4);
    var poolOuter = new THREE.Mesh(poolOuterGeo, mats.concretePlinth);
    poolOuter.position.set(3.8, 1.05, 2.8);
    poolOuter.castShadow = true;
    group.add(poolOuter);

    var poolWaterGeo = new THREE.PlaneGeometry(6.0, 3.0);
    poolWaterGeo.rotateX(-Math.PI / 2);
    var poolWater = new THREE.Mesh(poolWaterGeo, mats.waterPool);
    poolWater.position.set(3.8, 1.35, 2.8);
    group.add(poolWater);
    animatedElements.push({ type: 'poolRipple', mesh: poolWater, speed: 2.2 });

    // Overwater Net Hammock
    var hammockFrameGeo = new THREE.BoxGeometry(3.2, 0.12, 2.4);
    var hammockFrame = new THREE.Mesh(hammockFrameGeo, mats.darkBasalt);
    hammockFrame.position.set(-5.5, 0.9, 3.5);
    group.add(hammockFrame);

    var hammockMeshGeo = new THREE.PlaneGeometry(2.9, 2.1);
    hammockMeshGeo.rotateX(-Math.PI / 2);
    var hammockNet = new THREE.Mesh(hammockMeshGeo, mats.whiteFabric);
    hammockNet.position.set(-5.5, 0.92, 3.5);
    group.add(hammockNet);

    // 2 Luxury Sun Loungers & Cocktail Table
    for (var l = -1; l <= 1; l += 2) {
      var loungerBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 2.2), mats.teakDeck);
      loungerBase.position.set(l * 1.3 - 1.2, 1.3, 3.0);
      loungerBase.castShadow = true;
      group.add(loungerBase);

      var loungerCushion = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 2.1), mats.whiteFabric);
      loungerCushion.position.set(l * 1.3 - 1.2, 1.48, 3.0);
      group.add(loungerCushion);
    }

    // Swim Ladder (Descending to ocean)
    var ladderRailGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8);
    var railL = new THREE.Mesh(ladderRailGeo, mats.goldAccent);
    railL.position.set(7.5, 0.0, 2.2);
    var railR = new THREE.Mesh(ladderRailGeo, mats.goldAccent);
    railR.position.set(7.5, 0.0, 3.2);
    group.add(railL); group.add(railR);
    for (var r = 0; r < 4; r++) {
      var rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), mats.goldAccent);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(7.5, 0.8 - r * 0.45, 2.7);
      group.add(rung);
    }

    // Villa Enclosure (Back and side solid timber walls, front glass)
    var backWall = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 0.3), mats.darkTimber);
    backWall.position.set(-1.2, 2.8, -4.5);
    backWall.castShadow = true;
    group.add(backWall);

    var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 7.5), mats.darkTimber);
    leftWall.position.set(-6.7, 2.8, -0.75);
    leftWall.castShadow = true;
    group.add(leftWall);

    // Front Sliding Glass Panels
    var frontGlass = new THREE.Mesh(new THREE.BoxGeometry(11, 3.0, 0.1), mats.glass);
    frontGlass.position.set(-1.2, 2.7, 1.2);
    group.add(frontGlass);

    // Floating Cantilever Roof
    var roofGeo = new THREE.BoxGeometry(13.5, 0.35, 9.5);
    var roof = new THREE.Mesh(roofGeo, mats.darkBasalt);
    roof.position.set(-1.0, 4.45, -0.6);
    roof.castShadow = true;
    group.add(roof);

    // Master Bedroom Interior Furnishings
    var bedBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 2.8), mats.darkTimber);
    bedBase.position.set(-2.0, 1.4, -2.2);
    bedBase.castShadow = true;
    group.add(bedBase);

    var mattress = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 2.5), mats.whiteFabric);
    mattress.position.set(-2.0, 1.75, -2.1);
    group.add(mattress);

    var headboard = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.4, 0.15), mats.lightWood);
    headboard.position.set(-2.0, 2.2, -3.5);
    group.add(headboard);

    // Interior Warm Glow Lamp
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
    var oceanGeo = new THREE.PlaneGeometry(80, 80);
    oceanGeo.rotateX(-Math.PI / 2);
    var ocean = new THREE.Mesh(oceanGeo, mats.waterOcean);
    ocean.position.y = -2.0;
    ocean.receiveShadow = true;
    group.add(ocean);
    animatedElements.push({ type: 'oceanWave', mesh: ocean, baseGeo: oceanGeo.clone() });

    // Ground Concrete Plinth
    var plinth = new THREE.Mesh(new THREE.BoxGeometry(18, 0.6, 14), mats.concretePlinth);
    plinth.position.set(0, 0.3, 0);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    group.add(plinth);

    // Ground Lap Pool (12m x 3.6m)
    var poolOuter = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.6, 4.0), mats.darkBasalt);
    poolOuter.position.set(1.5, 0.45, 4.5);
    group.add(poolOuter);

    var poolWater = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 3.6).rotateX(-Math.PI / 2), mats.waterPool);
    poolWater.position.set(1.5, 0.72, 4.5);
    group.add(poolWater);
    animatedElements.push({ type: 'poolRipple', mesh: poolWater, speed: 2.5 });

    // Ground Floor Living Pavilion
    var gFloorWalls = new THREE.Mesh(new THREE.BoxGeometry(12, 3.2, 8), mats.darkTimber);
    gFloorWalls.position.set(-2, 2.2, -2);
    gFloorWalls.castShadow = true;
    group.add(gFloorWalls);

    var gFloorGlass = new THREE.Mesh(new THREE.BoxGeometry(10, 3.0, 0.1), mats.glass);
    gFloorGlass.position.set(-2, 2.1, 2.05);
    group.add(gFloorGlass);

    // Poolside Sunken Modular Lounge
    var loungeSofa = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.45, 2.2), mats.whiteFabric);
    loungeSofa.position.set(-5.5, 0.8, 3.5);
    group.add(loungeSofa);

    var fireTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.0), mats.darkBasalt);
    fireTable.position.set(-5.5, 0.8, 1.8);
    group.add(fireTable);

    // Exterior Architectural Spiral Staircase
    var stairPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.4, 12), mats.darkBasalt);
    stairPillar.position.set(4.8, 2.4, 1.8);
    group.add(stairPillar);
    for (var s = 0; s < 12; s++) {
      var step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.35), mats.teakDeck);
      var angle = s * 0.48;
      step.position.set(4.8 + Math.cos(angle) * 0.55, 0.6 + s * 0.3, 1.8 + Math.sin(angle) * 0.55);
      step.rotation.y = -angle;
      step.castShadow = true;
      group.add(step);
    }

    // UPPER LEVEL GROUP (For exploded cutaway & level switching)
    var upperGroup = new THREE.Group();
    upperGroup.position.set(0, 0, 0);

    // Cantilevered Upper Floor Slab (Projects 3m toward ocean)
    var upperSlab = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 10), mats.concretePlinth);
    upperSlab.position.set(-1.0, 4.0, 0.5);
    upperSlab.castShadow = true;
    upperGroup.add(upperSlab);

    // Upper Master Penthouse Suite Walls
    var upperWalls = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.0, 6.5), mats.lightWood);
    upperWalls.position.set(-2.8, 5.7, -0.8);
    upperWalls.castShadow = true;
    upperGroup.add(upperWalls);

    // Upper Glass Balustrade (Balcony)
    var upperGlass = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.1, 0.08), mats.glass);
    upperGlass.position.set(-1.0, 4.75, 5.3);
    upperGroup.add(upperGlass);

    // Upper Balcony Artisan Stone Soaking Plunge Tub
    var tubOuter = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.95, 0.9, 16), mats.darkBasalt);
    tubOuter.position.set(4.2, 4.65, 3.6);
    tubOuter.castShadow = true;
    upperGroup.add(tubOuter);

    var tubWater = new THREE.Mesh(new THREE.CircleGeometry(0.95, 16).rotateX(-Math.PI / 2), mats.waterPool);
    tubWater.position.set(4.2, 5.0, 3.6);
    upperGroup.add(tubWater);

    // Upper Master Bed
    var upBed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 2.4), mats.whiteFabric);
    upBed.position.set(-3.5, 4.5, -0.6);
    upperGroup.add(upBed);

    group.add(upperGroup);
    cutawayRefs.upperGroup = upperGroup;

    // ROOF GROUP (Separately lifts higher during cutaway)
    var roofGroup = new THREE.Group();
    var upperRoof = new THREE.Mesh(new THREE.BoxGeometry(15, 0.35, 11), mats.darkBasalt);
    upperRoof.position.set(-1.0, 7.35, 0.5);
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
    var beach = new THREE.Mesh(new THREE.BoxGeometry(42, 0.8, 34), mats.sand);
    beach.position.set(0, -0.4, 0);
    beach.receiveShadow = true;
    group.add(beach);

    // Ocean Water Edge (South side)
    var ocean = new THREE.Mesh(new THREE.PlaneGeometry(60, 24).rotateX(-Math.PI / 2), mats.waterOcean);
    ocean.position.set(0, -0.3, 16);
    ocean.receiveShadow = true;
    group.add(ocean);
    animatedElements.push({ type: 'oceanWave', mesh: ocean, baseGeo: ocean.geometry.clone() });

    // Enormous Central Infinity Pool (25m x 8m)
    var poolOuter = new THREE.Mesh(new THREE.BoxGeometry(25, 0.6, 8.5), mats.darkBasalt);
    poolOuter.position.set(0, 0.15, 3.5);
    group.add(poolOuter);

    var poolWater = new THREE.Mesh(new THREE.PlaneGeometry(24.2, 7.8).rotateX(-Math.PI / 2), mats.waterPool);
    poolWater.position.set(0, 0.42, 3.5);
    group.add(poolWater);
    animatedElements.push({ type: 'poolRipple', mesh: poolWater, speed: 2.8 });

    // CENTERPIECE: In-Pool Sunken Fire Pit Lounge
    var pitOuter = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.9, 24), mats.concretePlinth);
    pitOuter.position.set(0, 0.2, 3.5);
    group.add(pitOuter);

    var pitBench = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.35, 8, 24).rotateX(Math.PI / 2), mats.whiteFabric);
    pitBench.position.set(0, 0.4, 3.5);
    group.add(pitBench);

    // Granite Fire Table with Dancing Embers
    var fireTable = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), mats.darkBasalt);
    fireTable.position.set(0, 0.35, 3.5);
    group.add(fireTable);

    var emberMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), mats.fireEmber);
    emberMesh.position.set(0, 0.72, 3.5);
    group.add(emberMesh);

    var fireLight = new THREE.PointLight(0xff5500, 3.0, 16, 1.5);
    fireLight.position.set(0, 1.1, 3.5);
    group.add(fireLight);
    animatedElements.push({ type: 'fireFlicker', light: fireLight, mesh: emberMesh });

    // 1. Central Great Hall Pavilion (Cathedral Double Height)
    var mainPavilion = new THREE.Mesh(new THREE.BoxGeometry(14, 4.8, 9), mats.darkTimber);
    mainPavilion.position.set(0, 2.4, -6.5);
    mainPavilion.castShadow = true;
    group.add(mainPavilion);

    // Vaulted Pitched Roof
    var pitchedRoofGeo = new THREE.ConeGeometry(10.5, 2.6, 4).rotateY(Math.PI / 4);
    var mainRoof = new THREE.Mesh(pitchedRoofGeo, mats.darkBasalt);
    mainRoof.position.set(0, 5.8, -6.5);
    mainRoof.scale.set(1.1, 1, 0.75);
    mainRoof.castShadow = true;
    group.add(mainRoof);

    // 2. West Master Presidential Wing
    var westWing = new THREE.Mesh(new THREE.BoxGeometry(9, 3.4, 8), mats.lightWood);
    westWing.position.set(-14, 1.7, -4);
    westWing.castShadow = true;
    group.add(westWing);
    var westRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 9), mats.darkBasalt);
    westRoof.position.set(-14, 3.5, -4);
    group.add(westRoof);

    // 3. East VIP Guest Wing
    var eastWing = new THREE.Mesh(new THREE.BoxGeometry(9, 3.4, 8), mats.lightWood);
    eastWing.position.set(14, 1.7, -4);
    eastWing.castShadow = true;
    group.add(eastWing);
    var eastRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 9), mats.darkBasalt);
    eastRoof.position.set(14, 3.5, -4);
    group.add(eastRoof);

    // Covered Breezeway Colonnades
    var colonnadeW = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.2, 2.4), mats.darkBasalt);
    colonnadeW.position.set(-7.5, 3.2, -5.5);
    group.add(colonnadeW);
    var colonnadeE = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.2, 2.4), mats.darkBasalt);
    colonnadeE.position.set(7.5, 3.2, -5.5);
    group.add(colonnadeE);

    // 4 Beachfront Cabanas
    for (var c = -2; c <= 2; c++) {
      if (c === 0) continue;
      var cabanaBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 2.4), mats.teakDeck);
      cabanaBase.position.set(c * 5.5, 0.2, 9.5);
      group.add(cabanaBase);

      var cabanaRoof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 2.5), mats.whiteFabric);
      cabanaRoof.position.set(c * 5.5, 2.1, 9.5);
      group.add(cabanaRoof);
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

    // Lush Garden Ground Base (Deep forest grass & gravel)
    var gardenBase = new THREE.Mesh(new THREE.BoxGeometry(26, 0.6, 22), mats.sand);
    gardenBase.position.set(0, 0, 0);
    gardenBase.receiveShadow = true;
    group.add(gardenBase);

    // Stone Stepping-Stone Pathway
    for (var st = -4; st <= 4; st++) {
      var stepStone = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.12, 7), mats.darkBasalt);
      stepStone.position.set(Math.sin(st * 0.8) * 1.5, 0.35, st * 2.2);
      stepStone.rotation.y = st * 0.4;
      group.add(stepStone);
    }

    // Carved River-Stone Hydrotherapy Plunge Bath
    var hydroOuter = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.2, 0.9, 14), mats.darkBasalt);
    hydroOuter.position.set(5.5, 0.45, 2.5);
    hydroOuter.castShadow = true;
    group.add(hydroOuter);

    var hydroWater = new THREE.Mesh(new THREE.CircleGeometry(2.2, 14).rotateX(-Math.PI / 2), mats.waterPool);
    hydroWater.position.set(5.5, 0.82, 2.5);
    group.add(hydroWater);
    animatedElements.push({ type: 'poolRipple', mesh: hydroWater, speed: 2.0 });

    // Mirror-Flat Dark Reflection Pond
    var pond = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 4.5).rotateX(-Math.PI / 2), mats.waterDark);
    pond.position.set(-5.5, 0.32, 3.2);
    group.add(pond);

    // Main Open-Air Yoga & Meditation Pavilion
    var deck = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 9), mats.teakDeck);
    deck.position.set(-0.5, 0.45, -3.5);
    deck.receiveShadow = true;
    group.add(deck);

    // Timber Pergola Posts & Slats
    for (var px = -5.0; px <= 4.0; px += 4.5) {
      for (var pz = -7.5; pz <= 0.5; pz += 4.0) {
        var post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8), mats.darkTimber);
        post.position.set(px, 1.9, pz);
        post.castShadow = true;
        group.add(post);
      }
    }

    // Slatted Eaves Roof Overhang
    var pergolaRoof = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.25, 10.5), mats.darkBasalt);
    pergolaRoof.position.set(-0.5, 3.5, -3.5);
    pergolaRoof.castShadow = true;
    group.add(pergolaRoof);

    // Tatami Mats & Low Tea Table
    var tatami = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 4.0), mats.lightWood);
    tatami.position.set(-0.5, 0.68, -3.5);
    group.add(tatami);

    var teaTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.9), mats.darkTimber);
    teaTable.position.set(-0.5, 0.85, -3.5);
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
      var lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.7, 6), mats.darkBasalt);
      lanternBase.position.set(coord.x, 0.6, coord.z);
      group.add(lanternBase);

      var lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.35, 4).rotateY(Math.PI / 4), mats.darkBasalt);
      lanternCap.position.set(coord.x, 1.25, coord.z);
      group.add(lanternCap);

      var lanternCore = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), mats.lanternGlow);
      lanternCore.position.set(coord.x, 0.98, coord.z);
      group.add(lanternCore);

      var lanternLight = new THREE.PointLight(0xffbe6b, 1.2, 8, 2);
      lanternLight.position.set(coord.x, 1.0, coord.z);
      group.add(lanternLight);
    }

    // Lush Tropical Bamboo Clusters & Boulders
    var bambooGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.5, 6);
    for (var b = 0; b < 18; b++) {
      var bamboo = new THREE.Mesh(bambooGeo, mats.foliageGreen);
      var bx = -9 + (b % 6) * 0.7 + (Math.random() - 0.5) * 0.4;
      var bz = -6 + Math.floor(b / 6) * 1.5 + (Math.random() - 0.5) * 0.4;
      bamboo.position.set(bx, 2.2, bz);
      bamboo.rotation.z = (Math.random() - 0.5) * 0.1;
      group.add(bamboo);
    }

    // Volcanic Boulder Rocks
    var boulderGeo = new THREE.DodecahedronGeometry(1.1, 1);
    var b1 = new THREE.Mesh(boulderGeo, mats.darkBasalt);
    b1.position.set(8.5, 0.5, -4);
    group.add(b1);
    var b2 = new THREE.Mesh(boulderGeo, mats.darkBasalt);
    b2.position.set(-8.0, 0.4, 6.5);
    b2.scale.set(0.7, 0.7, 0.7);
    group.add(b2);

    lights.interior.position.set(-0.5, 2.2, -3.5);
    lights.interior.color.setHex(0xffbe68);
    lights.interior.intensity = 2.0;

    return group;
  }

  // Load and swap residence model
  function loadResidence(resId) {
    if (!RESIDENCES[resId]) resId = 'villa1';
    activeResidenceId = resId;
    var data = RESIDENCES[resId];

    // Clear previous children and animations
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

    // Toggle Level controls visibility (Villa 02 has 2 floors)
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

    // Camera preset
    orbit.targetDistance = data.camDist;
    orbit.targetPitch = data.camPitch;
    orbit.targetYaw = data.camYaw;
    orbit.targetPanX = 0;
    orbit.targetPanY = 0;
    orbit.targetPanZ = 0;

    applySolarLighting(solarPhase);
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
      lights.ambient.color.setHex(0xffffff);
      lights.ambient.intensity = 0.95;
      lights.sun.color.setHex(0xfff8ee);
      lights.sun.intensity = 1.7;
      lights.sun.position.set(30, 45, 25);
      lights.fill.color.setHex(0x90c8e8);
      lights.fill.intensity = 0.5;
      lights.interior.intensity = 1.2;
    } else if (phase === 'sunset') {
      scene.background.setHex(0x281920);
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
      targetRoofY = 6.2;
      targetUpperY = 3.2;
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
     Interactive Pointer & Orbit Mechanics
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
      // Rotate
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
     Render Loop
     ───────────────────────────────────────────────────────────── */
  function onResize() {
    if (!renderer || !canvas) return;
    var w = canvas.parentElement.clientWidth || window.innerWidth;
    var h = canvas.parentElement.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function tick(timestamp) {
    if (!isModalOpen) return;
    var time = timestamp * 0.001;

    // Smooth Orbit Inertia
    if (isAutoRotate) {
      orbit.targetYaw += 0.0025;
    }
    orbit.yaw += (orbit.targetYaw - orbit.yaw) * 0.08;
    orbit.pitch += (orbit.targetPitch - orbit.pitch) * 0.08;
    orbit.distance += (orbit.targetDistance - orbit.distance) * 0.08;
    orbit.panX += (orbit.targetPanX - orbit.panX) * 0.08;
    orbit.panY += (orbit.targetPanY - orbit.panY) * 0.08;
    orbit.panZ += (orbit.targetPanZ - orbit.panZ) * 0.08;

    // Position Camera via Spherical Coordinates
    var cy = Math.sin(orbit.pitch) * orbit.distance;
    var horiz = Math.cos(orbit.pitch) * orbit.distance;
    var cx = Math.sin(orbit.yaw) * horiz;
    var cz = Math.cos(orbit.yaw) * horiz;

    camera.position.set(cx + orbit.panX, cy + orbit.panY, cz + orbit.panZ);
    camera.lookAt(orbit.panX, orbit.panY + 1.2, orbit.panZ);

    // Update dynamic animations (water caustics, wave ripples, fire flickers)
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

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────────────────────────────
     Modal Open / Close Lifecycle
     ───────────────────────────────────────────────────────────── */
  function openModal(residenceId) {
    if (!scene) initScene();
    isModalOpen = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');

    onResize();
    loadResidence(residenceId || 'villa1');

    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(tick);
  }

  function closeModal() {
    isModalOpen = false;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
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
    if (e.key === 'Escape' && isModalOpen) closeModal();
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

  // Wire up all property card "Inspect in 3D" buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.inspect-property-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      var view = btn.dataset.inspectView || btn.dataset.inspectResidence || 'villa1';
      openModal(view);
    }
  });

  // Expose globally for scripting or console testing
  window.residenceInspector = {
    open: openModal,
    close: closeModal,
    load: loadResidence,
    solar: applySolarLighting,
    level: setLevelMode
  };

})();
