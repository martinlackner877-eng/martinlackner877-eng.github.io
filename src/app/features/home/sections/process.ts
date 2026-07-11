import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionService } from '../../../core/motion.service';
import { STEPS } from '../../../data/portfolio.data';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';

/**
 * Kapitel 04 — „Wie": Karten-Deck. Jede Prozess-Karte pinnt sich
 * unter die Nav, die nächste schiebt sich darüber, die vorige
 * skaliert zurück und dimmt — wie ein Stapel, der sich aufbaut.
 */
@Component({
  selector: 'app-process-section',
  imports: [Scramble, TextReveal],
  templateUrl: './process.html',
  styleUrl: './process.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessSection implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private ctx?: gsap.Context;

  readonly steps = STEPS;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const stack = this.host.nativeElement.querySelector('.process-stack') as HTMLElement;
        const cards = gsap.utils.toArray<HTMLElement>('.step-card', stack);

        cards.forEach((card, i) => {
          // Spätere Karten müssen immer über früheren liegen — auch in dem
          // Moment, in dem nur die frühere gepinnt (= transformiert) ist.
          gsap.set(card, { zIndex: i + 1 });

          ScrollTrigger.create({
            trigger: card,
            start: () => `top ${110 + i * 18}px`,
            endTrigger: stack,
            end: 'bottom 40%',
            pin: true,
            pinSpacing: false
          });

          // Die vorige Karte tritt zurück, während diese ankommt.
          // brightness statt opacity: opacity würde den Kartenhintergrund
          // transparent machen und die Karten darunter durchscheinen lassen.
          if (i > 0) {
            gsap.to(cards[i - 1], {
              scale: 0.94,
              filter: 'brightness(0.4)',
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: () => `top ${110 + (i - 1) * 18}px`,
                scrub: true
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
