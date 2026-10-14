/** Kleine Effekte, die mehrere Bausteine nutzen. */

const CHARS = '01ABCDEFGHKLMNPRSTXYZ#%&';

/** Text entschlüsselt sich von links nach rechts aus Zufallszeichen. */
export function scramble(el: HTMLElement, text: string, ms = 800, reduce = false): void {
  if (reduce) { el.textContent = text; return; }
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min((t - t0) / ms, 1), n = Math.floor(k * text.length);
    el.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)])).join('');
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Zahl zählt hoch, im Zahlenformat der Sprache. */
export function countUp(el: HTMLElement, end: number, dec: number, unit: string, reduce = false, locale = 'de-DE'): void {
  const fmt = (v: number) => v.toLocaleString(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + unit;
  if (reduce) { el.textContent = fmt(end); return; }
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min((t - t0) / 1400, 1);
    el.textContent = fmt(end * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
