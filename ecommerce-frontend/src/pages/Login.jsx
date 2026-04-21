import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.login(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="animate-in" style={{ width: '100%', maxWidth: 380 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-1)' }}>
            shop<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 4 }}>
            Sign in to your account
          </div>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            {error && (
              <div style={{ fontSize: '0.82rem', color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem' }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} />Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-3)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
