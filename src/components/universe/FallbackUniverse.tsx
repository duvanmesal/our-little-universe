import { planets } from '../../data/universe';
import type { Destination } from '../../types/universe';
export default function FallbackUniverse({ onSelect }: { onSelect: (id: Destination) => void }) {
  return (
    <div className="fallback-universe">
      <svg viewBox="0 0 1000 550" aria-hidden="true">
        <g transform="translate(500 275) rotate(-12)" fill="none" stroke="currentColor">
          {[90, 135, 180, 225, 270, 315].map((r) => (
            <ellipse key={r} rx={r * 1.4} ry={r * 0.57} />
          ))}
        </g>
        <path
          d="M500 244L507 268L531 275L507 282L500 306L493 282L469 275L493 268Z"
          fill="#e7c493"
          stroke="none"
        />
      </svg>
      <button className="fallback-sun" onClick={() => onSelect('us')}>
        Us <span>✧</span>
      </button>
      {planets.map((p, i) => (
        <button
          key={p.id}
          className={`fallback-planet fallback-${i}`}
          onClick={() => onSelect(p.id)}
        >
          <span style={{ color: p.color }}>✧</span>
          <strong>{p.name}</strong>
          <small>{p.description}</small>
        </button>
      ))}
      <p className="fallback-note">A quieter view of our universe. Every world is still here.</p>
    </div>
  );
}
