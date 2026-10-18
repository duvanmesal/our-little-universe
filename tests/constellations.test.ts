import test from 'node:test';
import assert from 'node:assert/strict';
import {
  constellations,
  connectionPoints,
  connectionRevealed,
  parseStarProgress,
  resetChapterProgress,
  starKey,
} from '../src/data/constellations.ts';
import { memories } from '../src/data/memories.ts';

test('replaying a completed chapter removes only its discoveries and clicks reveal it again', () => {
  const chapter = constellations[0]!;
  const all = constellations.flatMap((c) => c.stars.map((s) => starKey(c.id, s.id)));
  const replayed = resetChapterProgress(all, chapter.id);
  assert.equal(replayed.length, all.length - chapter.stars.length);
  assert.ok(replayed.every((id) => !id.startsWith(`${chapter.id}:`)));
  assert.ok(chapter.connections.every((edge) => !connectionRevealed(chapter, edge, replayed)));
  const afterClicks = [...replayed, ...chapter.stars.map((star) => starKey(chapter.id, star.id))];
  assert.ok(chapter.connections.every((edge) => connectionRevealed(chapter, edge, afterClicks)));
  assert.deepEqual(parseStarProgress(JSON.stringify(replayed)), replayed);
});

test('sky silhouettes and atlas paths share memory endpoints and valid intermediate stars', () => {
  for (const chapter of constellations) {
    for (const edge of chapter.connections) {
      const points = connectionPoints(chapter, edge);
      assert.deepEqual(points[0], chapter.stars.find((star) => star.id === edge[0])!.position);
      assert.deepEqual(points.at(-1), chapter.stars.find((star) => star.id === edge[1])!.position);
      assert.ok(points.length > 2);
      assert.ok(
        points.flat().every((value) => Number.isFinite(value) && value >= 0 && value <= 100),
      );
    }
    assert.ok(
      Object.keys(chapter.bends).every((key) =>
        chapter.connections.some((edge) => edge.join(':') === key),
      ),
    );
  }
});

test('every chapter forms a connected story with valid, unique memory references', () => {
  const memoryIds = new Set(memories.map((m) => m.id));
  assert.equal(memoryIds.size, memories.length);
  assert.equal(new Set(constellations.map((c) => c.id)).size, constellations.length);
  for (const chapter of constellations) {
    assert.ok(chapter.stars.length >= 3 && chapter.stars.length <= 5);
    const starIds = new Set(chapter.stars.map((s) => s.id));
    assert.equal(starIds.size, chapter.stars.length);
    for (const star of chapter.stars) {
      assert.ok(memoryIds.has(star.memoryId));
      assert.ok(star.position.every((v) => v >= 15 && v <= 85));
    }
    const reached = new Set([chapter.stars[0]!.id]);
    for (let i = 0; i < chapter.stars.length; i++) {
      for (const [a, b] of chapter.connections) {
        assert.ok(starIds.has(a) && starIds.has(b));
        assert.notEqual(a, b);
        if (reached.has(a) || reached.has(b)) {
          reached.add(a);
          reached.add(b);
        }
      }
    }
    assert.equal(reached.size, starIds.size);
    assert.ok(chapter.closingLine.length > 0);
  }
});

test('connections reveal only after both memories, regardless of visiting order', () => {
  for (const chapter of constellations) {
    for (const edge of chapter.connections) {
      const a = starKey(chapter.id, edge[0]);
      const b = starKey(chapter.id, edge[1]);
      assert.equal(connectionRevealed(chapter, edge, []), false);
      assert.equal(connectionRevealed(chapter, edge, [b]), false);
      assert.equal(connectionRevealed(chapter, edge, [a]), false);
      assert.equal(connectionRevealed(chapter, edge, [b, a]), true);
    }
  }
});

test('saved progress tolerates corrupt data, obsolete IDs and duplicates', () => {
  const valid = starKey(constellations[0]!.id, constellations[0]!.stars[0]!.id);
  for (const raw of [null, '', '{broken', '{}', 'null', '42', '"hello"'])
    assert.deepEqual(parseStarProgress(raw), []);
  assert.deepEqual(parseStarProgress(JSON.stringify([valid, 'old:star', valid, null, 1, {}])), [
    valid,
  ]);
});
