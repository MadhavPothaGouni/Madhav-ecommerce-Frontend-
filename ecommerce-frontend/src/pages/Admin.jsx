import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, orderApi } from '../services/api';
import { useToast } from '../hooks/useToast';

export function AdminUsers() {
  const { show, ToastComponent } = useToast();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = () => {
    setLoading(true);
    userApi.getAllUsers(page).then(r => {
      setUsers(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await userApi.deleteUser(id); show('User deleted', 'success'); load(); }
    catch { show('Delete failed', 'error'); }
  };

  return (
    <div className="animate-in">
      {ToastComponent}
      <div className="page-header">
        <div>
          <div className="page-title">All users</div>
          <div className="page-subtitle">Admin — manage user accounts</div>
        </div>
      </div>
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{u.phoneNumber}</td>
                    <td><span className="badge badge-blue">{u.role?.replace('ROLE_', '')}</span></td>
                    <td><span className={`badge ${u.enabled ? 'badge-green' : 'badge-red'}`}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-3)' }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

const STATUS_BADGE = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', PAID: 'badge-green',
  SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red', PAYMENT_FAILED: 'badge-red',
};

const STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function AdminOrders() {
  const navigate = useNavigate();
  const { show, ToastComponent } = useToast();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setLoading(true);
    orderApi.getAllOrders(page).then(r => {
      setOrders(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
    }).finally(() => setLoading(false));
  }, [page]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const r = await orderApi.updateStatus(orderId, status);
      setOrders(os => os.map(o => o.id === orderId ? r.data : o));
      show('Status updated', 'success');
    } catch { show('Update failed', 'error'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="animate-in">
      {ToastComponent}
      <div className="page-header">
        <div>
          <div className="page-title">All orders</div>
          <div className="page-subtitle">Admin — manage all customer orders</div>
        </div>
      </div>
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>User ID</th><th>Total</th><th>Status</th><th>Date</th><th>Update status</th><th></th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>#{o.id.slice(0, 8)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)' }}>{o.userId?.slice(0, 8)}</td>
                    <td style={{ fontWeight: 600 }}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select className="form-input" style={{ width: 140, padding: '4px 8px', fontSize: '0.8rem' }}
                        defaultValue="" disabled={updating === o.id}
                        onChange={e => e.target.value && handleStatusChange(o.id, e.target.value)}>
                        <option value="">Change…</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/orders/${o.id}`)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-3)' }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
