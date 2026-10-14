import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Kennt die Umgebung (Browser, Reduced Motion, feiner Zeiger) und
 * registriert GSAP-Plugins genau einmal.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly reducedMotion: boolean;
  readonly finePointer: boolean;

  constructor() {
    if (this.isBrowser) {
      gsap.registerPlugin(ScrollTrigger);
      this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    } else {
      this.reducedMotion = true;
      this.finePointer = false;
    }
  }
}
