import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { MotionService } from '../../core/motion.service';
import { TransitionService } from '../../core/transition.service';
import { PROJECTS, Project } from '../../data/portfolio.data';
import { Magnetic } from '../../shared/directives/magnetic.directive';
import { Scramble } from '../../shared/directives/scramble.directive';
import { TextReveal } from '../../shared/directives/text-reveal.directive';

/**
 * Case-Study-Seite (/work/:slug): erzählt ein Projekt in Kapiteln —
 * Challenge → Design → Build → Ergebnis. Nutzt dieselbe Reveal-Sprache
 * wie die Story, damit sich beide Seiten wie ein Stück anfühlen.
 */
@Component({
  selector: 'app-project-page',
  imports: [Magnetic, Scramble, TextReveal],
  templateUrl: './project-page.html',
  styleUrl: './project-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectPage implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private transition = inject(TransitionService);
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private ctx?: gsap.Context;

  private slug = inject(ActivatedRoute).snapshot.paramMap.get('slug');
  readonly project: Project | undefined = PROJECTS.find(
    (p) => p.slug === this.slug && !!p.case
  );

  constructor() {
    if (!this.project) {
      // Unbekannter Slug: zurück zur Story, aber erst nach Abschluss
      // der laufenden Navigation.
      queueMicrotask(() => void this.router.navigateByUrl('/'));
      return;
    }
    this.title.setTitle(`${this.project.name} — Case Study · Martin Lackner`);
    this.meta.updateTag({ name: 'description', content: this.project.description });
    this.motion.chapter.set('CASE / ' + this.project.slug.toUpperCase());
  }

  ngAfterViewInit(): void {
    if (!this.project || !this.motion.isBrowser) return;

    if (this.motion.reducedMotion) {
      gsap.set('[data-reveal]', { clearProps: 'all', opacity: 1 });
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
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
    });
  }

  back(): void {
    void this.transition.navigate('/#work');
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
