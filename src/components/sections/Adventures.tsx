import { useState } from 'react';
import { adventures } from '../../data/adventures';
export default function Adventures() {
  const [index, setIndex] = useState(0);
  const item = adventures[index]!;
  return (
    <div>
      <div className="destination-orbit" aria-label="Choose a destination">
        <div className="destination-core" aria-hidden="true">
          ✧
        </div>
        {adventures.map((place, i) => (
          <button
            key={place.name}
            className={`destination-point point-${i} ${index === i ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={place.name}
            aria-pressed={index === i}
          >
            <span aria-hidden="true" />
            {place.status === 'Someday' ? 'Someday' : `Memory ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="destination-detail" key={index}>
        <span className="small-meta">{item.status}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    </div>
  );
}
