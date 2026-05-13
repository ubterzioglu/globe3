import { useState, type FormEvent } from 'react';
import { sendMagicLink } from './authApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    const result = await sendMagicLink(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Check your email</h1>
          <p>We sent a magic link to <strong>{email}</strong>.</p>
          <p className="login-hint">Click the link in the email to sign in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <p className="login-hint">Enter your email to receive a magic link.</p>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ?? undefined}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </form>
    </div>
  );
}
