import { useApprovedPins } from './useApprovedPins';
import { GlobeScene } from './GlobeScene';
import { useGlobeController } from './useGlobeController';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { EmptyState } from '@/components/ui/EmptyState';
import './GlobePage.css';

export default function GlobePage() {
  const { pins, loading, error, refetch } = useApprovedPins();
  const { targetRotation } = useGlobeController();

  if (loading) {
    return (
      <div className="globe-page__center">
        <Spinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="globe-page__center">
        <ErrorBox message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="globe-page">
      <GlobeScene pins={pins} targetRotation={targetRotation} />
      {pins.length === 0 && (
        <div className="globe-page__empty-overlay">
          <EmptyState message="No pins yet. Be the first to add one!" />
        </div>
      )}
    </div>
  );
}
