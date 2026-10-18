import { constellations, starKey } from '../../data/constellations';
import ConstellationDrawing from './ConstellationDrawing';

export default function SolarConstellations({
  visible,
  selected,
  visited,
  onOpen,
}: {
  visible: boolean;
  selected: number;
  visited: string[];
  onOpen: (index: number) => void;
}) {
  return (
    <nav
      className={`solar-constellations ${visible ? 'is-visible' : ''}`}
      aria-label="Constellations in our sky"
      aria-hidden={!visible}
      inert={!visible}
    >
      {constellations.map((chapter, index) => (
        <button
          id={`sky-${chapter.id}`}
          key={chapter.id}
          className={`sky-constellation sky-${index} tone-${chapter.tone} ${!visible && selected === index ? 'is-departing' : ''}`}
          onClick={() => onOpen(index)}
          aria-label={`Explore ${chapter.title} constellation`}
        >
          <span className="sky-figure">
            <ConstellationDrawing chapter={chapter} visited={visited} preview />
          </span>
          <span className="sky-title">
            {chapter.title}
            <span aria-hidden="true">↗</span>
          </span>
          <span className="sky-progress">
            {chapter.stars.filter((star) => visited.includes(starKey(chapter.id, star.id))).length}{' '}
            / {chapter.stars.length} memories
          </span>
        </button>
      ))}
    </nav>
  );
}
