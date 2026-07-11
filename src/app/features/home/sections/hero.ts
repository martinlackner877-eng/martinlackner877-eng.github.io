import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject, viewChild, effect, signal
} from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MotionService, SCRAMBLE_CHARS } from '../../../core/motion.service';
import { HERO_KICKER } from '../../../data/portfolio.data';
import { NeuralCanvas } from '../../../shared/components/neural-canvas';

/**
 * Kapitel 00 — „Signal": Neural-Canvas hinter riesiger Typo.
 * Intro startet, sobald der Preloader fertig ist (introDone).
 * Beim Scrollen bleibt der Hero gepinnt, die Headline driftet
 * auseinander und das Partikelnetz verdichtet sich zur Mitte.
 */
@Component({
  selector: 'app-hero-section',
  imports: [NeuralCanvas],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSection implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);
  private ctx?: gsap.Context;

  readonly kicker = HERO_KICKER;
  readonly canvasRef = viewChild(NeuralCanvas);

  private readonly setupDone = signal(false);
  private intro?: gsap.core.Timeline;
  private introPlayed = false;
  private destroyed = false;
  private onPointer?: (e: MouseEvent) => void;

  constructor() {
    effect(() => {
      if (this.motion.introDone() && this.setupDone() && !this.introPlayed) {
        this.introPlayed = true;
        this.ngZone.runOutsideAngular(() => this.intro?.play());
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      document.fonts.ready.then(() => {
        if (this.destroyed) return;
        this.ctx = gsap.context(() => this.setup(), this.host.nativeElement);
        this.setupDone.set(true);
      });
    });
  }

  private setup(): void {
    const split = SplitText.create('.hero-line-inner', {
      type: 'chars',
      mask: 'chars',
      charsClass: 'tr-char'
    });

    // Startzustände — der Preloader verdeckt die Bühne noch
    gsap.set(split.chars, { yPercent: 120 });
    gsap.set('.hero-kicker, .hero-role, .hero-sub, .hero-cue', { opacity: 0 });
    gsap.set('.hero-figure', { opacity: 0, x: 70 });

    // ─── Auftritt ───
    // Der gepinnte Abgang entsteht erst NACH dem Intro: Scrub-Tweens
    // locken ihre Startwerte beim ersten Render — entstünde er vorher,
    // würde jeder ScrollTrigger.refresh (z. B. Fenster-Resize) Kicker
    // und Figur auf ihre Vor-Intro-Zustände (opacity 0) zurücksetzen.
    this.intro = gsap.timeline({
      paused: true,
      defaults: { ease: 'expo.out' },
      onComplete: () => this.ctx?.add(() => this.buildScrollOut())
    })
      .to('.hero-figure', { opacity: 1, x: 0, duration: 1.4 }, 0.55)
      .to(split.chars, { yPercent: 0, duration: 1.15, stagger: 0.035 }, 0.15)
      .to('.hero-kicker', {
        opacity: 1, duration: 0.9,
        scrambleText: { text: '{original}', chars: SCRAMBLE_CHARS, speed: 0.6 }
      }, 0.5)
      .to('.hero-role', {
        opacity: 1, duration: 0.8,
        scrambleText: { text: '{original}', chars: SCRAMBLE_CHARS, speed: 0.5 }
      }, 0.8)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9 }, 1.05)
      .to('.hero-cue', { opacity: 1, duration: 0.8 }, 1.4);
    gsap.set('.hero-sub', { y: 22 });

    // ─── Maus-Parallax: die Figur weicht der Maus minimal aus (Tiefe) ───
    if (this.motion.finePointer) {
      const img = this.host.nativeElement.querySelector('.hero-figure img') as HTMLElement | null;
      if (img) {
        const fx = gsap.quickTo(img, 'x', { duration: 0.9, ease: 'power2.out' });
        const fy = gsap.quickTo(img, 'y', { duration: 0.9, ease: 'power2.out' });
        this.onPointer = (e: MouseEvent) => {
          fx((e.clientX / window.innerWidth - 0.5) * -22);
          fy((e.clientY / window.innerHeight - 0.5) * -12);
        };
        window.addEventListener('mousemove', this.onPointer, { passive: true });
      }
    }
  }

  /** Gepinnter Abgang — Startwerte explizit (fromTo), damit Refreshes sauber rendern. */
  private buildScrollOut(): void {
    const canvas = this.canvasRef();
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=85%',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          if (canvas) canvas.condense = self.progress;
        }
      }
    })
      .fromTo('.hero-line-a', { xPercent: 0, opacity: 1 }, { xPercent: -14, opacity: 0, ease: 'power1.in' }, 0)
      .fromTo('.hero-line-b', { xPercent: 0, opacity: 1 }, { xPercent: 14, opacity: 0, ease: 'power1.in' }, 0)
      .fromTo('.hero-kicker, .hero-role, .hero-sub, .hero-cue', { opacity: 1, y: 0 }, { opacity: 0, y: -30, ease: 'power1.in' }, 0)
      .fromTo('.hero-figure', { xPercent: 0, opacity: 1 }, { xPercent: 16, opacity: 0, ease: 'power1.in' }, 0)
      .fromTo('.hero-shade', { opacity: 0.6 }, { opacity: 0.85, ease: 'none' }, 0);
  }

  onCue(event: Event): void {
    event.preventDefault();
    this.motion.scrollTo('#band');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.onPointer) window.removeEventListener('mousemove', this.onPointer);
    this.ctx?.revert();
  }
}
