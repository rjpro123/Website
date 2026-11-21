import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPercent, calcPercentFromX, formatSplitStyle, getAriaStatus } from '../js/beforeaftermath.js';

test('clampPercent clamps values within 0 to 100', () => {
  assert.equal(clampPercent(-15), 0);
  assert.equal(clampPercent(0), 0);
  assert.equal(clampPercent(42.5), 42.5);
  assert.equal(clampPercent(100), 100);
  assert.equal(clampPercent(115), 100);
  assert.equal(clampPercent('invalid'), 50);
});

test('calcPercentFromX converts screen X coordinate to clamped percentage', () => {
  assert.equal(calcPercentFromX(100, 0, 200), 50);
  assert.equal(calcPercentFromX(0, 0, 200), 0);
  assert.equal(calcPercentFromX(200, 0, 200), 100);
  assert.equal(calcPercentFromX(-50, 0, 200), 0);
  assert.equal(calcPercentFromX(250, 0, 200), 100);
  assert.equal(calcPercentFromX(150, 100, 100), 50);
  assert.equal(calcPercentFromX(100, 0, 0), 50);
});

test('formatSplitStyle formats cleanly for CSS variable', () => {
  assert.equal(formatSplitStyle(50), '50.0%');
  assert.equal(formatSplitStyle(75.34), '75.3%');
  assert.equal(formatSplitStyle(-10), '0.0%');
  assert.equal(formatSplitStyle(150), '100.0%');
});

test('getAriaStatus generates descriptive status messages', () => {
  assert.equal(getAriaStatus(50), '50% before work and 50% after work');
  assert.equal(getAriaStatus(100), 'Showing 100% before work');
  assert.equal(getAriaStatus(0), 'Showing 100% after work');
  assert.equal(getAriaStatus(30), '30% before work and 70% after work');
});
