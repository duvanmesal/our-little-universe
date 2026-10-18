import type { Memory } from '../../data/memories';

export default function MemoryFigure({
  item,
  exiting = false,
}: {
  item: Memory;
  exiting?: boolean;
}) {
  return (
    <figure className={`memory-main ${exiting ? 'memory-exit' : ''}`} aria-busy={exiting}>
      <div className="memory-photo">
        <img src={item.image} alt={item.alt} width="1920" height="1080" decoding="async" />
      </div>
      <figcaption>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </figcaption>
    </figure>
  );
}
