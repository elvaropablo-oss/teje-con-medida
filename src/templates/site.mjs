import { site } from '../../site.config.mjs';

const base = site.basePath;

export function linkButton(path, label, quiet = false) {
  return `<a class="button${quiet ? ' button--quiet' : ''}" href="${base}${path}">${label}</a>`;
}

export function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Migas de pan">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${item.label}</span>` : `<a href="${base}${item.path}">${item.label}</a>`).join('<span aria-hidden="true">/</span>')}</nav>`;
}

export function hero(kicker, title, intro, actions = '') {
  return `<section class="hero"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="lead">${intro}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</section>`;
}

function navLink(pagePath, path, label) {
  const active = pagePath === path || (path === 'guias/medir-muestra/' && pagePath.startsWith('guias/'));
  return `<a href="${base}${path}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

export function renderPage(page) {
  const canonical = `${site.origin}${base}${page.path ? `${page.path}/` : ''}`;
  const schema = JSON.stringify(page.schema || {
    '@context': 'https://schema.org', '@type': page.tool ? 'WebApplication' : 'WebPage',
    name: page.h1, url: canonical, description: page.description, inLanguage: 'es-ES',
    ...(page.tool ? { applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } } : {})
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  ${page.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/site.css">
  <script type="application/ld+json">${schema}</script>
  <script type="module" src="${base}assets/app.js"></script>
</head>
<body class="page-${page.path ? page.path.replaceAll('/', '-') : 'home'}">
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header"><a class="brand" href="${base}" aria-label="TejeConMedida, inicio"><svg class="brand-mark" viewBox="0 0 36 36" aria-hidden="true"><rect x="1" y="1" width="34" height="34" fill="#d9fa54" stroke="currentColor" stroke-width="2"/><path d="M7 10c4 0 4 5 8 5s4-5 8-5 4 5 6 5M7 21c4 0 4 5 8 5s4-5 8-5 4 5 6 5" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>TejeConMedida</span></a><nav aria-label="Principal">${navLink(page.path, 'herramientas/', 'Herramientas')}${navLink(page.path, 'guias/medir-muestra/', 'Guías')}${navLink(page.path, 'mi-proyecto/', 'Mi proyecto')}</nav></header>
  <main id="contenido">${page.content}</main>
  <footer><p><strong>TejeConMedida</strong> convierte medidas y tensiones. Comprueba siempre el resultado en tu propia muestra.</p><nav aria-label="Información"><a href="${base}metodologia/">Metodología</a><a href="${base}sobre/">Sobre</a><a href="${base}privacidad/">Privacidad</a></nav></footer>
</body>
</html>`;
}
