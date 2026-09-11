import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../src/pages/pages.mjs';
import { renderPage } from '../src/templates/site.mjs';
import { site } from '../site.config.mjs';
import { applyAnalyticsConsent } from './analytics-consent.mjs';
import { applyShareableCalculations } from './shareable-calculations.mjs';
import { applyCalculationExplanations } from './calculation-explanations.mjs';

const verificationTag = '<meta name="google-site-verification" content="EwTiLP4eMZK5K7W9U_5tpM7cvJsn4ZaLvRwKYrmuuV0">';
const shareableForms = ['gauge-form', 'counts-form', 'adapt-form', 'changes-form'];
const explanations = {
  'gauge-form': {
    formula: 'puntos por 10 cm = puntos medidos ÷ ancho medido × 10; vueltas por 10 cm = vueltas medidas ÷ alto medido × 10',
    fields: [['stitches', 'Puntos medidos'], ['rows', 'Vueltas medidas'], ['width', 'Ancho de la muestra', 'cm'], ['height', 'Alto de la muestra', 'cm']],
    note: 'Normalizar a 10 cm permite comparar muestras tomadas con tamaños distintos.'
  },
  'counts-form': {
    formula: 'puntos teóricos = (puntos/10 cm ÷ 10) × ancho; vueltas teóricas = (vueltas/10 cm ÷ 10) × alto; después se redondean los puntos al múltiplo y extras indicados',
    fields: [['stitches10cm', 'Puntos por 10 cm'], ['rows10cm', 'Vueltas por 10 cm'], ['width', 'Ancho objetivo', 'cm'], ['height', 'Alto objetivo', 'cm'], ['repeat', 'Múltiplo del motivo'], ['extra', 'Puntos extra']],
    note: 'El ancho final puede variar ligeramente porque los puntos deben quedar en un número entero compatible con el motivo.'
  },
  'adapt-form': {
    formula: 'ancho original = puntos patrón ÷ tensión patrón × 10; nuevos puntos = ancho original × tu tensión ÷ 10. Se aplica el mismo principio a las vueltas.',
    fields: [['patternStitches', 'Puntos del patrón'], ['patternRows', 'Vueltas del patrón'], ['patternStitches10cm', 'Tensión del patrón (puntos/10 cm)'], ['patternRows10cm', 'Tensión del patrón (vueltas/10 cm)'], ['ownStitches10cm', 'Tu tensión (puntos/10 cm)'], ['ownRows10cm', 'Tu tensión (vueltas/10 cm)']],
    note: 'El resultado mantiene aproximadamente la misma medida física, no necesariamente la misma estructura del patrón.'
  },
  'changes-form': {
    formula: 'nº de cambios = |puntos finales − puntos iniciales|; cada marca se aproxima a índice × puntos iniciales ÷ (cambios + 1)',
    fields: [['start', 'Puntos iniciales'], ['end', 'Puntos finales']],
    note: 'Las posiciones se redondean a puntos enteros para repartir aumentos o disminuciones de la forma más uniforme posible.'
  }
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'src/js'), path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'src/styles/site.css'), path.join(dist, 'assets/site.css'));
await cp(path.join(root, 'src/assets/favicon.svg'), path.join(dist, 'assets/favicon.svg'));

for (const page of pages) {
  const destination = page.output
    ? path.join(dist, page.output)
    : page.path ? path.join(dist, page.path, 'index.html') : path.join(dist, 'index.html');
  await mkdir(path.dirname(destination), { recursive: true });
  let html = applyAnalyticsConsent(renderPage(page), {
    measurementId: 'G-TQ69Y94XGG',
    storageKey: 'tcm:v1:analytics-consent'
  });
  html = applyShareableCalculations(html, shareableForms);
  html = applyCalculationExplanations(html, explanations);
  if (page.path === '') html = html.replace('<head>', `<head>\n  ${verificationTag}`);
  await writeFile(destination, html, 'utf8');
}

const urls = pages.filter((page) => !page.noindex && page.path !== '404')
  .map((page) => `  <url><loc>${site.origin}${site.basePath}${page.path ? `${page.path}/` : ''}</loc></url>`)
  .join('\n');
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
await writeFile(path.join(dist, '.nojekyll'), '', 'utf8');
console.log(`Built ${pages.length} pages in dist/`);
