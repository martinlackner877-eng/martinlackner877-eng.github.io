import { Component, ChangeDetectionStrategy, inject, signal, computed, afterNextRender, DestroyRef, ElementRef, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTENT, Lang } from '../content';
import { MotionService } from '../core/motion.service';
import { WaferBus } from '../core/wafer-bus';
import { Magnetic } from '../shared/directives/magnetic.directive';
import { Tilt } from '../shared/directives/tilt.directive';
import { Logo } from './logo';
import { WaferStage } from './wafer-stage';
import { ResearchLab } from './research-lab';
import { PhotoWafer } from './photo-wafer';
import { ContactForm } from './contact-form';
import { scramble, countUp } from './fx';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, Magnetic, Tilt, Logo, WaferStage, ResearchLab, PhotoWafer, ContactForm],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  private readonly motion = inject(MotionService);
  private readonly bus = inject(WaferBus);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly logo = viewChild.required(Logo);
  private readonly logoRef = viewChild.required(Logo, { read: ElementRef });
  private readonly legalDlg = viewChild.required<ElementRef<HTMLDialogElement>>('legal');

  readonly lang = (inject(ActivatedRoute).snapshot.data['lang'] as Lang) ?? 'de';
  readonly c = CONTENT[this.lang];
  readonly locale = this.lang === 'de' ? 'de-DE' : 'en-US';
  readonly mode = signal<'dark' | 'light'>('dark');
  readonly toastText = signal('');
  readonly toastOn = signal(false);
  readonly solidBar = signal(false);
  readonly nameLines = ['Martin', 'Lackner'];
  readonly year = 2026;
  readonly turnstileTheme = computed(() => this.mode());

  constructor() {
    inject(Title).setTitle(this.c.meta.title);
    inject(Meta).updateTag({ name: 'description', content: this.c.meta.description });
    afterNextRender(() => this.init());
  }

  go(id: string, e?: Event): void {
    e?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: this.motion.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  toggleMode(): void {
    const m = this.mode() === 'light' ? 'dark' : 'light';
    this.setMode(m);
    if (m === 'light') this.toast(this.c.toasts.clean);
  }

  openLegal(): void { this.legalDlg().nativeElement.showModal(); }
  closeLegal(): void { this.legalDlg().nativeElement.close(); }

  shipped(): void { this.bus.ship = 1; this.toast(this.c.toasts.shipped); }

  private tt?: ReturnType<typeof setTimeout>;
  toast(t: string): void {
    this.toastText.set(t); this.toastOn.set(true);
    clearTimeout(this.tt); this.tt = setTimeout(() => this.toastOn.set(false), 2600);
  }

  private setMode(m: 'dark' | 'light'): void {
    this.mode.set(m);
    document.documentElement.dataset['mode'] = m;
    try { localStorage.setItem('wafer-mode', m); } catch { /* privat oder gesperrt */ }
  }

  private init(): void {
    const root = this.host.nativeElement, reduce = this.motion.reducedMotion, fine = this.motion.finePointer;
    document.documentElement.lang = this.lang;
    try { const m = localStorage.getItem('wafer-mode'); if (m === 'light' || m === 'dark') this.setMode(m); } catch { /* egal */ }
    const off: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: K, f: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => { addEventListener(t, f, o); off.push(() => removeEventListener(t, f)); };

    // Wafer: Ziel für den Flug ins Logo, Sichtbarkeit, Modus
    this.bus.heroP = 0; this.bus.mode = 'hero'; this.bus.visible = true;
    this.bus.logoEl = this.logoRef().nativeElement;
    this.bus.onBorn = () => { this.logo().play(); this.toast(this.c.toasts.born); };
    const vis = { intro: true, contact: false };
    const upd = () => { this.bus.mode = vis.contact && !vis.intro ? 'contact' : 'hero'; this.bus.visible = vis.intro || vis.contact; };
    const vio = new IntersectionObserver((es) => { es.forEach((x) => { vis[(x.target as HTMLElement).id === 'kontakt' ? 'contact' : 'intro'] = x.isIntersecting; }); upd(); }, { threshold: 0 });
    vio.observe(root.querySelector('#top')!); vio.observe(root.querySelector('#kontakt')!);
    off.push(() => vio.disconnect());

    // Leiste bekommt Grund über dem Inhalt
    const content = root.querySelector<HTMLElement>('#content')!;
    on('scroll', () => { const r = content.getBoundingClientRect(); this.solidBar.set(r.top < 70 && r.bottom > 70); }, { passive: true });

    // Einblenden, entschlüsseln, hochzählen
    const rio = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); rio.unobserve(x.target); } }), { threshold: 0.15 });
    root.querySelectorAll('.reveal').forEach((x) => rio.observe(x));
    const sio = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { const el = x.target as HTMLElement; scramble(el, el.dataset['text'] ?? '', 700, reduce); sio.unobserve(el); } }), { threshold: 0.6 });
    root.querySelectorAll<HTMLElement>('.scr').forEach((h) => { h.dataset['text'] = h.textContent ?? ''; sio.observe(h); });
    const cio = new IntersectionObserver((es) => es.forEach((x) => { if (!x.isIntersecting) return; const el = x.target as HTMLElement; cio.unobserve(el); countUp(el, +el.dataset['count']!, +el.dataset['dec']!, el.dataset['unit'] ?? '', reduce, this.locale); }), { threshold: 0.6 });
    root.querySelectorAll('[data-count]').forEach((b) => cio.observe(b));
    off.push(() => { rio.disconnect(); sio.disconnect(); cio.disconnect(); });

    // GSAP: Einstieg als Scroll-Geschichte, Belichtung der Projekte, Werdegang-Linie
    const ctx = gsap.context(() => {
      if (reduce) { root.querySelectorAll('.cv li').forEach((li) => li.classList.add('on')); return; }
      root.querySelector('#top')!.classList.add('scrolly');
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        gsap.from('#name .ch', { yPercent: 110, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035, delay: 0.2 });
        gsap.from('.h-copy .sub, .h-copy .acts', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.9 });
        const claim = root.querySelector<HTMLElement>('#claim')!;
        setTimeout(() => scramble(claim, this.c.hero.claim, 1100), 500);
        ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (st) => { this.bus.heroP = st.progress; } });
        const tl = gsap.timeline({ scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
        tl.to('.h-copy', { y: -90, opacity: 0, duration: 0.14, ease: 'none' }, 0.02).to('.scrollhint', { opacity: 0, duration: 0.05 }, 0);
        [[0.1, 0.27], [0.3, 0.44], [0.47, 0.64], [0.7, 0.93]].forEach(([a, b], i) => {
          tl.fromTo(`#cap${i}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.07 }, a).to(`#cap${i}`, { opacity: 0, y: -30, duration: 0.06 }, b);
        });
        gsap.fromTo('#portrait', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top bottom', end: 'bottom top', scrub: true } });
        root.querySelectorAll<HTMLElement>('.shot').forEach((s) => {
          const img = s.querySelector('img'), ex = s.querySelector('.expo');
          gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 80%', once: true } })
            .set(img, { clipPath: 'inset(0 100% 0 0)' }).to(ex, { scaleX: 1, duration: 0.45, ease: 'power3.in' })
            .set(img, { clipPath: 'inset(0 0% 0 0)' }).to(ex, { scaleX: 0, transformOrigin: 'right', duration: 0.5, ease: 'power3.out' });
        });
        gsap.to('#lineFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#track', start: 'top 70%', end: 'bottom 60%', scrub: true } });
        root.querySelectorAll('.cv li').forEach((li) => ScrollTrigger.create({ trigger: li, start: 'top 65%', onEnter: () => li.classList.add('on'), onLeaveBack: () => li.classList.remove('on') }));
      });
    }, root);
    off.push(() => ctx.revert());

    // Cursor-Chip
    if (fine && !reduce) {
      const cur = root.querySelector<HTMLElement>('.cur')!;
      let cx = -50, cy = -50, px = -50, py = -50, raf = 0;
      on('pointermove', (e) => { px = e.clientX; py = e.clientY; cur.classList.add('on'); const t = (e.target as Element).closest<HTMLElement>('[data-cursor]'); cur.classList.toggle('big', !!t); cur.textContent = t?.dataset['cursor'] ?? ''; });
      const loop = () => { cx += (px - cx) * 0.2; cy += (py - cy) * 0.2; cur.style.transform = `translate(${cx}px, ${cy}px)`; raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      off.push(() => cancelAnimationFrame(raf));
    }

    // Überraschungen: „warum“/„why“ tippen, dreimal aufs Logo
    const word = this.lang === 'de' ? 'warum' : 'why';
    let typed = '', clicks = 0, last = 0;
    on('keydown', (e) => { if ((e.target as Element).closest('input, textarea')) return; typed = (typed + e.key.toLowerCase()).slice(-word.length); if (typed === word) this.toast(this.c.toasts.why); });
    const logoA = this.logoRef().nativeElement.closest('a');
    const onLogo = () => { const now = Date.now(); clicks = now - last < 600 ? clicks + 1 : 1; last = now; if (clicks >= 3) { const el = this.logoRef().nativeElement as HTMLElement; el.classList.add('ok'); this.toast(this.c.toasts.logo); setTimeout(() => el.classList.remove('ok'), 1800); clicks = 0; } };
    logoA?.addEventListener('click', onLogo); off.push(() => logoA?.removeEventListener('click', onLogo));
    const onEnter = () => this.logo().play();
    logoA?.addEventListener('mouseenter', onEnter); off.push(() => logoA?.removeEventListener('mouseenter', onEnter));

    this.destroyRef.onDestroy(() => { off.forEach((f) => f()); clearTimeout(this.tt); this.bus.logoEl = null; });
  }
}
