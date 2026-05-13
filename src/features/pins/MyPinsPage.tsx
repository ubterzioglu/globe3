import { EmptyState } from '@/components/ui/EmptyState';
import './MyPinsPage.css';

export default function MyPinsPage() {
  return (
    <div className="my-pins-page">
      <div className="my-pins-page__header">
        <h1>My Pins</h1>
      </div>
      <EmptyState message="This section is temporarily unavailable while authentication is disabled." />
    </div>
  );
}
