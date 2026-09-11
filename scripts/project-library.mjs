export function applyProjectLibrary(html, { storageKey, formIds }) {
  const config = JSON.stringify({ storageKey, formIds }).replace(/</g, '\\u003c');
  const style = `  <style data-project-library>
.project-library-launcher{position:fixed;right:1rem;bottom:1rem;z-index:40;border:0;border-radius:999px;padding:.7rem 1rem;font:inherit;font-weight:700;box-shadow:0 8px 28px rgba(0,0,0,.18);cursor:pointer}.project-library-dialog{width:min(680px,calc(100% - 2rem));max-height:min(78vh,760px);border:0;border-radius:1rem;padding:0;box-shadow:0 20px 70px rgba(0,0,0,.28)}.project-library-dialog::backdrop{background:rgba(0,0,0,.45)}.project-library-shell{padding:1.1rem}.project-library-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.project-library-head h2{margin:0}.project-library-close{border:0;background:transparent;font:inherit;font-size:1.35rem;cursor:pointer}.project-library-note{margin:.35rem 0 1rem;opacity:.75}.project-library-list{display:grid;gap:.7rem}.project-library-empty{padding:1rem;border:1px dashed currentColor;border-radius:.8rem;opacity:.75}.project-card{padding:.85rem;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:.8rem}.project-card h3{margin:0 0 .2rem;font-size:1rem}.project-card p{margin:.15rem 0;opacity:.75;font-size:.9rem}.project-card-actions{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.65rem}.project-card-actions button{font:inherit;padding:.45rem .7rem;border-radius:.55rem;cursor:pointer}.project-save-button{margin-top:.75rem}
  </style>`;
  const script = `  <script data-project-library>
(() => {
  const config = ${config};
  const allowed = new Set(config.formIds);
  const key = config.storageKey;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const read = () => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter((item) => item && item.id && item.path).slice(0, 100) : []; } catch { return []; } };
  const write = (items) => { try { localStorage.setItem(key, JSON.stringify(items.slice(0, 100))); return true; } catch { return false; } };
  const dateText = (iso) => { try { return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); } catch { return iso || ''; } };
  const launcher = document.createElement('button'); launcher.type = 'button'; launcher.className = 'project-library-launcher';
  const dialog = document.createElement('dialog'); dialog.className = 'project-library-dialog'; dialog.setAttribute('aria-label', 'Mis proyectos guardados');
  const shell = document.createElement('div'); shell.className = 'project-library-shell';
  const head = document.createElement('div'); head.className = 'project-library-head';
  const heading = document.createElement('h2'); heading.textContent = 'Mis proyectos';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'project-library-close'; close.setAttribute('aria-label', 'Cerrar'); close.textContent = '×';
  head.append(heading, close);
  const note = document.createElement('p'); note.className = 'project-library-note'; note.textContent = 'Se guardan únicamente en este navegador. No necesitas una cuenta.';
  const list = document.createElement('div'); list.className = 'project-library-list';
  shell.append(head, note, list); dialog.append(shell); document.body.append(launcher, dialog);
  const openDialog = () => { if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); };
  const closeDialog = () => { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); };
  close.addEventListener('click', closeDialog); dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); }); launcher.addEventListener('click', openDialog);
  const render = () => {
    const items = read(); launcher.textContent = 'Mis proyectos · ' + items.length; list.replaceChildren();
    if (!items.length) { const empty = document.createElement('p'); empty.className = 'project-library-empty'; empty.textContent = 'Todavía no has guardado ningún cálculo.'; list.append(empty); return; }
    for (const project of items) {
      const card = document.createElement('article'); card.className = 'project-card';
      const title = document.createElement('h3'); title.textContent = project.name || 'Proyecto sin nombre';
      const page = document.createElement('p'); page.textContent = project.page || 'Cálculo guardado';
      const date = document.createElement('p'); date.textContent = dateText(project.createdAt);
      const actions = document.createElement('div'); actions.className = 'project-card-actions';
      const open = document.createElement('button'); open.type = 'button'; open.textContent = 'Abrir'; open.addEventListener('click', () => { location.href = new URL(project.path, location.origin).href; });
      const duplicate = document.createElement('button'); duplicate.type = 'button'; duplicate.textContent = 'Duplicar'; duplicate.addEventListener('click', () => { const current = read(); const source = current.find((item) => item.id === project.id); if (!source) return; current.unshift({ ...source, id: uid(), name: (source.name || 'Proyecto') + ' (copia)', createdAt: new Date().toISOString() }); write(current); render(); });
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Eliminar'; remove.addEventListener('click', () => { if (!confirm('¿Eliminar este proyecto guardado?')) return; write(read().filter((item) => item.id !== project.id)); render(); });
      actions.append(open, duplicate, remove); card.append(title, page, date, actions); list.append(card);
    }
  };
  const saveProject = (form, button) => {
    const url = new URL(location.href); if (!url.searchParams.has('calc')) { alert('Haz primero un cálculo para poder guardarlo.'); return; }
    const pageTitle = (document.querySelector('h1')?.textContent || document.title || 'Cálculo').trim();
    const suggested = pageTitle + ' · ' + new Intl.DateTimeFormat('es-ES').format(new Date());
    const entered = prompt('Nombre del proyecto', suggested); if (entered === null) return; const name = entered.trim() || suggested;
    const items = read(); items.unshift({ id: uid(), name, page: pageTitle, formId: form.id, path: location.pathname + location.search + location.hash, createdAt: new Date().toISOString() });
    if (!write(items)) { alert('No se ha podido guardar el proyecto en este navegador.'); return; }
    render(); const original = button.textContent; button.textContent = 'Proyecto guardado'; setTimeout(() => { button.textContent = original; }, 1600);
  };
  const attachSave = (form) => {
    const result = document.getElementById(form.id.replace(/-form$/, '-result')); const error = form.querySelector('[data-error]');
    if (!result || result.hidden || (error && !error.hidden && error.textContent.trim())) return;
    if (!new URL(location.href).searchParams.has('calc') || result.querySelector('[data-save-project]')) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'button button--quiet project-save-button'; button.dataset.saveProject = ''; button.textContent = 'Guardar en mis proyectos'; button.addEventListener('click', () => saveProject(form, button)); result.append(button);
  };
  document.addEventListener('submit', (event) => { const form = event.target; if (!(form instanceof HTMLFormElement) || !allowed.has(form.id)) return; document.getElementById(form.id.replace(/-form$/, '-result'))?.querySelector('[data-save-project]')?.remove(); setTimeout(() => attachSave(form), 0); }, true);
  render();
})();
  </script>`;
  return html.replace('</head>', style + '\n</head>').replace('</body>', script + '\n</body>');
}
