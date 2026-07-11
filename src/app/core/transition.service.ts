import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MotionService } from './motion.service';

/**
 * Choreografierte Routenwechsel: Curtain zu → Route wechselt verdeckt →
 * Scroll auf 0, Trigger neu vermessen → Curtain auf.
 * Die PageTransition-Komponente registriert hier ihre Timelines.
 */
@Injectable({ providedIn: 'root' })
export class TransitionService {
  private router = inject(Router);
  private motion = inject(MotionService);

  private coverFn?: () => Promise<void>;
  private revealFn?: () => Promise<void>;
  private navigating = false;

  register(cover: () => Promise<void>, reveal: () => Promise<void>): void {
    this.coverFn = cover;
    this.revealFn = reveal;
  }

  /** Von allen internen Links statt routerLink verwendet. */
  async navigate(url: string): Promise<void> {
    if (this.navigating) return;

    // Ohne Browser/Motion/Overlay: nüchtern navigieren.
    if (!this.motion.isBrowser || this.motion.reducedMotion || !this.coverFn || !this.revealFn) {
      await this.router.navigateByUrl(url);
      this.motion.scrollTop();
      return;
    }

    this.navigating = true;
    try {
      await this.coverFn();
      await this.router.navigateByUrl(url);
      this.motion.scrollTop();
      await this.nextFrames(2); // neue Seite einmal malen lassen
      this.motion.refreshAfterRouteChange();
      await this.revealFn();
    } finally {
      this.navigating = false;
    }
  }

  /** true, solange ein choreografierter Wechsel läuft (für Browser-Back-Erkennung). */
  get busy(): boolean {
    return this.navigating;
  }

  private nextFrames(n: number): Promise<void> {
    return new Promise((resolve) => {
      const step = (left: number) =>
        left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
      step(n);
    });
  }
}
