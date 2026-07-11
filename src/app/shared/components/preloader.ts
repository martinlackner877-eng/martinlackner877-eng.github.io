import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject, signal, output
} from '@angular/core';
import { gsap } from 'gsap';
import { MotionService, SCRAMBLE_CHARS } from '../../core/motion.service';

/**
 * Boot-Sequenz beim ersten Besuch: Statuszeilen decodieren sich,
 * Zähler läuft auf 100 %, dann teilt sich der Vorhang ins Hero.
 * Folgebesuche (sessionStorage) und Reduced Motion überspringen alles.
 */
@Component({
  selector: 'app-preloader',
  template: `
    @if (visible()) {
      <div class="pre" role="status" aria-label="Seite lädt">
        <div class="pre-half pre-half-top"></div>
        <div class="pre-half pre-half-bottom"></div>
        <div class="pre-center">
          <div class="pre-lines" aria-hidden="true">
            @for (line of bootLines; track line) {
              <span class="pre-line">{{ line }}</span>
            }
          </div>
          <div class="pre-percent" aria-hidden="true">
            <span class="pre-num">0</span><span class="pre-unit">%</span>
          </div>
          <div class="pre-bar" aria-hidden="true"><span class="pre-bar-fill"></span></div>
        </div>
      </div>
    }
  `,
  styles: `
    .pre {
      position: fixed;
      inset: 0;
      z-index: 200;
    }
    .pre-half {
      position: absolute;
      left: 0;
      right: 0;
      height: 50.5%;
      background: var(--bg);
    }
    .pre-half-top { top: 0; }
    .pre-half-bottom { bottom: 0; }
    .pre-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.6rem;
    }
    .pre-lines {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      color: var(--muted);
      min-height: 5.2rem;
      text-align: center;
    }
    .pre-line { opacity: 0; }
    .pre-percent {
      font-family: var(--font-display);
      font-size: clamp(3rem, 8vw, 5.5rem);
      font-weight: 600;
      line-height: 1;
      color: var(--text);
    }
    .pre-unit { color: var(--cyan); font-size: 0.4em; margin-left: 0.15em; }
    .pre-bar {
      width: min(280px, 60vw);
      height: 1px;
      background: var(--line);
      overflow: hidden;
    }
    .pre-bar-fill {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--violet), var(--cyan));
      transform: scaleX(0);
      transform-origin: left center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Preloader implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private ctx?: gsap.Context;

  readonly done = output<void>();
  readonly visible = signal(true);

  readonly bootLines = [
    'init design.sys',
    'load code.sys',
    'load security.sys',
    'link neural.net'
  ];

  private static readonly SEEN_KEY = 'ml-boot-seen';

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser) return;

    const skip =
      this.motion.reducedMotion || sessionStorage.getItem(Preloader.SEEN_KEY) === '1';
    if (skip) {
      this.visible.set(false);
      this.done.emit();
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const el = this.host.nativeElement;
        const num = el.querySelector('.pre-num') as HTMLElement;
        const lines = gsap.utils.toArray<HTMLElement>('.pre-line', el);
        const state = { n: 0 };

        gsap.timeline({
          onComplete: () => {
            sessionStorage.setItem(Preloader.SEEN_KEY, '1');
            this.visible.set(false);
          }
        })
          .to(state, {
            n: 100, duration: 2.2, ease: 'power2.inOut', snap: { n: 1 },
            onUpdate: () => { num.textContent = String(state.n); }
          }, 0)
          .to('.pre-bar-fill', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0)
          .to(lines, {
            opacity: 1, duration: 0.5, stagger: 0.38,
            scrambleText: { text: '{original}', chars: SCRAMBLE_CHARS, speed: 0.5 }
          }, 0.1)
          .to('.pre-center', { opacity: 0, duration: 0.35, ease: 'power2.in' }, 2.35)
          .add(() => this.done.emit(), 2.6)
          .to('.pre-half-top', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 2.6)
          .to('.pre-half-bottom', { yPercent: 100, duration: 0.9, ease: 'expo.inOut' }, 2.6);
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
