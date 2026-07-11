import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MotionService } from '../../../core/motion.service';
import { ABOUT, STATS } from '../../../data/portfolio.data';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';

/**
 * Kapitel 01 — „Wer": Der Text wird beim Scrollen „gelesen" —
 * die Absätze sind gepinnt, Wort für Wort hellt sich auf.
 * Danach zählen die Kennzahlen hoch.
 */
@Component({
  selector: 'app-about-section',
  imports: [Scramble, TextReveal],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutSection implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private ctx?: gsap.Context;

  readonly about = ABOUT;
  readonly stats = STATS;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        // Lese-Effekt: Wörter hellen sich mit dem Scrub auf
        const split = SplitText.create('.about-p', { type: 'words' });
        gsap.set(split.words, { opacity: 0.13 });
        gsap.to(split.words, {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.about-pin',
            start: 'top 32%',
            end: '+=150%',
            pin: true,
            scrub: true
          }
        });

        // Kennzahlen zählen hoch, sobald sichtbar
        gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el) => {
          const target = Number(el.dataset['value'] || 0);
          const state = { n: 0 };
          gsap.to(state, {
            n: target,
            duration: 1.6,
            ease: 'power2.out',
            snap: { n: 1 },
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onUpdate: () => { el.textContent = String(state.n); }
          });
        });
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
