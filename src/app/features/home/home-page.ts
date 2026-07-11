import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionService } from '../../core/motion.service';
import { KEYWORDS } from '../../data/portfolio.data';
import { Marquee } from '../../shared/components/marquee';
import { HeroSection } from './sections/hero';
import { AboutSection } from './sections/about';
import { CapabilitiesSection } from './sections/capabilities';
import { WorkSection } from './sections/work';
import { ProcessSection } from './sections/process';
import { TimelineSection } from './sections/timeline';
import { ContactSection } from './sections/contact';

/**
 * Die One-Pager-Story. Kapitel-Logik und generische [data-reveal]-Regie
 * liegen hier — die Sektionen choreografieren nur ihre Spezialeffekte.
 */
@Component({
  selector: 'app-home-page',
  imports: [
    Marquee, HeroSection, AboutSection, CapabilitiesSection,
    WorkSection, ProcessSection, TimelineSection, ContactSection
  ],
  template: `
    <app-hero-section />
    <div id="band">
      <app-marquee [items]="keywords" />
    </div>
    <app-about-section />
    <app-capabilities-section />
    <app-work-section />
    <app-process-section />
    <app-timeline-section />
    <app-contact-section />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private route = inject(ActivatedRoute);
  private ctx?: gsap.Context;

  readonly keywords = KEYWORDS;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser) return;

    if (this.motion.reducedMotion) {
      gsap.set('[data-reveal]', { clearProps: 'all', opacity: 1 });
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        // Kapitel-Anzeige in der Nav folgt der Story
        gsap.utils.toArray<HTMLElement>('[data-chapter]').forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (self.isActive) this.motion.chapter.set(el.dataset['chapter']!);
            }
          });
        });

        // Eine Regie für alle einfachen Block-Reveals
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(el,
            { y: 48, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 1, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 86%', once: true }
            }
          );
        });
      }, this.host.nativeElement);

      // Anker aus der Navigation anderer Seiten (z. B. /#about)
      const fragment = this.route.snapshot.fragment;
      if (fragment) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => this.motion.scrollTo('#' + fragment))
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
