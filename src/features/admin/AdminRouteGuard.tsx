import { type ReactNode } from 'react';
import { useSession } from '@/features/auth/useSession';
import './AdminRouteGuard.css';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, loading } = useSession();

  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.role;

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="admin-guard">
        <h2>Access Denied</h2>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="admin-guard">
        <h2>Forbidden</h2>
        <p>You do not have admin access.</p>
      </div>
    );
  }

  return <>{children}</>;
}
