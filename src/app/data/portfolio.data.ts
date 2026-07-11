// ============================================================
// Aller Content an einem Ort — Komponenten bleiben reine Bühne.
// Quelle: CV/LinkedIn-Profil Martin Lackner (Stand Juli 2026).
// ============================================================

export interface SkillGroup {
  num: string;
  title: string;
  blurb: string;
  skills: string[];
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface Step {
  num: string;
  title: string;
  text: string;
}

export interface TimelineEntry {
  period: string;
  title: string;
  place: string;
  text: string;
}

export interface CaseFact {
  label: string;
  value: string;
}

export interface CaseSection {
  kicker: string;
  title: string;
  paragraphs: string[];
  quote?: string;
}

export interface Project {
  slug: string;
  name: string;
  url?: string;
  urlLabel?: string;
  description: string;
  tags: string[];
  meta: string;
  /** Pfad unter public/, z. B. 'img/etfit.jpg' — Visual der Work-Karte. */
  image?: string;
  case?: {
    intro: string;
    facts: CaseFact[];
    sections: CaseSection[];
  };
}

export interface MiniProject {
  name: string;
  description: string;
  tags: string[];
  /** Kleines Thumb in der „Weitere Systeme"-Liste. */
  image?: string;
}

export const CONTACT = {
  linkedin: 'https://www.linkedin.com/in/martinlac',
  github: 'https://github.com/martinlackner877-eng'
} as const;

export const HERO_KICKER = 'Martin Lackner · Kärnten, Österreich';

// ─── About ───
export const ABOUT: string[] = [
  'Ich bin Martin Lackner — Wirtschaftsinformatiker, Cybersecurity Engineer, ' +
    'Softwareentwickler und Digital Designer aus Kärnten.',
  'Meine Arbeit dreht sich um die Entwicklung und Absicherung moderner digitaler ' +
    'Systeme. Mich interessiert dabei weniger die einzelne Technologie als ihr ' +
    'Zusammenspiel: sichere Netzwerke, robuste Softwarearchitekturen, industrielle ' +
    'Produktionssysteme, künstliche Intelligenz und benutzerzentriertes Design.',
  'Mit Ausbildung in Netzwerktechnik und Cybersecurity, Studium der Wirtschaftsinformatik ' +
    'und Cybersecurity-Praxis im Halbleiterumfeld betrachte ich Projekte ganzheitlich — ' +
    'von der Idee über Architektur und Sicherheitskonzept bis zur visuellen Präsentation.'
];

// ─── Keyword-Band ───
export const KEYWORDS: string[] = [
  'OT Security', 'Cybersecurity', 'Software Engineering', 'Artificial Intelligence',
  'Large Language Models', 'Neural Networks', 'Industrial IT', 'UI / UX Design',
  'Branding', 'Systems Thinking', 'Leadership'
];

// ─── Kennzahlen ───
export const STATS: Stat[] = [
  { value: 9, suffix: '+', label: 'Projekte realisiert' },
  { value: 4, suffix: '', label: 'Disziplinen vereint' },
  { value: 100, suffix: '%', label: 'Eigenentwicklung' }
];

// ─── Capabilities ───
export const SKILL_GROUPS: SkillGroup[] = [
  {
    num: '01', title: 'Cybersecurity & OT',
    blurb: 'Schutz industrieller Produktionsumgebungen — vom Netzwerk bis zur Maschine im Reinraum.',
    skills: [
      'OT- & IIoT-Security', 'Netzwerksegmentierung', 'Next-Gen Firewalls', 'Check Point',
      'Malware Prevention', 'Security Hardening', 'OWASP', 'Kryptographie', 'Defense-in-Depth'
    ]
  },
  {
    num: '02', title: 'Software Engineering',
    blurb: 'Full-Stack von Web bis Mobile — sauber, performant und wartbar gebaut.',
    skills: [
      'TypeScript', 'Angular', 'React', 'Python', 'Java', 'Kotlin',
      'Jetpack Compose', 'Node.js', 'SQL', 'Docker', 'Git', 'CI/CD'
    ]
  },
  {
    num: '03', title: 'AI & Data',
    blurb: 'Von LLMs bis Similarity Search — intelligent, sicher und nachvollziehbar integriert.',
    skills: [
      'Large Language Models', 'Machine Learning', 'Neural Networks', 'Embeddings',
      'Similarity Search', 'AI Agents', 'AI Security', 'Prompt Engineering'
    ]
  },
  {
    num: '04', title: 'Design & Brand',
    blurb: 'Interfaces und Markenwelten, die die Qualität eines Produkts sichtbar machen.',
    skills: [
      'UI / UX Design', 'Branding', 'Design Systems', 'Typografie',
      'Motion', 'Marketingvisuals', 'Social Media', 'Storytelling'
    ]
  }
];

// ─── Arbeitsweise ───
export const STEPS: Step[] = [
  {
    num: '01', title: 'Systemisches Denken',
    text: 'Abhängigkeiten, Schnittstellen, Risiken: Ich analysiere nicht die Komponente, sondern das Gesamtsystem — und seine langfristigen Auswirkungen.'
  },
  {
    num: '02', title: 'Security by Design',
    text: 'Sicherheit ist kein nachträgliches Zusatzmodul. Sie gehört von Anfang an in Architektur, Design und Entwicklung.'
  },
  {
    num: '03', title: 'Interdisziplinarität',
    text: 'Informatik, Wirtschaft, Security, Design, Management: Ich verbinde Perspektiven, die selten am selben Tisch sitzen.'
  },
  {
    num: '04', title: 'Qualitätsanspruch',
    text: 'Technisch sauber, visuell hochwertig, nachvollziehbar dokumentiert — Ergebnisse, hinter denen ich stehen kann.'
  }
];

// ─── Stationen ───
export const TIMELINE: TimelineEntry[] = [
  {
    period: 'Heute',
    title: 'Cybersecurity im Produktionsumfeld',
    place: 'Infineon Technologies Austria AG',
    text: 'OT-Security in der Halbleiterfertigung: Netzwerksegmentierung, Malware-Prävention, ' +
      'Next-Generation Firewalls und ein sicheres Software-Gateway für Reinraum-Anlagen. ' +
      'Dazu Entwicklung AI-gestützter Lösungen für interne Prozesse — bis zur Repräsentation ' +
      'beim Munich AI Day 2026.'
  },
  {
    period: 'Laufend',
    title: 'Bachelorstudium Wirtschaftsinformatik',
    place: 'Alpen-Adria-Universität Klagenfurt',
    text: 'Informatik trifft Unternehmensführung: Softwareentwicklung, Informationssysteme, ' +
      'Finanzierung, Statistik, Wirtschaftsrecht. Technische Entscheidungen auch nach ' +
      'Wirtschaftlichkeit, Risiko und Strategie beurteilen.'
  },
  {
    period: 'Fundament',
    title: 'IT, Netzwerktechnik & Cybersecurity',
    place: 'HTL Villach',
    text: 'Die technische Grundausbildung: Routing & Switching, Cisco, Check Point, Firewalls, ' +
      'Linux, Kryptographie, Webentwicklung — bis heute die Basis für mein Verständnis ' +
      'komplexer Infrastrukturen.'
  },
  {
    period: 'Ehrenamt',
    title: 'Sanitäter',
    place: 'Österreichisches Rotes Kreuz',
    text: 'Der bewusste Gegenpol zur Technik: Verantwortung, Teamarbeit und strukturierte ' +
      'Entscheidungen unter Zeitdruck — Fähigkeiten, die in jedes Projekt einfließen.'
  }
];

// ─── Projekte ───
export const PROJECTS: Project[] = [
  {
    slug: 'et-fit',
    image: 'img/etfit.jpg',
    name: 'ET FIT',
    url: 'https://www.et-fit.at',
    urlLabel: 'www.et-fit.at',
    description:
      'Komplette digitale Marken- und Webpräsenz für ein Premium-Fitnessstudio: Konzeption, ' +
      'Design, Angular-Entwicklung, Markeninszenierung, Marketingmaterialien und Launch-Kommunikation.',
    tags: ['Angular', 'UI / UX', 'Branding', 'Marketing', 'SEO'],
    meta: '2026 · Web & Brand',
    case: {
      intro:
        'Ein Premium-Fitnessstudio brauchte einen Auftritt, der genauso trainiert ist wie seine ' +
        'Mitglieder: schnell, klar und mit eigener Handschrift — von der Marke bis zur letzten Zeile Code.',
      facts: [
        { label: 'Rolle', value: 'Konzept · Design · Development · Marketing' },
        { label: 'Stack', value: 'Angular · TypeScript · GSAP · SCSS' },
        { label: 'Jahr', value: '2026' },
        { label: 'Status', value: 'Live' }
      ],
      sections: [
        {
          kicker: 'Challenge',
          title: 'Eine Marke, die zieht statt nur informiert.',
          paragraphs: [
            'Die meisten Gym-Websites sind austauschbar: Stockfotos, Preislisten, Fließtext. ' +
              'ET FIT wollte das Gegenteil — einen Auftritt, der die Energie des Trainings ' +
              'transportiert und Mitglieder gewinnt, bevor sie das Studio betreten.',
            'Die Anforderung: alles aus einer Hand. Positionierung, visuelle Identität, ' +
              'Entwicklung, Marketingmaterialien, Social-Media-Kampagnen und Launch-Kommunikation.'
          ]
        },
        {
          kicker: 'Design',
          title: 'Dunkel, kraftvoll, typografiegetrieben.',
          paragraphs: [
            'Die Gestaltung folgt einer dunklen, hochwertigen Markenwelt: klare Typografie, ' +
              'intensive Kontraste, die Markenfarbe Orange und eine reduzierte Premium-Ästhetik. ' +
              'Custom-Animationen inszenieren Inhalte beim Scrollen, statt sie nur aufzulisten.',
            'Jedes Element folgt einem klaren Raster. Keine Templates, kein Baukasten: ' +
              'jede Sektion ist für die Marke entworfen.'
          ],
          quote: 'Eine Website, die sich anfühlt wie das erste Training: fordernd, direkt, motivierend.'
        },
        {
          kicker: 'Build',
          title: 'Angular, GSAP und Performance als Feature.',
          paragraphs: [
            'Technisch ist die Seite eine moderne Angular-App: komponentenbasiert, wartbar ' +
              'und auf Performance optimiert. Die Animationen laufen GPU-freundlich über GSAP, ' +
              'Assets sind konsequent optimiert.',
            'SEO war von Anfang an Teil der Architektur — saubere Semantik, Meta-Struktur ' +
              'und schnelle Ladezeiten. Dazu eine DSGVO-konforme Umsetzung ohne Tracking-Ballast.'
          ]
        },
        {
          kicker: 'Ergebnis',
          title: 'Konzept, Design & Code — aus einer Hand.',
          paragraphs: [
            'Von der ersten Skizze über Social-Media-Kampagnen bis zum Deployment: Das Projekt ' +
              'zeigt die Verbindung von Softwareentwicklung, Design, Branding und Marketing — ' +
              'eine Website, die die Marke trägt und mit dem Studio wachsen kann.'
          ]
        }
      ]
    }
  },
  {
    slug: 'etcon',
    image: 'img/etcon.jpg',
    name: 'ETCON',
    description:
      'Energiemanagement für Photovoltaikanlagen: Verwaltung, Analyse und Absicherung von ' +
      'Energiedaten. Als Projektleiter eines dreiköpfigen Teams verantwortlich für Architektur, ' +
      'technisches Backbone, Security-Konzept, Rollen- und Rechteverwaltung und Frontend.',
    tags: ['Projektleitung', 'Architektur', 'Security', 'Frontend', 'Web'],
    meta: 'Web-Plattform · Teamlead'
  },
  {
    slug: 'pulverfass',
    image: 'img/pulverfass.jpg',
    name: 'Pulverfass',
    description:
      'Strategisches Mobile Game mit Piratenwelt: interaktive Karte, Echtzeit-Updates, Partikel- ' +
      'und Angriffseffekte in Jetpack Compose — plus komplette visuelle Identität von Charakterdesign ' +
      'über Key Visuals bis zur Store-Präsentation.',
    tags: ['Android', 'Kotlin', 'Jetpack Compose', 'Game Design', 'Branding'],
    meta: 'Mobile Game · Android'
  },
  {
    slug: 'reinraum-gateway',
    image: 'img/gateway.jpg',
    name: 'Reinraum-Gateway',
    description:
      'Software-Gateway für die sichere Kommunikation mit Produktionsmaschinen in der ' +
      'Halbleiterfertigung: kontrollierte Datenpfade, Malware-Schutz und nachvollziehbare ' +
      'Transaktionen — an der Schnittstelle von Software Engineering und OT-Security.',
    tags: ['OT-Security', 'Software Engineering', 'Industrial', 'Halbleiter'],
    meta: 'Industrie · OT-Security'
  },
  {
    slug: 'android-otp',
    image: 'img/otp.jpg',
    name: 'Android OTP',
    description:
      'Mobiles Einmalpasswort- und Token-System mit kryptographischer Absicherung: ' +
      'AES-Verschlüsselung, HMAC-Integritätsprüfung und sichere Client-Verifier-Kommunikation.',
    tags: ['Android', 'Kotlin', 'AES', 'HMAC', 'Security'],
    meta: 'Mobile · Kryptographie'
  }
];

// ─── Weitere Systeme (kompakte Liste) ───
export const MORE_PROJECTS: MiniProject[] = [
  {
    name: 'DASHBUNNY',
    image: 'img/server.jpg',
    description: 'Webanwendung mit moderner Frontend-Architektur und REST-Kommunikation.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB']
  },
  {
    name: 'iHID BarcodeLive',
    image: 'img/barcode.jpg',
    description: 'Echtzeit-Verarbeitung und Übertragung von Barcode- und HID-Daten.',
    tags: ['Python', 'aiohttp', 'Echtzeit']
  },
  {
    name: 'iUST Windows Service',
    image: 'img/oht.jpg',
    description: 'Windows-Dienst für kontrollierte USB-Datenübertragung über Netzwerk.',
    tags: ['Windows Services', 'USB', 'TCP/IP']
  },
  {
    name: 'Serial-to-Network',
    image: 'img/serial.jpg',
    description: 'Headless-System für serielle Gerätedaten in Netzwerkumgebungen.',
    tags: ['Seriell', 'Netzwerk', 'Headless']
  }
];
