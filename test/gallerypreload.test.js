import test from 'node:test';
import assert from 'node:assert/strict';
import { collectUniqueUrls, getAdjacentIndices, buildPreloadPlan } from '../js/preloadplanner.js';

test('collectUniqueUrls deduplicates, trims, and ignores invalid entries', () => {
  const input = [
    ' gallery/brightonbed.jpg ',
    '',
    null,
    'gallery/brightonbed.jpg',
    'gallery/stirlinghedge.jpg',
    undefined,
    '   '
  ];
  assert.deepEqual(collectUniqueUrls(input), [
    'gallery/brightonbed.jpg',
    'gallery/stirlinghedge.jpg'
  ]);
  assert.deepEqual(collectUniqueUrls(null), []);
});

test('getAdjacentIndices returns current, next, and previous circular indices', () => {
  assert.deepEqual(getAdjacentIndices(0, 5), [0, 1, 4]);
  assert.deepEqual(getAdjacentIndices(4, 5), [4, 0, 3]);
  assert.deepEqual(getAdjacentIndices(2, 5), [2, 3, 1]);
  assert.deepEqual(getAdjacentIndices(0, 2), [0, 1]);
  assert.deepEqual(getAdjacentIndices(0, 1), [0]);
  assert.deepEqual(getAdjacentIndices(0, 0), []);
});

test('buildPreloadPlan orders priority URLs before gallery grid URLs without duplicates', () => {
  const plan = buildPreloadPlan(
    ['gallery/beforeandafterphotos/lawnresetafter.jpg', 'gallery/beforeandafterphotos/lawnresetbefore.jpg'],
    ['gallery/beforeandafterphotos/lawnresetafter.jpg', 'gallery/brightonbed.jpg', 'gallery/stirlinghedge.jpg']
  );
  assert.deepEqual(plan, [
    'gallery/beforeandafterphotos/lawnresetafter.jpg',
    'gallery/beforeandafterphotos/lawnresetbefore.jpg',
    'gallery/brightonbed.jpg',
    'gallery/stirlinghedge.jpg'
  ]);
});
