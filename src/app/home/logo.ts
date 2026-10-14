import { Component, ChangeDetectionStrategy, ElementRef, inject, afterNextRender } from '@angular/core';

/** Wafer-Stempel: 11 × 11 Chips im Kreis, 20 davon bilden „ML“, die Kerbe ist orange. */
const M = ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'];
const L = ['X..', 'X..', 'X..', 'X..', 'XXX'];
const N = 11, P = 8.2, S = 6.6, O = 50 - (N * P) / 2 + (P - S) / 2, R = 45.5;

interface Die { x: number; y: number; ml: boolean; i: number }
function dies(): Die[] {
  const on = new Set<string>();
  M.forEach((row, r) => [...row].forEach((c, k) => c === 'X' && on.add(`${1 + k},${3 + r}`)));
  L.forEach((row, r) => [...row].forEach((c, k) => c === 'X' && on.add(`${7 + k},${3 + r}`)));
  const out: Die[] = [];
  let i = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const x = +(O + c * P).toFixed(2), y = +(O + r * P).toFixed(2);
    const inside = [[x, y], [x + S, y], [x, y + S], [x + S, y + S]].every(([a, b]) => (a - 50) ** 2 + (b - 50) ** 2 <= R * R);
    if (!inside || r === 0 || c === 0 || c === N - 1 || (y > 82 && Math.abs(x + S / 2 - 50) < 9)) continue;
    const ml = on.has(`${c},${r}`);
    out.push({ x, y, ml, i: ml ? i++ : 0 });
  }
  return out;
}
const DIES = dies();

@Component({
  selector: 'app-logo',
  template: `
    <svg class="logo" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" stroke-width="2" />
      <g class="grid" fill="currentColor">
        @for (d of grid; track $index) { <rect [attr.x]="d.x" [attr.y]="d.y" [attr.width]="size" [attr.height]="size" rx="0.8" /> }
      </g>
      <g class="ml" fill="currentColor">
        @for (d of ml; track d.i) { <rect class="d" [attr.x]="d.x" [attr.y]="d.y" [attr.width]="size" [attr.height]="size" rx="0.8" [style.--i]="d.i" /> }
      </g>
      <path class="notch" d="M44.5 98.6 L50 92.4 L55.5 98.6 Z" fill="#ED440D" />
    </svg>`,
  styles: `
    :host { display: inline-block; width: 40px; height: 40px; color: var(--ink); }
    .logo { width: 100%; height: 100%; overflow: visible; display: block; }
    .grid { opacity: .28; }
    .ml .d { transform-box: fill-box; transform-origin: center; transition: fill .2s ease; }
    .anim .ml .d { animation: probe .32s cubic-bezier(.2,.7,.2,1) both; animation-delay: calc(.2s + var(--i) * 45ms); }
    .anim .notch { animation: notch .6s ease both 1.2s; }
    :host(.ok) .ml .d { fill: var(--accent); }
    @keyframes probe { from { opacity: 0; transform: scale(.3); } }
    @keyframes notch { from { transform: translateY(6px); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .anim .ml .d, .anim .notch { animation: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Logo {
  readonly grid = DIES.filter((d) => !d.ml);
  readonly ml = DIES.filter((d) => d.ml);
  readonly size = S;
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.play());
  }

  /** Die ML-Chips leuchten nacheinander auf, wie beim Prüfen. */
  play(): void {
    const svg = this.host.nativeElement.querySelector('svg');
    if (!svg) return;
    svg.classList.remove('anim');
    void svg.getBoundingClientRect();
    svg.classList.add('anim');
  }
}
