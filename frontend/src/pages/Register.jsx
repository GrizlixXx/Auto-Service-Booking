import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import api from '../api/axios';
import './Auth.css';

const passwordRules = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
const loginRules = /^[a-zA-Z0-9]+$/;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.login || !form.email || !form.phone || !form.password || !form.confirmPassword) return 'All fields are required.';
    if (!loginRules.test(form.login)) return 'Login must contain only letters and numbers.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email address.';
    if (!passwordRules.test(form.password)) return 'Password must be at least 8 characters with uppercase, lowercase and a number.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await api.post('/register', {
        login: form.login,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/signin'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[a-z]/.test(form.password)) s++;
    if (/\d/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  };
  const strength = getStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#eab308', '#10b981', '#06b6d4'];

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container glass-card auth-container--wide">
        <div className="auth-header">
          <div className="auth-header__icon-badge">
            <Car size={28} />
          </div>
          <h1 className="auth-header__title">Create Account</h1>
          <p className="auth-header__sub">Join AutoFix and start booking in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form" noValidate>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="auth-form__row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-login">Username</label>
              <input id="reg-login" name="login" type="text" className="form-input"
                placeholder="johndoe" value={form.login} onChange={handleChange}
                autoComplete="username" disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" name="email" type="email" className="form-input"
                placeholder="john@example.com" value={form.email} onChange={handleChange}
                autoComplete="email" disabled={loading} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone Number</label>
            <input id="reg-phone" name="phone" type="tel" className="form-input"
              placeholder="+1 555 0101" value={form.phone} onChange={handleChange}
              autoComplete="tel" disabled={loading} />
          </div>

          <div className="auth-form__row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="form-input"
                placeholder="Min 8 chars, uppercase & number" value={form.password} onChange={handleChange}
                autoComplete="new-password" disabled={loading} />
              {form.password && (
                <div className="password-strength">
                  <div className="password-strength__bars">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="password-strength__bar"
                        style={{ background: i <= strength ? strengthColors[strength] : 'var(--border-subtle)' }} />
                    ))}
                  </div>
                  <span className="password-strength__label" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" name="confirmPassword" type="password" className="form-input"
                placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange}
                autoComplete="new-password" disabled={loading} />
            </div>
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" style={{width:20,height:20,borderWidth:2}} /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/signin" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
