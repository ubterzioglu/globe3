import { useState } from 'react';
import type { GlobePinItem } from './globeTypes';
import './GlobePin.css';

interface GlobePinProps {
  pin: GlobePinItem;
  x: number;
  y: number;
  visible: boolean;
}

const PIN_TYPE_LABELS: Record<string, string> = {
  person: 'Ki\u015fi',
  business: '\u0130\u015fletme',
  ngo: 'STK',
  creator: '\u0130\u00e7erik \u00dcreticisi',
  event: 'Etkinlik',
};

export function GlobePin({ pin, x, y, visible }: GlobePinProps) {
  const [hovered, setHovered] = useState(false);

  if (!visible) return null;

  return (
    <div
      className="globe-pin"
      style={{ left: x, top: y }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="globe-pin__dot" />
      <div className="globe-pin__glow" />
      {hovered && (
        <div className="globe-pin__tooltip">
          <div className="globe-pin__tooltip-name">{pin.displayName}</div>
          <div className="globe-pin__tooltip-meta">
            <span className="globe-pin__tooltip-type">
              {PIN_TYPE_LABELS[pin.pinType] ?? pin.pinType}
            </span>
            <span className="globe-pin__tooltip-separator">&middot;</span>
            <span>{pin.city}, {pin.country}</span>
          </div>
        </div>
      )}
    </div>
  );
}
