import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', role: 'ROLE_USER' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.register(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="animate-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
            shop<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 4 }}>Create your account</div>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input className="form-input" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input className="form-input" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input className="form-input" placeholder="+91-9876543210" value={form.phoneNumber} onChange={set('phoneNumber')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Account type</label>
              <select className="form-input" value={form.role} onChange={set('role')}>
                <option value="ROLE_USER">Customer</option>
                <option value="ROLE_SELLER">Seller</option>
              </select>
            </div>

            {error && (
              <div style={{ fontSize: '0.82rem', color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem' }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} />Creating account…</> : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
