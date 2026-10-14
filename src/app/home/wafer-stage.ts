import { Component, ChangeDetectionStrategy, ElementRef, inject, afterNextRender, DestroyRef, signal, viewChild } from '@angular/core';
import { WaferBus } from '../core/wafer-bus';
import { MotionService } from '../core/motion.service';

/**
 * Der 3D-Wafer: im Einstieg die Scroll-Geschichte (Laserscan, ML leuchtet, Flug ins Logo),
 * beim Kontakt die Rückkehr mit leuchtenden Chip-Klassen. three.js wird erst geladen,
 * wenn die Seite steht. Ohne WebGL oder bei Reduced Motion bleibt ein Standbild.
 */
@Component({
  selector: 'app-wafer-stage',
  template: `
    <canvas #cv aria-hidden="true"></canvas>
    @if (!live()) { <img class="still" src="img/lab-wafer.webp" alt="" width="1600" height="1600" /> }
  `,
  styles: `
    canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; display: block; pointer-events: none; }
    .still { position: fixed; z-index: 0; width: min(62vw, 92svh); aspect-ratio: 1; right: -6vw; top: 50%; translate: 0 -50%; object-fit: cover; clip-path: circle(45% at 50% 51%); }
    @media (max-width: 960px) { .still { width: 112vw; right: -6vw; top: 26svh; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaferStage {
  private readonly bus = inject(WaferBus);
  private readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  readonly live = signal(false);

  constructor() {
    afterNextRender(() => {
      if (this.motion.reducedMotion || !this.webgl()) return;
      const start = () => import('three').then((THREE) => this.run(THREE)).catch(() => this.live.set(false));
      ('requestIdleCallback' in window) ? requestIdleCallback(() => start(), { timeout: 1200 }) : setTimeout(start, 300);
    });
  }

  private webgl(): boolean {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
  }

  private run(THREE: typeof import('three')): void {
    const canvas = this.cv().nativeElement, bus = this.bus;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Studio: schwarzer Raum mit Lichtleisten, eine orange. Daraus kommen die Spiegelungen.
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x040405, side: THREE.BackSide })));
    const strip = (w: number, h: number, c: number, k: number, p: [number, number, number], r: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...p); m.rotation.set(...r); env.add(m);
    };
    strip(8, 0.7, 0xffffff, 4, [0, 4.5, 0.5], [Math.PI / 2, 0, 0]);
    strip(0.6, 6, 0xdfe6ff, 2.5, [-5.5, 0.5, 1.5], [0, Math.PI / 2, 0]);
    strip(1.2, 7, 0xed440d, 4.5, [5.5, 0, 0.8], [0, -Math.PI / 2, 0]);
    strip(11, 3.5, 0x6c7684, 0.55, [0, 3.2, 5.6], [-0.5, Math.PI, 0]);
    strip(4, 2, 0x9aa6b4, 0.6, [0, -1, 5.9], [0, Math.PI, 0]);
    strip(2.5, 0.35, 0xffffff, 3, [1.5, -4.5, 2], [-Math.PI / 2, 0, 0]);
    scene.environment = pmrem.fromScene(env, 0.015).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0, 8);

    // Texturen: Chips, Klassen (Kontakt) und das ML aus Chips (Einstieg)
    const R = 1.5, N = 2048, COLS = 26, pitch = N / COLS, die = pitch * 0.9;
    const ml = new Set<string>();
    const mark = (pc: number, pr: number) => { for (const dx of [0, 1]) for (const dy of [0, 1]) ml.add(`${4 + pc * 2 + dx},${8 + pr * 2 + dy}`); };
    ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'].forEach((row, r) => [...row].forEach((c, k) => c === 'X' && mark(k, r)));
    ['X..', 'X..', 'X..', 'X..', 'XXX'].forEach((row, r) => [...row].forEach((c, k) => c === 'X' && mark(6 + k, r)));
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return [c, c.getContext('2d')!] as const; };
    const [ca, g] = mk(), [cb, h] = mk(), [cc, k2] = mk();
    g.fillStyle = '#0d0f12'; g.fillRect(0, 0, N, N); h.fillStyle = '#000'; h.fillRect(0, 0, N, N); k2.fillStyle = '#000'; k2.fillRect(0, 0, N, N);
    const rr = (N / 2) * 0.94, CLS = ['#ED440D', '#C2C8CF', '#6f93c8', '#ECEEF1'];
    let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let gy = 0; gy < COLS; gy++) for (let gx = 0; gx < COLS; gx++) {
      const x = gx * pitch, y = gy * pitch;
      if (![[x, y], [x + die, y], [x, y + die], [x + die, y + die]].every(([p, q]) => (p - N / 2) ** 2 + (q - N / 2) ** 2 < rr * rr)) continue;
      const v = 30 + Math.floor(rnd() * 10); g.fillStyle = `rgb(${v},${v + 3},${v + 7})`; g.fillRect(x, y, die, die);
      g.fillStyle = 'rgba(95,105,120,0.6)';
      for (let n = 0; n < 4; n++) g.fillRect(x + die * (0.1 + rnd() * 0.5), y + die * (0.1 + rnd() * 0.6), die * (0.12 + rnd() * 0.3), die * (0.06 + rnd() * 0.18));
      g.fillStyle = 'rgba(200,205,215,0.35)'; g.fillRect(x + die * 0.08, y + die * 0.86, die * 0.84, die * 0.03);
      if (rnd() < 0.34) { h.fillStyle = CLS[Math.floor(rnd() * 4)]; h.fillRect(x + 2, y + 2, die - 4, die - 4); }
      if (ml.has(`${gx},${gy}`)) { k2.fillStyle = '#ffffff'; k2.fillRect(x + 3, y + 3, die - 6, die - 6); }
    }
    const [dieTex, clsTex, mlTex] = [ca, cb, cc].map((c) => {
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / (2 * R), 1 / (2 * R)); t.offset.set(0.5, 0.5); t.anisotropy = 8; return t;
    });

    const shape = new THREE.Shape(), d = 0.035;
    shape.absarc(0, 0, R, -Math.PI / 2 + d, -Math.PI / 2 - d + Math.PI * 2, false);
    shape.lineTo(0, -R + 0.07); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.01, bevelSegments: 4, curveSegments: 160 });
    geo.center();
    const cap = new THREE.MeshPhysicalMaterial({ map: dieTex, metalness: 0.92, roughness: 0.16, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 420], clearcoat: 1, clearcoatRoughness: 0.06, emissiveMap: mlTex, emissive: 0xed440d, emissiveIntensity: 0 });
    const side = new THREE.MeshStandardMaterial({ color: 0xaab0b8, metalness: 1, roughness: 0.3 });
    const wafer = new THREE.Mesh(geo, [cap, side]);
    const group = new THREE.Group(); group.add(wafer); scene.add(group);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0xff7a3d, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xed440d, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.022), scanMat), halo = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.28), haloMat);
    scan.position.z = halo.position.z = 0.035; wafer.add(scan, halo);
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-2, 3, 5); scene.add(key);
    const rim = new THREE.PointLight(0xed440d, 60, 12, 2); rim.position.set(2.6, -1.6, -1.2); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.04));

    let W = 0, H = 0, mob = false, s0 = 1;
    const size = () => { W = innerWidth; H = innerHeight; mob = W < 960; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); s0 = mob ? 0.95 : Math.min(1.5, H / 640); };
    size();
    let mx = 0.5, my = 0.5, tx = 0, ty = 0, spin = 0, boost = 0, born = false, raf = 0;
    const onMove = (e: PointerEvent) => { mx = e.clientX / W; my = e.clientY / H; };
    addEventListener('resize', size); addEventListener('pointermove', onMove, { passive: true });

    const sm = (a: number, b: number, x: number) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tmp = new THREE.Vector3();
    const logoWorld = () => {
      const el = bus.logoEl; if (!el) return null;
      const r = el.getBoundingClientRect();
      tmp.set(((r.left + r.width / 2) / W) * 2 - 1, -((r.top + r.height / 2) / H) * 2 + 1, 0.5).unproject(camera);
      const dir = tmp.sub(camera.position).normalize(), dist = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!bus.visible || document.hidden) return;
      if (bus.ship) { boost = 1; bus.ship = 0; }
      const hp = bus.heroP;
      spin += 0.0016 + boost * 0.12; boost *= 0.97;
      tx += ((my - 0.5) * 0.35 - tx) * 0.06; ty += ((mx - 0.5) * 0.6 - ty) * 0.06;
      key.position.set(-4 + mx * 8, 4 - my * 6, 5);
      if (bus.mode === 'contact') {
        camera.position.z = 8; group.scale.setScalar(s0);
        group.position.set(mob ? 0.35 : 1.85, mob ? 1.25 : -0.15, 0);
        group.rotation.set((mob ? -0.62 : -0.86) + tx, ty - 0.18, spin);
        cap.emissiveMap = clsTex; cap.emissive.set(0xffffff); cap.emissiveIntensity += (1.3 - cap.emissiveIntensity) * 0.08;
        scanMat.opacity = haloMat.opacity = 0; canvas.style.opacity = '1';
      } else {
        const a = sm(0, 0.34, hp), b = sm(0.36, 0.6, hp), c = sm(0.66, 0.95, hp), sc = sm(0.06, 0.36, hp);
        camera.position.z = lerp(8, 6.2, a); camera.updateMatrixWorld();
        const hx = lerp(mob ? 0.35 : 2.35, mob ? 0 : 0.95, a), hy = lerp(mob ? 1.25 : -0.15, mob ? 0.55 : 0, a);
        const target = c > 0 ? logoWorld() : null;
        group.position.set(target ? lerp(hx, target.x, c) : hx, target ? lerp(hy, target.y, c) : hy, 0);
        group.scale.setScalar(lerp(s0, 0.055, c));
        const upright = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
        group.rotation.set(lerp(lerp(mob ? -0.62 : -0.86, -0.42, a) + tx * (1 - b), 0, c), (ty - 0.18) * (1 - b), lerp(spin, upright, b));
        scan.position.y = halo.position.y = lerp(-1.55, 1.55, sc);
        const on = Math.sin(Math.PI * sc); scanMat.opacity = on * 0.95; haloMat.opacity = on * 0.35;
        cap.emissiveMap = mlTex; cap.emissive.set(0xed440d); cap.emissiveIntensity = b * 1.9;
        canvas.style.opacity = String(1 - sm(0.93, 1, hp));
        if (hp > 0.96 && !born) { born = true; bus.onBorn(); } else if (hp < 0.9) born = false;
      }
      renderer.render(scene, camera);
    };
    this.live.set(true);
    frame();
    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', onMove);
      [dieTex, clsTex, mlTex].forEach((t) => t.dispose()); geo.dispose(); cap.dispose(); side.dispose(); pmrem.dispose(); renderer.dispose();
    });
  }
}
