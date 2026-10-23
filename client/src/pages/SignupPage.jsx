// React
import { useState } from 'react';

// External libraries
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setErrors({});
    try {
      await signup(Object.fromEntries(new FormData(event.currentTarget)));
      showToast('Your account is ready. Log in to continue.');
      const returnTo = location.state?.from || params.get('returnTo');
      navigate(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
    } catch (error) {
      setErrors(error.errors || {});
      showToast(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="wrap page-main auth-main">
      <h1 tabIndex="-1">Create your account</h1>
      <form className="auth-form" onSubmit={submit}>
        <label>
          First name
          <input name="firstName" autoComplete="given-name" required />
        </label>
        <FieldError message={errors.firstName} />
        <label>
          Last name
          <input name="lastName" autoComplete="family-name" required />
        </label>
        <FieldError message={errors.lastName} />
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <FieldError message={errors.email} />
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" required />
        </label>
        <FieldError message={errors.password} />
        <label>
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </label>
        <FieldError message={errors.confirmPassword} />
        <label className="checkbox-label">
          <input name="terms" type="checkbox" value="on" required /> I agree to the terms.
        </label>
        <FieldError message={errors.terms} />
        <button className="primary-button" type="submit" disabled={sending}>
          {sending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
