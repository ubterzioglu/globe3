import { EmptyState } from '@/components/ui/EmptyState';
import './AdminPinsPage.css';

export default function AdminPinsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Admin — Pins</h1>
      </div>
      <EmptyState message="Admin review is temporarily unavailable while authentication is disabled." />
    </div>
  );
}
