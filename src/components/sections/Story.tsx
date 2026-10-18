import { timeline } from '../../data/timeline';
import { formatDate } from '../../config/couple';
export default function Story() {
  return (
    <ol className="timeline">
      {timeline.map((item) => (
        <li key={item.title}>
          <span className="timeline-star" aria-hidden="true">
            ✧
          </span>
          <div>
            <span className="small-meta">
              {item.date ? formatDate(item.date) : 'Still unfolding'}
            </span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
