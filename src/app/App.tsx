import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { useSession } from '@/features/auth/useSession';
import { signOut } from '@/features/auth/authApi';
import './App.css';

export function App() {
  const { user } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate(ROUTES.HOME);
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__brand">
          <Link to={ROUTES.HOME}>CorteQS Globe</Link>
        </div>
        <nav className="app-header__nav">
          <Link to={ROUTES.HOME}>Globe</Link>
          {user ? (
            <>
              <Link to={ROUTES.MY_PINS}>My Pins</Link>
              <button className="app-header__logout" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to={ROUTES.LOGIN}>Sign In</Link>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
