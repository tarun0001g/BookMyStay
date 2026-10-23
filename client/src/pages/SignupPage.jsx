// React
import { useState } from 'react';

// External libraries
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

// Local files
import { FieldError } from '../components/FieldError';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Creates a guest account and then sends the user to log in.
export function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.password !== values.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setSending(true);
    setErrors({});
    try {
      await signup(values);
      showToast('Your account is ready. Log in to continue.', { type: 'success' });
      const returnTo = location.state?.from || params.get('returnTo');
      navigate(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
    } catch (error) {
      setErrors(error.errors || {});
      showToast(error.message, { type: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="wrap page-main auth-main signup-main">
      <section className="auth-card" aria-labelledby="signup-heading">
        <header className="auth-heading">
          <h1 id="signup-heading" tabIndex="-1">
            Create your account
          </h1>
          <p>Find a place that feels like yours.</p>
        </header>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-name-row">
            <div className="auth-field">
              <label htmlFor="signup-first-name">First name</label>
              <input
                id="signup-first-name"
                name="firstName"
                autoComplete="given-name"
                required
              />
              <FieldError message={errors.firstName} />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-last-name">Last name</label>
              <input
                id="signup-last-name"
                name="lastName"
                autoComplete="family-name"
                required
              />
              <FieldError message={errors.lastName} />
            </div>
          </div>
          <label htmlFor="signup-email">Email</label>
          <span className="auth-input-wrap">
            <Mail aria-hidden="true" />
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </span>
          <FieldError message={errors.email} />
          <label htmlFor="signup-password">Password</label>
          <span className="auth-input-wrap">
            <LockKeyhole aria-hidden="true" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a password"
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
          <label htmlFor="signup-confirm-password">Confirm password</label>
          <span className="auth-input-wrap">
            <LockKeyhole aria-hidden="true" />
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm your password"
              required
            />
          </span>
          <FieldError message={errors.confirmPassword} />
          <label className="checkbox-label">
            <input name="terms" type="checkbox" value="on" required /> I agree to the
            terms.
          </label>
          <FieldError message={errors.terms} />
          <button className="primary-button" type="submit" disabled={sending}>
            {sending ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
