import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { MotionService } from '../../core/motion.service';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
}

interface Pulse {
  a: Particle; b: Particle;
  t: number;
}

const VIOLET = '139, 124, 255';
const CYAN = '78, 225, 201';
const LINK_DIST = 130;
const MOUSE_DIST = 190;
const MAX_SPEED = 0.55;

/**
 * Neuronales Partikel-Netz auf Canvas 2D: driftende Knoten, Kanten nach
 * Nähe, sanfte Maus-Anziehung und „Synapsen-Pulse", die Kanten entlanglaufen.
 * `condense` (0..1) zieht das Netz zur Mitte — vom Hero-Scrub gesteuert.
 * Pausiert offscreen und bei verstecktem Tab; Reduced Motion = 1 statisches Bild.
 */
@Component({
  selector: 'app-neural-canvas',
  template: `<canvas aria-hidden="true"></canvas>`,
  styles: `
    :host { position: absolute; inset: 0; display: block; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NeuralCanvas implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);

  /** 0..1 — Netz-Verdichtung Richtung Zentrum, imperativ gesetzt (Hero-Scrub). */
  condense = 0;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private pulses: Pulse[] = [];
  private mouse: { x: number; y: number } | null = null;
  private raf = 0;
  private running = false;
  private inView = true;
  private lastPulse = 0;
  private resizeObs?: ResizeObserver;
  private intersectObs?: IntersectionObserver;
  private cleanup: Array<() => void> = [];

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser) return;

    this.canvas = this.host.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.ngZone.runOutsideAngular(() => {
      this.resize();
      this.seed();

      if (this.motion.reducedMotion) {
        this.draw(); // ein ruhiges Standbild, keine Loop
        return;
      }

      this.resizeObs = new ResizeObserver(() => { this.resize(); this.seed(); });
      this.resizeObs.observe(this.host.nativeElement);

      this.intersectObs = new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting;
        this.syncLoop();
      });
      this.intersectObs.observe(this.canvas);

      const onVisibility = () => this.syncLoop();
      document.addEventListener('visibilitychange', onVisibility);
      this.cleanup.push(() => document.removeEventListener('visibilitychange', onVisibility));

      if (this.motion.finePointer) {
        const onMove = (e: MouseEvent) => {
          const r = this.canvas.getBoundingClientRect();
          this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
        };
        const onLeave = () => { this.mouse = null; };
        window.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseleave', onLeave, { passive: true });
        this.cleanup.push(() => window.removeEventListener('mousemove', onMove));
        this.cleanup.push(() => document.removeEventListener('mouseleave', onLeave));
      }

      this.syncLoop();
    });
  }

  ngOnDestroy(): void {
    this.stop();
    this.resizeObs?.disconnect();
    this.intersectObs?.disconnect();
    this.cleanup.forEach((fn) => fn());
  }

  // ─── Loop-Steuerung ───

  private syncLoop(): void {
    const shouldRun = this.inView && !document.hidden;
    if (shouldRun && !this.running) this.start();
    if (!shouldRun && this.running) this.stop();
  }

  private start(): void {
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      this.step();
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  // ─── Welt ───

  private resize(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private get w(): number { return this.canvas.width / Math.min(window.devicePixelRatio || 1, 2); }
  private get h(): number { return this.canvas.height / Math.min(window.devicePixelRatio || 1, 2); }

  private seed(): void {
    const target = Math.round(Math.min(130, Math.max(36, (this.w * this.h) / 16000)));
    while (this.particles.length < target) {
      const cyan = Math.random() < 0.3;
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 1.3,
        color: cyan ? CYAN : VIOLET
      });
    }
    this.particles.length = target;
    this.pulses = [];
  }

  private step(): void {
    const { w, h } = this;

    for (const p of this.particles) {
      // Maus zieht sanft an — Synapsen suchen die Nähe des Besuchers
      if (this.mouse) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > 1 && d < MOUSE_DIST) {
          const f = (1 - d / MOUSE_DIST) * 0.012;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      p.x += p.vx;
      p.y += p.vy;

      // weiches Wrapping mit Rand, damit Kanten nicht abrupt poppen
      const m = 24;
      if (p.x < -m) p.x = w + m; else if (p.x > w + m) p.x = -m;
      if (p.y < -m) p.y = h + m; else if (p.y > h + m) p.y = -m;
    }
  }

  private draw(): void {
    const { w, h } = this;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    // Anzeige-Koordinaten: bei condense > 0 zur Mitte gerafft
    const k = this.condense * 0.82;
    const cx = w / 2;
    const cy = h / 2;
    const px = this.particles.map((p) => p.x + (cx - p.x) * k);
    const py = this.particles.map((p) => p.y + (cy - p.y) * k);

    // Kanten
    const linkDist = LINK_DIST * (1 - k * 0.55);
    const candidates: Array<[number, number]> = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = px[i] - px[j];
        const dy = py[i] - py[j];
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          const a = (1 - d / linkDist) * 0.32;
          ctx.strokeStyle = `rgba(${VIOLET}, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          ctx.stroke();
          if (candidates.length < 40) candidates.push([i, j]);
        }
      }
    }

    // Maus-Synapsen in Cyan
    if (this.mouse) {
      for (let i = 0; i < this.particles.length; i++) {
        const dx = px[i] - this.mouse.x;
        const dy = py[i] - this.mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE_DIST * 0.8) {
          const a = (1 - d / (MOUSE_DIST * 0.8)) * 0.22;
          ctx.strokeStyle = `rgba(${CYAN}, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(this.mouse.x, this.mouse.y);
          ctx.stroke();
        }
      }
    }

    // Knoten
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.fillStyle = `rgba(${p.color}, 0.75)`;
      ctx.beginPath();
      ctx.arc(px[i], py[i], p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Synapsen-Pulse: Lichtpunkte laufen Kanten entlang
    if (this.running) {
      const now = performance.now();
      if (now - this.lastPulse > 1400 + Math.random() * 1200 && candidates.length && this.pulses.length < 4) {
        const [i, j] = candidates[Math.floor(Math.random() * candidates.length)];
        this.pulses.push({ a: this.particles[i], b: this.particles[j], t: 0 });
        this.lastPulse = now;
      }
    }

    for (let n = this.pulses.length - 1; n >= 0; n--) {
      const pulse = this.pulses[n];
      pulse.t += 0.028;
      if (pulse.t >= 1) { this.pulses.splice(n, 1); continue; }
      const ax = pulse.a.x + (cx - pulse.a.x) * k;
      const ay = pulse.a.y + (cy - pulse.a.y) * k;
      const bx = pulse.b.x + (cx - pulse.b.x) * k;
      const by = pulse.b.y + (cy - pulse.b.y) * k;
      const x = ax + (bx - ax) * pulse.t;
      const y = ay + (by - ay) * pulse.t;
      const fade = Math.sin(pulse.t * Math.PI);
      ctx.shadowColor = `rgba(${CYAN}, 0.9)`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(${CYAN}, ${(0.9 * fade).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}
