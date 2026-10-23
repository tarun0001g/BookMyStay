// React
import { useState } from 'react';

// External libraries
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// Local files
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FieldError } from '../components/FieldError';

// Authenticates a user and returns them to their requested page.
export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await login(values);
      showToast('Welcome back.');
      navigate(location.state?.from || params.get('returnTo') || '/', { replace: true });
    } catch (error) {
      setErrors(error.errors || {});
      showToast(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="wrap page-main auth-main">
      <h1 tabIndex="-1">Log in</h1>
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <FieldError message={errors.email} />
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <FieldError message={errors.password} />
        <button className="primary-button" type="submit" disabled={sending}>
          {sending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        New to BookMyStay? <Link to="/signup">Create an account</Link>
      </p>
    </main>
  );
}
