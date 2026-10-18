import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { planets } from '../src/data/universe.ts';
import { memories } from '../src/data/memories.ts';
import { songs } from '../src/data/songs.ts';
import { dateIdeas, chooseDateIndex } from '../src/data/dateIdeas.ts';
import { formatDate } from '../src/config/couple.ts';

test('date generator reaches all alternatives and never repeats the previous date', () => {
  for (let previous = -1; previous < dateIdeas.length; previous++) {
    const results = new Set<number>();
    for (let n = 0; n < 1000; n++) {
      const next = chooseDateIndex(previous, n / 1000);
      assert.ok(next >= 0 && next < dateIdeas.length);
      assert.notEqual(next, previous);
      results.add(next);
    }
    assert.equal(results.size, previous < 0 ? dateIdeas.length : dateIdeas.length - 1);
  }
});
test('every configured memory and demo track exists locally', () => {
  for (const memory of memories) assert.ok(existsSync(`public${memory.image}`), memory.image);
  for (const song of songs) if (song.src) assert.ok(existsSync(`public${song.src}`), song.src);
});
test('planets have unique IDs, separated orbits, and valid configuration', () => {
  assert.equal(new Set(planets.map((p) => p.id)).size, 6);
  for (const p of planets) {
    assert.ok(p.size > 0);
    assert.ok(p.orbit > p.size + 1);
    assert.ok(Number.isFinite(p.speed));
  }
  assert.equal(formatDate('2023-06-18'), '18 · 06 · 2023');
});
