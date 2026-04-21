import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function Profile() {
  const { user, login } = useAuth();
  const { show, ToastComponent } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ firstName: '', lastName: '', phoneNumber: '' });

  useEffect(() => {
    userApi.getProfile().then(r => {
      setProfile(r.data);
      setForm({ firstName: r.data.firstName, lastName: r.data.lastName, phoneNumber: r.data.phoneNumber });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await userApi.updateUser(profile.id, { ...form, email: profile.email });
      setProfile(r.data);
      login({ accessToken: localStorage.getItem('token'), user: r.data });
      show('Profile updated', 'success');
    } catch { show('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const initials = profile ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() : '?';

  return (
    <div className="animate-in" style={{ maxWidth: 560 }}>
      {ToastComponent}
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Manage your account details</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner" /></div>
      ) : (
        <>
          {/* Avatar card */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--accent-bg)', border: '2px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)',
            }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{profile?.firstName} {profile?.lastName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{profile?.email}</div>
              <div style={{ marginTop: 6 }}>
                <span className={`badge ${profile?.role === 'ROLE_ADMIN' ? 'badge-blue' : profile?.role === 'ROLE_SELLER' ? 'badge-amber' : 'badge-gray'}`}>
                  {profile?.role?.replace('ROLE_', '')}
                </span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Edit details</div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={profile?.email} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input className="form-input" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} />Saving…</> : 'Save changes'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
