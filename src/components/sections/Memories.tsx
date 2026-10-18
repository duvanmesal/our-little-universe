import { useState } from 'react';
import { memories } from '../../data/memories';
import MemoryFigure from './MemoryFigure';
import { useRetainedValue } from '../../hooks/useRetainedValue';
import { motion } from '../../config/motion';

export default function Memories({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const displayed = useRetainedValue(index, motion.memoryExit, reduced);
  const item = memories[displayed.value]!;
  return (
    <div className="memory-gallery">
      <MemoryFigure key={displayed.value} item={item} exiting={displayed.exiting} />
      <div className="gallery-controls">
        <span className="small-meta">
          {String(index + 1).padStart(2, '0')} / {String(memories.length).padStart(2, '0')}
        </span>
        <div>
          {memories.map((memory, i) => (
            <button
              key={memory.title}
              className={`gallery-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`View ${memory.title}`}
              aria-pressed={i === index}
            >
              <span />
            </button>
          ))}
        </div>
        <button className="text-button" onClick={() => setIndex((index + 1) % memories.length)}>
          Next memory <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
