import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ElementRef, NgZone, inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SkillGroup {
  num: string;
  title: string;
  blurb: string;
  skills: string[];
}

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

interface Step {
  num: string;
  title: string;
  text: string;
}

interface TimelineEntry {
  period: string;
  title: string;
  place: string;
  text: string;
}

interface Project {
  name: string;
  url?: string;
  urlLabel?: string;
  description: string;
  tags: string[];
  meta: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private gsapCtx?: gsap.Context;

  readonly year = new Date().getFullYear();

  readonly contact = {
    email: 'martinlackner877@gmail.com',
    linkedin: 'https://www.linkedin.com/in/martinlac',
    github: 'https://github.com/martinlackner877-eng'
  };

  // ─── Hero ───
  readonly heroKicker = 'Martin Lackner · Designer & Developer · Kärnten, AT';

  // ─── About ───
  readonly about: string[] = [
    'Ich bin Martin Lackner, Designer und Web Developer an der Schnittstelle von Design, ' +
      'Softwareentwicklung, Cybersecurity und intelligenten digitalen Systemen.',
    'Mit Background in Netzwerktechnik, Wirtschaftsinformatik, Webentwicklung und industrieller ' +
      'Cybersecurity verbinde ich kreative Gestaltung mit analytischem Systemdenken. ' +
      'Visuell stark, technisch sauber, strategisch durchdacht.',
    'Besonders faszinieren mich Zukunftstechnologien: Large Language Models, Machine Learning, ' +
      'neuronale Netze und datengetriebene Systeme. Und die Frage, wie intelligente Modelle ' +
      'Prozesse effizienter, sicherer und adaptiver machen.'
  ];

  // ─── Keyword-Band ───
  readonly keywords: string[] = [
    'Web Development', 'UI / UX Design', 'Cybersecurity', 'Machine Learning',
    'Large Language Models', 'Neural Networks', 'Data-Driven Systems',
    'Systems Thinking', 'Branding', 'Performance'
  ];

  // ─── Kennzahlen ───
  readonly stats: Stat[] = [
    { value: 5, suffix: '+', label: 'Jahre an der Tech-Front' },
    { value: 4, suffix: '', label: 'Disziplinen vereint' },
    { value: 100, suffix: '%', label: 'Eigenentwicklung' }
  ];

  // ─── Capabilities ───
  readonly skillGroups: SkillGroup[] = [
    {
      num: '01', title: 'Design',
      blurb: 'Interfaces mit Wirkung, von der Idee bis zum pixelgenauen Feinschliff.',
      skills: ['UI / UX Design', 'Design Systems', 'Visual Identity', 'Prototyping', 'Motion', 'Figma']
    },
    {
      num: '02', title: 'Development',
      blurb: 'Sauberer, performanter Code für moderne, wartbare Web-Apps.',
      skills: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'GSAP', 'REST APIs', 'Node.js', 'Git']
    },
    {
      num: '03', title: 'Security & Systems',
      blurb: 'Sicher gedacht, robust gebaut. Vom Netzwerk bis zur Applikation.',
      skills: ['Cybersecurity', 'Netzwerktechnik', 'OWASP', 'Hardening', 'Linux', 'Industrial Security']
    },
    {
      num: '04', title: 'AI & Data',
      blurb: 'Intelligente, datengetriebene Systeme, von ML bis LLM.',
      skills: ['Machine Learning', 'Large Language Models', 'Neural Networks', 'Similarity Search', 'Data Systems', 'Python']
    }
  ];

  // ─── Projekte ───
  readonly projects: Project[] = [
    {
      name: 'ET FIT Drautal',
      url: 'https://www.et-fit.at',
      urlLabel: 'www.et-fit.at',
      description:
        'Konzept, Design und komplette Entwicklung der Website für das kompromissloseste Gym der Region. ' +
        'Angular, Custom-Animationen, SEO-optimiert und DSGVO-konform.',
      tags: ['Angular', 'UI / UX', 'GSAP', 'SEO', 'Branding'],
      meta: '2026 · Angular · 100% Eigenbau'
    }
  ];

  // ─── Arbeitsweise ───
  readonly steps: Step[] = [
    {
      num: '01', title: 'Konzept & Strategie',
      text: 'Zuhören, verstehen, scharf stellen. Jedes Projekt startet mit Klarheit über Ziel, Zielgruppe und Wirkung.'
    },
    {
      num: '02', title: 'Design & Identity',
      text: 'Typografie, Farbe, Rhythmus. Ein visuelles System, das die Marke trägt, statt nur zu dekorieren.'
    },
    {
      num: '03', title: 'Development',
      text: 'Angular, TypeScript, GSAP. Performant, wartbar und sauber bis ins letzte Detail gebaut.'
    },
    {
      num: '04', title: 'Launch & Beyond',
      text: 'SEO, Analytics, Security. Live gehen ist der Anfang, nicht das Ende.'
    }
  ];

  // ─── Stationen ───
  // PLATZHALTER-Struktur: Perioden/Details werden mit echten CV-Daten befüllt,
  // sobald Martin sie liefert. Reihenfolge: neueste zuerst.
  readonly timeline: TimelineEntry[] = [
    {
      period: '····',
      title: 'Industrielle Cybersecurity',
      place: 'Station folgt',
      text: 'OT-/IT-Security, Härtung und Netzwerkarchitektur im industriellen Umfeld.'
    },
    {
      period: '····',
      title: 'Webentwicklung & Design',
      place: 'Station folgt',
      text: 'Konzeption, Design und Entwicklung digitaler Produkte, von der Marke bis zum Deployment.'
    },
    {
      period: '····',
      title: 'Wirtschaftsinformatik',
      place: 'Station folgt',
      text: 'Schnittstelle von Business und Technik: Prozesse, Daten, Systeme.'
    },
    {
      period: '····',
      title: 'Netzwerktechnik',
      place: 'Station folgt',
      text: 'Das Fundament: Netzwerke, Infrastruktur und Systemadministration.'
    }
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduceMotion) {
      // Ohne Motion: alles sofort sichtbar, keine Trigger registrieren.
      gsap.set('[data-reveal], .hero-line, .hero-kicker, .hero-sub, .hero-cue', { clearProps: 'all', opacity: 1 });
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.gsapCtx = gsap.context(() => {
        this.introSequence();
        this.scrollReveals();
        this.statCounters();
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  /** Hero-Intro: Kicker → Headline-Zeilen → Subline → Scroll-Cue, wie ein Vorspann. */
  private introSequence(): void {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.hero-kicker', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.15)
      .fromTo('.hero-line', { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.14 }, 0.35)
      .fromTo('.hero-sub', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.05)
      .fromTo('.hero-cue', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 1.5);
  }

  /** Sektionen blenden beim Scrollen ruhig ein — eine Regie für alle. */
  private scrollReveals(): void {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(el,
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true }
        }
      );
    });
  }

  /** Kennzahlen zählen hoch, sobald sie sichtbar werden. */
  private statCounters(): void {
    gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el) => {
      const target = Number(el.dataset['value'] || 0);
      const state = { n: 0 };
      gsap.to(state, {
        n: target,
        duration: 1.6,
        ease: 'power2.out',
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = String(state.n); }
      });
    });
  }
}
