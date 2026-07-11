import { Directive, AfterViewInit, OnDestroy, ElementRef, NgZone, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';

/**
 * [appMagnetic] — Element zieht federnd zur Maus, schnappt elastisch zurück.
 * Nur auf feinen Pointern ohne Reduced Motion.
 */
@Directive({ selector: '[appMagnetic]' })
export class Magnetic implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);

  /** Anziehungsstärke: Anteil der Distanz zur Element-Mitte. */
  readonly magneticStrength = input(0.35);

  private cleanup: Array<() => void> = [];

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || !this.motion.finePointer || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const el = this.host.nativeElement;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const s = this.magneticStrength();
        xTo((e.clientX - (r.left + r.width / 2)) * s);
        yTo((e.clientY - (r.top + r.height / 2)) * s);
      };

      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
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
    gsap.set(this.host.nativeElement, { clearProps: 'x,y' });
  }
}
