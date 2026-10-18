import {
  connectionPoints,
  connectionRevealed,
  starKey,
  type ConstellationChapter,
} from '../../data/constellations';

export default function ConstellationDrawing({
  chapter,
  visited,
  preview = false,
  guidesOnly = false,
}: {
  chapter: ConstellationChapter;
  visited: string[];
  preview?: boolean;
  guidesOnly?: boolean;
}) {
  return (
    <svg
      className="celestial-drawing"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: preview ? 15 : 38 }, (_, i) => (
        <circle
          key={`dust-${i}`}
          className="celestial-dust"
          cx={5 + ((i * 37 + chapter.id.length * 7) % 90)}
          cy={6 + ((i * 23) % 86)}
          r={i % 4 === 0 ? 0.22 : 0.12}
        />
      ))}
      {chapter.connections.map((edge) => {
        const points = connectionPoints(chapter, edge);
        const d = `M ${points.map((p) => p.join(' ')).join(' L ')}`;
        const lit = connectionRevealed(chapter, edge, visited);
        return (
          <g key={edge.join('-')}>
            <path d={d} className="celestial-guide" />
            {!guidesOnly && (
              <path
                d={d}
                pathLength="1"
                className={`celestial-thread ${lit ? 'is-connected' : ''} ${preview ? 'is-preview' : ''}`}
              />
            )}
            {points.slice(1, -1).map(([x, y], index) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={preview ? 0.8 : 0.42}
                className={`celestial-joint ${lit ? 'is-lit' : ''}`}
              />
            ))}
          </g>
        );
      })}
      {preview &&
        chapter.stars.map((star) => (
          <g
            key={star.id}
            className={`celestial-beacon ${visited.includes(starKey(chapter.id, star.id)) ? 'is-lit' : ''}`}
          >
            <circle cx={star.position[0]} cy={star.position[1]} r="5" className="beacon-aura" />
            <circle cx={star.position[0]} cy={star.position[1]} r="1.25" />
            <path
              d={`M ${star.position[0] - 3} ${star.position[1]} h 6 M ${star.position[0]} ${star.position[1] - 3} v 6`}
              className="beacon-rays"
            />
          </g>
        ))}
    </svg>
  );
}
