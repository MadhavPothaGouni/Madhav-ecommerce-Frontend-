import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi, productApi, paymentApi } from '../services/api';

function StatCard({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function OrderRow({ order, onClick }) {
  const statusColor = {
    PENDING: 'badge-amber', CONFIRMED: 'badge-blue', PAID: 'badge-green',
    SHIPPED: 'badge-blue', DELIVERED: 'badge-green',
    CANCELLED: 'badge-red', PAYMENT_FAILED: 'badge-red',
  };
  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{order.id.slice(0, 8)}</td>
      <td>${Number(order.totalAmount).toFixed(2)}</td>
      <td><span className={`badge ${statusColor[order.status] || 'badge-gray'}`}>{order.status}</span></td>
      <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
    </tr>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [stats, setStats]       = useState({ orders: 0, spent: 0, products: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordRes, prodRes] = await Promise.allSettled([
          orderApi.getMyOrders(0),
          productApi.getAll(0),
        ]);
        const ords = ordRes.status === 'fulfilled' ? ordRes.value.data.content ?? [] : [];
        const totalSpent = ords.filter(o => o.status === 'PAID' || o.status === 'DELIVERED')
          .reduce((s, o) => s + Number(o.totalAmount), 0);
        const prodCount = prodRes.status === 'fulfilled' ? prodRes.value.data.totalElements ?? 0 : 0;
        setOrders(ords.slice(0, 5));
        setStats({ orders: ords.length, spent: totalSpent, products: prodCount });
      } finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>  
          <div className="page-title">Good morning, {user?.firstName} 👋</div>
          <div className="page-subtitle">Here's what's happening with your store</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="My orders"    value={loading ? '—' : stats.orders}  sub="total placed" />
        <StatCard label="Total spent"  value={loading ? '—' : `$${stats.spent.toFixed(2)}`} sub="confirmed orders" color="var(--green)" />
        <StatCard label="Products"     value={loading ? '—' : stats.products} sub="in the catalog" color="var(--amber)" />
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Recent orders</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/orders')}>View all</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><span className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span>No orders yet</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>Browse products</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{orders.map(o => <OrderRow key={o.id} order={o} onClick={() => navigate(`/orders/${o.id}`)} />)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
