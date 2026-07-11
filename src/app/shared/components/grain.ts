import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Film-Grain über der ganzen Seite: SVG-Turbulence als Data-URI,
 * leicht animiert (steps), damit es lebt statt klebt.
 */
@Component({
  selector: 'app-grain',
  template: `<div class="grain" aria-hidden="true"></div>`,
  styles: `
    .grain {
      position: fixed;
      inset: -60px;
      z-index: 150;
      pointer-events: none;
      opacity: 0.055;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      animation: grain-shift 0.7s steps(4) infinite;
    }
    @keyframes grain-shift {
      0%   { transform: translate(0, 0); }
      25%  { transform: translate(-18px, 12px); }
      50%  { transform: translate(14px, -16px); }
      75%  { transform: translate(-10px, -8px); }
      100% { transform: translate(0, 0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .grain { animation: none; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Grain {}
