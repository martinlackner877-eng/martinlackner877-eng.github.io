// ============================================================
// Alle Texte der Seite, Deutsch und Englisch.
// Fakten (Jahre, Noten, Titel) hier und nur hier ändern.
// Regeln: Infineon nur allgemein; Note 1,0 gilt nur für die Bachelorarbeit;
// kein „Ing.“ (noch nicht verliehen).
// ============================================================

export type Lang = 'de' | 'en';
export type Discipline = 'design' | 'dev' | 'sec' | 'ai';

export interface Project { id: string; title: string; tags: Discipline[]; text: string; meta: string; link?: { href: string; label: string }; img: string; alt: string; w: number; h: number; cursor: string; }
export interface Station { years: string; org: string; role: string; step: string; stepInfo: string; }
export interface Photo { file: string; caption: string; }
export interface NextWord { base: string; contexts: Record<string, [string, number][]>; }

export interface Content {
  lang: Lang;
  meta: { title: string; description: string };
  nav: { about: string; projects: string; research: string; cv: string; photos: string; contact: string; switchLang: string; switchHref: string; modeLight: string; modeDark: string; skip: string };
  hero: { claim: string; sub: string; ctaProjects: string; ctaContact: string; scroll: string; caps: [string, string, string][] };
  about: { title: string; paras: string[]; facts: { value: number; dec: number; unit: string; label: string }[]; portraitAlt: string };
  disciplines: Record<Discipline, string>;
  projects: { title: string; list: Project[]; more: { title: string; tags: Discipline[]; text: string }[] };
  research: {
    title: string; statement: [string, string, string, string, string]; netCursor: string;
    netLabel: string; hud: [string, string, string, string]; labNote: string;
    nt: { title: string; intro: string; temp: string; go: string; done: string; reset: string; note: string; finished: string; words: NextWord };
    att: { title: string; intro: string; inputLabel: string; sentence: string; hint: string; reads: string; note: string; matrixLabel: string };
    topics: { title: string; text: string; d: Discipline }[];
    goalLead: string; goal: string;
    fired: string;
  };
  cv: { title: string; list: Station[]; stepWord: string; note: string };
  photos: { title: string; lead: string; open: string; count: (p: number, t: number) => string; list: Photo[]; prev: string; next: string; close: string; of: string };
  contact: {
    title: string; sub: string; name: string; email: string; message: string; send: string; sending: string;
    sent: string; error: string; captcha: string; invalidName: string; invalidEmail: string; invalidMessage: string;
  };
  legal: { title: string; imprintTitle: string; imprint: string[]; privacyTitle: string; privacy: string[]; credits: string; close: string };
  footer: { place: string; legal: string };
  toasts: { born: string; logo: string; why: string; clean: string; shipped: string };
}

const PHOTO_FILES = [
  'gipfel-wolken', 'gipfel-sitzend', 'wanderung-tal', 'gipfel-ausblick', 'felsfenster', 'gipfel-sender-abend', 'felsspitze-nebel',
  'berge-wolken', 'alm-nebel', 'wald-wolken', 'pistenambulanz-heli', 'akropolis', 'griechenland-dorf', 'meer-abend', 'kanal-abend',
  'stadt-abend', 'selfie-strand', 'portraet-brille', 'gym-spiegel'
];
const photos = (captions: string[]): Photo[] => PHOTO_FILES.map((file, i) => ({ file, caption: captions[i] }));

const DE: Content = {
  lang: 'de',
  meta: {
    title: 'Martin Lackner · Software, Security und KI',
    description: 'Martin Lackner aus Kärnten: Software und OT-Security für die Halbleiterfertigung, Wirtschaftsinformatik in Klagenfurt und KI, die er bis in die Mathematik verstehen will.'
  },
  nav: { about: 'Über mich', projects: 'Projekte', research: 'Forschung', cv: 'Werdegang', photos: 'Fotos', contact: 'Kontakt', switchLang: 'EN', switchHref: '/en', modeLight: 'Reinraum-Modus', modeDark: 'Dunkel', skip: 'Zum Inhalt springen' },
  hero: {
    claim: 'Ich will den Grund wissen.',
    sub: 'Software und Security für die Halbleiterfertigung, Wirtschaftsinformatik in Klagenfurt, und KI, die ich bis in die Mathematik verstehen will.',
    ctaProjects: 'Projekte ansehen', ctaContact: 'Kontakt', scroll: 'Scrollen',
    caps: [['Jeder Chip beginnt als ', 'blanke Scheibe', ' Silizium.'], ['Ein Laser prüft ', 'jede Struktur', ', Zeile für Zeile.'], ['Und auf meinem Wafer leuchten ', 'zwei Buchstaben', '.'], ['Daraus ist mein ', 'Zeichen', ' entstanden. Schau nach oben links.']]
  },
  about: {
    title: 'Über mich',
    paras: [
      'Ich bin Martin, aus Kärnten. Ich arbeite dort, wo Software auf Maschinen trifft.',
      'In der Halbleiterfertigung entwickle ich Automatisierungssoftware und sorge dafür, dass Anlagen sicher ans Netz kommen. Daneben studiere ich Wirtschaftsinformatik an der Universität Klagenfurt und verantworte als Freelancer die gesamte digitale Seite von ET-FIT im Drautal.',
      'Was mich antreibt, ist eine Frage: warum? Bei Netzwerken, bei Maschinen und gerade bei KI. Ich will nicht nur wissen, dass ein Sprachmodell funktioniert, sondern wie, bis in die Algorithmen und die Mathematik dahinter.',
      'Den Kopf frei bekomme ich draußen: auf dem Gravelbike bis ans Meer, auf Bergtouren, die ich für meine Gruppe organisiere, beim Calisthenics und im Winter auf Ski und Snowboard.'
    ],
    facts: [{ value: 1, dec: 1, unit: '', label: 'Note der Bachelorarbeit' }, { value: 400, dec: 0, unit: ' km', label: 'Kärnten bis Triest am Rad' }, { value: 2145, dec: 0, unit: ' m', label: 'Mittagskogel, mein Gipfel' }],
    portraitAlt: 'Martin sitzt auf einem Gipfelfelsen und schaut zur Seite'
  },
  disciplines: { design: 'Design', dev: 'Development', sec: 'Security & Systems', ai: 'AI & Data' },
  projects: {
    title: 'Projekte',
    list: [
      { id: 'etfit', title: 'ET-FIT Drautal', tags: ['design', 'dev'], text: 'Die ganze digitale Seite eines neuen Fitnessstudios mit 1.200 m², von der ersten Zeile bis zur Eröffnung: Website in Angular mit automatischem Deployment, Shop, Datenschutz und Messung, Print und Videos.', meta: '2026', link: { href: 'https://www.et-fit.at', label: 'et-fit.at' }, img: 'img/shot-etfit.webp', alt: 'Startseite von et-fit.at', w: 1600, h: 1000, cursor: 'ET-FIT' },
      { id: 'kompass', title: 'Kompass', tags: ['ai', 'dev'], text: 'Mein Studium an einem Ort: Moodle, Stundenplan, Abgaben, ECTS und Lernkarten der Universität Klagenfurt, sortiert nach dem, was heute zählt. Web und iPhone auf einem gemeinsamen Kern, KI-Agenten mit klaren Freigaben.', meta: 'in Arbeit', link: { href: 'https://kompass.unistuff.workers.dev/', label: 'kompass.unistuff.workers.dev' }, img: 'img/shot-kompass.webp', alt: 'Startseite der App Kompass', w: 1600, h: 1000, cursor: 'Kompass' },
      { id: 'gateway', title: 'Serial-to-IP-Gateway', tags: ['sec', 'dev'], text: 'Meine Bachelorarbeit, bewertet mit 1,0: Entwicklung eines Serial-to-IP-Gateways für den Reinraumbetrieb in der Halbleiterindustrie. Serielle Anlagen kommen sicher ins Netzwerk, als Windows-Dienst oder als Container direkt auf einer Firewall.', meta: 'Bachelorarbeit, Universität Klagenfurt · Bild: Reinraum, gemeinfrei, Wikimedia Commons', img: 'img/lab-reinraum.webp', alt: 'Reinraum einer Halbleiterfertigung im gelben Licht', w: 1600, h: 1240, cursor: 'Reinraum' },
      { id: 'pulse', title: 'ET FIT Pulse', tags: ['dev', 'design'], text: 'Eine Show für die Bildschirme im Studio, die das Team selbst pflegt. Auf der Player-Hardware ruckelte sie. Der Grund: ein eingebautes Chromium 69 ohne Grafikbeschleunigung. Jetzt läuft sie flüssig.', meta: '2026', img: 'img/shot-monitor.webp', alt: 'Startbild der Monitor-Show ET FIT Pulse', w: 1600, h: 900, cursor: 'Show' }
    ],
    more: [
      { title: 'ETCON', tags: ['dev', 'sec'], text: 'Energiemanagement für Photovoltaik. Als Projektleiter eines Dreierteams verantwortlich für Architektur, Sicherheitskonzept und Frontend. 2022–2023.' },
      { title: 'Pulverfass', tags: ['design'], text: 'UI-Design für ein Multiplayer-Strategiespiel mit Piratenwelt, veröffentlicht für Android.' },
      { title: 'Android OTP', tags: ['sec'], text: 'Einmalpasswörter auf dem Handy, abgesichert mit AES und HMAC.' }
    ]
  },
  research: {
    title: 'Woran ich forsche', netCursor: 'Feuern',
    statement: ['Ich will verstehen, wie ', 'Sprachmodelle', ' ', 'denken', '. Nicht nur als Nutzer, sondern bis in die Mathematik.'],
    netLabel: 'Ein kleines neuronales Netz mit sechs Schichten. Es rechnet laufend Durchläufe, die Maus verändert Gewichte, ein Klick startet einen eigenen Durchlauf.',
    hud: ['Neuronen', 'Verbindungen', 'Durchläufe', 'Gewichte gelernt'],
    labNote: 'Fahr über das Netz: Neuronen in deiner Nähe feuern, und die Verbindungen unter der Maus lernen mit. Ein Klick schickt einen eigenen Durchlauf durch alle sechs Schichten. Das Netz ist klein, die Rechnung ist echt.',
    nt: {
      title: 'Experiment: Das nächste Wort', intro: 'Ein Sprachmodell sagt immer nur das nächste Wort voraus. Die Temperatur bestimmt, wie mutig es wählt.',
      temp: 'Temperatur', go: 'Nächstes Wort ziehen', done: 'Satz fertig', reset: 'Neu anfangen',
      note: 'Die Rechnung ist echt: Softmax mit Temperatur. Die Ausgangswerte sind zur Anschauung gesetzt, ein echtes Modell lernt sie aus Milliarden Wörtern.',
      finished: 'Fertig. Genau so, nur mit Milliarden Gewichten.',
      words: {
        base: 'Ich will den Grund',
        contexts: {
          '^': [['wissen', 3.2], ['verstehen', 2.4], ['finden', 1.6], ['kennen', 1.2], ['sehen', 0.4]],
          wissen: [['.', 2.6], ['warum', 2.3], ['und', 1.1], ['genau', 0.9], ['sofort', 0.3]],
          verstehen: [['.', 2.4], ['warum', 2.0], ['lernen', 1.0], ['bauen', 0.8], ['dürfen', 0.2]],
          finden: [['.', 2.5], ['und', 1.4], ['warum', 1.0], ['müssen', 0.6], ['heute', 0.4]],
          kennen: [['.', 2.3], ['lernen', 1.6], ['warum', 1.3], ['und', 0.9], ['jetzt', 0.4]],
          sehen: [['.', 2.1], ['können', 1.7], ['warum', 1.2], ['und', 0.8], ['jetzt', 0.5]],
          warum: [['?', 2.2], ['.', 1.9], ['Maschinen', 1.4], ['es', 1.0], ['das', 0.9]],
          Maschinen: [['denken', 2.6], ['lernen', 2.0], ['.', 1.2], ['?', 1.0], ['träumen', 0.3]],
          '*': [['.', 2.0], ['warum', 1.6], ['und', 1.2], ['bis', 0.6], ['jetzt', 0.5]]
        }
      }
    },
    att: {
      title: 'Experiment: Attention', intro: 'In einem Transformer schaut jedes Wort auf jedes andere und entscheidet, was wichtig ist. Schreib einen Satz und zeig auf ein Wort.',
      inputLabel: 'Satz', sentence: 'Ich will verstehen wie Maschinen denken',
      hint: 'Zeig auf ein Wort links: Seine Zeile leuchtet, und du siehst, worauf es achtet.',
      reads: '„{a}“ achtet am meisten auf „{b}“ ({p} %).',
      note: 'Echte Attention lernt ein Modell im Training. Hier rechnet die Seite mit der Ähnlichkeit der Wörter und ihrer Nähe zueinander, damit das Prinzip sichtbar wird.',
      matrixLabel: 'Matrix: wie stark jedes Wort auf jedes andere achtet'
    },
    topics: [
      { title: 'Wie LLMs funktionieren', text: 'Transformer, Attention, Embeddings, Training: was in einem Modell passiert, zwischen Eingabe und Antwort.', d: 'ai' },
      { title: 'Algorithmen und Mathematik', text: 'Lineare Algebra, Wahrscheinlichkeit, Optimierung. Die Grundlagen, ohne die man nur Oberfläche sieht.', d: 'dev' },
      { title: 'Agenten', text: 'Systeme, die selbstständig planen und Werkzeuge nutzen, mit klaren Freigaben. Und die Frage, wohin das Richtung AGI führt.', d: 'sec' },
      { title: 'Eigene KI bauen', text: 'Nicht nur lesen, sondern selbst entwickeln: Kompass mit seinen Agenten ist der erste Schritt.', d: 'design' }
    ],
    goalLead: 'Und irgendwann:', goal: 'aus einer Idee ein ganzes Unternehmen bauen, technisch und wirtschaftlich.',
    fired: 'Durchlauf gestartet: sechs Schichten, {n} Gewichte.'
  },
  cv: {
    title: 'Werdegang', stepWord: 'Prozessschritt',
    note: 'Rechts steht, welcher Schritt in einer Chipfabrik dazu passt. Ein kleines Spiel für alle, die wissen, wie ein Wafer entsteht.',
    list: [
      { years: '2018–2023', org: 'HTL Villach', role: 'Informationstechnologie, Netzwerktechnik und Cybersecurity', step: 'Lithografie', stepInfo: 'Lithografie: Das Grundmuster wird belichtet.' },
      { years: '2020–2024', org: 'ET Ingenieurbüro', role: 'Praktikum, dann Projektleitung ETCON, danach Netzwerk und IT', step: 'Dotierung', stepInfo: 'Dotierung: Fremdatome ändern gezielt die Eigenschaften.' },
      { years: '2023–2026', org: 'Österreichisches Rotes Kreuz', role: 'Zivildienst, danach ehrenamtlich Rettungssanitäter, auch auf der Pistenambulanz', step: 'Passivierung', stepInfo: 'Passivierung: eine Schutzschicht.' },
      { years: 'seit 2024', org: 'Universität Klagenfurt', role: 'Bachelor Wirtschaftsinformatik, Bachelorarbeit mit 1,0', step: 'Verdrahtung', stepInfo: 'Verdrahtung: verbindet die Bausteine.' },
      { years: '2025–2026', org: 'AlpSec', role: 'Verein für offensive und defensive Cybersicherheit', step: 'Ätzen', stepInfo: 'Ätzen: gezielt Material abtragen, wie beim Angriff auf ein System.' },
      { years: 'seit 2025', org: 'Infineon Technologies', role: 'Software und OT-Security im Produktionsumfeld', step: 'Integration', stepInfo: 'Integration: Alles läuft in der echten Fab.' },
      { years: 'seit 2026', org: 'ET-FIT GmbH', role: 'Verantwortlich für Digitales und IT, freiberuflich', step: 'Packaging', stepInfo: 'Packaging: Aus dem Chip wird ein fertiges Produkt.' }
    ]
  },
  photos: {
    title: 'Mein Wafer', lead: 'Alle Fotos auf einem Wafer: Berge, Reisen, Einsätze, das Studio. Jeder Chip ist ein Moment. Klick einen an.', open: 'Öffnen',
    count: (p, t) => `${p} Fotos, ${t} Testfelder`, prev: 'Zurück', next: 'Weiter', close: 'Schließen', of: 'von',
    list: photos(['Über der Wolkendecke', 'Gipfelrast', 'Zwischen Lärchen und Kalk', 'Blick ins Tal', 'Felsfenster', 'Abends am Gipfel', 'Felsspitze im Nebel', 'Wolken über den Bergen', 'Alm im Nebel', 'Wald und Wolken', 'Pistenambulanz, Rotes Kreuz', 'Athen, Akropolis', 'Griechenland', 'Am Meer', 'Abendlicht am Kanal', 'Stadt im Abendlicht', 'Am Strand', 'Porträt', 'Im Studio'])
  },
  contact: {
    title: 'Kontakt', sub: 'Ein Projekt, eine Frage oder eine Idee für ein Unternehmen? Die Nachricht geht direkt an mich.',
    name: 'Name', email: 'E-Mail', message: 'Nachricht', send: 'Nachricht senden', sending: 'Wird gesendet …',
    sent: 'Danke! Deine Nachricht ist angekommen. Ich melde mich.', error: 'Das hat nicht geklappt. Versuch es bitte gleich noch einmal oder schreib mir auf LinkedIn.',
    captcha: 'Bitte kurz die Sicherheitsprüfung abwarten.', invalidName: 'Bitte gib deinen Namen an.', invalidEmail: 'Bitte gib eine gültige E-Mail-Adresse an.', invalidMessage: 'Die Nachricht braucht mindestens 10 Zeichen.'
  },
  legal: {
    title: 'Impressum und Datenschutz', imprintTitle: 'Impressum',
    imprint: ['Martin Lackner, Kärnten, Österreich.', 'Persönliche Website ohne kommerziellen Zweck. Kontakt über das Formular auf dieser Seite.'],
    privacyTitle: 'Datenschutz',
    privacy: [
      'Diese Seite setzt keine Cookies und nutzt kein Tracking. Schriften und Bilder liegen auf dem eigenen Server, es werden keine Google-Dienste geladen.',
      'Gehostet wird die Seite bei GitHub Pages (GitHub Inc.). GitHub verarbeitet dabei technisch nötige Daten wie die IP-Adresse in Server-Logs.',
      'Wenn du das Kontaktformular nutzt, werden Name, E-Mail-Adresse und Nachricht an ein Skript auf et-fit.at (Hosting: World4You) übermittelt und per E-Mail über Brevo an mich zugestellt. Ich nutze die Daten nur, um dir zu antworten, und lösche sie, wenn sie dafür nicht mehr nötig sind.',
      'Zum Schutz vor Spam prüft Cloudflare Turnstile, ob ein Mensch das Formular absendet. Dabei werden technische Daten deines Browsers an Cloudflare übertragen.',
      'Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Schreib mir dazu über das Formular. Beschwerden kannst du bei der Österreichischen Datenschutzbehörde einreichen.'
    ],
    credits: 'Bildnachweise: Reinraum, gemeinfrei, Wikimedia Commons. Ersatzbild Wafer: „12-inch silicon wafer“, Peellden, CC BY-SA 3.0, Wikimedia Commons. Alle anderen Fotos: Martin Lackner.',
    close: 'Schließen'
  },
  footer: { place: 'Kärnten', legal: 'Impressum und Datenschutz' },
  toasts: { born: 'Das ist mein Zeichen: 20 Chips, die ML ergeben.', logo: 'Alle 20 Chips bestanden.', why: 'Gute Frage. Genau die stelle ich auch.', clean: 'Reinraum: Kittel an, Haube auf.', shipped: 'Danke! Der Wafer ist unterwegs.' }
};

const EN: Content = {
  lang: 'en',
  meta: {
    title: 'Martin Lackner · Software, Security and AI',
    description: 'Martin Lackner from Carinthia, Austria: software and OT security for semiconductor manufacturing, business informatics in Klagenfurt, and AI he wants to understand down to the maths.'
  },
  nav: { about: 'About', projects: 'Projects', research: 'Research', cv: 'Career', photos: 'Photos', contact: 'Contact', switchLang: 'DE', switchHref: '/', modeLight: 'Cleanroom mode', modeDark: 'Dark', skip: 'Skip to content' },
  hero: {
    claim: 'I want to know why.',
    sub: 'Software and security for semiconductor manufacturing, business informatics in Klagenfurt, and AI I want to understand down to the maths.',
    ctaProjects: 'See projects', ctaContact: 'Contact', scroll: 'Scroll',
    caps: [['Every chip starts as a ', 'bare disc', ' of silicon.'], ['A laser checks ', 'every structure', ', line by line.'], ['And on my wafer, ', 'two letters', ' light up.'], ['That became my ', 'mark', '. Look at the top left.']]
  },
  about: {
    title: 'About',
    paras: [
      'I’m Martin, from Carinthia in Austria. I work where software meets machines.',
      'In semiconductor manufacturing I build automation software and make sure equipment gets onto the network safely. Alongside that I study business informatics at the University of Klagenfurt and, as a freelancer, run the entire digital side of ET-FIT, a gym in the Drau valley.',
      'What drives me is one question: why? With networks, with machines, and above all with AI. I don’t just want to know that a language model works, but how, down to the algorithms and the maths behind it.',
      'I clear my head outdoors: on the gravel bike all the way to the sea, on mountain tours I organise for my group, doing calisthenics, and skiing and snowboarding in winter.'
    ],
    facts: [{ value: 1, dec: 1, unit: '', label: 'Grade of my bachelor’s thesis (top mark)' }, { value: 400, dec: 0, unit: ' km', label: 'Carinthia to Trieste by bike' }, { value: 2145, dec: 0, unit: ' m', label: 'Mittagskogel, my mountain' }],
    portraitAlt: 'Martin sitting on a summit rock, looking to the side'
  },
  disciplines: { design: 'Design', dev: 'Development', sec: 'Security & Systems', ai: 'AI & Data' },
  projects: {
    title: 'Projects',
    list: [
      { id: 'etfit', title: 'ET-FIT Drautal', tags: ['design', 'dev'], text: 'The entire digital side of a new 1,200 m² gym, from the first line of code to opening day: an Angular website with automated deployment, shop, privacy and analytics, print and video.', meta: '2026', link: { href: 'https://www.et-fit.at', label: 'et-fit.at' }, img: 'img/shot-etfit.webp', alt: 'Home page of et-fit.at', w: 1600, h: 1000, cursor: 'ET-FIT' },
      { id: 'kompass', title: 'Kompass', tags: ['ai', 'dev'], text: 'My studies in one place: Moodle, timetable, assignments, ECTS and flashcards from the University of Klagenfurt, sorted by what matters today. Web and iPhone on one shared core, AI agents with clear approvals.', meta: 'in progress', link: { href: 'https://kompass.unistuff.workers.dev/', label: 'kompass.unistuff.workers.dev' }, img: 'img/shot-kompass.webp', alt: 'Home page of the Kompass app', w: 1600, h: 1000, cursor: 'Kompass' },
      { id: 'gateway', title: 'Serial-to-IP Gateway', tags: ['sec', 'dev'], text: 'My bachelor’s thesis, graded 1.0 (the top mark): developing a serial-to-IP gateway for cleanroom operation in the semiconductor industry. Serial equipment gets onto the network securely, as a Windows service or as a container running directly on a firewall.', meta: 'Bachelor’s thesis, University of Klagenfurt · Image: cleanroom, public domain, Wikimedia Commons', img: 'img/lab-reinraum.webp', alt: 'Semiconductor cleanroom in yellow light', w: 1600, h: 1240, cursor: 'Cleanroom' },
      { id: 'pulse', title: 'ET FIT Pulse', tags: ['dev', 'design'], text: 'A show for the screens in the gym that the team maintains themselves. On the player hardware it stuttered. The reason: a built-in Chromium 69 without GPU acceleration. Now it runs smoothly.', meta: '2026', img: 'img/shot-monitor.webp', alt: 'Start screen of the ET FIT Pulse monitor show', w: 1600, h: 900, cursor: 'Show' }
    ],
    more: [
      { title: 'ETCON', tags: ['dev', 'sec'], text: 'Energy management for photovoltaics. As project lead of a team of three, responsible for architecture, security concept and front end. 2022–2023.' },
      { title: 'Pulverfass', tags: ['design'], text: 'UI design for a pirate-themed multiplayer strategy game, released for Android.' },
      { title: 'Android OTP', tags: ['sec'], text: 'One-time passwords on the phone, secured with AES and HMAC.' }
    ]
  },
  research: {
    title: 'What I’m researching', netCursor: 'Fire',
    statement: ['I want to understand how ', 'language models', ' ', 'think', '. Not just as a user, but down to the maths.'],
    netLabel: 'A small neural network with six layers. It keeps running forward passes, the mouse changes weights, a click starts a pass of your own.',
    hud: ['neurons', 'connections', 'passes', 'weights learned'],
    labNote: 'Move over the network: neurons near you fire, and the connections under the mouse learn. A click sends a pass of your own through all six layers. The network is small, the maths is real.',
    nt: {
      title: 'Experiment: the next word', intro: 'A language model only ever predicts the next word. The temperature decides how boldly it chooses.',
      temp: 'Temperature', go: 'Draw the next word', done: 'Sentence done', reset: 'Start over',
      note: 'The maths is real: softmax with temperature. The starting values are set for illustration; a real model learns them from billions of words.',
      finished: 'Done. Exactly like that, just with billions of weights.',
      words: {
        base: 'I want to know the',
        contexts: {
          '^': [['reason', 3.2], ['cause', 2.4], ['truth', 1.6], ['answer', 1.2], ['way', 0.4]],
          reason: [['.', 2.6], ['why', 2.3], ['behind', 1.1], ['exactly', 0.9], ['now', 0.3]],
          cause: [['.', 2.4], ['first', 1.6], ['why', 1.4], ['behind', 1.0], ['today', 0.3]],
          truth: [['.', 2.5], ['first', 1.2], ['behind', 1.1], ['why', 0.9], ['today', 0.4]],
          answer: [['.', 2.4], ['first', 1.4], ['why', 1.2], ['now', 0.8], ['today', 0.4]],
          way: [['.', 2.1], ['forward', 1.7], ['out', 1.2], ['why', 0.8], ['now', 0.5]],
          why: [['?', 2.2], ['.', 1.9], ['machines', 1.4], ['it', 1.0], ['this', 0.9]],
          machines: [['think', 2.6], ['learn', 2.0], ['.', 1.2], ['?', 1.0], ['dream', 0.3]],
          '*': [['.', 2.0], ['why', 1.6], ['and', 1.2], ['now', 0.6], ['today', 0.5]]
        }
      }
    },
    att: {
      title: 'Experiment: attention', intro: 'In a transformer, every word looks at every other word and decides what matters. Type a sentence and point at a word.',
      inputLabel: 'Sentence', sentence: 'I want to understand how machines think',
      hint: 'Point at a word on the left: its row lights up and you see what it pays attention to.',
      reads: '“{a}” pays most attention to “{b}” ({p} %).',
      note: 'A real model learns attention during training. Here the page uses how similar the words are and how close they stand, so the principle becomes visible.',
      matrixLabel: 'Matrix: how strongly each word attends to every other word'
    },
    topics: [
      { title: 'How LLMs work', text: 'Transformers, attention, embeddings, training: what happens inside a model between input and answer.', d: 'ai' },
      { title: 'Algorithms and maths', text: 'Linear algebra, probability, optimisation. The foundations without which you only see the surface.', d: 'dev' },
      { title: 'Agents', text: 'Systems that plan on their own and use tools, with clear approvals. And the question of where that leads towards AGI.', d: 'sec' },
      { title: 'Building my own AI', text: 'Not just reading, but building: Kompass with its agents is the first step.', d: 'design' }
    ],
    goalLead: 'And one day:', goal: 'turn an idea into a whole company, technically and commercially.',
    fired: 'Pass started: six layers, {n} weights.'
  },
  cv: {
    title: 'Career', stepWord: 'Process step',
    note: 'On the right: the step in a chip fab that fits. A little game for anyone who knows how a wafer is made.',
    list: [
      { years: '2018–2023', org: 'HTL Villach (technical college)', role: 'Information technology, network engineering and cybersecurity', step: 'Lithography', stepInfo: 'Lithography: the base pattern is exposed.' },
      { years: '2020–2024', org: 'ET Ingenieurbüro', role: 'Internship, then project lead for ETCON, then network and IT', step: 'Doping', stepInfo: 'Doping: foreign atoms change the properties on purpose.' },
      { years: '2023–2026', org: 'Austrian Red Cross', role: 'Civilian service, then volunteer paramedic, including the ski slope first-aid station', step: 'Passivation', stepInfo: 'Passivation: a protective layer.' },
      { years: 'since 2024', org: 'University of Klagenfurt', role: 'Bachelor in business informatics, thesis graded 1.0', step: 'Interconnect', stepInfo: 'Interconnect: wiring the building blocks together.' },
      { years: '2025–2026', org: 'AlpSec', role: 'Association for offensive and defensive cybersecurity', step: 'Etching', stepInfo: 'Etching: removing material on purpose, like attacking a system.' },
      { years: 'since 2025', org: 'Infineon Technologies', role: 'Software and OT security in manufacturing', step: 'Integration', stepInfo: 'Integration: everything runs in the real fab.' },
      { years: 'since 2026', org: 'ET-FIT GmbH', role: 'Head of digital and IT, freelance', step: 'Packaging', stepInfo: 'Packaging: the chip becomes a finished product.' }
    ]
  },
  photos: {
    title: 'My wafer', lead: 'All my photos on one wafer: mountains, travel, rescue duty, the gym. Every chip is a moment. Click one.', open: 'Open',
    count: (p, t) => `${p} photos, ${t} test fields`, prev: 'Previous', next: 'Next', close: 'Close', of: 'of',
    list: photos(['Above the clouds', 'Summit break', 'Between larches and limestone', 'Looking down the valley', 'Rock window', 'Evening on the summit', 'Peak in the fog', 'Clouds over the mountains', 'Alpine pasture in fog', 'Forest and clouds', 'Ski slope first aid, Red Cross', 'Athens, Acropolis', 'Greece', 'By the sea', 'Evening light on the canal', 'City in the evening light', 'On the beach', 'Portrait', 'At the gym'])
  },
  contact: {
    title: 'Contact', sub: 'A project, a question or an idea for a company? Your message goes straight to me.',
    name: 'Name', email: 'Email', message: 'Message', send: 'Send message', sending: 'Sending …',
    sent: 'Thank you! Your message arrived. I’ll get back to you.', error: 'That didn’t work. Please try again in a moment or message me on LinkedIn.',
    captcha: 'Please wait a moment for the security check.', invalidName: 'Please enter your name.', invalidEmail: 'Please enter a valid email address.', invalidMessage: 'The message needs at least 10 characters.'
  },
  legal: {
    title: 'Imprint and privacy', imprintTitle: 'Imprint',
    imprint: ['Martin Lackner, Carinthia, Austria.', 'Personal website without commercial purpose. Contact via the form on this page.'],
    privacyTitle: 'Privacy',
    privacy: [
      'This site sets no cookies and uses no tracking. Fonts and images are served from this site; no Google services are loaded.',
      'The site is hosted on GitHub Pages (GitHub Inc.). GitHub processes technically necessary data such as your IP address in server logs.',
      'If you use the contact form, your name, email address and message are sent to a script on et-fit.at (hosting: World4You) and delivered to me by email via Brevo. I only use the data to reply to you and delete it when it is no longer needed for that.',
      'To prevent spam, Cloudflare Turnstile checks that a human is sending the form. Technical data from your browser is transmitted to Cloudflare for this.',
      'You have the right to access, correct and delete your data. Use the form to contact me. You can lodge complaints with the Austrian Data Protection Authority.'
    ],
    credits: 'Image credits: cleanroom, public domain, Wikimedia Commons. Fallback wafer image: “12-inch silicon wafer”, Peellden, CC BY-SA 3.0, Wikimedia Commons. All other photos: Martin Lackner.',
    close: 'Close'
  },
  footer: { place: 'Carinthia, Austria', legal: 'Imprint and privacy' },
  toasts: { born: 'That’s my mark: 20 chips that spell ML.', logo: 'All 20 chips passed.', why: 'Good question. It’s the one I keep asking too.', clean: 'Cleanroom: gown on, hood up.', shipped: 'Thank you! The wafer is on its way.' }
};

export const CONTENT: Record<Lang, Content> = { de: DE, en: EN };
