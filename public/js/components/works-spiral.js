/* Our Works hero: spiral 3D slider + neon mesh background.
   Needs /js/vendor/three-r128.min.js loaded first. Markup lives in views/our-works.ejs (#works-spiral). */
(function () {
  "use strict";
  if (!document.getElementById("works-spiral")) return;

  var WS_SLIDES = [
    {
      "src": "/images/works/super-chennai.webp",
      "alt": "Super Chennai",
      "label": "Super Chennai"
    },
    {
      "src": "/images/works/cha.webp",
      "alt": "Cha",
      "label": "Cha"
    },
    {
      "src": "/images/works/decorgeous.webp",
      "alt": "Decorgeous",
      "label": "Decorgeous"
    },
    {
      "src": "/images/works/naturals.webp",
      "alt": "Naturals",
      "label": "Naturals"
    },
    {
      "src": "/images/works/kkix.webp",
      "alt": "KKIX",
      "label": "KKIX"
    },
    {
      "src": "/images/works/bbcl.webp",
      "alt": "BBCL",
      "label": "BBCL"
    },
    {
      "src": "/images/works/soft-serve-co.webp",
      "alt": "Soft Serve Co.",
      "label": "Soft Serve Co."
    },
    {
      "src": "/images/works/dr-b.webp",
      "alt": "Dr B",
      "label": "Dr B"
    },
    {
      "src": "/images/works/ssbd.webp",
      "alt": "SSBD",
      "label": "SSBD"
    },
    {
      "src": "/images/works/reboot.webp",
      "alt": "Reboot",
      "label": "Reboot"
    },
    {
      "src": "/images/works/k-resort.webp",
      "alt": "K Resort",
      "label": "K Resort"
    },
    {
      "src": "/images/works/everealth.webp",
      "alt": "Everealth",
      "label": "Everealth"
    },
    {
      "src": "/images/works/chaitanya.webp",
      "alt": "Chaitanya",
      "label": "Chaitanya"
    },
    {
      "src": "/images/works/sui-circle.webp",
      "alt": "SUI Circle",
      "label": "SUI Circle"
    },
    {
      "src": "/images/works/dra.webp",
      "alt": "DRA",
      "label": "DRA"
    },
    {
      "src": "/images/works/kala-ki-jodi.webp",
      "alt": "Kala ki Jodi",
      "label": "Kala ki Jodi"
    }
  ];

  var sr = document.getElementById("ws-srList");
  if (sr) sr.innerHTML = WS_SLIDES.map(function (s) { return "<li>" + s.alt + "</li>"; }).join("");

(() => {
  "use strict";
  /* ======================================================================
     Kinetic neon mesh background (ported from NeonMesh) — dark-mode only,
     faint warm lines, soft yellow highlight near the cursor.
     ====================================================================== */
  const MESH = {
    spacing: 42,            // px between nodes (wider on phones)
    lineAlphaScale: 0.055,  // base line opacity (was 0.25 — much quieter now)
    lineAlphaMax: 0.14,
    baseRGB: "255,222,110", // warm tint for idle lines
    hotRGB: "255,214,10",   // yellow highlight (matches the hover pill)
    hotRadius: 150,         // px around the cursor that lights up
    pushForce: 14,          // how hard the cursor pushes the mesh (was 22)
    waveAmp: 14             // ambient ripple depth (was 18)
  };

  const stage = document.getElementById("works-spiral");
  const cv = document.getElementById("ws-bg");
  if (!stage || !cv) return;
  const ctx = cv.getContext("2d", { alpha: false });
  if (!ctx) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, points = [], cons = [], time = 0;
  const mouse = { x: -1000, y: -1000, tx: 0.2, ty: 0, ax: 0.2, ay: 0 };

  function build() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const spacing = W < 640 ? 54 : MESH.spacing;
    const cols = Math.ceil((W * 1.15) / spacing) + 1;
    const rows = Math.ceil((H * 1.15) / spacing) + 1;
    const sx = -(cols * spacing) / 2, sy = -(rows * spacing) / 2;
    points = []; cons = [];
    const grid = [];
    for (let j = 0; j < rows; j++) {
      grid[j] = [];
      for (let i = 0; i < cols; i++) {
        const bx = sx + i * spacing, by = sy + j * spacing;
        const p = { x: bx, y: by, z: 0, ox: bx, oy: by, oz: 0, bx, by,
          pinned: i === 0 || j === 0 || i === cols - 1 || j === rows - 1,
          px: 0, py: 0, ps: 1 };
        points.push(p); grid[j][i] = p;
      }
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (i < cols - 1) cons.push({ a: grid[j][i], b: grid[j][i + 1], len: spacing });
      if (j < rows - 1) cons.push({ a: grid[j][i], b: grid[j + 1][i], len: spacing });
    }
    step(); draw();
  }

  /* ---- physics + projection, fixed 60Hz step so it feels identical on any display ---- */
  function step() {
    if (!points.length) return;
    if (!reduce) time += 0.025;
    if (mouse.x < -500 && !reduce) {              // idle: very slow camera drift
      mouse.ty = Math.sin(time * 0.35) * 0.1;
      mouse.tx = 0.2 + Math.cos(time * 0.27) * 0.05;
    }
    mouse.ax += (mouse.tx - mouse.ax) * 0.05;
    mouse.ay += (mouse.ty - mouse.ay) * 0.05;
    const cosX = Math.cos(mouse.ax), sinX = Math.sin(mouse.ax);
    const cosY = Math.cos(mouse.ay), sinY = Math.sin(mouse.ay);

    for (const p of points) {
      if (p.pinned) continue;
      const vx = (p.x - p.ox) * 0.93, vy = (p.y - p.oy) * 0.93, vz = (p.z - p.oz) * 0.93;
      p.ox = p.x; p.oy = p.y; p.oz = p.z;
      p.x += vx; p.y += vy; p.z += vz;
      const amb = reduce ? 0 : Math.sin(p.bx * 0.015 + p.by * 0.015 + time) * MESH.waveAmp;
      p.x += (p.bx - p.x) * 0.04;
      p.y += (p.by - p.y) * 0.04;
      p.z += (amb - p.z) * 0.04;
    }

    const persp = 600, cx = W / 2, cy = H / 2;
    for (const p of points) {
      const rx1 = p.x * cosY + p.z * sinY;
      const rz1 = -p.x * sinY + p.z * cosY;
      const ry2 = p.y * cosX - rz1 * sinX;
      const rz2 = p.y * sinX + rz1 * cosX + 400;
      const s = persp / Math.max(1, rz2);
      p.ps = s; p.px = cx + rx1 * s; p.py = cy + ry2 * s;
      if (!p.pinned) {
        const dx = p.px - mouse.x, dy = p.py - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MESH.hotRadius && d > 0) {
          const f = (1 - d / MESH.hotRadius) * MESH.pushForce;
          p.x += (dx / d) * f / s;
          p.y += (dy / d) * f / s;
          p.z -= (f * 1.5) / s;
        }
      }
    }
    for (let it = 0; it < 4; it++) {
      for (const c of cons) {
        const dx = c.b.x - c.a.x, dy = c.b.y - c.a.y, dz = c.b.z - c.a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const k = (d - c.len) / (d || 1) * 0.5;
        if (!c.a.pinned) { c.a.x += dx * k; c.a.y += dy * k; c.a.z += dz * k; }
        if (!c.b.pinned) { c.b.x -= dx * k; c.b.y -= dy * k; c.b.z -= dz * k; }
      }
    }
  }

  /* ---- drawing: idle lines are batched into a few paths; only lines near the cursor are drawn singly ---- */
  const BUCKETS = 6;
  const buckets = Array.from({ length: BUCKETS }, () => []);
  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    for (const b of buckets) b.length = 0;
    const hot = [];
    const R = MESH.hotRadius;
    for (const c of cons) {
      const mx = (c.a.px + c.b.px) / 2, my = (c.a.py + c.b.py) / 2;
      const d = Math.hypot(mouse.x - mx, mouse.y - my);
      const s = (c.a.ps + c.b.ps) / 2;
      if (d < R) { hot.push(c, 1 - d / R, s); continue; }
      const a = Math.min(MESH.lineAlphaMax, Math.max(0.03, MESH.lineAlphaScale * s));
      const bi = Math.min(BUCKETS - 1, Math.round(((a - 0.03) / (MESH.lineAlphaMax - 0.03)) * (BUCKETS - 1)));
      buckets[bi].push(c);
    }
    ctx.lineWidth = 0.8;
    for (let bi = 0; bi < BUCKETS; bi++) {
      const list = buckets[bi];
      if (!list.length) continue;
      const a = 0.03 + (bi / (BUCKETS - 1)) * (MESH.lineAlphaMax - 0.03);
      ctx.strokeStyle = `rgba(${MESH.baseRGB},${a.toFixed(3)})`;
      ctx.beginPath();
      for (const c of list) { ctx.moveTo(c.a.px, c.a.py); ctx.lineTo(c.b.px, c.b.py); }
      ctx.stroke();
    }
    // soft yellow glow around the cursor — fades out smoothly, never solid
    for (let i = 0; i < hot.length; i += 3) {
      const c = hot[i], k = hot[i + 1], s = hot[i + 2];
      ctx.strokeStyle = `rgba(${MESH.hotRGB},${(0.08 + 0.42 * k * k).toFixed(3)})`;
      ctx.lineWidth = (0.8 + 0.5 * k) * Math.min(s, 1.6);
      ctx.beginPath(); ctx.moveTo(c.a.px, c.a.py); ctx.lineTo(c.b.px, c.b.py); ctx.stroke();
    }
    for (const p of points) {
      const d = Math.hypot(mouse.x - p.px, mouse.y - p.py);
      if (d < 100) {
        const k = 1 - d / 100;
        ctx.fillStyle = `rgba(${MESH.hotRGB},${(0.55 * k).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.px, p.py, 1.6 * p.ps * (0.6 + 0.4 * k), 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* ---- loop (pauses off-screen / hidden tab) ---- */
  const STEP = 1000 / 60;
  let raf = 0, last = 0, acc = 0, vis = true;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    acc += Math.min(now - last, 100); last = now;
    let n = 0;
    while (acc >= STEP && n < 3) { step(); acc -= STEP; n++; }
    if (acc > STEP) acc = STEP;
    if (n) draw();
  }
  const start = () => { if (raf || !vis || document.hidden || !points.length) return; last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  new IntersectionObserver(([e]) => { vis = !!(e && e.isIntersecting); vis ? start() : stop(); }, { threshold: 0.01 }).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new ResizeObserver(() => { build(); start(); }).observe(stage);

  /* ---- cursor (mouse/pen only; touch never triggers highlights) ---- */
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = stage.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    mouse.ty = ((mouse.x / r.width) - 0.5) * 2 * 0.25;          // gentle parallax tilt
    mouse.tx = 0.2 - ((mouse.y / r.height) - 0.5) * 2 * 0.18;
  });
  stage.addEventListener("pointerleave", () => { mouse.x = -1000; mouse.y = -1000; });
})();


(() => {
  "use strict";

  /* ======================================================================
     Spiral3DSlider — settings (same props as the React component)
     ====================================================================== */
  const CFG = {
    autoRotate: true,
    autoSpeed: 0.26,          // slides per second while idle (was 0.13)
    radius: 250,              // max horizontal radius of the spiral (px)
    verticalGap: 78,          // vertical distance between neighbouring cards (px)
    cardWidth: 285,           // max card width (px)  – was 255
    cardAspectRatio: 1,       // thumbnails are square
    scrollSensitivity: 0.0024,
    blurStrength: 1.65,
    bend: 0.17,
    fov: 44,
    hoverScale: 1.08,
    dragPxPerSlideX: 150,     // horizontal drag distance for one slide
    dragPxPerSlideY: 95       // vertical (mouse) drag distance for one slide
  };

  const SLIDES = WS_SLIDES;
  const stage  = document.getElementById("works-spiral");
  const canvas = document.getElementById("ws-gl");
  const labelPos = document.getElementById("ws-labelPos");
  const label = document.getElementById("ws-label");
  if (!SLIDES || !SLIDES.length) return;

  /* Repeat images if there are fewer than 16 (same rule as the component). */
  const COUNT = Math.max(SLIDES.length, 16);
  const sceneItems = Array.from({ length: COUNT }, (_, i) => SLIDES[i % SLIDES.length]);

  /* ---------------------------------------------------------------- shaders */
  const vertexShader = `
    uniform float uBend;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 transformed = position;
      float curve = 1.0 - cos(position.x * 3.14159265);
      transformed.z -= curve * uBend;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }`;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uImageAspect;
    uniform float uPlaneAspect;
    uniform float uBlur;
    varying vec2 vUv;

    vec2 coverUv(vec2 uv) {
      vec2 scale = vec2(1.0);
      if (uImageAspect > uPlaneAspect) { scale.x = uPlaneAspect / uImageAspect; }
      else { scale.y = uImageAspect / uPlaneAspect; }
      return (uv - 0.5) * scale + 0.5;
    }

    void main() {
      vec2 uv = coverUv(vUv);
      vec2 stepSize = vec2(0.0065) * uBlur;
      vec4 color = texture2D(uTexture, uv) * 0.23;
      color += texture2D(uTexture, uv + vec2(stepSize.x, 0.0)) * 0.12;
      color += texture2D(uTexture, uv - vec2(stepSize.x, 0.0)) * 0.12;
      color += texture2D(uTexture, uv + vec2(stepSize.x * 2.0, 0.0)) * 0.06;
      color += texture2D(uTexture, uv - vec2(stepSize.x * 2.0, 0.0)) * 0.06;
      color += texture2D(uTexture, uv + vec2(0.0, stepSize.y)) * 0.12;
      color += texture2D(uTexture, uv - vec2(0.0, stepSize.y)) * 0.12;
      color += texture2D(uTexture, uv + vec2(0.0, stepSize.y * 2.0)) * 0.06;
      color += texture2D(uTexture, uv - vec2(0.0, stepSize.y * 2.0)) * 0.06;
      color += texture2D(uTexture, uv + stepSize) * 0.025;
      color += texture2D(uTexture, uv - stepSize) * 0.025;

      float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      color.rgb = mix(vec3(luminance), color.rgb, 1.18);
      color.rgb = (color.rgb - 0.5) * 1.08 + 0.5;
      float brightness = 1.04 - min(uBlur * 0.025, 0.07);

      // soft rounded corners drawn in the shader (keeps edges crisp at any size)
      vec2 half_ = vec2(uPlaneAspect, 1.0) * 0.5;
      vec2 p = (vUv - 0.5) * vec2(uPlaneAspect, 1.0);
      vec2 q = abs(p) - half_ + 0.06;
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.06;
      float alpha = 1.0 - smoothstep(-0.003, 0.003, d);

      if (alpha < 0.02) discard;   // transparent corner pixels must not write depth
      gl_FragColor = vec4(clamp(color.rgb * brightness, 0.0, 1.0), alpha);
    }`;

  /* ----------------------------------------------------------------- helpers */
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  function wrappedPosition(value, length) {
    const w = ((value % length) + length) % length;
    return w > length / 2 ? w - length : w;
  }
  const finePointerHover = matchMedia("(hover: hover) and (pointer: fine)");
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedQuery.matches;
  reducedQuery.addEventListener && reducedQuery.addEventListener("change", () => (reducedMotion = reducedQuery.matches));

  /* ---------------------------------------------------------------- renderer */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (err) {
    showFallback();
    return;
  }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CFG.fov, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  camera.updateMatrixWorld();

  let W = 1, H = 1, factor = 1, vpW = 1, vpH = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    W = r.width; H = r.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    vpH = 2 * camera.position.z * Math.tan((CFG.fov * Math.PI) / 360); // world height at z = 0
    vpW = vpH * camera.aspect;
    factor = H / vpH;                                                   // px per world unit
    draw();
  }

  /* ---------------------------------------------------------------- textures */
  const loader = new THREE.TextureLoader();
  const textureCache = new Map();
  function loadTexture(src) {
    if (!textureCache.has(src)) {
      textureCache.set(src, new Promise((resolve, reject) => {
        loader.load(src, resolve, undefined, reject);
      }));
    }
    return textureCache.get(src);
  }

  const meshes = [];
  const hover = new Array(COUNT).fill(0);

  Promise.all(sceneItems.map((it) => loadTexture(it.src))).then((textures) => {
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const geometry = new THREE.PlaneGeometry(1, 1, 48, 2);
    const prepared = new Set();
    textures.forEach((t) => {
      if (prepared.has(t)) return;
      prepared.add(t);
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter; // smooth minification, no shimmer
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = Math.min(8, maxAniso);
      t.needsUpdate = true;
    });
    textures.forEach((t, i) => {
      const img = t.image || {};
      const aspect = (img.naturalWidth || img.width || 1) / Math.max(img.naturalHeight || img.height || 1, 1);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: t },
          uImageAspect: { value: aspect },
          uPlaneAspect: { value: CFG.cardAspectRatio },
          uBlur: { value: 0 },
          uBend: { value: 0 }
        },
        vertexShader, fragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: true,
        depthWrite: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);
      meshes[i] = mesh;
    });
    resize();
    stage.classList.add("ready");
    start();
  }).catch(showFallback);

  /* ------------------------------------------------------------------- state */
  const S = {
    target: 0, mid: 0, progress: 0,   // cascaded smoothing → soft start AND soft stop
    vel: 0,                           // flick inertia (slides/s)
    auto: 0,                          // eased auto-rotate speed (slides/s)
    dragging: false,
    lastInteraction: 0, lastWheel: 0,
    hoverIdx: -1, labelIdx: -1
  };
  const pointer = { inside: false, ndc: new THREE.Vector2(), type: "mouse" };
  const raycaster = new THREE.Raycaster();
  const tmp = new THREE.Vector3();

  /* ------------------------------------------------------------------ update */
  function update(dt, now) {
    // ---- auto-rotate (eases in/out, pauses on hover/drag/interaction)
    let want = 0;
    if (CFG.autoRotate && !reducedMotion && !S.dragging && S.hoverIdx < 0 && now - S.lastInteraction > 450) want = CFG.autoSpeed;
    S.auto += (want - S.auto) * (1 - Math.exp(-dt * 2.5));

    if (!S.dragging) {
      S.vel *= Math.exp(-dt * 3);
      if (Math.abs(S.vel) < 0.002) S.vel = 0;
      S.target += (S.vel + S.auto) * dt;
    }

    // ---- two cascaded low-pass stages: no velocity jumps when input changes
    if (reducedMotion) { S.mid = S.target; S.progress = S.target; }
    else {
      const tau = S.dragging ? 0.05 : 0.11;
      const e = 1 - Math.exp(-dt / tau);
      S.mid += (S.target - S.mid) * e;
      S.progress += (S.mid - S.progress) * e;
    }
    if (Math.abs(S.progress) > COUNT * 40) {      // keep numbers small; invisible (positions wrap)
      const k = Math.trunc(S.progress / COUNT) * COUNT;
      S.progress -= k; S.mid -= k; S.target -= k;
    }

    // ---- responsive sizing (same formulas as the component, tuned for narrow screens)
    const aspect = W / H;
    const frac = clamp(0.225 + (1.3 - aspect) * 0.2, 0.225, 0.42);
    const planeWidth = Math.min(CFG.cardWidth / factor, vpW * frac);
    const planeHeight = planeWidth / CFG.cardAspectRatio;
    const spiralRadius = Math.min(CFG.radius / factor, vpW * 0.245);
    const gap = Math.min(CFG.verticalGap / factor, vpH * 0.1);

    for (let i = 0; i < COUNT; i++) {
      const mesh = meshes[i];
      if (!mesh) continue;
      const pos = wrappedPosition(i - S.progress, COUNT);
      const angle = pos * 0.78;
      const depth = (Math.cos(angle) + 1) / 2;
      const distance = Math.min(Math.abs(pos) / (COUNT * 0.43), 1);
      hover[i] += ((i === S.hoverIdx ? 1 : 0) - hover[i]) * (1 - Math.exp(-dt * 10));
      const h = hover[i];
      const sc = (0.74 + depth * 0.26) * (1 + (CFG.hoverScale - 1) * h);

      mesh.position.set(Math.sin(angle) * spiralRadius, -pos * gap, Math.cos(angle) * 2.55);
      mesh.rotation.set(0, Math.sin(angle) * -1.12, 0);
      mesh.scale.set(planeWidth * sc, planeHeight * sc, 1);

      const u = mesh.material.uniforms;
      u.uBlur.value = Math.pow(distance, 1.28) * CFG.blurStrength * (1 - h); // hovered card snaps into focus
      u.uBend.value = planeWidth * CFG.bend;
      u.uPlaneAspect.value = CFG.cardAspectRatio;
    }
    scene.updateMatrixWorld(true);

    // ---- hover picking
    if (pointer.inside && pointer.type !== "touch" && !S.dragging) {
      raycaster.setFromCamera(pointer.ndc, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      S.hoverIdx = hit ? meshes.indexOf(hit.object) : -1;
    } else S.hoverIdx = -1;

    // ---- which card gets the name label
    let idx = -1;
    if (!S.dragging) {
      if (S.hoverIdx >= 0) idx = S.hoverIdx;
      else if (!finePointerHover.matches) {         // touch: label the card facing you
        let best = 1e9;
        for (let i = 0; i < COUNT; i++) {
          const a = Math.abs(wrappedPosition(i - S.progress, COUNT));
          if (a < best) { best = a; idx = i; }
        }
      }
    }
    if (idx >= 0 && meshes[idx]) {
      const m = meshes[idx];
      if (idx !== S.labelIdx) label.textContent = sceneItems[idx].label || sceneItems[idx].alt;
      tmp.set(m.position.x, m.position.y - (m.scale.y * 0.5) * 0.86, m.position.z + 0.2).project(camera);
      const px = clamp((tmp.x * 0.5 + 0.5) * W, 70, W - 70);
      const py = clamp((-tmp.y * 0.5 + 0.5) * H, 40, H - 12);
      labelPos.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
      label.classList.add("show");
    } else label.classList.remove("show");
    S.labelIdx = idx;
  }

  /* -------------------------------------------------------------------- loop */
  let raf = 0, last = 0, visible = true;
  function draw() { renderer.render(scene, camera); }
  function tick(now) {
    const dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now;
    update(dt, now);
    draw();
    raf = requestAnimationFrame(tick);
  }
  function start() { if (raf || !visible || document.hidden || !meshes.length) return; last = performance.now(); raf = requestAnimationFrame(tick); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  new IntersectionObserver(([e]) => { visible = !!(e && e.isIntersecting); visible ? start() : stop(); }, { threshold: 0.02 }).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new ResizeObserver(resize).observe(stage);

  /* ------------------------------------------------------------------- input */
  const bump = () => (S.lastInteraction = performance.now());

  // Mouse wheel over the stage (page keeps scrolling; we never preventDefault vertical wheel)
  stage.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {          // horizontal trackpad swipe
      e.preventDefault();                                    // also blocks browser back-swipe
      bump();
      S.target += clamp(e.deltaX, -160, 160) * CFG.scrollSensitivity;
      return;
    }
    S.lastWheel = performance.now(); S.lastInteraction = S.lastWheel;
    S.target += Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 160) * CFG.scrollSensitivity;
  }, { passive: false });

  // Page scroll while the stage is visible (touch scrolling, scrollbar, keyboard…)
  let prevScroll = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY, d = y - prevScroll;
    prevScroll = y;
    if (visible && performance.now() - S.lastWheel > 80) {
      bump();
      S.target += Math.sign(d) * Math.min(Math.abs(d), 160) * CFG.scrollSensitivity;
    }
  }, { passive: true });

  // Drag / swipe. Touch only claims HORIZONTAL gestures (touch-action: pan-y), so a
  // vertical swipe scrolls the page on to the next section like normal.
  const drag = { active: false, on: false, id: -1, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0 };
  function setNdc(e) {
    const r = stage.getBoundingClientRect();
    pointer.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointer.type = e.pointerType || "mouse";
  }
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setNdc(e);
    Object.assign(drag, { active: true, on: false, id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: e.timeStamp });
  });
  stage.addEventListener("pointermove", (e) => {
    setNdc(e);
    pointer.inside = true;
    if (!drag.active || e.pointerId !== drag.id) return;
    if (!drag.on) {
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      const claim = e.pointerType === "touch" ? Math.abs(dx) >= 6 && Math.abs(dx) > Math.abs(dy) : Math.hypot(dx, dy) >= 5;
      if (!claim) return;
      drag.on = true; S.dragging = true; S.vel = 0;
      stage.dataset.dragging = "true";
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = e.timeStamp;
      bump(); return;
    }
    const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
    const ds = -dx / CFG.dragPxPerSlideX - (e.pointerType === "touch" ? 0 : dy / CFG.dragPxPerSlideY);
    const dtMs = Math.max(e.timeStamp - drag.lt, 1);
    S.target += ds;
    S.vel = S.vel * 0.6 + clamp((ds / dtMs) * 1000, -10, 10) * 0.4;
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = e.timeStamp;
    bump();
  });
  function endDrag(e) {
    if (!drag.active || e.pointerId !== drag.id) return;
    drag.active = false;
    if (!drag.on) return;
    drag.on = false; S.dragging = false;
    if (e.type === "pointercancel" || e.timeStamp - drag.lt > 90) S.vel = 0; // held still → no flick
    delete stage.dataset.dragging;
    try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
    bump();
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", (e) => { if (!drag.on) pointer.inside = false; });

  stage.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") S.target += 1;
    else if (k === "ArrowLeft" || k === "ArrowUp") S.target -= 1;
    else return;
    bump(); e.preventDefault();
  });

  /* ---------------------------------------------------------------- fallback */
  function showFallback() {
    stage.classList.add("ready", "nogl");
    const grid = document.createElement("div");
    grid.className = "ws-fallback";
    SLIDES.forEach((s) => {
      const f = document.createElement("figure");
      const im = new Image(); im.src = s.src; im.alt = s.alt;
      const c = document.createElement("figcaption"); c.textContent = s.label || s.alt;
      f.append(im, c); grid.append(f);
    });
    stage.append(grid);
  }
})();
})();
