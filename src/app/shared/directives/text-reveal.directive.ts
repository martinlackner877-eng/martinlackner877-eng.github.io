import { Directive, AfterViewInit, OnDestroy, ElementRef, NgZone, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MotionService } from '../../core/motion.service';

export type RevealMode = 'lines' | 'words' | 'chars';

/**
 * [appTextReveal] — SplitText-Reveal beim Scrollen: Zeilen/Wörter/Chars
 * steigen aus einer Maske. Wartet auf document.fonts.ready, damit die
 * Zeilenumbrüche stimmen. Bei Reduced Motion bleibt der Text einfach stehen.
 */
@Directive({ selector: '[appTextReveal]' })
export class TextReveal implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private motion = inject(MotionService);

  readonly appTextReveal = input<RevealMode | ''>('lines');
  readonly revealStart = input('top 88%');
  readonly revealDelay = input(0);

  private split?: SplitText;
  private trigger?: ScrollTrigger;
  private destroyed = false;

  ngAfterViewInit(): void {
    if (!this.motion.isBrowser || this.motion.reducedMotion) return;

    const el = this.host.nativeElement;
    el.style.opacity = '0'; // kein FOUC, bis die Fonts stehen und gesplittet ist

    document.fonts.ready.then(() => {
      if (this.destroyed) return;
      this.ngZone.runOutsideAngular(() => this.build(el));
    });
  }

  private build(el: HTMLElement): void {
    const mode = this.appTextReveal() || 'lines';
    const config: Record<RevealMode, { type: string; stagger: number; duration: number }> = {
      lines: { type: 'lines', stagger: 0.09, duration: 1 },
      words: { type: 'lines,words', stagger: 0.035, duration: 0.85 },
      chars: { type: 'lines,chars', stagger: 0.018, duration: 0.7 }
    };
    const cfg = config[mode];

    this.split = SplitText.create(el, {
      type: cfg.type,
      mask: 'lines',
      linesClass: 'reveal-line',
      charsClass: 'tr-char'
    });

    const targets =
      mode === 'chars' ? this.split.chars : mode === 'words' ? this.split.words : this.split.lines;

    el.style.opacity = '1';
    gsap.set(targets, { yPercent: 120 });

    const tween = gsap.to(targets, {
      yPercent: 0,
      duration: cfg.duration,
      stagger: cfg.stagger,
      delay: this.revealDelay(),
      ease: 'power3.out',
      paused: true
    });

    this.trigger = ScrollTrigger.create({
      trigger: el,
      start: this.revealStart(),
      once: true,
      onEnter: () => tween.play()
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.trigger?.kill();
    this.split?.revert();
  }
}
