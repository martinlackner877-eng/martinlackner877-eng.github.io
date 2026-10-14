# AGENTS.md – Portfolio Martin Lackner

Persönliche Portfolio-Seite. Live: **https://martinlackner877-eng.github.io**
Repo `martinlackner877-eng/martinlackner877-eng.github.io` – **öffentlich** (GitHub Pages verlangt das kostenlos).

## Stack und Deploy

- Angular 21 (Standalone, OnPush, zoneless), SCSS, GSAP ScrollTrigger, three.js (nachgeladen).
- Eine Seite in zwei Sprachen: `/` Deutsch, `/en` Englisch (Route-Daten `lang`).
- **Alle Texte und Fakten: `src/app/content.ts`** (DE und EN nebeneinander). Keine Datenbank.
- Bausteine in `src/app/home/`: `home-page` (Abschnitte, Scroll-Geschichte, Effekte), `wafer-stage` (3D-Wafer),
  `research-lab` (Netz, nächstes Wort, Attention), `photo-wafer` (Galerie + Lightbox), `contact-form`, `logo`, `fx.ts`.
  Gemeinsamer Zustand Seite ↔ Wafer: `core/wafer-bus.ts`. Tokens und Grundstile: `src/styles.scss`.
- Schrift Archivo lokal über `@fontsource-variable/archivo` (Breitenachse), keine Google-Dienste.
- Favicon und Link-Vorschau: `public/favicon.svg|ico`, `apple-touch-icon.png`, `og-image.jpg` (aus dem Wafer-Logo bzw. Hero).
- **Push auf `main` = sofort live**: `.github/workflows/deploy.yml` baut und veröffentlicht auf GitHub Pages.
- `npm run build` → `dist/portfolio/browser`; `postbuild` kopiert `index.html` nach `404.html` (SPA-Fallback auf Pages).
- Abhängigkeiten mit `npm install`, nie `npm ci` (Lockfile entsteht auf Windows, siehe Workflow-Kommentar).
- Tag `obsidian-v1` = Stand vor dem Redesign (Obsidian-Dark). Zurück: `git checkout obsidian-v1 -- src public`.

## Befehle

- Dev-Server: `npm start`
- Build: `npm run build`
- Fotos aufbereiten: `node tools/fotos.mjs` (`--neu` erzwingt alle)

## Fotos und Rohinhalte

- Martin legt Originale in `inhalte/fotos/`, Antworten in `inhalte/steckbrief.md`. `inhalte/` ist gitignored.
- `tools/fotos.mjs` schreibt `public/img/<name>.webp` (max. 2000 px, WebP q82) und `<name>-s.webp` (480 px, Vorschau), **ohne EXIF/GPS**. HEIC wird abgelehnt.
- Im Code nur die aufbereiteten `img/*.webp` verwenden, nie Originale nach `public/` legen.

## Kontaktformular (muss so bleiben, wie es auf et-fit.at/dev funktioniert)

Vorlage: `etfit/src/app/pages/portfolio/portfolio.ts` (Nachbarordner `Desktop\et-fit Drautal\etfit`).
- `POST https://www.et-fit.at/mail-dev.php` als JSON: `name`, `email`, `message`, `cf-turnstile-response`.
- Felder: Name ≥ 2, E-Mail, Nachricht ≥ 10 Zeichen, Honeypot `bot-field` (gefüllt → still verwerfen).
- Cloudflare Turnstile, Site-Key `0x4AAAAAADt2dBu0Bm_syblC` (Widget „/dev“), Paket `ngx-turnstile`.
- Damit es von github.io aus geht, braucht es **zwei Einstellungen außerhalb dieses Repos** (nur Martin):
  1. `allowed_origins` in der Server-Datei `et-config.php` enthält `https://martinlackner877-eng.github.io`.
  2. Im Turnstile-Widget „/dev“ (Cloudflare) steht der Hostname `martinlackner877-eng.github.io`.
- Code von `mail-dev.php` und eine Config-Vorlage: Repo `et-fit-marke`, Ordner `server/`.

## Regeln

1. **Öffentliches Repo:** keine Passwörter, Schlüssel, `et-config.php`, Screenshots mit Zugangsdaten.
2. **Infineon nur allgemein** („Cybersecurity im Produktionsumfeld“). Keine internen Systemnamen, Standorte,
   Kolleginnen und Kollegen, Screenshots oder Fotos vom Gelände.
3. **Fotos:** kein GPS, keine erkennbaren Patientinnen/Patienten, keine Kennzeichen, kein Wohnort.
4. **Instagram (`ma3t1n.2026`) nur als Link**, kein eingebetteter Feed (würde Meta-Skripte laden).
5. Kein `innerHTML`, `bypassSecurityTrust*`, `eval`. `prefers-reduced-motion` respektieren, Maus-Effekte
   nur bei `(hover: hover) and (pointer: fine)`. Jeder GSAP-ScrollTrigger wird beim Zerstören gekillt.
6. Pro Seite genau ein `<h1>`; 0 px horizontaler Overflow bei 320–1440 px.
7. Sprache Deutsch (Österreich), Anrede „du“ beim Kontakt.
8. Sichtbare Änderungen erst auf Martins „push“.

## Design-Werkzeuge (`.claude/skills/`)

- **`design-taste-frontend`** (taste-skill v2, MIT, Herkunft in `HERKUNFT.md`): Ablauf Brief → Richtung ziehen
  (`node .claude/skills/design-taste-frontend/scripts/draw.mjs`) → bauen → prüfen (`scripts/lint.mjs`,
  `scripts/inspect.mjs` startet lokales Chrome). Bibliothek mit Referenzen unter `library/`.
- **`web-design-guidelines`** (Vercel): Audit gegen die aktuellen Web-Interface-Guidelines, Befunde als `datei:zeile`.
- awesome-design-md (VoltAgent) nur als Inspiration, nichts davon kopieren.

## Verwandte Repos

`Desktop\et-fit Drautal\` – `etfit` (Kundenwebsite, dort lebt bis zum Umzug noch `/dev`), `et-fit-pulse`,
`et-fit-marke` (Betriebshandbuch). Nach dem Umzug: `/dev` auf et-fit.at per 301 hierher umleiten,
Footer-Link dort anpassen, Route `portfolio` in etfit entfernen.

## Konzept „Der Wafer“ (entschieden 14.10.2026)

- Leitidee: Das Leben als **Prozessroute eines Wafers** durch die Fab. Rohling → Lithografie → Dotierung →
  Passivierung → Verdrahtung → Integration → Wafertest → Burn-in → Auslieferung. Projekte sind Chips auf der
  Wafermap, Klassen = Design / Development / Security & Systems / AI & Data. Kontakt = Auslieferung.
- Hero: echter 3D-Wafer (three.js, `MeshPhysicalMaterial` mit Iridescence, Studio-Environment aus Lichtleisten,
  orange Kante), reagiert auf Maus und Scroll. three.js nur nachladen; schwache Geräte, `prefers-reduced-motion`
  und Fehler → Standbild.
- Look: dunkel als Standard, heller „Reinraum-Modus“ umschaltbar. Farben `#0B0C0E` `#16181C` `#C2C8CF`
  `#ECEEF1`, Akzent nur `#ED440D`. Überschriften Archivo (breiter Schnitt), lokal einbinden.
- Logo: Wafer-Stempel, 11×11-Chipraster, 20 Chips bilden „ML“, Kerbe orange.
- Halbleiter-Inhalte nur allgemein (siehe Regel 2). Laborfotos aus offenen Archiven immer mit Nachweis.
- Plan mit persönlichen Details: `inhalte/plan.md` (lokal).
