import { Component, ChangeDetectionStrategy, ElementRef, input, signal, computed, afterNextRender, viewChild, DestroyRef, inject } from '@angular/core';
import { Content } from '../content';

type P = Content['photos'];
interface Cell { r: number; c: number; photo: number }

/** Reihen 3-5-7-7-7-5-3 ergeben eine runde Scheibe aus 37 Chips; Fotos in die Mitte, außen Testfelder. */
const ROWS = [3, 5, 7, 7, 7, 5, 3];

@Component({
  selector: 'app-photo-wafer',
  template: `
    <div class="disc"><div class="dies" #dies [class.in]="shown()">
      @for (cell of cells(); track $index; let k = $index) {
        @if (cell.photo >= 0) {
          <button type="button" [style.grid-row]="cell.r + 1" [style.grid-column]="cell.c + 1" [style.--k]="k" [attr.data-cursor]="c().open"
                  [attr.aria-label]="c().open + ': ' + c().list[cell.photo].caption" (click)="open(cell.photo)">
            <img [src]="'img/' + c().list[cell.photo].file + '-s.webp'" [alt]="c().list[cell.photo].caption" loading="lazy" width="480" height="480" />
          </button>
        } @else {
          <span class="blank" [style.grid-row]="cell.r + 1" [style.grid-column]="cell.c + 1" [style.--k]="k" aria-hidden="true"></span>
        }
      }
    </div></div>
    <p class="count">{{ c().count(c().list.length, cells().length - c().list.length) }}</p>
    <dialog #lb class="lb" [attr.aria-label]="current().caption" (click)="backdrop($event)" (keydown)="keys($event)">
      @if (current(); as p) { <img [src]="'img/' + p.file + '.webp'" [alt]="p.caption" /> }
      <div class="row">
        <span>{{ current().caption }} · {{ idx() + 1 }} {{ c().of }} {{ c().list.length }}</span>
        <span class="btns"><button type="button" (click)="step(-1)">{{ c().prev }}</button><button type="button" (click)="step(1)">{{ c().next }}</button><button type="button" (click)="close()">{{ c().close }}</button></span>
      </div>
    </dialog>
  `,
  styles: `
    :host { display: grid; justify-items: center; }
    .disc { position: relative; width: min(880px, 94vw); aspect-ratio: 1; border-radius: 50%; background: var(--surface); display: grid; place-items: center; }
    .disc::after { content: ""; position: absolute; left: 50%; bottom: -1px; width: 30px; height: 16px; translate: -50% 0; background: var(--accent); clip-path: polygon(0 100%, 50% 0, 100% 100%); }
    .dies { width: 82%; display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.1%; }
    button, .blank { aspect-ratio: 1; border-radius: 4px; overflow: hidden; background: var(--die); position: relative;
      transition: transform .55s cubic-bezier(.34,1.56,.64,1) calc(var(--k, 0) * 28ms), opacity .4s ease calc(var(--k, 0) * 28ms), box-shadow .25s ease; }
    button { all: unset; aspect-ratio: 1; border-radius: 4px; overflow: hidden; background: var(--die); position: relative; cursor: pointer;
      transition: transform .55s cubic-bezier(.34,1.56,.64,1) calc(var(--k, 0) * 28ms), opacity .4s ease calc(var(--k, 0) * 28ms), box-shadow .25s ease; }
    .dies:not(.in) button, .dies:not(.in) .blank { transform: scale(.2); opacity: 0; }
    .blank::after { content: ""; position: absolute; inset: 28%; border-radius: 2px; background: var(--ink); opacity: .08; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .dies.in button:hover, .dies.in button:focus-visible { transform: scale(1.18); z-index: 2; box-shadow: 0 12px 30px rgba(0,0,0,.45); transition-delay: 0s; }
    button:focus-visible { outline: 3px solid var(--accent); }
    .count { margin-top: 24px; font-size: 14px; color: var(--muted); font-variant-numeric: tabular-nums; }
    dialog.lb { border: 0; padding: 0; background: transparent; max-width: min(92vw, 1100px); max-height: 92svh; color: var(--ink); }
    dialog.lb::backdrop { background: rgba(5, 6, 8, .9); }
    dialog.lb img { max-width: 100%; max-height: 80svh; width: auto; height: auto; margin: 0 auto; border-radius: 6px; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 4px 0; font-size: 15px; flex-wrap: wrap; }
    .btns { display: flex; gap: 8px; }
    .btns button { all: unset; min-height: 44px; padding: 0 16px; border-radius: 999px; background: var(--surface); color: var(--ink); font: 500 14px/44px var(--font); cursor: pointer; }
    .btns button:focus-visible { outline: 3px solid var(--accent); }
    @media (prefers-reduced-motion: reduce) { button, .blank { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoWafer {
  readonly c = input.required<P>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly diesEl = viewChild.required<ElementRef<HTMLElement>>('dies');
  private readonly lb = viewChild.required<ElementRef<HTMLDialogElement>>('lb');
  readonly shown = signal(false);
  readonly idx = signal(0);
  readonly current = computed(() => this.c().list[this.idx()]);

  readonly cells = computed<Cell[]>(() => {
    const cells: Cell[] = [];
    ROWS.forEach((w, r) => { const start = (7 - w) / 2; for (let c = 0; c < w; c++) cells.push({ r, c: start + c, photo: -1 }); });
    const n = this.c().list.length;
    [...cells].sort((a, b) => Math.hypot(a.r - 3, a.c - 3) - Math.hypot(b.r - 3, b.c - 3)).forEach((cell, i) => { cell.photo = i < n ? i : -1; });
    return cells;
  });

  constructor() {
    afterNextRender(() => {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { this.shown.set(true); io.disconnect(); } }, { threshold: 0.2 });
      io.observe(this.diesEl().nativeElement);
      this.destroyRef.onDestroy(() => io.disconnect());
    });
  }

  open(i: number): void { this.idx.set(i); this.lb().nativeElement.showModal(); }
  close(): void { this.lb().nativeElement.close(); }
  step(d: number): void { const n = this.c().list.length; this.idx.update((i) => (i + d + n) % n); }
  backdrop(e: MouseEvent): void { if (e.target === this.lb().nativeElement) this.close(); }
  keys(e: KeyboardEvent): void { if (e.key === 'ArrowRight') this.step(1); if (e.key === 'ArrowLeft') this.step(-1); }
}
