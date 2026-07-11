import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OFFLINE_INTRO, OFFLINE_PHOTOS } from '../../../data/portfolio.data';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';

/**
 * Kapitel 06 — „Offline": der Mensch hinter dem Code. Persönliche
 * Fotos als versetzte Galerie; data-lag lässt die Kacheln beim
 * Scrollen unterschiedlich träge nachschweben (ScrollSmoother).
 */
@Component({
  selector: 'app-offline-section',
  imports: [Scramble, TextReveal],
  templateUrl: './offline.html',
  styleUrl: './offline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfflineSection {
  readonly intro = OFFLINE_INTRO;
  readonly photos = OFFLINE_PHOTOS;

  /** Zyklische Trägheit: Nachbar-Kacheln schweben unterschiedlich. */
  lagFor(index: number): number {
    return [0.05, 0.22, 0.12, 0.3][index % 4];
  }
}
