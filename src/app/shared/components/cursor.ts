import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';

/**
 * Custom Cursor: präziser Punkt + träge nachziehender Ring.
 * Wächst über Interaktivem; zeigt Labels über [data-cursor]-Zielen.
 * Existiert nur auf feinen Pointern ohne Reduced Motion.
 */
@Component({
  selector: 'app-cursor',
  template: `
    @if (enabled) {
      <div class="cur-dot"></div>
      <div class="cur-ring"><span class="cur-label"></span></div>
    }
  `,
  styles: `
    .cur-dot,
    .cur-ring {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 300;
      pointer-events: none;
      border-radius: 50%;
      opacity: 0;
      will-change: transform;
    }
    .cur-dot {
      width: 7px;
      height: 7px;
      background: var(--cyan);
      mix-blend-mode: difference;
    }
    .cur-ring {
      width: 38px;
      height: 38px;
      border: 1px solid var(--violet-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.3s var(--ease), height 0.3s var(--ease),
        border-color 0.3s var(--ease), background-color 0.3s var(--ease);
    }
    .cur-label {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--text);
      opacity: 0;
      transition: opacity 0.25s var(--ease);
      white-space: nowrap;
    }
    .cur-ring.is-hover {
      width: 56px;
      height: 56px;
      border-color: var(--cyan-glow);
    }
    .cur-ring.has-label {
      width: 88px;
      height: 88px;
      background: rgba(10, 10, 18, 0.55);
      backdrop-filter: blur(4px);
      border-color: var(--line-strong);
    }
    .cur-ring.has-label .cur-label { opacity: 1; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cursor implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);

  readonly enabled =
    this.motion.isBrowser && this.motion.finePointer && !this.motion.reducedMotion;

  private cleanup: Array<() => void> = [];

  ngAfterViewInit(): void {
    if (!this.enabled) return;

    this.ngZone.runOutsideAngular(() => {
      const el = this.host.nativeElement;
      const dot = el.querySelector('.cur-dot') as HTMLElement;
      const ring = el.querySelector('.cur-ring') as HTMLElement;
      const label = el.querySelector('.cur-label') as HTMLElement;

      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

      let shown = false;

      const onMove = (e: MouseEvent) => {
        if (!shown) {
          shown = true;
          gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        }
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
      };

      const onOver = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a, button, [data-cursor]');
        if (!target) return;
        ring.classList.add('is-hover');
        const text = (target as HTMLElement).dataset['cursor'];
        if (text) {
          label.textContent = text;
          ring.classList.add('has-label');
        }
      };

      const onOut = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a, button, [data-cursor]');
        if (!target) return;
        ring.classList.remove('is-hover', 'has-label');
      };

      const onLeave = (e: MouseEvent) => {
        if (!e.relatedTarget) {
          shown = false;
          gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
        }
      };

      const onDown = () => gsap.to(dot, { scale: 2.2, duration: 0.2 });
      const onUp = () => gsap.to(dot, { scale: 1, duration: 0.3, ease: 'back.out(3)' });

      document.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseover', onOver, { passive: true });
      document.addEventListener('mouseout', onOut, { passive: true });
      document.addEventListener('mouseout', onLeave, { passive: true });
      document.addEventListener('mousedown', onDown, { passive: true });
      document.addEventListener('mouseup', onUp, { passive: true });

      this.cleanup = [
        () => document.removeEventListener('mousemove', onMove),
        () => document.removeEventListener('mouseover', onOver),
        () => document.removeEventListener('mouseout', onOut),
        () => document.removeEventListener('mouseout', onLeave),
        () => document.removeEventListener('mousedown', onDown),
        () => document.removeEventListener('mouseup', onUp)
      ];
    });
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((fn) => fn());
  }
}
