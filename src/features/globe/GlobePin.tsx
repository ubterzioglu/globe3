import type { GlobePinItem } from './globeTypes';
import { formatDate } from '@/lib/format';
import { PIN_TYPE_LABELS } from '@/features/pins/types';
import './GlobePin.css';

interface GlobePinProps {
  pin: GlobePinItem;
  x: number;
  y: number;
  visible: boolean;
  opacity: number;
  interactive: boolean;
  selected: boolean;
  onSelect: (pinId: string) => void;
}

const PIN_EMOJIS: Record<string, string> = {
  person: '🧑',
  business: '🏪',
  ngo: '🤝',
  creator: '🎥',
  event: '📍',
};

export function GlobePin({ pin, x, y, visible, opacity, interactive, selected, onSelect }: GlobePinProps) {
  if (!visible) return null;

  return (
    <div
      className={`globe-pin globe-pin--type-${pin.pinType} ${selected ? 'globe-pin--selected' : ''} ${pin.pinType === 'event' ? 'globe-pin--event' : ''}`}
      style={{ left: x, top: y, opacity, pointerEvents: interactive ? 'auto' : 'none' }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(pin.id);
      }}
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label={`${pin.displayName}, ${pin.city}, ${pin.country}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(pin.id);
        }
      }}
    >
      <div className="globe-pin__pulse globe-pin__pulse--primary" />
      {pin.pinType === 'event' && <div className="globe-pin__pulse globe-pin__pulse--secondary" />}
      <div className="globe-pin__glow" />
      <div className="globe-pin__emoji" aria-hidden="true">
        {PIN_EMOJIS[pin.pinType] ?? '📍'}
      </div>
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
