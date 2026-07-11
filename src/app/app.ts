import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, NgZone, inject
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { gsap } from 'gsap';
import { MotionService } from './core/motion.service';
import { TransitionService } from './core/transition.service';
import { Preloader } from './shared/components/preloader';
import { Cursor } from './shared/components/cursor';
import { Grain } from './shared/components/grain';
import { PageTransition } from './shared/components/page-transition';

/**
 * Shell: alles, was über der gescrollten Bühne liegt (fixed), lebt hier —
 * außerhalb von #smooth-content, weil position:fixed innerhalb des
 * transformierten Smoother-Contents nicht funktioniert.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Preloader, Cursor, Grain, PageTransition],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements AfterViewInit, OnDestroy {
  readonly motion = inject(MotionService);
  private transition = inject(TransitionService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private ctx?: gsap.Context;

  readonly year = new Date().getFullYear();

  constructor() {
    // Browser-Back/Forward läuft ohne Curtain — Scroll & Trigger trotzdem nachziehen.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        if (!this.motion.isBrowser || this.transition.busy) return;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => this.motion.refreshAfterRouteChange())
        );
      });
  }

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser) return;

    if (this.motion.finePointer && !this.motion.reducedMotion) {
      document.body.classList.add('has-custom-cursor');
    }

    this.ngZone.runOutsideAngular(() => {
      this.motion.initSmoother();
      if (this.motion.reducedMotion) return;

      this.ctx = gsap.context(() => {
        gsap.to('.nav-progress-bar', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  onIntroDone(): void {
    this.motion.introDone.set(true);
  }

  onAnchor(event: Event, anchor: string): void {
    event.preventDefault();
    if (this.isHome()) {
      this.motion.scrollTo('#' + anchor);
    } else {
      void this.transition.navigate('/#' + anchor);
    }
  }

  onLogo(event: Event): void {
    event.preventDefault();
    if (this.isHome()) {
      this.motion.scrollTo('#top');
    } else {
      void this.transition.navigate('/');
    }
  }

  private isHome(): boolean {
    return this.router.url.split('#')[0] === '/';
  }
}
