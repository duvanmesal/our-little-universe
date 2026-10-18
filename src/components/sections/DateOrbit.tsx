import { useEffect, useRef, useState } from 'react';
import { chooseDateIndex, dateIdeas } from '../../data/dateIdeas';
import { motion } from '../../config/motion';
export default function DateOrbit({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(-1);
  const [spinning, setSpinning] = useState(false);
  const [turns, setTurns] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function choose() {
    if (spinning) return;
    const next = chooseDateIndex(index);
    if (reduced) {
      setIndex(next);
      return;
    }
    setSpinning(true);
    setTurns((value) => value + 1);
    timer.current = setTimeout(() => {
      setIndex(next);
      setSpinning(false);
    }, motion.dateSpin);
  }
  const idea = index < 0 ? null : dateIdeas[index]!;
  return (
    <div className="date-generator">
      <div
        className={`date-roulette ${spinning ? 'spinning' : ''}`}
        style={{ transform: `rotate(${turns * 720}deg)` }}
        aria-hidden="true"
      >
        <span>✧</span>
        <i />
        <i />
      </div>
      <div
        aria-live="polite"
        aria-busy={spinning}
        className="date-result"
        key={spinning ? 'choosing' : index}
      >
        <span className="small-meta">
          {spinning
            ? 'A little serendipity…'
            : idea
              ? `${idea.type} · ${idea.duration}`
              : 'Leave a little room for chance'}
        </span>
        <h3>{spinning ? 'A little possibility…' : (idea?.title ?? 'What should we do today?')}</h3>
        <p>
          {spinning
            ? 'Finding our next little adventure.'
            : (idea?.detail ?? 'No big plans needed. The best part is already decided: together.')}
        </p>
      </div>
      <button className="primary-button" onClick={choose} disabled={spinning}>
        {spinning ? 'Following the orbit…' : idea ? 'Choose another date' : 'Choose our date'}
        <span aria-hidden="true">✧</span>
      </button>
    </div>
  );
}
