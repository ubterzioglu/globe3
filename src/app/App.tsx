import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from './routes';
import './App.css';

export function App() {
  return (
    <>
      <header className="app-header">
        <div className="app-header__brand">
          <Link to={ROUTES.HOME}>CorteQS Globe</Link>
        </div>
        <nav className="app-header__nav">
          <Link to={ROUTES.HOME}>Globe</Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
