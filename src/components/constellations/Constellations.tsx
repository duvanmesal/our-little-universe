import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { constellations, starKey } from '../../data/constellations';
import { memories } from '../../data/memories';
import type { useConstellationProgress } from '../../hooks/useConstellationProgress';
import { useRetainedValue } from '../../hooks/useRetainedValue';
import MemoryFigure from '../sections/MemoryFigure';
import SceneBoundary from '../universe/SceneBoundary';
import ConstellationDrawing from './ConstellationDrawing';

const ConstellationScene = lazy(() => import('./ConstellationScene'));

export default function Constellations({
  active,
  settled,
  reduced,
  fallback,
  onBack,
  chapterIndex,
  onChapterChange,
  progress,
  paused,
  exiting,
}: {
  active: boolean;
  settled: boolean;
  reduced: boolean;
  fallback: boolean;
  onBack: () => void;
  chapterIndex: number;
  onChapterChange: (index: number) => void;
  progress: ReturnType<typeof useConstellationProgress>;
  paused: boolean;
  exiting: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [traceVisited, setTraceVisited] = useState<string[]>([]);
  const [sceneFailed, setSceneFailed] = useState(false);
  const onError = useCallback(() => setSceneFailed(true), []);
  useEffect(() => {
    if (!active || exiting) return;
    setSelected(null);
    setTraceVisited([]);
  }, [chapterIndex, active, exiting]);
  const displayed = useRetainedValue(chapterIndex, 240, reduced);
  const chapter = constellations[displayed.value]!;
  const selectedMemory = chapter.stars.find((star) => star.id === selected)?.memoryId ?? null;
  const displayedMemory = useRetainedValue(selectedMemory, 180, reduced);
  const memory = memories.find((item) => item.id === displayedMemory.value);
  const title = useRef<HTMLHeadingElement>(null);
  const wasActive = useRef(false);
  useEffect(() => {
    if (active && !exiting && settled && !wasActive.current) {
      title.current?.focus({ preventScroll: true });
      wasActive.current = true;
    }
    if (!active || exiting) wasActive.current = false;
  }, [active, exiting, settled]);
  if (!active) return null;
  const count = chapter.stars.filter((star) =>
    traceVisited.includes(starKey(chapter.id, star.id)),
  ).length;
  const complete = count === chapter.stars.length;
  function selectStar(id: string) {
    setSelected(id);
    const key = starKey(chapter.id, id);
    setTraceVisited((current) => (current.includes(key) ? current : [...current, key]));
    progress.visit(starKey(chapter.id, id));
  }
  return (
    <section
      className={`constellation-experience tone-${chapter.tone} ${exiting ? 'is-exiting' : ''}`}
      aria-labelledby="constellation-title"
      inert={exiting}
    >
      <button className="text-button constellation-back" onClick={onBack}>
        ← Back to universe
      </button>
      <header className="constellation-heading">
        <h1 id="constellation-title" tabIndex={-1} ref={title}>
          Written in our stars.
        </h1>
        <p>Open a memory. Watch our story take shape.</p>
      </header>
      <nav className="chapter-navigation" aria-label="Constellation chapters">
        {constellations.map((item, index) => {
          const finished = item.stars.every((star) =>
            progress.visited.includes(starKey(item.id, star.id)),
          );
          return (
            <button
              key={item.id}
              aria-current={chapterIndex === index ? 'page' : undefined}
              onClick={() => {
                onChapterChange(index);
                setSelected(null);
              }}
            >
              <span className={`chapter-miniature tone-${item.tone}`}>
                <ConstellationDrawing chapter={item} visited={progress.visited} preview />
              </span>
              {item.title}
              <span className="sr-only">{finished ? ', explored' : ''}</span>
            </button>
          );
        })}
      </nav>
      <div className="trace-controls">
        <span>Each visit is a new sky to trace.</span>
        <button
          className="text-button constellation-replay"
          disabled={!count || displayed.exiting || !settled}
          onClick={() => {
            setTraceVisited([]);
            setSelected(null);
          }}
        >
          ↺ Trace this constellation again
        </button>
      </div>
      <div
        className={`constellation-layout ${settled ? 'is-arrived' : ''} ${displayed.exiting ? 'is-leaving' : ''}`}
        aria-busy={!settled || displayed.exiting}
        inert={!settled || displayed.exiting}
      >
        <div className="constellation-atlas" key={chapter.id}>
          <div
            className={`constellation-map ${complete ? 'is-complete' : ''}`}
            role="group"
            aria-label={`${chapter.title} star map`}
          >
            <div className="constellation-renderer" aria-hidden="true">
              <ConstellationDrawing
                chapter={chapter}
                visited={traceVisited}
                guidesOnly={!fallback && !sceneFailed}
              />
              {!fallback && !sceneFailed && (
                <SceneBoundary onError={onError}>
                  <Suspense fallback={null}>
                    <ConstellationScene
                      chapter={chapter}
                      visited={traceVisited}
                      selected={selected}
                      reduced={reduced}
                      paused={paused}
                      onError={onError}
                    />
                  </Suspense>
                </SceneBoundary>
              )}
            </div>
            {chapter.stars.map((star) => {
              const item = memories.find((m) => m.id === star.memoryId)!;
              const lit = traceVisited.includes(starKey(chapter.id, star.id));
              return (
                <button
                  key={star.id}
                  className={`memory-star ${lit ? 'is-lit' : ''}`}
                  style={{ left: `${star.position[0]}%`, top: `${star.position[1]}%` }}
                  aria-label={`Open ${item.title}${lit ? ', explored' : ''}`}
                  aria-pressed={selected === star.id}
                  aria-controls="constellation-memory"
                  onClick={() => selectStar(star.id)}
                >
                  <span className="star-halo" aria-hidden="true" />
                  <span className="star-core" aria-hidden="true">
                    ✦
                  </span>
                  <span className="star-caption">{item.title}</span>
                </button>
              );
            })}
          </div>
          <span className="atlas-instruction">
            {complete
              ? 'Constellation complete. Replay to connect it again.'
              : 'Click the three bright stars to complete the figure.'}
          </span>
          <div className="chapter-caption">
            <h2>{chapter.title}</h2>
            <span className="constellation-figure-name">{chapter.figure}</span>
            <p>{chapter.description}</p>
          </div>
          <p className="constellation-progress" role="status">
            {count} of {chapter.stars.length} memories illuminated
            {complete ? ' · Constellation revealed' : ''}
          </p>
          <div className="chapter-closing" aria-live="polite">
            {complete && <p key={chapter.id}>{chapter.closingLine}</p>}
          </div>
        </div>
        <div
          className="constellation-memory"
          id="constellation-memory"
          aria-live="polite"
          aria-atomic="true"
        >
          {memory ? (
            <MemoryFigure key={memory.id} item={memory} exiting={displayedMemory.exiting} />
          ) : (
            <div className="memory-invitation">
              <span aria-hidden="true">✧</span>
              <h2>A sky full of little moments.</h2>
              <p>Choose any star to begin. The connections appear as you explore.</p>
            </div>
          )}
        </div>
      </div>
      <div className="constellation-bottom">
        <div
          className="memory-index"
          role="group"
          aria-label="Memories in this constellation"
          inert={displayed.exiting || !settled}
        >
          {chapter.stars.map((star) => (
            <button
              key={star.id}
              onClick={() => selectStar(star.id)}
              aria-pressed={selected === star.id}
            >
              <span aria-hidden="true">
                {traceVisited.includes(starKey(chapter.id, star.id)) ? '✦' : '✧'}
              </span>
              {memories.find((m) => m.id === star.memoryId)!.title}
            </button>
          ))}
        </div>
        <label className="remember-stars">
          <input
            type="checkbox"
            checked={progress.remember && !progress.unavailable}
            disabled={progress.unavailable}
            onChange={(event) => progress.setRemember(event.target.checked)}
          />
          {progress.unavailable ? 'Progress stays for this visit' : 'Remember stars on this device'}
        </label>
      </div>
    </section>
  );
}
