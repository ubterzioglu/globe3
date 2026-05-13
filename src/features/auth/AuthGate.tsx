import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './useSession';
import { ROUTES } from '@/app/routes';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
