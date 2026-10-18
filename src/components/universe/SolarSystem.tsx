import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { couple, formatDate } from '../../config/couple';
import { planets } from '../../data/universe';
import type { Destination, Mode } from '../../types/universe';
import SceneBoundary from './SceneBoundary';
import FallbackUniverse from './FallbackUniverse';
import { motion as motionConfig } from '../../config/motion';
import { useRetainedValue } from '../../hooks/useRetainedValue';
import Constellations from '../constellations/Constellations';
import SolarConstellations from '../constellations/SolarConstellations';
import { useConstellationProgress } from '../../hooks/useConstellationProgress';
import { constellations } from '../../data/constellations';

const UniverseCanvas = lazy(() => import('./UniverseCanvas'));
const SectionContent = lazy(() => import('../sections/SectionContent'));

export default function SolarSystem() {
  const [mode, setMode] = useState<Mode>('intro');
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [phase, setPhase] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [fullMotion, setFullMotion] = useState(false);
  const reduced = systemReduced && !fullMotion;
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [settled, setSettled] = useState(false);
  const [visited, setVisited] = useState<Destination[]>([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const starProgress = useConstellationProgress();
  const displayed = useRetainedValue(selected, motionConfig.contentExit, reduced);
  const displayedMode = useRetainedValue(mode, motionConfig.contentExit, reduced);
  const contentReady = settled && displayed.value === selected && !displayed.exiting;
  const [secret, setSecret] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(false);
  const returnDestination = useRef<Destination | null>(null);
  const secretTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const constellation = useRef(0);
  const notify = useCallback((message: string) => {
    setSecret(message);
    if (secretTimer.current) clearTimeout(secretTimer.current);
    secretTimer.current = setTimeout(() => setSecret(''), 5500);
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setReady(true);
    setSettled(true);
  }, []);
  const onSettled = useCallback(() => setSettled(true), []);
  const onMoonSecret = useCallback(
    () => notify('You found a tiny secret. Even our moons have memories. ☾'),
    [notify],
  );
  useEffect(() => {
    setMounted(true);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 700px)');
    const sync = () => {
      setSystemReduced(motion.matches);
      setMobile(narrow.matches);
      if (motion.matches) setPhase(2);
    };
    sync();
    motion.addEventListener('change', sync);
    narrow.addEventListener('change', sync);
    const a = setTimeout(() => {
      if (!motion.matches) setPhase((current) => (current === 2 ? 2 : 1));
    }, 1900);
    const b = setTimeout(() => setPhase(2), 4300);
    if (new URLSearchParams(location.search).has('fallback')) onError();
    else {
      try {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext('webgl2')) onError();
      } catch {
        onError();
      }
    }
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      if (secretTimer.current) clearTimeout(secretTimer.current);
      motion.removeEventListener('change', sync);
      narrow.removeEventListener('change', sync);
    };
  }, [onError]);
  useEffect(() => {
    if (contentReady && displayed.value) heading.current?.focus({ preventScroll: true });
  }, [contentReady, displayed.value]);
  const back = useCallback(() => {
    restoreFocus.current = true;
    setSelected(null);
    setMode('explore');
    setSettled(false);
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }, [reduced]);
  useEffect(() => {
    if (!restoreFocus.current || mode !== 'explore' || selected) return;
    const frame = requestAnimationFrame(() => {
      const control = returnFocus.current?.isConnected
        ? returnFocus.current
        : (document.getElementById(`nav-${returnDestination.current}`) ??
          document.getElementById('orbit-navigation'));
      control?.focus({ preventScroll: true });
      restoreFocus.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, selected]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (selected || mode === 'ending' || mode === 'constellations'))
        back();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [back, selected, mode]);
  function select(id: Destination) {
    if (selected === id) return;
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    returnDestination.current = id;
    setPhase(2);
    setMode('explore');
    setSelected(id);
    setSettled(failed || reduced);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
  function explore() {
    setPhase(2);
    setMode('explore');
    setSettled(false);
  }
  function ending() {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(null);
    setMode('ending');
    setPhase(2);
    setSettled(false);
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
  function openConstellations(index?: number) {
    returnFocus.current = document.getElementById(
      index === undefined ? 'open-constellations' : `sky-${constellations[index]!.id}`,
    );
    if (index !== undefined) setChapterIndex(index);
    setSelected(null);
    setPhase(2);
    setMode('constellations');
    setSettled(failed || reduced);
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
  const current = planets.find((p) => p.id === displayed.value);
  return (
    <div
      className={`universe-app mode-${mode} ${selected || displayed.value ? 'has-selection' : ''} ${phase < 2 ? 'in-prologue' : ''} ${reduced ? 'reduced-motion' : ''} ${fullMotion ? 'full-motion' : ''} ${paused ? 'motion-paused' : ''} ${!settled ? 'camera-travelling' : ''}`}
    >
      <div className="space-backdrop" aria-hidden="true">
        <div className="nebula nebula-one" />
        <div className="nebula nebula-two" />
        <div className="star-dust" />
        {!reduced && !paused && <div className="shooting-star" />}
      </div>
      <div
        className="scene-stage"
        inert={mode === 'constellations'}
        aria-hidden={mode === 'constellations'}
        aria-label="Interactive solar system. Use the planet navigation for keyboard access."
      >
        {failed ? (
          <FallbackUniverse onSelect={select} />
        ) : (
          mounted && (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <UniverseCanvas
                  selected={selected}
                  mode={mode}
                  reduced={reduced}
                  paused={paused}
                  mobile={mobile}
                  onSelect={select}
                  onReady={onReady}
                  onError={onError}
                  onSettled={onSettled}
                  onSecret={onMoonSecret}
                />
              </Suspense>
            </SceneBoundary>
          )
        )}
      </div>
      <SolarConstellations
        visible={phase === 2 && !selected && (mode === 'intro' || mode === 'explore')}
        selected={chapterIndex}
        visited={starProgress.visited}
        onOpen={openConstellations}
      />
      {!ready && (
        <div className="scene-loader" role="status">
          <span>✧</span>Building our little universe…
        </div>
      )}
      <Constellations
        active={mode === 'constellations' || displayedMode.value === 'constellations'}
        exiting={mode !== 'constellations'}
        chapterIndex={chapterIndex}
        onChapterChange={setChapterIndex}
        progress={starProgress}
        paused={paused}
        settled={settled || failed || reduced}
        reduced={reduced}
        fallback={failed}
        onBack={back}
      />
      {!reduced && (
        <div
          className={`prologue ${phase === 2 ? 'is-finished' : ''}`}
          aria-hidden={phase === 2}
          inert={phase === 2}
        >
          <div key={Math.min(phase, 1)}>
            <span className="birth-star" aria-hidden="true">
              ✧
            </span>
            <p>{couple.intro[Math.min(phase, 1)]}</p>
          </div>
          <button className="text-button" onClick={() => setPhase(2)}>
            Skip introduction <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}
      {phase === 2 && displayedMode.value === 'intro' && (
        <section
          className={`intro-copy ${displayedMode.exiting ? 'cinematic-exit' : ''}`}
          aria-labelledby="universe-title"
          inert={displayedMode.exiting}
        >
          <div className="intro-kicker">
            <span />
            Every possibility led to you
            <span />
          </div>
          <h1 id="universe-title">
            Our little universe
            <span className="title-star" aria-hidden="true">
              ✧
            </span>
          </h1>
          <p>{couple.tagline}</p>
          <button className="primary-button" onClick={explore}>
            Explore our universe<span aria-hidden="true">↗</span>
          </button>
        </section>
      )}
      {displayedMode.value === 'explore' && !selected && !displayed.value && (
        <div className="explore-copy">
          <span className="small-meta">A little closer to us</span>
          <h1>Every world holds a story.</h1>
          <p>Choose a planet. Stay a little while.</p>
        </div>
      )}
      {displayed.value && (
        <section
          className={`planet-content ${contentReady ? 'is-settled' : ''} ${displayed.exiting ? 'cinematic-exit' : ''}`}
          aria-labelledby="section-title"
          aria-busy={!contentReady}
          inert={!contentReady}
        >
          <button className="text-button back-button" onClick={back}>
            <span aria-hidden="true">←</span> Back to universe
          </button>
          <div className="section-heading">
            <span className="small-meta">
              {displayed.value === 'us' ? 'Our brightest beginning' : current?.description}
            </span>
            <h2 ref={heading} tabIndex={-1} id="section-title">
              {displayed.value === 'us' ? 'The center of it all' : current?.name}
              <span aria-hidden="true">.</span>
            </h2>
          </div>
          <div className="section-body" key={displayed.value}>
            <Suspense fallback={<p role="status">Gathering our little moments…</p>}>
              <SectionContent
                key={displayed.value}
                selected={displayed.value}
                reduced={reduced}
                onSecret={() =>
                  notify(
                    'Five wishes, a whole constellation. Look at everything we made possible. ✧',
                  )
                }
              />
            </Suspense>
          </div>
        </section>
      )}
      {displayedMode.value === 'ending' && (
        <section
          className={`ending-copy ${displayedMode.exiting ? 'cinematic-exit' : ''}`}
          inert={displayedMode.exiting}
        >
          <button className="text-button back-button" onClick={back}>
            ← Back to universe
          </button>
          <span className="ending-star" aria-hidden="true">
            ✧
          </span>
          <h1>{couple.ending[0]}</h1>
          <p>{couple.ending[1]}</p>
          <div className="ending-names">{couple.names.join(' × ')}</div>
          <span className="small-meta">Since {formatDate(couple.startDate)}</span>
        </section>
      )}
      <div className="universe-tools">
        {systemReduced && (
          <button
            className="motion-preference"
            onClick={() => {
              setFullMotion((value) => !value);
              setPaused(false);
            }}
            aria-pressed={fullMotion}
            title={
              fullMotion
                ? 'Return to the system preference for reduced motion'
                : 'Your system prefers reduced motion. Enable cinematic animations for this visit.'
            }
          >
            {fullMotion ? 'Reduce motion' : 'Enable animations'}
          </button>
        )}
        <button
          className="tool-button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          disabled={reduced}
          aria-label={paused ? 'Resume orbital motion' : 'Pause orbital motion'}
        >
          <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
          <span className="tool-description">{paused ? 'Motion paused' : 'Slow things down'}</span>
        </button>
        <button
          className="tool-button constellation-button"
          aria-label="Little constellation"
          onClick={() => {
            constellation.current++;
            if (constellation.current === 5) {
              notify('Of all the stars, I would still find you. ✧');
              constellation.current = 0;
            }
          }}
        >
          <span aria-hidden="true">⁘</span>
        </button>
      </div>
      <footer className="universe-footer">
        <div className="footer-top">
          <button
            id="open-constellations"
            className="text-button constellations-entry"
            aria-current={mode === 'constellations' ? 'page' : undefined}
            onClick={mode === 'constellations' ? back : () => openConstellations()}
          >
            <span aria-hidden="true">✧</span>
            {mode === 'constellations' ? 'Return to planets' : 'Constellations'}
          </button>
          <span className="explore-hint">
            <span className="hint-cross" aria-hidden="true">
              ✥
            </span>
            {selected
              ? 'A world of our own'
              : mode === 'intro'
                ? 'Six little worlds. One shared story.'
                : mobile
                  ? 'Tap a planet to explore'
                  : 'Drag to wander · Scroll to drift closer'}
          </span>
          <button className="text-button ending-link" onClick={mode === 'ending' ? back : ending}>
            {mode === 'ending'
              ? 'Return to our worlds'
              : visited.filter((v) => v !== 'us').length === 6
                ? 'Our next chapter'
                : 'Our universe is still expanding'}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        <nav
          id="orbit-navigation"
          className="orbit-navigation"
          aria-label="Orbit navigator"
          tabIndex={-1}
        >
          <span className="navigator-caption">
            <span aria-hidden="true">◎</span> Orbit navigator
          </span>
          <div className="planet-nav-list">
            {planets.map((p) => (
              <button
                id={`nav-${p.id}`}
                key={p.id}
                onClick={() => select(p.id)}
                aria-current={selected === p.id ? 'page' : undefined}
                className={`${selected === p.id ? 'active' : ''} ${visited.includes(p.id) ? 'visited' : ''}`}
              >
                <span
                  className="nav-planet"
                  style={{ '--planet-color': p.color } as React.CSSProperties}
                  aria-hidden="true"
                />
                <span>{p.shortName}</span>
                <span className="visited-dot" aria-hidden="true" />
              </button>
            ))}
          </div>
          <span className="navigator-count">
            {String(visited.filter((v) => v !== 'us').length).padStart(2, '0')}{' '}
            <span>/ 06 explored</span>
          </span>
        </nav>
        <div className="footer-bottom">
          <span>Made of little moments</span>
          <span className="footer-coordinate">
            ∞ possibilities <span aria-hidden="true">·</span> one us
          </span>
          <span>Since {formatDate(couple.startDate)}</span>
        </div>
      </footer>
      <div className={`secret-message ${secret ? 'visible' : ''}`} role="status">
        {secret}
      </div>
    </div>
  );
}
