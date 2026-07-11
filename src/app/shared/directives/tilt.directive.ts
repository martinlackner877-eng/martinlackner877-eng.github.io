import { Directive, AfterViewInit, OnDestroy, ElementRef, NgZone, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';

/**
 * [appTilt] — 3D-Neigung zur Maus + Spotlight-Position als CSS-Variablen
 * (--spot-x/--spot-y in %), damit die Karte einen wandernden Lichtfleck
 * zeichnen kann. Nur auf feinen Pointern ohne Reduced Motion.
 */
@Directive({ selector: '[appTilt]' })
export class Tilt implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);

  /** Maximale Neigung in Grad. */
  readonly tiltMax = input(7);

  private cleanup: Array<() => void> = [];

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || !this.motion.finePointer || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const el = this.host.nativeElement;
      gsap.set(el, { transformPerspective: 900 });
      const rxTo = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      const ryTo = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0..1
        const py = (e.clientY - r.top) / r.height;
        const max = this.tiltMax();
        rxTo((0.5 - py) * max * 2);
        ryTo((px - 0.5) * max * 2);
        el.style.setProperty('--spot-x', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--spot-y', `${(py * 100).toFixed(1)}%`);
      };

      const onLeave = () => {
        rxTo(0);
        ryTo(0);
      };

      el.addEventListener('mousemove', onMove, { passive: true });
      el.addEventListener('mouseleave', onLeave, { passive: true });
      this.cleanup = [
        () => el.removeEventListener('mousemove', onMove),
        () => el.removeEventListener('mouseleave', onLeave)
      ];
    });
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((fn) => fn());
    gsap.set(this.host.nativeElement, { clearProps: 'transform' });
  }
}
