import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';
import { TransitionService } from '../../core/transition.service';

/**
 * Curtain für Routenwechsel: schiebt sich von unten über die Seite,
 * die Route wechselt verdeckt, dann gibt er nach oben wieder frei.
 * Registriert seine Timelines beim TransitionService.
 */
@Component({
  selector: 'app-page-transition',
  template: `
    <div class="pt" aria-hidden="true">
      <div class="pt-veil"></div>
      <span class="pt-tag">ML<i>.</i></span>
    </div>
  `,
  styles: `
    .pt {
      position: fixed;
      inset: 0;
      z-index: 180;
      visibility: hidden;
      pointer-events: none;
    }
    .pt-veil {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(90rem 40rem at 50% 120%, var(--violet-soft), transparent 60%),
        var(--bg-2);
      border-top: 1px solid var(--line-strong);
    }
    .pt-tag {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text);
      opacity: 0;
    }
    .pt-tag i { font-style: normal; color: var(--cyan); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTransition implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private transition = inject(TransitionService);
  private ctx?: gsap.Context;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const root = this.host.nativeElement.querySelector('.pt') as HTMLElement;
        const veil = root.querySelector('.pt-veil') as HTMLElement;
        const tag = root.querySelector('.pt-tag') as HTMLElement;

        const cover = (): Promise<void> =>
          new Promise((resolve) => {
            root.style.pointerEvents = 'all';
            gsap.timeline({ onComplete: resolve })
              .set(root, { visibility: 'visible' })
              .fromTo(veil, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'expo.inOut' })
              .fromTo(tag, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2');
          });

        const reveal = (): Promise<void> =>
          new Promise((resolve) => {
            gsap.timeline({
              onComplete: () => {
                root.style.pointerEvents = 'none';
                gsap.set(root, { visibility: 'hidden' });
                resolve();
              }
            })
              .to(tag, { opacity: 0, y: -14, duration: 0.25 })
              .to(veil, { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, '-=0.05');
          });

        this.transition.register(cover, reveal);
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
