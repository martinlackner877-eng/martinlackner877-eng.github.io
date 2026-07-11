import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionService } from '../../../core/motion.service';
import { TIMELINE } from '../../../data/portfolio.data';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';

/**
 * Kapitel 05 — „Woher": Eine Leuchtlinie zeichnet sich mit dem Scroll
 * durch die Stationen; Einträge gleiten wechselseitig herein, die
 * Perioden-Labels decodieren sich (appScramble).
 */
@Component({
  selector: 'app-timeline-section',
  imports: [Scramble, TextReveal],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineSection implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private ctx?: gsap.Context;

  readonly timeline = TIMELINE;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const root = this.host.nativeElement;

        // Linie wächst mit dem Scroll
        gsap.fromTo('.tl-line-fill',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.tl-list',
              start: 'top 60%',
              end: 'bottom 60%',
              scrub: 0.4
            }
          }
        );

        // Einträge gleiten wechselseitig herein, Dots zünden
        gsap.utils.toArray<HTMLElement>('.tl-entry', root).forEach((entry, i) => {
          gsap.from(entry, {
            x: i % 2 ? 56 : -56,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, start: 'top 82%', once: true }
          });
          ScrollTrigger.create({
            trigger: entry,
            start: 'top 60%',
            once: true,
            onEnter: () => entry.classList.add('is-lit')
          });
        });
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
