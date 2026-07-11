import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { gsap } from 'gsap';
import { MotionService } from '../../../core/motion.service';
import { SKILL_GROUPS } from '../../../data/portfolio.data';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';

/**
 * Kapitel 02 — „Was": Auf Desktop eine gepinnte Horizontal-Fahrt
 * durch die vier Disziplinen; Chips staggern pro Panel ein
 * (containerAnimation). Auf kleinen Screens ein vertikaler Stack.
 */
@Component({
  selector: 'app-capabilities-section',
  imports: [Scramble, TextReveal],
  templateUrl: './capabilities.html',
  styleUrl: './capabilities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapabilitiesSection implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private mm?: gsap.MatchMedia;

  readonly skillGroups = SKILL_GROUPS;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const root = this.host.nativeElement;
      this.mm = gsap.matchMedia(root);

      // ─── Desktop: Horizontal-Fahrt ───
      this.mm.add('(min-width: 900px)', () => {
        const stage = root.querySelector('.caps-stage') as HTMLElement;
        const track = root.querySelector('.caps-track') as HTMLElement;
        const current = root.querySelector('.caps-current') as HTMLElement;
        stage.classList.add('is-horizontal');

        const distance = () => track.scrollWidth - stage.clientWidth;

        const ride = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = 1 + Math.round(self.progress * (this.skillGroups.length - 1));
              current.textContent = String(idx).padStart(2, '0');
            }
          }
        });

        // Chips pro Panel, getriggert innerhalb der Fahrt
        gsap.utils.toArray<HTMLElement>('.cap-panel', root).forEach((panel) => {
          gsap.from(panel.querySelectorAll('.chip'), {
            y: 26, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: ride,
              start: 'left 72%',
              once: true
            }
          });
        });

        return () => stage.classList.remove('is-horizontal');
      });

      // ─── Mobil: vertikaler Stack mit einfachen Reveals ───
      this.mm.add('(max-width: 899px)', () => {
        gsap.utils.toArray<HTMLElement>('.cap-panel', root).forEach((panel) => {
          gsap.from(panel, {
            y: 48, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: panel, start: 'top 86%', once: true }
          });
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }
}
