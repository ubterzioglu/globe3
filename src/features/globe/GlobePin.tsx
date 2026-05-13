import type { GlobePinItem } from './globeTypes';
import { formatDate } from '@/lib/format';
import { PIN_TYPE_LABELS } from '@/features/pins/types';
import './GlobePin.css';

interface GlobePinProps {
  pin: GlobePinItem;
  x: number;
  y: number;
  visible: boolean;
  selected: boolean;
  onSelect: (pinId: string) => void;
}

export function GlobePin({ pin, x, y, visible, selected, onSelect }: GlobePinProps) {
  if (!visible) return null;

  return (
    <div
      className="globe-pin"
      style={{ left: x, top: y }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(pin.id);
      }}
    >
      <div className="globe-pin__dot" />
      <div className="globe-pin__glow" />
      {selected && (
        <div className="globe-pin__card" role="dialog" aria-label={pin.displayName}>
          <div className="globe-pin__card-name">{pin.displayName}</div>
          <div className="globe-pin__card-meta">
            <span className="globe-pin__card-type">
              {PIN_TYPE_LABELS[pin.pinType as keyof typeof PIN_TYPE_LABELS] ?? pin.pinType}
            </span>
            <span>{pin.city}, {pin.country}</span>
          </div>
          {pin.description && (
            <div className="globe-pin__card-description">{pin.description}</div>
          )}
          <div className="globe-pin__card-date">{formatDate(pin.createdAt)}</div>
        </div>
      )}
    </div>
  );
}
