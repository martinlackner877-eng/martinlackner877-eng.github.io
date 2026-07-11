import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject, input
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionService } from '../../core/motion.service';

/**
 * Endlos-Marquee, die auf Scroll-Geschwindigkeit reagiert: schneller
 * Scroll beschleunigt und skewt das Band, Richtung folgt dem Scroll.
 */
@Component({
  selector: 'app-marquee',
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="mq">
      <div class="mq-track">
        @for (item of items(); track $index) {
          <span class="mq-item">{{ item }}<i class="mq-sep">·</i></span>
        }
        @for (item of items(); track $index) {
          <span class="mq-item">{{ item }}<i class="mq-sep">·</i></span>
        }
      </div>
    </div>
  `,
  styles: `
    .mq {
      overflow: hidden;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      padding: 1.2rem 0;
    }
    .mq-track {
      display: inline-flex;
      white-space: nowrap;
      will-change: transform;
    }
    .mq-item {
      font-family: var(--font-display);
      font-size: clamp(1rem, 2vw, 1.5rem);
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .mq-sep {
      font-style: normal;
      color: var(--cyan);
      margin: 0 1.6rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Marquee implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private ctx?: gsap.Context;

  readonly items = input.required<string[]>();
  /** Sekunden pro halber Bandlänge (eine Kopie). */
  readonly speed = input(26);

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const track = this.host.nativeElement.querySelector('.mq-track') as HTMLElement;

        const tween = gsap.to(track, {
          xPercent: -50,
          ease: 'none',
          duration: this.speed(),
          repeat: -1
        });

        ScrollTrigger.create({
          onUpdate: (self) => {
            const v = self.getVelocity();
            if (Math.abs(v) < 60) return;
            const dir = v < 0 ? -1 : 1;
            gsap.to(tween, {
              timeScale: dir * gsap.utils.clamp(1, 4, Math.abs(v) / 320),
              duration: 0.2,
              overwrite: true,
              onComplete: () => {
                gsap.to(tween, { timeScale: dir, duration: 1.4, ease: 'power2.out' });
              }
            });
            gsap.to(track, {
              skewX: gsap.utils.clamp(-8, 8, v / 320),
              duration: 0.25,
              overwrite: 'auto',
              onComplete: () => {
                gsap.to(track, { skewX: 0, duration: 0.7, ease: 'power2.out' });
              }
            });
          }
        });
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
