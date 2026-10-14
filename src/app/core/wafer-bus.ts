import { Injectable } from '@angular/core';

/**
 * Gemeinsamer Zustand zwischen Seite und 3D-Wafer. Absichtlich keine Signals:
 * die Werte ändern sich pro Frame und werden nur in der Render-Schleife gelesen.
 */
@Injectable({ providedIn: 'root' })
export class WaferBus {
  /** Fortschritt der Scroll-Geschichte im Einstieg, 0 bis 1. */
  heroP = 0;
  /** 'hero': Geschichte im Einstieg, 'contact': Rückkehr beim Kontakt. */
  mode: 'hero' | 'contact' = 'hero';
  /** Nur zeichnen, wenn Einstieg oder Kontakt sichtbar sind. */
  visible = true;
  /** Das Element, in das der Wafer am Ende des Einstiegs fliegt. */
  logoEl: HTMLElement | null = null;
  /** Wird aufgerufen, wenn der Wafer im Logo angekommen ist. */
  onBorn: () => void = () => {};
  /** Wafer kurz schnell drehen lassen (nach dem Absenden). */
  ship = 0;
}
