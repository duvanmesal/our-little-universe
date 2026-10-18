import type { Destination } from '../../types/universe';
import { couple, formatDate } from '../../config/couple';
import Memories from './Memories';
import Story from './Story';
import Songs from './Songs';
import Adventures from './Adventures';
import Dreams from './Dreams';
import DateOrbit from './DateOrbit';

export default function SectionContent({
  selected,
  reduced,
  onSecret,
}: {
  selected: Destination;
  reduced: boolean;
  onSecret: () => void;
}) {
  switch (selected) {
    case 'memories':
      return <Memories reduced={reduced} />;
    case 'story':
      return <Story />;
    case 'songs':
      return <Songs />;
    case 'adventures':
      return <Adventures />;
    case 'dreams':
      return <Dreams onSecret={onSecret} />;
    case 'date':
      return <DateOrbit reduced={reduced} />;
    case 'us':
      return (
        <div className="us-content">
          <span className="small-meta">Two lives, one orbit</span>
          <h3>
            {couple.names[0]}
            <span> & </span>
            {couple.names[1]}
          </h3>
          <p>{couple.dedication}</p>
          <div className="us-date">
            <span className="small-meta">Since</span>
            <p>{formatDate(couple.startDate)}</p>
          </div>
          <span className="us-symbol" aria-hidden="true">
            ∞
          </span>
        </div>
      );
  }
}
