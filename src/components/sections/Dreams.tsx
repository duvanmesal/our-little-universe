import { useEffect, useState } from 'react';
import { dreams } from '../../data/dreams';
const key = 'our-little-universe:dreams:v1';
export default function Dreams({ onSecret }: { onSecret: () => void }) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (Array.isArray(saved))
        setDone(
          saved.filter(
            (id): id is string => typeof id === 'string' && dreams.some((d) => d.id === id),
          ),
        );
    } catch {
      /* Storage is optional. */
    }
  }, []);
  function toggle(id: string) {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Keep this visit functional without storage. */
    }
    if (next.length === dreams.length) onSecret();
  }
  return (
    <div>
      <p className="section-lead">A few things we’d love to turn into memories.</p>
      <ul className="dream-list">
        {dreams.map((d) => (
          <li key={d.id}>
            <button onClick={() => toggle(d.id)} aria-pressed={done.includes(d.id)}>
              <span
                className={`dream-check ${done.includes(d.id) ? 'is-done' : ''}`}
                aria-hidden="true"
              >
                {done.includes(d.id) ? '✦' : '✧'}
              </span>
              <span>{d.text}</span>
              <span className="dream-state">{done.includes(d.id) ? 'A memory' : 'Someday'}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="quiet-note">Touch a star when a dream becomes a memory.</p>
    </div>
  );
}
