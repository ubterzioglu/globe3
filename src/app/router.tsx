import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';
import { App } from './App';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const MyPinsPage = lazy(() => import('@/features/pins/MyPinsPage'));
const AdminPinsPage = lazy(() => import('@/features/admin/AdminPinsPage'));
const GlobePage = lazy(() => import('@/features/globe/GlobePage'));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading…</div>}>
        <Routes>
          <Route path={ROUTES.HOME} element={<App />}>
            <Route index element={<GlobePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.MY_PINS} element={<MyPinsPage />} />
            <Route path={ROUTES.ADMIN_PINS} element={<AdminPinsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
