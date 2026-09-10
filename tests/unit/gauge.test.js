import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptPattern, dimensionsToCounts, distributeChanges, normalizeGauge, roundToRepeat } from '../../src/js/math/gauge.js';

test('normaliza una muestra medida en un área distinta de 10 cm', () => {
  const result = normalizeGauge({ stitches: 18, rows: 24, width: 8, height: 8 });
  assert.equal(result.stitches10cm, 22.5);
  assert.equal(result.rows10cm, 30);
});

test('calcula puntos y vueltas para una medida final', () => {
  const result = dimensionsToCounts({ stitches10cm: 20, rows10cm: 28, width: 50, height: 60, repeat: 1, extra: 0 });
  assert.equal(result.stitches, 100);
  assert.equal(result.rows, 168);
});

test('redondea respetando múltiplo y puntos de borde', () => {
  assert.equal(roundToRepeat(101, 6, 2, 'nearest'), 104);
  assert.equal(roundToRepeat(101, 6, 2, 'down'), 98);
});

test('adapta horizontal y vertical por separado', () => {
  const result = adaptPattern({ patternStitches: 100, patternRows: 140, patternStitches10cm: 20, patternRows10cm: 28, ownStitches10cm: 22, ownRows10cm: 30 });
  assert.equal(result.stitches, 110);
  assert.equal(result.rows, 150);
  assert.equal(result.widthCm, 50);
  assert.equal(result.heightCm, 50);
});

test('rechaza ceros y valores no numéricos', () => {
  assert.throws(() => normalizeGauge({ stitches: 0, rows: 20, width: 10, height: 10 }));
  assert.throws(() => dimensionsToCounts({ stitches10cm: 'x', rows10cm: 20, width: 10, height: 10 }));
});

test('reparte cambios sin agruparlos en un extremo', () => {
  const result = distributeChanges(100, 110);
  assert.equal(result.changes, 10);
  assert.equal(result.direction, 'increase');
  assert.deepEqual(result.positions, [9, 18, 27, 36, 45, 55, 64, 73, 82, 91]);
  assert.ok(Math.max(...result.gaps) - Math.min(...result.gaps) <= 1);
});

test('detecta una disminución y rechaza cambios imposibles', () => {
  assert.equal(distributeChanges(80, 72).direction, 'decrease');
  assert.throws(() => distributeChanges(10, 25));
});
