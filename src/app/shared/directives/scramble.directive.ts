import { Directive, AfterViewInit, OnDestroy, ElementRef, NgZone, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionService, SCRAMBLE_CHARS } from '../../core/motion.service';

/**
 * [appScramble] — Mono-Labels decodieren sich beim Erreichen im Viewport
 * (Terminal-Ästhetik). Bei Reduced Motion bleibt der Text unangetastet.
 */
@Directive({ selector: '[appScramble]' })
export class Scramble implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);

  private trigger?: ScrollTrigger;
  private tween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const el = this.host.nativeElement;
      const original = el.textContent ?? '';
      if (!original.trim()) return;

      el.style.opacity = '0'; // erst beim Trigger sichtbar, dann decodieren

      this.trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          el.style.opacity = '1';
          this.tween = gsap.to(el, {
            duration: Math.min(1.6, 0.7 + original.length * 0.02),
            scrambleText: { text: original, chars: SCRAMBLE_CHARS, speed: 0.5 },
            ease: 'none'
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
    this.tween?.kill();
  }
}
