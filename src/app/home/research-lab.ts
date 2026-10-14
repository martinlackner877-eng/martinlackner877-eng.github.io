import { Component, ChangeDetectionStrategy, ElementRef, inject, input, output, signal, computed, afterNextRender, DestroyRef, viewChild } from '@angular/core';
import { Content } from '../content';
import { MotionService } from '../core/motion.service';
import { Magnetic } from '../shared/directives/magnetic.directive';
import { scramble } from './fx';

type R = Content['research'];
interface Node { l: number; x: number; y: number; z: number; s: [number, number, number]; a: number; inc: Edge[]; px: number; py: number; ps: number }
interface Edge { a: Node; b: Node; w: number; learned: boolean }

const grams = (w: string) => { const s = ' ' + w.toLowerCase() + ' ', m = new Map<string, number>(); for (let i = 0; i < s.length - 2; i++) { const g = s.slice(i, i + 3); m.set(g, (m.get(g) || 0) + 1); } return m; };
const cos = (a: Map<string, number>, b: Map<string, number>) => { let d = 0, na = 0, nb = 0; a.forEach((v, k) => { na += v * v; d += v * (b.get(k) || 0); }); b.forEach((v) => { nb += v * v; }); return d / (Math.sqrt(na * nb) || 1); };

/**
 * Das Labor: ein echtes kleines Netz (Forward-Pass mit Sigmoid, Gewichte lernen unter der Maus),
 * „Das nächste Wort“ (Softmax mit Temperatur) und „Attention“ (Wortähnlichkeit plus Nähe).
 */
@Component({
  selector: 'app-research-lab',
  imports: [Magnetic],
  templateUrl: './research-lab.html',
  styleUrl: './research-lab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResearchLab {
  readonly c = input.required<R>();
  readonly toast = output<string>();
  private readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly net = viewChild.required<ElementRef<HTMLCanvasElement>>('net');

  readonly passes = signal(0);
  readonly learned = signal(0);
  readonly nodeCount = 52;
  readonly edgeCount = signal(0);

  // ─── Das nächste Wort ───
  readonly words = signal<string[]>([]);
  readonly temp = signal(0.8);
  readonly pick = signal(-1);
  private readonly END = ['.', '?'];
  readonly key = computed(() => { const w = this.words(); return w.length ? w[w.length - 1] : '^'; });
  readonly probs = computed(() => {
    const ctx = this.c().nt.words.contexts, list = ctx[this.key()] ?? ctx['*'], t = this.temp();
    const ex = list.map(([, l]) => Math.exp(l / t)), s = ex.reduce((a, b) => a + b, 0);
    const p = list.map(([w], i) => ({ w, p: ex[i] / s }));
    const max = Math.max(...p.map((x) => x.p));
    return p.map((x) => ({ ...x, top: x.p === max }));
  });
  readonly done = computed(() => this.END.includes(this.key()));
  readonly tempLabel = computed(() => this.temp().toFixed(2).replace('.', ','));

  // ─── Attention ───
  readonly sentence = signal('');
  readonly focus = signal(-1);
  readonly toks = computed(() => this.sentence().trim().split(/\s+/).filter(Boolean).slice(0, 8));
  readonly att = computed(() => {
    const t = this.toks(), G = t.map(grams);
    return t.map((_, i) => {
      const sc = t.map((_, j) => (j === i ? 0.6 : 4 * cos(G[i], G[j])) + 1.4 * Math.exp(-Math.abs(i - j) / 1.6) + (j < i ? 0.5 : 0));
      const ex = sc.map((v) => Math.exp(v)), s = ex.reduce((a, b) => a + b, 0);
      return ex.map((v) => v / s);
    });
  });
  readonly best = computed(() => {
    const i = this.focus(), A = this.att();
    if (i < 0 || !A[i]) return -1;
    const others = A[i].map((v, k) => (k === i ? -1 : v));
    return others.indexOf(Math.max(...others));
  });
  readonly reading = computed(() => {
    const i = this.focus(), j = this.best(), c = this.c().att;
    if (i < 0 || j < 0) return c.hint;
    return c.reads.replace('{a}', this.toks()[i]).replace('{b}', this.toks()[j]).replace('{p}', String(Math.round(this.att()[i][j] * 100)));
  });

  constructor() {
    afterNextRender(() => {
      this.sentence.set(this.c().att.sentence);
      this.startNet();
      this.startGlitch();
    });
  }

  draw(): void {
    if (this.done()) return;
    const ps = this.probs();
    let x = Math.random(), i = 0;
    while (i < ps.length - 1 && x > ps[i].p) { x -= ps[i].p; i++; }
    this.pick.set(i);
    setTimeout(() => {
      this.pick.set(-1);
      this.words.update((w) => [...w, ps[i].w]);
      if (this.END.includes(ps[i].w)) this.toast.emit(this.c().nt.finished);
    }, 480);
  }
  reset(): void { this.words.set([]); }
  spaced(w: string): string { return (this.END.includes(w) ? '' : ' ') + w; }
  setTemp(e: Event): void { this.temp.set(+(e.target as HTMLInputElement).value); }
  setSentence(e: Event): void { this.sentence.set((e.target as HTMLInputElement).value); this.focus.set(-1); }
  cellOpacity(v: number): number { return Math.min(1, 0.12 + v * 2.4); }
  pct(v: number): string { return (v * 100).toFixed(1).replace('.', ',') + ' %'; }

  private startGlitch(): void {
    if (this.motion.reducedMotion) return;
    const gs = [...this.host.nativeElement.querySelectorAll<HTMLElement>('.glitch')];
    gs.forEach((g) => g.addEventListener('pointerenter', () => scramble(g, g.dataset['text'] ?? '', 520)));
    const id = setInterval(() => {
      const g = gs[Math.floor(Math.random() * gs.length)], r = g?.getBoundingClientRect();
      if (g && r.top > 0 && r.bottom < innerHeight) scramble(g, g.dataset['text'] ?? '', 420);
    }, 3600);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  private startNet(): void {
    const cv = this.net().nativeElement, ctx = cv.getContext('2d')!, reduce = this.motion.reducedMotion, LAY = [5, 9, 12, 12, 9, 5];
    let W = 0, H = 0, rotY = 0, rotX = 0, mx = -999, my = -999, build = reduce ? 1 : 0, building = false, running = false, t = 0, lastFire = 0, raf = 0;
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const nodes: Node[] = [];
    LAY.forEach((n, l) => { for (let i = 0; i < n; i++) nodes.push({ l, x: (l / (LAY.length - 1)) * 2 - 1, y: n === 1 ? 0 : (i / (n - 1)) * 2 - 1, z: (rnd() - 0.5) * 1.2, s: [(rnd() - 0.5) * 3.4, (rnd() - 0.5) * 3.4, (rnd() - 0.5) * 3], a: 0, inc: [], px: 0, py: 0, ps: 1 }); });
    const byL = LAY.map((_, l) => nodes.filter((n) => n.l === l));
    const edges: Edge[] = [];
    for (let l = 0; l < LAY.length - 1; l++) for (const a of byL[l]) for (const b of byL[l + 1]) { const e = { a, b, w: rnd() * 2 - 1, learned: false }; edges.push(e); b.inc.push(e); }
    this.edgeCount.set(edges.length);
    let pulses: { e: Edge; k: number }[] = [], wave: { l: number; at: number } | null = null;
    const sig = (v: number) => 1 / (1 + Math.exp(-v));
    const fire = (inputs?: number[]) => { byL[0].forEach((n, i) => { n.a = inputs ? inputs[i] : 0.2 + rnd() * 0.8; }); wave = { l: 0, at: performance.now() }; this.passes.update((p) => p + 1); };
    const advance = (now: number) => {
      if (!wave || now - wave.at < 150) return;
      const l = wave.l;
      if (l >= LAY.length - 1) { wave = null; return; }
      for (const b of byL[l + 1]) {
        let sum = 0; for (const e of b.inc) sum += e.a.a * e.w * 1.7;
        b.a = sig(sum * 1.4 - 0.3);
        for (const e of b.inc) if (Math.abs(e.a.a * e.w) > 0.32) pulses.push({ e, k: 0 });
      }
      wave = { l: l + 1, at: now };
    };
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const onLeave = () => { mx = my = -999; };
    const onClick = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect(), cy = e.clientY - r.top;
      fire(byL[0].map((n) => Math.exp(-((((n.py || 0) - cy) / 90) ** 2))));
      this.toast.emit(this.c().fired.replace('{n}', String(edges.length)));
    };
    cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave); cv.addEventListener('click', onClick); addEventListener('resize', size);
    const io = new IntersectionObserver((es) => {
      running = es[0].isIntersecting;
      if (running && build < 1 && !building) { building = true; const t0 = performance.now(); const grow = (now: number) => { build = Math.min((now - t0) / 1800, 1); if (build < 1) requestAnimationFrame(grow); }; requestAnimationFrame(grow); }
    }, { threshold: 0.2 });
    io.observe(cv);
    const ease = (k: number) => 1 - Math.pow(1 - k, 3);
    const project = (n: Node, k: number) => {
      const x = n.s[0] + (n.x * 1.15 - n.s[0]) * k, y = n.s[1] + (n.y * 0.85 - n.s[1]) * k, z = n.s[2] + (n.z - n.s[2]) * k;
      const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx, p = 3.2 / (3.2 + z2);
      n.px = W / 2 + x1 * p * W * 0.4; n.py = H / 2 + y2 * p * H * 0.44; n.ps = p;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running) return; t++;
      const cs = getComputedStyle(document.documentElement), acc = cs.getPropertyValue('--accent').trim(), ink = cs.getPropertyValue('--platin').trim(), neg = cs.getPropertyValue('--c-sec').trim(), light = document.documentElement.dataset['mode'] === 'light';
      const r = cv.getBoundingClientRect(), sp = (innerHeight - r.top) / (innerHeight + r.height) - 0.5;
      const ty = (mx > -999 ? (mx / W - 0.5) * 0.9 : Math.sin(t * 0.004) * 0.35) + sp * 1.1, tx = mx > -999 ? (my / H - 0.5) * 0.5 : 0.12;
      if (!reduce) { rotY += (ty - rotY) * 0.05; rotX += (tx - rotX) * 0.05; }
      if (!reduce && now - lastFire > 2300 && !wave) { lastFire = now; fire(); }
      advance(now);
      const k = ease(build);
      nodes.forEach((n) => project(n, k));
      if (mx > -999) {
        nodes.forEach((n) => { const dd = Math.hypot(n.px - mx, n.py - my); if (dd < 80) n.a = Math.max(n.a, 1 - dd / 80); });
        edges.forEach((e) => {
          if (Math.hypot((e.a.px + e.b.px) / 2 - mx, (e.a.py + e.b.py) / 2 - my) < 46) {
            e.w = Math.max(-1.6, Math.min(1.6, e.w + 0.02 * (e.w >= 0 ? 1 : -1)));
            if (!e.learned) { e.learned = true; this.learned.update((v) => v + 1); }
          }
        });
      }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      for (const e of edges) {
        const act = Math.max(e.a.a, e.b.a) * Math.abs(e.w), depth = (e.a.ps + e.b.ps) / 2;
        ctx.strokeStyle = e.w >= 0 ? (act > 0.25 ? acc : ink) : neg;
        ctx.globalAlpha = Math.min(1, (0.05 + Math.abs(e.w) * 0.12 + act * 0.6) * k * depth);
        ctx.lineWidth = (0.6 + Math.abs(e.w) * 0.9 + act * 2.4) * depth;
        ctx.beginPath(); ctx.moveTo(e.a.px, e.a.py); ctx.lineTo(e.b.px, e.b.py); ctx.stroke();
      }
      ctx.fillStyle = acc;
      pulses = pulses.filter((p) => (p.k += reduce ? 1 : 0.06) < 1);
      for (const p of pulses) { ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(p.e.a.px + (p.e.b.px - p.e.a.px) * p.k, p.e.a.py + (p.e.b.py - p.e.a.py) * p.k, 2.6 * p.e.b.ps, 0, 7); ctx.fill(); }
      for (const n of nodes) {
        const rr = (3 + n.a * 7) * n.ps * (0.6 + k * 0.4);
        ctx.globalAlpha = 0.35 + n.a * 0.65; ctx.fillStyle = n.a > 0.15 ? acc : ink;
        ctx.beginPath(); ctx.arc(n.px, n.py, rr, 0, 7); ctx.fill();
        if (n.a > 0.5) { ctx.globalAlpha = (n.a - 0.5) * 0.5; ctx.beginPath(); ctx.arc(n.px, n.py, rr * 2.6, 0, 7); ctx.fill(); }
      }
      if (mx > -999) {
        const near = edges.map((e) => [e, Math.hypot((e.a.px + e.b.px) / 2 - mx, (e.a.py + e.b.py) / 2 - my)] as const).filter(([, dd]) => dd < 70).sort((a, b) => a[1] - b[1]).slice(0, 3);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.font = '600 12px "Archivo Variable", Arial, sans-serif'; ctx.fillStyle = cs.getPropertyValue('--ink').trim();
        near.forEach(([e], i) => ctx.fillText('w = ' + e.w.toFixed(2).replace('.', ','), (e.a.px + e.b.px) / 2 + 8, (e.a.py + e.b.py) / 2 - 8 - i * 14));
      }
      nodes.forEach((n) => { n.a *= reduce ? 0.9 : 0.975; });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(frame);
    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size);
      cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave); cv.removeEventListener('click', onClick);
    });
  }
}
