import type { PinListItem } from './types';
import { PinStatusBadge } from './PinStatusBadge';
import './MyPinsList.css';

interface MyPinsListProps {
  pins: PinListItem[];
}

export function MyPinsList({ pins }: MyPinsListProps) {
  return (
    <div className="my-pins-list">
      {pins.map((pin) => (
        <div key={pin.id} className="my-pins-list__item">
          <div className="my-pins-list__header">
            <span className="my-pins-list__name">{pin.displayName}</span>
            <PinStatusBadge status={pin.status} />
          </div>
          <div className="my-pins-list__meta">
            {pin.city}, {pin.country}
          </div>
          {pin.status === 'rejected' && pin.rejectionReason && (
            <div className="my-pins-list__reason">
              Reason: {pin.rejectionReason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
