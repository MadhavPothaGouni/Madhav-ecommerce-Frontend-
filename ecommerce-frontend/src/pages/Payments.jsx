import React, { useEffect, useState } from 'react';
import { paymentApi } from '../services/api';
import { useToast } from '../hooks/useToast';

const STATUS_BADGE = {
  PENDING: 'badge-amber', PROCESSING: 'badge-amber',
  SUCCESS: 'badge-green', FAILED: 'badge-red',
  REFUNDED: 'badge-gray', CANCELLED: 'badge-red',
};

export default function Payments() {
  const { show, ToastComponent } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refunding, setRefunding] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    setLoading(true);
    paymentApi.getMyPayments(page).then(r => {
      setPayments(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
    }).finally(() => setLoading(false));
  }, [page]);

  const handleRefund = async (paymentId) => {
    if (!refundReason.trim()) { show('Please enter a reason', 'error'); return; }
    try {
      await paymentApi.refund(paymentId, { reason: refundReason });
      setPayments(ps => ps.map(p => p.paymentId === paymentId ? { ...p, status: 'REFUNDED' } : p));
      setRefunding(null); setRefundReason('');
      show('Refund requested', 'success');
    } catch { show('Refund failed', 'error'); }
  };

  return (
    <div className="animate-in">
      {ToastComponent}
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">View your payment history</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner" /></div>
        ) : payments.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>No payments yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Payment ID</th><th>Order ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.paymentId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{p.paymentId?.slice(0, 10)}…</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{p.orderId?.slice(0, 10)}…</td>
                    <td style={{ fontWeight: 600 }}>${Number(p.amount).toFixed(2)}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{p.paymentMethod}</td>
                    <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      {p.status === 'SUCCESS' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setRefunding(p.paymentId)}>Refund</button>
                      )}
                    </td>
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

      {refunding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card animate-in" style={{ padding: '1.5rem', width: 360 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Request refund</div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea className="form-input" rows={3} placeholder="Product damaged, wrong item, etc."
                value={refundReason} onChange={e => setRefundReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-secondary btn-full" onClick={() => { setRefunding(null); setRefundReason(''); }}>Cancel</button>
              <button className="btn btn-danger btn-full" onClick={() => handleRefund(refunding)}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
