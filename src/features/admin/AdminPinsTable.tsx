import type { AdminPinItem } from './adminApi';
import { PinStatusBadge } from '@/features/pins/PinStatusBadge';
import './AdminPinsTable.css';

interface AdminPinsTableProps {
  items: AdminPinItem[];
  onReview: (pin: AdminPinItem) => void;
}

export function AdminPinsTable({ items, onReview }: AdminPinsTableProps) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>City</th>
            <th>Country</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((pin) => (
            <tr key={pin.id}>
              <td>{pin.displayName}</td>
              <td>{pin.pinType}</td>
              <td>{pin.city}</td>
              <td>{pin.country}</td>
              <td><PinStatusBadge status={pin.status} /></td>
              <td>{new Date(pin.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="admin-table__review-btn" onClick={() => onReview(pin)}>
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
