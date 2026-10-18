import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { couple } from '../../config/couple';
import { introSunDiameter } from '../../config/scene';

interface Props {
  reduced: boolean;
  onMotionToggle: () => void;
  failed: boolean;
  stage: RefObject<HTMLDivElement | null>;
  /** The veil starts lifting: the universe should begin opening behind it. */
  onReveal: () => void;
  /** The dedication is gone; `keyboard` tells whether it was finished from the keyboard. */
  onDone: (keyboard: boolean) => void;
}
type State = 'story' | 'opening' | 'leaving';

/** Covers the outgoing words and most of the incoming ones, so quick taps never skip a phrase. */
const STEP_LOCK = 900;
/** The arrival line and its button need a little longer before anything is clickable. */
const ARRIVAL_LOCK = 2200;
/** With reduced motion every change is a 400ms fade, so the lock only needs to cover that. */
const REDUCED_LOCK = 450;
/** Rendered size of the star's disc and glow; at rest they are scaled down. */
const ORB_SIZE = 200;
/** Fraction of the disc's diameter that reads as solid before its edge softens. */
const DISC_EDGE = 0.9;
/** The landing glow spans this many sun diameters, like the scene's own sun glow. */
const GLOW_SPREAD = 2.6;
const FALLBACK_SUN = 44;
const MAX_TAP_TRAVEL = 12;
/** Meteor shower radiant, as a fraction of the sky: just beyond the upper right edge. */
const RADIANT = { x: 0.82, y: -0.15 };
/** Pause between meteors, in ms: a minimum plus a random spread. */
const METEOR_GAP = [2200, 3200] as const;
/** Opening timeline, in ms: the frame widens only once the drawn sun has handed over to the real one. */
const REVEAL_AT = 2000;
const DONE_AT = 4200;

const sky = Array.from({ length: 144 }, (_, i) => {
  const random = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: random(1) * 100,
    y: random(2) * 100,
    size: 0.65 + random(3) * (i % 12 === 0 ? 2 : 0.8),
    glows: i % 12 === 0,
    delay: random(4) * 16,
    duration: 7 + random(5) * 9,
    layer: i % 3,
    tone: i % 7 === 0 ? 'gold' : i % 5 === 0 ? 'lavender' : 'ink',
    brightness: 0.25 + random(6) * 0.5,
  };
});

export default function Journey({
  reduced,
  onMotionToggle,
  failed,
  stage,
  onReveal,
  onDone,
}: Props) {
  const lines = couple.journey;
  const last = lines.length - 1;
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>('story');
  const [flight, setFlight] = useState<CSSProperties>();
  const lockUntil = useRef(0);
  const press = useRef<{ x: number; y: number } | null>(null);
  const keyboard = useRef(false);
  const star = useRef<HTMLSpanElement>(null);
  const discover = useRef<HTMLButtonElement>(null);
  const meteors = useRef<HTMLDivElement>(null);
  const comet = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const story = state === 'story';

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const advance = useCallback(
    (viaKeyboard: boolean) => {
      const now = performance.now();
      if (!story || step >= last || now < lockUntil.current) return;
      keyboard.current = viaKeyboard;
      lockUntil.current =
        now + (reduced ? REDUCED_LOCK : step + 1 === last ? ARRIVAL_LOCK : STEP_LOCK);
      setStep(step + 1);
    },
    [story, step, last, reduced],
  );

  function finish(opening: boolean, viaKeyboard: boolean) {
    if (!story || (opening && performance.now() < lockUntil.current)) return;
    keyboard.current = viaKeyboard;
    const travel = opening && !reduced;
    if (travel) {
      const from = star.current?.getBoundingClientRect();
      const to = stage.current?.getBoundingClientRect();
      if (from && to) {
        const diameter = failed ? FALLBACK_SUN : introSunDiameter(to.height);
        setFlight({
          '--fly-x': `${to.left + to.width / 2 - (from.left + from.width / 2)}px`,
          '--fly-y': `${to.top + to.height / 2 - (from.top + from.height / 2)}px`,
          '--fly-disc': diameter / (ORB_SIZE * DISC_EDGE),
          '--fly-glow': (diameter * GLOW_SPREAD) / ORB_SIZE,
          '--portal-x': `${to.left + to.width / 2}px`,
          '--portal-y': `${to.top + to.height / 2}px`,
        } as CSSProperties);
      }
    }
    setState(travel ? 'opening' : 'leaving');
    timers.current.push(
      setTimeout(onReveal, travel ? REVEAL_AT : 0),
      setTimeout(() => onDone(keyboard.current), travel ? DONE_AT : 600),
    );
  }

  useEffect(() => {
    if (!story) return;
    const key = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const onControl = e.target instanceof Element && e.target.closest('button, a');
      const forward = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key);
      if (forward || ((e.key === 'Enter' || e.key === ' ') && !onControl)) {
        e.preventDefault();
        advance(true);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [story, advance]);

  // A sparse shower: every meteor streams away from the same radiant, at its own pace.
  useEffect(() => {
    const box = meteors.current;
    if (step !== 0 || !story || reduced || !box) return;
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      timer = setTimeout(spawn, METEOR_GAP[0] + Math.random() * METEOR_GAP[1]);
      if (document.hidden) return;
      const { width, height } = box.getBoundingClientRect();
      // Keep clear of the phrase: upper sky most of the time, sometimes the low sky.
      const low = Math.random() < 0.3;
      const x = width * (0.08 + Math.random() * 0.88);
      const y = height * (low ? 0.7 + Math.random() * 0.14 : 0.04 + Math.random() * 0.26);
      const angle = Math.atan2(y - RADIANT.y * height, x - RADIANT.x * width);
      const bright = Math.random() < 0.18;
      const length = (bright ? 220 : 120) + Math.random() * 120;
      // Upper-sky meteors burn out before reaching the phrase; low ones before the hint.
      const floor = height * (low ? 0.88 : 0.34) - y;
      const travel = Math.max(
        90,
        Math.min(220 + Math.random() * 220, floor / Math.max(Math.sin(angle), 0.2)),
      );
      const meteor = document.createElement('span');
      meteor.className = `journey-meteor ${bright ? 'is-bright' : ''}`;
      meteor.innerHTML = '<span class="meteor-tail"></span><span class="meteor-head"></span>';
      Object.assign(meteor.style, { left: `${x - length}px`, top: `${y}px`, width: `${length}px` });
      box.append(meteor);
      const path = (d: number) => `rotate(${angle}rad) translate3d(${d}px, 0, 0)`;
      meteor
        .animate(
          [
            { transform: path(0), opacity: 0 },
            { transform: path(travel * 0.12), opacity: 1, offset: 0.12 },
            { transform: path(travel * 0.7), opacity: 0.9, offset: 0.7 },
            { transform: path(travel), opacity: 0 },
          ],
          {
            duration: (bright ? 1100 : 650) + Math.random() * 350,
            easing: 'cubic-bezier(0.2, 0.6, 0.35, 1)',
          },
        )
        .finished.then(
          () => meteor.remove(),
          () => meteor.remove(),
        );
      meteor.firstElementChild?.animate(
        [
          { transform: 'scaleX(0.15)' },
          { transform: 'scaleX(1)', offset: 0.45 },
          { transform: 'scaleX(0.5)' },
        ],
        { duration: bright ? 1250 : 800, easing: 'ease-out', fill: 'forwards' },
      );
    };
    timer = setTimeout(spawn, 900);
    return () => clearTimeout(timer);
  }, [step, story, reduced]);

  // A comet's tails always point away from its sun: here, the golden star.
  useEffect(() => {
    if (step !== 1 || !story) return;
    let frame = 0;
    let previous = -Infinity;
    const aim = (now: number) => {
      if (!reduced) frame = requestAnimationFrame(aim);
      if (now - previous < 100) return;
      previous = now;
      const s = star.current?.getBoundingClientRect();
      const c = comet.current?.getBoundingClientRect();
      if (!s || !c) return;
      comet.current?.style.setProperty(
        '--comet-angle',
        `${Math.atan2(c.top - s.top, c.left - s.left)}rad`,
      );
    };
    frame = requestAnimationFrame(aim);
    return () => cancelAnimationFrame(frame);
  }, [step, story, reduced]);

  useEffect(() => {
    if (step === last && keyboard.current) discover.current?.focus({ preventScroll: true });
  }, [step, last]);

  return (
    <section
      className={`journey step-${step} is-${state}`}
      style={flight}
      lang="es"
      aria-label="Un pequeño viaje"
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        const p = press.current;
        press.current = null;
        if (e.target instanceof Element && e.target.closest('button')) return;
        // A drag or scroll that ends on the sky is not a tap.
        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MAX_TAP_TRAVEL) return;
        advance(false);
      }}
    >
      <div className="journey-veil" aria-hidden="true">
        <div className="journey-haze" />
        <div className="journey-totality" />
        <div className="journey-phenomena">
          <div ref={meteors} className="journey-meteors" />
          <div ref={comet} className="journey-comet">
            <svg className="comet-tails" viewBox="0 0 400 120">
              <defs>
                <linearGradient id="comet-dust-fill" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#fff1d6" stopOpacity="0.7" />
                  <stop offset="0.25" stopColor="#e9cfa0" stopOpacity="0.32" />
                  <stop offset="0.7" stopColor="#c9a97a" stopOpacity="0.07" />
                  <stop offset="1" stopColor="#c9a97a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="comet-ion-fill" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#e3e8ff" stopOpacity="0.85" />
                  <stop offset="0.45" stopColor="#a9b6f0" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#9aa8e8" stopOpacity="0" />
                </linearGradient>
                <filter id="comet-blur-wide" x="-10%" y="-80%" width="120%" height="260%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                <filter id="comet-blur-thin" x="-10%" y="-80%" width="120%" height="260%">
                  <feGaussianBlur stdDeviation="1.2" />
                </filter>
              </defs>
              {/* The dust tail curves behind the orbit; the ion tail runs straight from the sun. */}
              <path
                className="comet-dust"
                d="M0 60 C 90 56 200 34 400 8 L 400 58 C 240 70 110 66 0 61 Z"
                fill="url(#comet-dust-fill)"
                filter="url(#comet-blur-wide)"
              />
              <path
                className="comet-ion"
                d="M0 59.5 L 400 53 L 400 61 L 0 60.5 Z"
                fill="url(#comet-ion-fill)"
                filter="url(#comet-blur-thin)"
              />
            </svg>
            <span className="comet-coma" />
          </div>
          <div className="journey-eclipse">
            <span className="eclipse-glare" />
            <span className="eclipse-corona">
              <span className="eclipse-streamers" />
            </span>
            <span className="eclipse-sun" />
            <span className="eclipse-chromosphere" />
            <span className="eclipse-moon" />
            <span className="eclipse-diamond" />
          </div>
        </div>
        {[0, 1, 2].map((layer) => (
          <div key={layer} className={`journey-sky layer-${layer}`}>
            {sky
              .filter((s) => s.layer === layer)
              .map((s, i) => (
                <span
                  key={i}
                  className={`journey-dot ${s.glows ? 'can-glow' : ''}`}
                  style={
                    {
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      '--size': `${s.size}px`,
                      '--star-color': `var(--color-${s.tone})`,
                      '--brightness': s.brightness,
                      animationDuration: `${s.duration}s`,
                      animationDelay: `-${s.delay}s`,
                    } as CSSProperties
                  }
                />
              ))}
          </div>
        ))}
      </div>
      <button
        className="text-button journey-motion"
        inert={!story}
        aria-pressed={reduced}
        onClick={onMotionToggle}
      >
        {reduced ? 'Activar animaciones' : 'Reducir movimiento'}
      </button>
      <button
        className="text-button journey-skip"
        inert={!story}
        onClick={(e) => finish(false, e.detail === 0)}
      >
        Saltar introducción <span aria-hidden="true">↗</span>
      </button>
      <div className="journey-center">
        <span ref={star} className="journey-star" aria-hidden="true">
          <span className="journey-ring" />
          <span className="journey-arrival-wave" />
          <span className="journey-glow" />
          <span className="journey-disc" />
          <span className="journey-flare" />
        </span>
        <div className="journey-lines" aria-hidden="true">
          {lines.map((line, i) => (
            <p
              key={line}
              className={`journey-line ${i === step ? 'is-current' : ''} ${i < step ? 'is-past' : ''} ${i === last ? 'is-arrival' : ''}`}
            >
              {line.split(' ').map((word, w) => (
                // The space sits outside the inline block so words keep their natural gap.
                <Fragment key={w}>
                  {w > 0 && ' '}
                  <span className="journey-word" style={{ '--i': w } as CSSProperties}>
                    {word}
                  </span>
                </Fragment>
              ))}
            </p>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {lines[step]}
        </p>
        <button
          ref={discover}
          className="journey-discover"
          inert={step !== last || !story}
          onClick={(e) => finish(true, e.detail === 0)}
        >
          Descubre nuestro universo<span aria-hidden="true">↗</span>
        </button>
      </div>
      <button
        className="journey-continue"
        inert={step === last || !story}
        onClick={(e) => advance(e.detail === 0)}
      >
        Toca para continuar
      </button>
    </section>
  );
}
