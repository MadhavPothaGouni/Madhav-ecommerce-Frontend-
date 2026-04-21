import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/products',  label: 'Products',  icon: '◫' },
  { to: '/orders',    label: 'Orders',    icon: '◳' },
  { to: '/payments',  label: 'Payments',  icon: '◈' },
  { to: '/profile',   label: 'Profile',   icon: '◉' },
];

const ADMIN_NAV = [
  { to: '/admin/users',    label: 'Users',       icon: '◍' },
  { to: '/admin/orders',   label: 'All Orders',  icon: '◈' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
          gap: 8,
        }}>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
              GARUDA SHOP<span style={{ color: 'var(--accent)' }}></span>
            </span>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '4px 6px', fontSize: 12, color: 'var(--text-2)',
          }}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: 10,
              padding: collapsed ? '0.65rem 0' : '0.65rem 1.25rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontSize: '0.875rem', fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.12s',
              textDecoration: 'none',
            })}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              {!collapsed && (
                <div style={{ padding: '0.75rem 1.25rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Admin
                </div>
              )}
              {ADMIN_NAV.map(item => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '0.65rem 0' : '0.65rem 1.25rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  fontSize: '0.875rem', fontWeight: 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-2)',
                  background: isActive ? 'var(--accent-bg)' : 'transparent',
                  borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.12s', textDecoration: 'none',
                })}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User + Logout */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', flexShrink: 0,
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout" style={{
              background: 'none', border: 'none', color: 'var(--text-3)',
              fontSize: 14, cursor: 'pointer', padding: '4px', borderRadius: 6,
              flexShrink: 0,
            }}>⏏</button>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: 1200, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
