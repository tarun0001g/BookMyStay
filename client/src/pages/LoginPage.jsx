// React
import { useState } from 'react';

// External libraries
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await login(values);
      showToast('Welcome back.', { type: 'success' });
      navigate(location.state?.from || params.get('returnTo') || '/', { replace: true });
    } catch (error) {
      setErrors(error.errors || {});
      showToast(error.message, { type: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="wrap page-main auth-main login-main">
      <section className="auth-card" aria-labelledby="login-heading">
        <header className="auth-heading">
          <h1 id="login-heading" tabIndex="-1">
            Welcome back
          </h1>
          <p>Log in to continue your journey with BookMyStay</p>
        </header>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="login-email">Email</label>
          <span className="auth-input-wrap">
            <Mail aria-hidden="true" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </span>
          <FieldError message={errors.email} />
          <label htmlFor="login-password">Password</label>
          <span className="auth-input-wrap">
            <LockKeyhole aria-hidden="true" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </span>
          <FieldError message={errors.password} />
          <button className="primary-button" type="submit" disabled={sending}>
            {sending ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="auth-switch">
          New to BookMyStay? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
