import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const FINISH = { gold: 0xc9a96e, steel: 0xb8bcc2, black: 0x1b1b1d };

/** Real geometry: case, bezel, dial, crystal, indices, hands, crown and strap. */
export function buildWatch(finish = "gold") {
  const metal = new THREE.MeshStandardMaterial({ color: FINISH[finish], metalness: 1, roughness: 0.22 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0d0d0f, metalness: 0.3, roughness: 0.5 });
  const strapM = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.8 });
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.18 });
  const mesh = (g, m, y = 0) => { const o = new THREE.Mesh(g, m); o.position.y = y; return o; };

  // Local +Y faces the viewer once the group is rotated; local -Z points to 12 o'clock.
  const parts = {
    case: mesh(new THREE.CylinderGeometry(1, 1, 0.35, 64), metal),
    bezel: mesh(new THREE.TorusGeometry(0.95, 0.07, 24, 96).rotateX(Math.PI / 2), metal, 0.18),
    dial: mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.02, 64), dark, 0.17),
    glass: mesh(new THREE.CylinderGeometry(0.93, 0.93, 0.03, 64), glassM, 0.27),
    hands: new THREE.Group(),
    crown: mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.25, 24).rotateZ(Math.PI / 2), metal),
    strap: new THREE.Group(),
  };
  parts.crown.position.x = 1.08;

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = mesh(new THREE.BoxGeometry(0.04, 0.02, i % 3 ? 0.1 : 0.18), metal, 0.02);
    b.position.set(Math.sin(a) * 0.76, 0.02, -Math.cos(a) * 0.76);
    b.rotation.y = -a;
    parts.dial.add(b);
  }

  const hand = (len, w, mat) => {
    const g = new THREE.Group();
    const b = mesh(new THREE.BoxGeometry(w, 0.015, len), mat);
    b.position.z = -len / 2 + 0.08;
    g.add(b); parts.hands.add(g); return g;
  };
  const hr = hand(0.45, 0.07, metal), mn = hand(0.7, 0.05, metal);
  const sc = hand(0.78, 0.015, new THREE.MeshStandardMaterial({ color: 0xe6d3a6, metalness: 1, roughness: 0.3 }));
  parts.hands.position.y = 0.21;

  [-1, 1].forEach((d) => { const b = mesh(new THREE.BoxGeometry(0.9, 0.1, 1.5), strapM, -0.05); b.position.z = d * 1.85; parts.strap.add(b); });

  const inner = new THREE.Group();
  inner.rotation.x = Math.PI / 2;
  Object.values(parts).forEach((p) => inner.add(p));
  const root = new THREE.Group(); root.add(inner);
  const base = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.position.y]));

  return {
    root, parts,
    setFinish(f) { metal.color.setHex(FINISH[f]); },
    explode(p) { const k = { glass: 1.3, hands: 0.8, dial: 0.45, bezel: 0.15, case: -0.4, strap: -0.6 }; for (const n in k) parts[n].position.y = base[n] + k[n] * p; },
    tick() {
      const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000 * 0, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      hr.rotation.y = -(h / 12) * Math.PI * 2; mn.rotation.y = -(m / 60) * Math.PI * 2; sc.rotation.y = -(s / 60) * Math.PI * 2;
    },
  };
}

/** Mounts a renderer on a canvas; pauses when off screen; falls back if WebGL is unavailable. */
export function mountScene(canvas, { finish = "gold", fov = 35, z = 6 } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { canvas.replaceWith(Object.assign(document.createElement("p"), { textContent: "3D view unavailable on this device." })); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 50);
  camera.position.set(0, 0, z);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffe2b0, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 1.2); rim.position.set(-4, -1, -3); scene.add(rim);
  const watch = buildWatch(finish), pivot = new THREE.Group();
  pivot.add(watch.root); scene.add(pivot);
  const api = { watch, pivot, camera, visible: true, onFrame: null };
  const size = () => { const { clientWidth: w, clientHeight: h } = canvas; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(canvas); size();
  new IntersectionObserver(([e]) => (api.visible = e.isIntersecting)).observe(canvas);
  renderer.setAnimationLoop(() => { if (!api.visible) return; watch.tick(); api.onFrame?.(); renderer.render(scene, camera); });
  return api;
}
