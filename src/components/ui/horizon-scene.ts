/*
  Escena three.js del hero — parteix del component "Horizon Hero Section" de 21st.dev
  (https://21st.dev/@lovesickfromthe6ix/components/horizon-hero-section): estrelles amb
  shader, carenes en capes, bloom i càmera guiada pel scroll.
  Ampliada per a aquest portfolio: la càmera recorre una vall de la Serra de Tramuntana
  entre capes que s'obren als costats, amb pins a les carenes, bancs de boira que travessa,
  espurnes en primer pla i els llums d'un poble al fons. Així el moviment es nota a cada tram.
*/
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface HorizonScene {
  /** progrés del scroll del hero, de 0 a 1 */
  setProgress: (p: number) => void;
  setActive: (active: boolean) => void;
  resize: () => void;
  dispose: () => void;
}

// Generador pseudoaleatori amb llavor: l'escena surt sempre igual
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const FOG = 0x45567a;

/* Carenes, de la més propera a la més llunyana. `valley` és la meitat de l'amplada
   de la vall central per on passa la càmera (0 = carena sencera). */
type Profile = "rounded" | "cliff" | "jagged" | "mesa";
const RIDGES: { z: number; valley: number; height: number; base: number; color: number; seed: number; profile: Profile }[] = [
  { z: 300, valley: 60, height: 70, base: -42, color: 0x111a24, seed: 3, profile: "rounded" },
  { z: 160, valley: 80, height: 95, base: -40, color: 0x17212e, seed: 11, profile: "cliff" },
  { z: 20, valley: 100, height: 115, base: -36, color: 0x1b2737, seed: 23, profile: "rounded" },
  { z: -130, valley: 120, height: 125, base: -32, color: 0x223044, seed: 37, profile: "jagged" },
  { z: -330, valley: 0, height: 105, base: -26, color: 0x2b3b54, seed: 51, profile: "rounded" },
  { z: -540, valley: 0, height: 170, base: -18, color: 0x35486a, seed: 67, profile: "mesa" },
  { z: -780, valley: 0, height: 240, base: -6, color: 0x42577d, seed: 79, profile: "rounded" },
];

// Soroll determinista per posició (permet consultar l'altura d'una carena en qualsevol x)
function hash(n: number, seed: number) {
  const v = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function profileY(profile: Profile, t: number, phase: number, x: number, seed: number) {
  const n = hash(Math.round(x / 10), seed) - 0.5;
  switch (profile) {
    case "rounded": // turons de bosc
      return Math.sin(t * 9 + phase) * 0.5 + Math.sin(t * 23 + phase * 2) * 0.18 + n * 0.05;
    case "cliff": { // replans amb penya-segats verticals
      const q = Math.sin(t * 11 + phase);
      return -0.4 + smoothstep(0.05, 0.2, q) * 1.25 + Math.sin(t * 70 + phase) * 0.04 + n * 0.05;
    }
    case "mesa": { // mola de cim pla
      const q = Math.sin(t * 7 + phase) * 1.4 + Math.sin(t * 19 + phase) * 0.3;
      return Math.min(0.85, q) + n * 0.04;
    }
    default: // crestes calcàries esmolades
      return Math.sin(t * 18 + phase) * 0.5 + Math.sin(t * 45 + phase * 2) * 0.22 + Math.pow(Math.abs(Math.sin(t * 27 + phase * 3)), 6) * 0.7 + n * 0.22;
  }
}

/* Recorregut de la càmera: inici, meitat i final del scroll */
const PATH = [
  { pos: new THREE.Vector3(0, 46, 470), look: new THREE.Vector3(0, 30, -600) },
  { pos: new THREE.Vector3(0, 24, 210), look: new THREE.Vector3(0, 18, -600) },
  { pos: new THREE.Vector3(0, 14, -60), look: new THREE.Vector3(0, 26, -700) },
];

export function createHorizonScene(canvas: HTMLCanvasElement, container: HTMLElement): HorizonScene {
  const lite = window.matchMedia("(max-width: 768px)").matches;
  const width = () => container.clientWidth;
  const height = () => container.clientHeight;
  // En vertical (mòbil) la vall s'estreny perquè les carenes laterals entrin al pla
  const narrow = width() / height() < 1;
  const valleyScale = narrow ? 0.4 : 1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(FOG, 80, 1150);

  const camera = new THREE.PerspectiveCamera(narrow ? 78 : 60, width() / height(), 0.5, 3000);
  camera.position.copy(PATH[0].pos);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(width(), height(), false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.setClearColor(FOG);

  let composer: EffectComposer | null = null;
  if (!lite) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width(), height()), 0.55, 0.5, 0.82));
  }

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  /* --- Cel: degradat de capvespre (blau a dalt, càlid a l'horitzó) --- */
  const skyMaterial = track(
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x152440) },
        mid: { value: new THREE.Color(0x3a5079) },
        horizon: { value: new THREE.Color(0xd38a58) },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 horizon;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.16, h));
          col = mix(col, top, smoothstep(0.16, 0.6, h));
          // resplendor càlid cap al sud-oest
          float sun = pow(max(dot(normalize(vec3(-0.4, 0.05, -1.0)), vDir), 0.0), 12.0);
          col += vec3(0.55, 0.3, 0.15) * sun * 0.6;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
  const sky = new THREE.Mesh(track(new THREE.SphereGeometry(2200, 32, 24)), skyMaterial);
  scene.add(sky);

  /* --- Estrelles (shader del component original) --- */
  const starGeometry = track(new THREE.BufferGeometry());
  const starCount = lite ? 600 : 1500;
  const starPos = new Float32Array(starCount * 3);
  const starSize = new Float32Array(starCount);
  const rand = mulberry32(7);
  for (let i = 0; i < starCount; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(0.15 + rand() * 0.85); // només la meitat alta del cel
    const r = 1900;
    starPos.set([r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)], i * 3);
    starSize[i] = 0.6 + rand() * 1.6;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeometry.setAttribute("size", new THREE.BufferAttribute(starSize, 1));
  const starMaterial = track(
    new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float size;
        uniform float time;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vAlpha = smoothstep(80.0, 900.0, position.y) * (0.7 + 0.3 * sin(time * 1.5 + position.x));
          gl_PointSize = size * 2.0;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vec3(0.95, 0.96, 1.0), vAlpha * (1.0 - smoothstep(0.0, 0.5, d)));
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(new THREE.Points(starGeometry, starMaterial));

  /* --- Lluna --- */
  const moonCanvas = document.createElement("canvas");
  moonCanvas.width = moonCanvas.height = 128;
  const mctx = moonCanvas.getContext("2d")!;
  const grad = mctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,246,228,1)");
  grad.addColorStop(0.22, "rgba(255,240,215,1)");
  grad.addColorStop(0.3, "rgba(255,220,180,0.35)");
  grad.addColorStop(1, "rgba(255,200,150,0)");
  mctx.fillStyle = grad;
  mctx.fillRect(0, 0, 128, 128);
  const moonTexture = track(new THREE.CanvasTexture(moonCanvas));
  const moon = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: moonTexture, fog: false, depthWrite: false, transparent: true })));
  moon.position.set(520, 420, -1500);
  moon.scale.setScalar(260);
  scene.add(moon);

  /* --- Carenes de la Serra --- */
  const ridgeY = (layer: (typeof RIDGES)[number], x: number) => {
    const t = x / 3000 + 0.5;
    const ridge = profileY(layer.profile, t, (layer.seed * 1.37) % 10, x, layer.seed);
    const valley = layer.valley * valleyScale;
    const mask = valley ? smoothstep(valley, valley * 2.4, Math.abs(x)) : 1;
    const crest = layer.base + (ridge * 0.5 + 0.65) * layer.height * mask;
    // al centre de la vall la carena s'enfonsa sota el terra (y = -38)
    return layer.valley ? crest - (1 - mask) * 30 : crest;
  };

  const crestPoints: { x: number; y: number; z: number }[] = [];
  RIDGES.forEach((layer) => {
    const segments = lite ? 160 : 300;
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * 3000;
      const y = ridgeY(layer, x);
      points.push(new THREE.Vector2(x, y));
      // punts de cresta per plantar-hi pins (només a les capes properes)
      if (layer.z > -200 && i % 2 === 0 && Math.abs(x) < 700) crestPoints.push({ x, y, z: layer.z });
    }
    points.push(new THREE.Vector2(1500, -400), new THREE.Vector2(-1500, -400));
    const geometry = track(new THREE.ShapeGeometry(new THREE.Shape(points)));
    const material = track(new THREE.MeshBasicMaterial({ color: layer.color, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = layer.z;
    scene.add(mesh);
  });

  /* --- Terra de la vall --- */
  const ground = new THREE.Mesh(
    track(new THREE.PlaneGeometry(4000, 3000)),
    track(new THREE.MeshBasicMaterial({ color: 0x0f1720 })),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -38, -400);
  scene.add(ground);

  /* --- Pins (silueta de pi mediterrani, copa irregular) i xiprers --- */
  const makePine = (seed: number) => {
    const r = mulberry32(seed);
    const shape = new THREE.Shape();
    const lean = (r() - 0.5) * 0.25;
    const topY = 0.62 + r() * 0.2;
    // tronc lleugerament inclinat
    shape.moveTo(-0.035, 0);
    shape.lineTo(0.035, 0);
    shape.lineTo(lean + 0.03, topY);
    // copa: contorn el·líptic amb bonys
    const cx = lean, cy = topY + 0.12, rx = 0.45 + r() * 0.2, ry = 0.13 + r() * 0.06;
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const bump = 1 + 0.18 * Math.sin(a * 5 + seed) + 0.1 * (r() - 0.5);
      const flat = Math.sin(a) < 0 ? 0.55 : 1; // la part de baix de la copa és més plana
      shape.lineTo(cx + Math.cos(a) * rx * bump, cy + Math.sin(a) * ry * bump * flat);
    }
    shape.lineTo(lean - 0.03, topY);
    shape.closePath();
    return shape;
  };
  const cypressShape = new THREE.Shape();
  cypressShape.moveTo(-0.04, 0);
  cypressShape.lineTo(0.04, 0);
  cypressShape.bezierCurveTo(0.2, 0.25, 0.16, 0.8, 0.0, 1.25);
  cypressShape.bezierCurveTo(-0.16, 0.8, -0.2, 0.25, -0.04, 0);

  // Zona del poble de mitja vall (abans d'arribar al llac)
  // Poble al centre de la vall: la càmera el sobrevola a mig recorregut
  const villageW = 0.6 + 0.4 * valleyScale;
  const VILLAGE = { x0: -58 * villageW, x1: 48 * villageW, z0: 30, z1: 175 };

  const treeMaterial = track(new THREE.MeshBasicMaterial({ color: 0x0b1118, side: THREE.DoubleSide }));
  const treeRand = mulberry32(99);
  const dummy = new THREE.Object3D();
  const placeTrees = (shape: THREE.Shape, count: number, scaleMin: number, scaleMax: number) => {
    const mesh = new THREE.InstancedMesh(track(new THREE.ShapeGeometry(shape, 6)), treeMaterial, count);
    for (let i = 0; i < count; i++) {
      // la meitat a les carenes, la resta escampats pel fons de la vall
      if (i % 2 === 0 && crestPoints.length) {
        const p = crestPoints[Math.floor(treeRand() * crestPoints.length)];
        dummy.position.set(p.x + (treeRand() - 0.5) * 8, p.y - 3, p.z + 0.5);
      } else {
        // fora del llac (el·lipse centrada a x -15, z -235)
        let x = 0, z = 0;
        do {
          const side = treeRand() < 0.5 ? -1 : 1;
          x = side * (45 * valleyScale + 8 + treeRand() * 380);
          z = 380 - treeRand() * 680;
        } while (((x + 15) / 175) ** 2 + ((z + 235) / 85) ** 2 < 1 || (x > VILLAGE.x0 - 6 && x < VILLAGE.x1 + 6 && z > VILLAGE.z0 - 6 && z < VILLAGE.z1 + 6));
        dummy.position.set(x, -38, z);
      }
      const s = scaleMin + treeRand() * (scaleMax - scaleMin);
      dummy.scale.set(s * (0.8 + treeRand() * 0.4), s, 1);
      dummy.rotation.set(0, 0, (treeRand() - 0.5) * 0.08);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(mesh);
  };
  for (const seed of [1, 2, 3]) placeTrees(makePine(seed), lite ? 50 : 110, 12, 24);
  placeTrees(cypressShape, lite ? 40 : 90, 12, 24);

  /* --- Bancs de boira que la càmera travessa --- */
  const mistMaterials: THREE.ShaderMaterial[] = [];
  const mistDepths = [400, 260, 30, -100, -200, -300]; // deixa lliure el poble (z 65–135)
  mistDepths.forEach((z, i) => {
    const material = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        fog: false,
        uniforms: { time: { value: 0 }, seed: { value: i * 13.7 }, color: { value: new THREE.Color(0xb7c4dc) } },
        vertexShader: `
          varying vec2 vUv;
          varying float vDepth;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float time; uniform float seed; uniform vec3 color;
          varying vec2 vUv; varying float vDepth;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
          }
          float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
          void main() {
            vec2 p = vec2(vUv.x * 6.0 + time * 0.02 + seed, vUv.y * 1.6);
            float n = fbm(p);
            float band = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
            // s'esvaeix quan la càmera hi és a sobre, perquè no tapi la vista en travessar-la
            float near = smoothstep(8.0, 70.0, vDepth);
            float alpha = smoothstep(0.35, 0.8, n) * band * near * 0.42;
            gl_FragColor = vec4(color, alpha);
          }`,
      }),
    );
    mistMaterials.push(material);
    const mist = new THREE.Mesh(track(new THREE.PlaneGeometry(2400, 120)), material);
    mist.position.set(0, -6 + (i % 3) * 6, z);
    scene.add(mist);
  });

  /* --- Espurnes en primer pla (pugen lentament i parpellegen) --- */
  const emberCount = lite ? 220 : 600;
  const emberGeometry = track(new THREE.BufferGeometry());
  const emberPos = new Float32Array(emberCount * 3);
  const emberSeed = new Float32Array(emberCount);
  const er = mulberry32(5);
  for (let i = 0; i < emberCount; i++) {
    emberPos.set([(er() - 0.5) * 420, -30 + er() * 120, 460 - er() * 760], i * 3);
    emberSeed[i] = er();
  }
  emberGeometry.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
  emberGeometry.setAttribute("seed", new THREE.BufferAttribute(emberSeed, 1));
  const emberMaterial = track(
    new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, pixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float seed;
        uniform float time; uniform float pixelRatio;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y = mod(p.y + 30.0 + time * (2.0 + seed * 4.0), 120.0) - 30.0;
          p.x += sin(time * 0.4 + seed * 20.0) * 4.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vAlpha = (0.55 + 0.45 * sin(time * (2.0 + seed * 3.0) + seed * 40.0)) * smoothstep(900.0, 60.0, -mv.z);
          gl_PointSize = (1.2 + seed * 2.2) * pixelRatio * (260.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vec3(1.0, 0.68, 0.32), vAlpha * (1.0 - smoothstep(0.0, 0.5, d)));
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(new THREE.Points(emberGeometry, emberMaterial));

  /* --- Llums d'un poble al fons de la vall --- */
  const dotCanvas = document.createElement("canvas");
  dotCanvas.width = dotCanvas.height = 32;
  const dctx = dotCanvas.getContext("2d")!;
  const dgrad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  dgrad.addColorStop(0, "rgba(255,255,255,1)");
  dgrad.addColorStop(0.35, "rgba(255,255,255,0.85)");
  dgrad.addColorStop(1, "rgba(255,255,255,0)");
  dctx.fillStyle = dgrad;
  dctx.fillRect(0, 0, 32, 32);
  const dotTexture = track(new THREE.CanvasTexture(dotCanvas));
  const villageCount = 46;
  const villageGeometry = track(new THREE.BufferGeometry());
  const villagePos = new Float32Array(villageCount * 3);
  const vr = mulberry32(42);
  for (let i = 0; i < villageCount; i++) {
    villagePos.set([40 + vr() * 110, -30 + vr() * 26 + (vr() * 60 - 20) * 0.15, -300 + vr() * 20], i * 3);
  }
  villageGeometry.setAttribute("position", new THREE.BufferAttribute(villagePos, 3));
  const villageMaterial = track(
    new THREE.PointsMaterial({ color: 0xffc27a, map: dotTexture, size: lite ? 2.2 : 1.8, sizeAttenuation: true, transparent: true, depthWrite: false, fog: false }),
  );
  scene.add(new THREE.Points(villageGeometry, villageMaterial));

  /* --- Torre de guaita sobre el penya-segat, amb una finestra encesa --- */
  const towerLayer = RIDGES[1];
  const towerX = -(towerLayer.valley * valleyScale * 2.4 + 50);
  const towerY = ridgeY(towerLayer, towerX) - 2;
  const towerShape = new THREE.Shape();
  towerShape.moveTo(-6, 0);
  towerShape.lineTo(6, 0);
  towerShape.lineTo(5, 30);
  // merlets
  for (const [a, b] of [[5, 2.6], [1.2, -1.2], [-2.6, -5]]) {
    towerShape.lineTo(a, 34);
    towerShape.lineTo(b, 34);
    towerShape.lineTo(b, 30.5);
  }
  towerShape.lineTo(-5, 30);
  towerShape.closePath();
  const tower = new THREE.Mesh(track(new THREE.ShapeGeometry(towerShape)), treeMaterial);
  tower.position.set(towerX, towerY, towerLayer.z + 0.8);
  scene.add(tower);
  const windowLight = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: dotTexture, color: 0xffb35c, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending })),
  );
  windowLight.position.set(towerX + 1, towerY + 22, towerLayer.z + 1);
  windowLight.scale.setScalar(5);
  scene.add(windowLight);

  /* --- Llums petits (finestres, fanals) amb un sol material --- */
  const windowMaterial = track(
    new THREE.SpriteMaterial({ map: dotTexture, color: 0xffb35c, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }),
  );
  const addLight = (x: number, y: number, z: number, size: number) => {
    const light = new THREE.Sprite(windowMaterial);
    light.position.set(x, y, z);
    light.scale.setScalar(size);
    scene.add(light);
  };

  /* Casa amb teulada a dues aigües (amplada w, altura de paret h) */
  const houseShape = (w: number, h: number, roof: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(w / 2, h);
    shape.lineTo(w / 2 + 0.8, h);
    shape.lineTo(0, h + roof);
    shape.lineTo(-w / 2 - 0.8, h);
    shape.lineTo(-w / 2, h);
    shape.closePath();
    return shape;
  };
  const buildingMaterial = track(new THREE.MeshBasicMaterial({ color: 0x0d141c, side: THREE.DoubleSide }));
  const addBuilding = (shape: THREE.Shape, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(track(new THREE.ShapeGeometry(shape)), buildingMaterial);
    mesh.position.set(x, y, z);
    scene.add(mesh);
  };

  /* --- Poble de mitja vall en 3D, il·luminat --- */
  // Llums: només afecten els edificis (la resta de l'escena és MeshBasic)
  scene.add(new THREE.HemisphereLight(0x8ea3c8, 0x2a2018, 1.1));
  const moonLight = new THREE.DirectionalLight(0xbcc9e6, 1.1);
  moonLight.position.set(520, 420, -1500);
  scene.add(moonLight);
  const villageCx = (VILLAGE.x0 + VILLAGE.x1) / 2;
  const villageCz = (VILLAGE.z0 + VILLAGE.z1) / 2;
  const warmLight = new THREE.PointLight(0xffa860, 9, 240, 0.9);
  warmLight.position.set(villageCx, -18, villageCz);
  scene.add(warmLight);

  const wallMaterial = track(new THREE.MeshLambertMaterial({ color: 0xc9b392 }));
  const wallMaterialAlt = track(new THREE.MeshLambertMaterial({ color: 0xa89a86 }));
  const roofMaterial = track(new THREE.MeshLambertMaterial({ color: 0x9a4a32 }));
  const lit = track(new THREE.MeshBasicMaterial({ color: 0xffb760, side: THREE.DoubleSide }));
  const boxGeometry = track(new THREE.BoxGeometry(1, 1, 1));
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.56, 0);
  roofShape.lineTo(0.56, 0);
  roofShape.lineTo(0, 0.42);
  roofShape.closePath();
  const roofGeometry = track(new THREE.ExtrudeGeometry(roofShape, { depth: 1, bevelEnabled: false }));
  roofGeometry.translate(0, 0, -0.5);
  const windowGeometry = track(new THREE.PlaneGeometry(1.3, 1.9));
  const windowMatrices: THREE.Matrix4[] = [];

  const addHouse = (x: number, z: number, w: number, d: number, h: number, rng: () => number, flat = false) => {
    const box = new THREE.Mesh(boxGeometry, rng() < 0.5 ? wallMaterial : wallMaterialAlt);
    box.scale.set(w, h, d);
    box.position.set(x, -38 + h / 2, z);
    scene.add(box);
    if (!flat) {
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.scale.set(w, w * 0.9, d * 1.04);
      roof.position.set(x, -38 + h, z);
      scene.add(roof);
    }
    // finestres enceses a la façana davantera i a un lateral
    const floors = Math.max(1, Math.floor(h / 6.5));
    const cols = Math.max(1, Math.floor(w / 4.5));
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        if (rng() > 0.45) continue;
        const wx = x - w / 2 + (c + 0.5) * (w / cols);
        const wy = -38 + 3.2 + f * 6.2;
        windowMatrices.push(new THREE.Matrix4().makeTranslation(wx, wy, z + d / 2 + 0.06));
      }
      if (rng() < 0.35) {
        const side = rng() < 0.5 ? -1 : 1;
        const m = new THREE.Matrix4().makeRotationY(Math.PI / 2);
        m.setPosition(x + side * (w / 2 + 0.06), -38 + 3.2 + f * 6.2, z + (rng() - 0.5) * d * 0.5);
        windowMatrices.push(m);
      }
    }
  };

  const vrng = mulberry32(2024);
  const placed: { x: number; z: number; r: number }[] = [];
  const houses = lite ? 16 : 30;
  for (let i = 0, tries = 0; i < houses && tries < 600; tries++) {
    const w = 8 + vrng() * 9;
    const d = 8 + vrng() * 7;
    const h = 8 + vrng() * 14; // de dos a tres pisos
    const x = VILLAGE.x0 + vrng() * (VILLAGE.x1 - VILLAGE.x0);
    const z = VILLAGE.z0 + vrng() * (VILLAGE.z1 - VILLAGE.z0);
    const r = Math.max(w, d) * 0.62;
    if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + r)) continue;
    placed.push({ x, z, r });
    addHouse(x, z, w, d, h, vrng, vrng() < 0.2);
    i++;
  }

  // Església amb campanar alt
  const churchX = VILLAGE.x1 - 6;
  const churchZ = VILLAGE.z0 + 30;
  addHouse(churchX, churchZ, 14, 26, 16, mulberry32(7));
  const belfry = new THREE.Mesh(boxGeometry, wallMaterial);
  belfry.scale.set(7, 40, 7);
  belfry.position.set(churchX - 9, -38 + 20, churchZ + 9);
  scene.add(belfry);
  const spire = new THREE.Mesh(track(new THREE.ConeGeometry(5.2, 9, 4)), roofMaterial);
  spire.rotation.y = Math.PI / 4;
  spire.position.set(churchX - 9, -38 + 44.5, churchZ + 9);
  scene.add(spire);
  addLight(churchX - 9, -38 + 34, churchZ + 12.6, 3.4);

  // Totes les finestres en una sola malla
  const windows = new THREE.InstancedMesh(windowGeometry, lit, windowMatrices.length);
  windowMatrices.forEach((m, i) => windows.setMatrixAt(i, m));
  scene.add(windows);

  // Clapa de llum càlida sobre el terra del poble
  const poolCanvas = document.createElement("canvas");
  poolCanvas.width = poolCanvas.height = 128;
  const pctx = poolCanvas.getContext("2d")!;
  const pgrad = pctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  pgrad.addColorStop(0, "rgba(255,170,90,0.55)");
  pgrad.addColorStop(1, "rgba(255,170,90,0)");
  pctx.fillStyle = pgrad;
  pctx.fillRect(0, 0, 128, 128);
  const pool = new THREE.Mesh(
    track(new THREE.PlaneGeometry(VILLAGE.x1 - VILLAGE.x0 + 80, VILLAGE.z1 - VILLAGE.z0 + 80)),
    track(new THREE.MeshBasicMaterial({ map: track(new THREE.CanvasTexture(poolCanvas)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(villageCx, -37.7, villageCz);
  scene.add(pool);

  /* --- Possessió en primer terme, a l'esquerra, amb un llum --- */
  const farmX = -(70 * valleyScale + 45);
  addBuilding(houseShape(22, 9, 4), farmX, -38, 250);
  addBuilding(houseShape(10, 6, 2.5), farmX + 17, -38, 250.4);
  addLight(farmX - 4, -38 + 5, 250.6, 2.8);

  /* --- Molí de vent sobre una carena, amb les aspes girant --- */
  const millLayer = RIDGES[2];
  const millX = -(millLayer.valley * valleyScale * 2.4 + 90);
  const millY = ridgeY(millLayer, millX) - 2;
  const millBody = new THREE.Shape();
  millBody.moveTo(-5, 0);
  millBody.lineTo(5, 0);
  millBody.lineTo(3.5, 20);
  millBody.lineTo(0, 23);
  millBody.lineTo(-3.5, 20);
  millBody.closePath();
  addBuilding(millBody, millX, millY, millLayer.z + 0.6);
  const sails = new THREE.Group();
  const sailGeometry = track(new THREE.PlaneGeometry(1.4, 15));
  for (let i = 0; i < 4; i++) {
    const sail = new THREE.Mesh(sailGeometry, buildingMaterial);
    sail.position.y = 7.5;
    const arm = new THREE.Group();
    arm.add(sail);
    arm.rotation.z = (i * Math.PI) / 2;
    sails.add(arm);
  }
  sails.position.set(millX, millY + 19, millLayer.z + 1.2);
  scene.add(sails);

  /* --- Ermita en una carena llunyana --- */
  const hermitLayer = RIDGES[3];
  const hermitX = hermitLayer.valley * valleyScale * 2.4 + 140;
  const hermitY = ridgeY(hermitLayer, hermitX) - 2;
  addBuilding(houseShape(12, 7, 3), hermitX, hermitY, hermitLayer.z + 0.6);
  const bell = new THREE.Shape();
  bell.moveTo(-1.6, 0);
  bell.lineTo(1.6, 0);
  bell.lineTo(1.6, 6);
  bell.lineTo(0, 8);
  bell.lineTo(-1.6, 6);
  bell.closePath();
  addBuilding(bell, hermitX - 4, hermitY + 7, hermitLayer.z + 0.6);
  addLight(hermitX + 2, hermitY + 3.5, hermitLayer.z + 1, 3);

  /* --- Llac al fons de la vall, que reflecteix el capvespre --- */
  const lakeMaterial = track(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: false,
      uniforms: { time: { value: 0 }, warm: { value: new THREE.Color(0xd08a5a) }, deep: { value: new THREE.Color(0x34496f) } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float time; uniform vec3 warm; uniform vec3 deep;
        varying vec2 vUv;
        void main() {
          vec2 c = (vUv - 0.5) * 2.0;
          float ang = atan(c.y, c.x);
          float d = length(c) + sin(ang * 5.0) * 0.06 + sin(ang * 11.0) * 0.03;
          float edge = smoothstep(1.0, 0.85, d);
          vec3 col = mix(deep, warm, smoothstep(0.15, 1.0, vUv.y));
          float wobble = sin(vUv.x * 23.0 + time * 0.4) * 1.5 + sin(vUv.x * 57.0 - time * 0.3) * 0.8;
          float ripple = sin(vUv.y * 140.0 + time * 1.2 + wobble) * 0.5 + 0.5;
          float breakup = smoothstep(0.3, 0.8, sin(vUv.x * 41.0 + vUv.y * 17.0 + time * 0.5) * 0.5 + 0.5);
          col += vec3(0.3, 0.22, 0.14) * pow(ripple, 14.0) * 0.35 * breakup;
          gl_FragColor = vec4(col, edge * 0.82);
        }`,
    }),
  );
  const lake = new THREE.Mesh(track(new THREE.PlaneGeometry(330, 150)), lakeMaterial);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(-15, -37.6, -235);
  scene.add(lake);

  /* --- Roques en primer pla, a tocar del recorregut de la càmera --- */
  const makeRock = (seed: number) => {
    const r = mulberry32(seed);
    const shape = new THREE.Shape();
    shape.moveTo(-1.3, 0);
    const n = 9;
    for (let i = 1; i < n; i++) {
      const a = Math.PI - (i / n) * Math.PI;
      const rad = 0.75 + r() * 0.5;
      shape.lineTo(Math.cos(a) * 1.3 * rad, Math.sin(a) * (0.6 + r() * 0.6) * rad);
    }
    shape.lineTo(1.3, 0);
    shape.closePath();
    return shape;
  };
  const rockMaterial = track(new THREE.MeshBasicMaterial({ color: 0x0c131b, side: THREE.DoubleSide }));
  const rockRand = mulberry32(314);
  for (const seed of [4, 8, 15]) {
    const count = lite ? 12 : 26;
    const rocks = new THREE.InstancedMesh(track(new THREE.ShapeGeometry(makeRock(seed))), rockMaterial, count);
    for (let i = 0; i < count; i++) {
      const side = rockRand() < 0.5 ? -1 : 1;
      let rx = 0, rz = 0;
      do {
        rx = side * (14 + rockRand() * 90);
        rz = 470 - rockRand() * 640;
      } while (rx > VILLAGE.x0 - 8 && rx < VILLAGE.x1 + 8 && rz > VILLAGE.z0 - 8 && rz < VILLAGE.z1 + 8);
      dummy.position.set(rx, -38, rz);
      const sc = 2.5 + rockRand() * 6;
      dummy.scale.set(sc * (0.8 + rockRand() * 0.6), sc, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);
    }
    scene.add(rocks);
  }

  /* --- Núvols al cel, a diferents distàncies --- */
  const cloudCanvas = document.createElement("canvas");
  cloudCanvas.width = 256;
  cloudCanvas.height = 128;
  const cctx = cloudCanvas.getContext("2d")!;
  const cr = mulberry32(21);
  for (let i = 0; i < 14; i++) {
    const x = 40 + cr() * 176, y = 50 + cr() * 40, rad = 18 + cr() * 34;
    const g = cctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    cctx.fillStyle = g;
    cctx.fillRect(0, 0, 256, 128);
  }
  const cloudTexture = track(new THREE.CanvasTexture(cloudCanvas));
  const clouds: { sprite: THREE.Sprite; speed: number }[] = [];
  for (let i = 0; i < (lite ? 6 : 10); i++) {
    const material = track(
      new THREE.SpriteMaterial({ map: cloudTexture, color: i % 3 === 0 ? 0xf0c4a0 : 0xb9c6de, opacity: 0.32 + cr() * 0.2, fog: false, depthWrite: false, transparent: true }),
    );
    const sprite = new THREE.Sprite(material);
    const w = 300 + cr() * 420;
    sprite.scale.set(w, w * 0.36, 1);
    sprite.position.set(-1100 + cr() * 2200, 150 + cr() * 220, -500 - cr() * 1100);
    scene.add(sprite);
    clouds.push({ sprite, speed: 2 + cr() * 5 });
  }

  /* --- Estol d'ocells que creua el cel --- */
  const birdShape = new THREE.Shape();
  birdShape.moveTo(-1, 0.35);
  birdShape.lineTo(0, 0);
  birdShape.lineTo(1, 0.35);
  birdShape.lineTo(0.92, 0.45);
  birdShape.lineTo(0, 0.14);
  birdShape.lineTo(-0.92, 0.45);
  birdShape.closePath();
  const birdGeometry = track(new THREE.ShapeGeometry(birdShape));
  const birdMaterial = track(new THREE.MeshBasicMaterial({ color: 0x1a2333, side: THREE.DoubleSide, fog: false }));
  const birds = Array.from({ length: 9 }, (_, i) => {
    const mesh = new THREE.Mesh(birdGeometry, birdMaterial);
    const row = Math.ceil(i / 2);
    mesh.userData = { dx: -row * 9, dy: (i % 2 ? 1 : -1) * row * 5, phase: i * 0.7 };
    scene.add(mesh);
    return mesh;
  });

  /* --- Pols en suspensió per tot el volum (dóna la sensació de profunditat) --- */
  const moteCount = lite ? 700 : 2000;
  const moteGeometry = track(new THREE.BufferGeometry());
  const motePos = new Float32Array(moteCount * 3);
  const moteSeed = new Float32Array(moteCount);
  const mr = mulberry32(77);
  for (let i = 0; i < moteCount; i++) {
    motePos.set([(mr() - 0.5) * 520, -36 + mr() * 150, 540 - mr() * 920], i * 3);
    moteSeed[i] = mr();
  }
  moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  moteGeometry.setAttribute("seed", new THREE.BufferAttribute(moteSeed, 1));
  const moteMaterial = track(
    new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, pixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float seed;
        uniform float time; uniform float pixelRatio;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.x += sin(time * 0.12 + seed * 31.0) * 7.0 + time * (0.6 + seed);
          p.x = mod(p.x + 260.0, 520.0) - 260.0;
          p.y += sin(time * 0.18 + seed * 13.0) * 4.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float depth = -mv.z;
          vAlpha = smoothstep(600.0, 20.0, depth) * smoothstep(2.0, 12.0, depth) * (0.25 + 0.45 * seed);
          gl_PointSize = (0.6 + seed * 1.5) * pixelRatio * (200.0 / depth);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vec3(0.86, 0.9, 1.0), vAlpha * (1.0 - smoothstep(0.1, 0.5, d)));
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(new THREE.Points(moteGeometry, moteMaterial));

  /* --- Càmera guiada pel scroll --- */
  const targetPos = PATH[0].pos.clone();
  const targetLook = PATH[0].look.clone();
  const smoothPos = PATH[0].pos.clone();
  const smoothLook = PATH[0].look.clone();
  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let active = true;
  let frame = 0;
  const clock = new THREE.Clock();

  const render = () => {
    const time = clock.getElapsedTime();
    starMaterial.uniforms.time.value = time;
    emberMaterial.uniforms.time.value = time;
    for (const m of mistMaterials) m.uniforms.time.value = time;
    lakeMaterial.uniforms.time.value = time;
    sails.rotation.z = -time * 0.35;
    moteMaterial.uniforms.time.value = time;
    for (const c of clouds) {
      c.sprite.position.x += c.speed * 0.016;
      if (c.sprite.position.x > 1300) c.sprite.position.x = -1300;
    }
    const flockX = -700 + ((time * 16) % 1500);
    birds.forEach((b) => {
      const { dx, dy, phase } = b.userData as { dx: number; dy: number; phase: number };
      b.position.set(flockX + dx, 190 + dy + Math.sin(time * 0.5) * 8, -560);
      b.scale.set(3, 3 * (0.35 + 0.65 * Math.abs(Math.sin(time * 5 + phase))), 1);
    });

    smoothPos.lerp(targetPos, 0.06);
    smoothLook.lerp(targetLook, 0.06);
    camera.position.set(
      smoothPos.x + pointer.x * 3,
      smoothPos.y - pointer.y * 3 + Math.cos(time * 0.25) * 0.8,
      smoothPos.z,
    );
    camera.lookAt(smoothLook);
    sky.position.copy(camera.position);

    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const loop = () => {
    render();
    frame = active ? requestAnimationFrame(loop) : 0;
  };
  frame = requestAnimationFrame(loop);

  return {
    setProgress(p) {
      const t = Math.min(1, Math.max(0, p)) * (PATH.length - 1);
      const i = Math.min(PATH.length - 2, Math.floor(t));
      const k = smoothstep(0, 1, t - i);
      targetPos.lerpVectors(PATH[i].pos, PATH[i + 1].pos, k);
      targetLook.lerpVectors(PATH[i].look, PATH[i + 1].look, k);
    },
    setActive(next) {
      if (next === active) return;
      active = next;
      if (active && !frame) frame = requestAnimationFrame(loop);
    },
    resize() {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height(), false);
      composer?.setSize(width(), height());
      emberMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
      moteMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
    },
    dispose() {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      for (const d of disposables) d.dispose();
      composer?.dispose();
      renderer.dispose();
    },
  };
}
