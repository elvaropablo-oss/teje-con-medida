export function positive(value, label = 'valor') {
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} debe ser mayor que cero.`);
  return number;
}

export function normalizeGauge({ stitches, rows, width, height }) {
  const stitchCount = positive(stitches, 'Los puntos');
  const rowCount = positive(rows, 'Las vueltas');
  const measuredWidth = positive(width, 'El ancho medido');
  const measuredHeight = positive(height, 'El alto medido');
  return {
    stitchesPerCm: stitchCount / measuredWidth,
    rowsPerCm: rowCount / measuredHeight,
    stitches10cm: stitchCount / measuredWidth * 10,
    rows10cm: rowCount / measuredHeight * 10
  };
}

export function roundToRepeat(raw, repeat = 1, extra = 0, mode = 'nearest') {
  const repeatSize = Math.max(1, Math.round(positive(repeat, 'El múltiplo')));
  const extraCount = Math.max(0, Math.round(Number(extra) || 0));
  const available = Math.max(0, raw - extraCount);
  const operation = mode === 'up' ? Math.ceil : mode === 'down' ? Math.floor : Math.round;
  return Math.max(extraCount, operation(available / repeatSize) * repeatSize + extraCount);
}

export function dimensionsToCounts({ stitches10cm, rows10cm, width, height, repeat = 1, extra = 0, round = 'nearest' }) {
  const stitchGauge = positive(stitches10cm, 'La tensión de puntos') / 10;
  const rowGauge = positive(rows10cm, 'La tensión de vueltas') / 10;
  const targetWidth = positive(width, 'El ancho final');
  const targetHeight = positive(height, 'El alto final');
  const rawStitches = stitchGauge * targetWidth;
  const rawRows = rowGauge * targetHeight;
  const stitches = roundToRepeat(rawStitches, repeat, extra, round);
  return {
    rawStitches,
    rawRows,
    stitches,
    rows: Math.max(1, Math.round(rawRows)),
    achievedWidth: stitches / stitchGauge,
    achievedHeight: Math.max(1, Math.round(rawRows)) / rowGauge
  };
}

export function adaptPattern({ patternStitches, patternRows, patternStitches10cm, patternRows10cm, ownStitches10cm, ownRows10cm }) {
  const stitches = positive(patternStitches, 'Los puntos del patrón');
  const rows = positive(patternRows, 'Las vueltas del patrón');
  const patternStitchGauge = positive(patternStitches10cm, 'La tensión de puntos del patrón');
  const patternRowGauge = positive(patternRows10cm, 'La tensión de vueltas del patrón');
  const ownStitchGauge = positive(ownStitches10cm, 'Tu tensión de puntos');
  const ownRowGauge = positive(ownRows10cm, 'Tu tensión de vueltas');
  const widthCm = stitches / patternStitchGauge * 10;
  const heightCm = rows / patternRowGauge * 10;
  return {
    widthCm,
    heightCm,
    stitches: Math.max(1, Math.round(widthCm * ownStitchGauge / 10)),
    rows: Math.max(1, Math.round(heightCm * ownRowGauge / 10)),
    stitchFactor: ownStitchGauge / patternStitchGauge,
    rowFactor: ownRowGauge / patternRowGauge
  };
}
