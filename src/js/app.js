import { adaptPattern, dimensionsToCounts, normalizeGauge } from './math/gauge.js';

const number = (form, name) => form.elements[name].value;
const format = (value, digits = 1) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(value);
const show = (element, html) => { element.innerHTML = html; element.hidden = false; element.focus(); };
const fail = (form, error) => {
  const box = form.querySelector('[data-error]');
  box.textContent = error.message;
  box.hidden = false;
  box.focus();
};
const save = (value) => {
  try { localStorage.setItem('tcm:v1:project', JSON.stringify(value)); } catch {}
};

document.querySelector('#gauge-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const result = normalizeGauge({ stitches: number(form, 'stitches'), rows: number(form, 'rows'), width: number(form, 'width'), height: number(form, 'height') });
    show(document.querySelector('#gauge-result'), `<p class="eyebrow">Tu tensión normalizada</p><h2>${format(result.stitches10cm, 2)} puntos × ${format(result.rows10cm, 2)} vueltas</h2><p>por cada 10 × 10 cm</p><p>Equivale a ${format(result.stitchesPerCm, 3)} puntos y ${format(result.rowsPerCm, 3)} vueltas por centímetro.</p><a class="button" href="../puntos-y-vueltas/?st=${encodeURIComponent(result.stitches10cm)}&rw=${encodeURIComponent(result.rows10cm)}">Usar esta muestra</a>`);
    save({ type: 'gauge', ...result, savedAt: new Date().toISOString() });
  } catch (error) { fail(form, error); }
});

const countsForm = document.querySelector('#counts-form');
if (countsForm) {
  const params = new URLSearchParams(location.search);
  if (params.has('st')) countsForm.elements.stitches10cm.value = params.get('st');
  if (params.has('rw')) countsForm.elements.rows10cm.value = params.get('rw');
  countsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const result = dimensionsToCounts({
        stitches10cm: number(countsForm, 'stitches10cm'), rows10cm: number(countsForm, 'rows10cm'),
        width: number(countsForm, 'width'), height: number(countsForm, 'height'), repeat: number(countsForm, 'repeat'),
        extra: number(countsForm, 'extra'), round: countsForm.elements.round.value
      });
      show(document.querySelector('#counts-result'), `<p class="eyebrow">Resultado ajustado</p><h2>Monta ${result.stitches} puntos</h2><p>Teje aproximadamente <strong>${result.rows} vueltas</strong>.</p><dl><div><dt>Ancho resultante</dt><dd>${format(result.achievedWidth, 2)} cm</dd></div><div><dt>Alto resultante</dt><dd>${format(result.achievedHeight, 2)} cm</dd></div></dl><p class="note">El redondeo respeta el múltiplo del motivo y los puntos adicionales indicados.</p>`);
      save({ type: 'counts', ...result, savedAt: new Date().toISOString() });
    } catch (error) { fail(countsForm, error); }
  });
}

document.querySelector('#adapt-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const result = adaptPattern({
      patternStitches: number(form, 'patternStitches'), patternRows: number(form, 'patternRows'),
      patternStitches10cm: number(form, 'patternStitches10cm'), patternRows10cm: number(form, 'patternRows10cm'),
      ownStitches10cm: number(form, 'ownStitches10cm'), ownRows10cm: number(form, 'ownRows10cm')
    });
    show(document.querySelector('#adapt-result'), `<p class="eyebrow">Misma medida, tu tensión</p><h2>${result.stitches} puntos × ${result.rows} vueltas</h2><p>El tramo original mide aproximadamente ${format(result.widthCm, 2)} × ${format(result.heightCm, 2)} cm.</p><p>Factores independientes: ×${format(result.stitchFactor, 3)} en horizontal y ×${format(result.rowFactor, 3)} en vertical.</p><p class="note">Revisa aumentos, disminuciones, sisas y motivos: no se adaptan de forma segura multiplicando todo el patrón.</p>`);
    save({ type: 'adapt', ...result, savedAt: new Date().toISOString() });
  } catch (error) { fail(form, error); }
});

const saved = document.querySelector('#saved-result');
if (saved) {
  try {
    const value = JSON.parse(localStorage.getItem('tcm:v1:project'));
    if (!value) throw new Error();
    const descriptions = {
      gauge: `Muestra: ${format(value.stitches10cm, 2)} puntos × ${format(value.rows10cm, 2)} vueltas en 10 cm`,
      counts: `Pieza: ${value.stitches} puntos × ${value.rows} vueltas`,
      adapt: `Adaptación: ${value.stitches} puntos × ${value.rows} vueltas`
    };
    saved.innerHTML = `<h2>Último cálculo</h2><p>${descriptions[value.type]}</p><p class="note">Guardado en este dispositivo.</p>`;
  } catch { saved.innerHTML = '<h2>Aún no hay cálculos guardados</h2><p>Usa una herramienta y el último resultado aparecerá aquí.</p>'; }
}

document.querySelector('#clear-project')?.addEventListener('click', () => {
  localStorage.removeItem('tcm:v1:project');
  location.reload();
});
