import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useToast } from '../hooks/useToast';

const STATUS_BADGE = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', PAYMENT_PROCESSING: 'badge-amber',
  PAID: 'badge-green', SHIPPED: 'badge-blue', DELIVERED: 'badge-green',
  CANCELLED: 'badge-red', PAYMENT_FAILED: 'badge-red', REFUNDED: 'badge-gray',
};

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show, ToastComponent } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderApi.getById(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const r = await orderApi.cancel(id);
      setOrder(r.data);
      show('Order cancelled', 'success');
    } catch { show('Cannot cancel order', 'error'); }
    finally { setCancelling(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner" /></div>;
  if (!order)  return <div className="empty-state">Order not found</div>;

  const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="animate-in">
      {ToastComponent}
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/orders')} style={{ marginBottom: 8 }}>← Back</button>
          <div className="page-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>#{order.id.slice(0, 8)}</div>
          <div style={{ marginTop: 4 }}><span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>{order.status}</span></div>
        </div>
        {cancellable && (
          <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[
          ['Total amount',    `$${Number(order.totalAmount).toFixed(2)}`],
          ['Payment ID',      order.paymentId ? order.paymentId.slice(0, 16) + '…' : '—'],
          ['Shipping to',     order.shippingAddress],
          ['Placed on',       new Date(order.createdAt).toLocaleString()],
        ].map(([label, val]) => (
          <div key={label} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-all' }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.95rem' }}>Items</div>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Subtotal</th></tr></thead>
          <tbody>
            {(order.items ?? []).map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>${Number(item.unitPrice).toFixed(2)}</td>
                <td style={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <span style={{ color: 'var(--text-3)' }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    orderApi.getMyOrders(page).then(r => {
      setOrders(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">My orders</div>
          <div className="page-subtitle">Track and manage your purchases</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>+ Shop now</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <span>No orders yet</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>Browse products</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>#{o.id.slice(0, 8)}</td>
                    <td style={{ color: 'var(--text-2)' }}>{(o.items ?? []).length} item{(o.items ?? []).length !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 600 }}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
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
