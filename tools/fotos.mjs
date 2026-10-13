// ============================================================
// Fotos für die Seite aufbereiten
// node tools/fotos.mjs
//
// Nimmt alles aus inhalte/fotos/ (gitignored, Originale vom Handy) und legt
// es als WebP in public/img/ ab:
//   - längste Seite höchstens 2000 px, Qualität 82
//   - ALLE Metadaten weg (EXIF, GPS, Kamera, Datum) – Wander- und Radfotos
//     verraten sonst Standorte, im schlimmsten Fall das eigene Zuhause
//   - Dateiname wird web-tauglich (klein, ohne Leer- und Sonderzeichen)
//   - Hochkant-Fotos vom Handy werden richtig gedreht
// Bereits aufbereitete Fotos werden übersprungen (--neu erzwingt alles).
//
// iPhone-Fotos im HEIC-Format kann das Werkzeug nicht lesen: als JPG
// exportieren oder am iPhone „Einstellungen › Kamera › Formate › Maximale
// Kompatibilität“ wählen.
// ============================================================

import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EIN = path.join(ROOT, 'inhalte', 'fotos');
const AUS = path.join(ROOT, 'public', 'img');
const alleNeu = process.argv.includes('--neu');

const webName = (datei) => path.parse(datei).name.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.webp';

if (!existsSync(EIN)) { console.error(`Ordner fehlt: ${path.relative(ROOT, EIN)}`); process.exit(1); }
mkdirSync(AUS, { recursive: true });

let neu = 0;
for (const datei of readdirSync(EIN).sort()) {
  const von = path.join(EIN, datei);
  if (!statSync(von).isFile() || datei.startsWith('.')) continue;
  if (/\.hei[cf]$/i.test(datei)) { console.warn(`  ✗ ${datei}: HEIC – bitte als JPG exportieren`); continue; }
  const nach = path.join(AUS, webName(datei));
  if (!alleNeu && existsSync(nach)) continue;
  try {
    const meta = await sharp(von).metadata();
    const hatteGps = !!meta.exif && meta.exif.includes(Buffer.from('GPS'));
    await sharp(von).rotate()                       // Ausrichtung aus EXIF übernehmen, dann EXIF verwerfen
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(nach);                                // sharp schreibt ohne .withMetadata() keine Metadaten
    const kb = Math.round(statSync(nach).size / 1024);
    console.log(`  ✓ ${datei} → img/${path.basename(nach)} (${kb} KB)${hatteGps ? '  · GPS entfernt' : ''}`);
    neu++;
  } catch (e) {
    console.warn(`  ✗ ${datei}: ${e.message}`);
  }
}
console.log(neu ? `\n${neu} Foto(s) aufbereitet → public/img/` : 'Nichts Neues in inhalte/fotos/.');
