import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

/** Zeichenvorrat für alle Scramble-/Decode-Effekte — ein Look für die ganze Seite. */
export const SCRAMBLE_CHARS = '█▓▒░<>/_01';

/**
 * Zentrale Motion-Instanz: registriert GSAP-Plugins genau einmal,
 * kennt die Umgebung (Browser, Reduced Motion, Pointer-Typ) und
 * besitzt den ScrollSmoother, der die ganze Seite fährt.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly reducedMotion: boolean;
  readonly finePointer: boolean;

  /** Preloader fertig → Hero darf seinen Auftritt spielen. */
  readonly introDone = signal(false);
  /** Aktuelles Story-Kapitel, angezeigt in der Nav. */
  readonly chapter = signal('00 / INIT');

  private smootherRef?: ScrollSmoother;

  constructor() {
    if (this.isBrowser) {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, ScrambleTextPlugin);
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.finePointer = window.matchMedia('(pointer: fine)').matches;
    } else {
      this.reducedMotion = true;
      this.finePointer = false;
    }
  }

  get smoother(): ScrollSmoother | undefined {
    return this.smootherRef;
  }

  /** Einmalig von der Shell aufgerufen, sobald #smooth-wrapper im DOM steht. */
  initSmoother(): void {
    if (!this.isBrowser || this.reducedMotion || this.smootherRef) return;
    this.smootherRef = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.2,
      effects: true,
      smoothTouch: false,
      normalizeScroll: true
    });
  }

  /** Sanft zu einem Ziel scrollen (Nav-Anker) — mit und ohne Smoother. */
  scrollTo(target: string): void {
    if (!this.isBrowser) return;
    if (this.smootherRef) {
      this.smootherRef.scrollTo(target, true, 'top 88px');
    } else {
      gsap.to(window, { scrollTo: { y: target, offsetY: 88 }, duration: 0.8, ease: 'power2.inOut' });
    }
  }

  /** Sofort an den Seitenanfang (Routenwechsel hinter dem Vorhang). */
  scrollTop(): void {
    if (!this.isBrowser) return;
    if (this.smootherRef) {
      this.smootherRef.scrollTop(0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  /**
   * Nach einem Routenwechsel: neue [data-speed]/[data-lag]-Elemente
   * beim Smoother anmelden und alle Trigger neu vermessen.
   */
  refreshAfterRouteChange(): void {
    if (!this.isBrowser) return;
    this.smootherRef?.effects('[data-speed], [data-lag]');
    ScrollTrigger.refresh();
  }
}
