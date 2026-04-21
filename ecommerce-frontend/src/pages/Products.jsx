import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, orderApi } from '../services/api';
import { useToast } from '../hooks/useToast';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ height: 140, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
        🛍️
      </div>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="badge badge-gray" style={{ alignSelf: 'flex-start' }}>{product.category}</span>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-1)', lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', flex: 1, lineHeight: 1.5 }}>
          {product.description?.slice(0, 60)}{product.description?.length > 60 ? '…' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)' }}>
            ${Number(product.price).toFixed(2)}
          </span>
          <span style={{ fontSize: '0.75rem', color: product.stockQuantity > 0 ? 'var(--green)' : 'var(--red)' }}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>
        <button className="btn btn-primary btn-full" disabled={product.stockQuantity === 0}
          onClick={() => onAddToCart(product)}
          style={{ marginTop: 4, fontSize: '0.82rem', padding: '0.45rem' }}>
          Add to cart
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onRemove, onQtyChange, onClose, onCheckout, checkingOut }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
      <div className="animate-in" style={{
        position: 'relative', width: 360, background: 'var(--surface)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Cart ({cart.length})</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text-3)', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.length === 0 ? (
            <div className="empty-state"><span>Your cart is empty</span></div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0.75rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>${Number(item.price).toFixed(2)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => onQtyChange(item.id, item.qty - 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}>−</button>
                <span style={{ fontSize: '0.85rem', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => onQtyChange(item.id, item.qty + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}>+</button>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-full btn-lg" disabled={cart.length === 0 || checkingOut} onClick={onCheckout}>
            {checkingOut ? <><span className="spinner" style={{ width: 16, height: 16 }} />Placing order…</> : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const { show, ToastComponent } = useToast();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [keyword, setKeyword]       = useState('');
  const [category, setCategory]     = useState('All');
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cart, setCart]             = useState([]);
  const [cartOpen, setCartOpen]     = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress]       = useState('');
  const [showAddr, setShowAddr]     = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) res = await productApi.search(keyword.trim(), page);
      else if (category !== 'All') res = await productApi.getByCategory(category, page);
      else res = await productApi.getAll(page);
      setProducts(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
    } finally { setLoading(false); }
  }, [keyword, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addToCart = (product) => {
    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    show('Added to cart', 'success');
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
  const changeQty = (id, qty) => {
    if (qty <= 0) removeFromCart(id);
    else setCart(c => c.map(i => i.id === id ? { ...i, qty } : i));
  };

  const handleCheckout = async () => {
    if (!address.trim()) { setShowAddr(true); return; }
    setCheckingOut(true);
    try {
      await orderApi.create({
        items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
        shippingAddress: address,
      });
      setCart([]); setCartOpen(false); setAddress(''); setShowAddr(false);
      show('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      show(err.response?.data?.error || 'Order failed', 'error');
    } finally { setCheckingOut(false); }
  };

  return (
    <div className="animate-in">
      {ToastComponent}

      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Browse and add items to your cart</div>
        </div>
        <button className="btn btn-secondary" onClick={() => setCartOpen(true)} style={{ position: 'relative' }}>
          🛒 Cart
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: '#fff', borderRadius: '99px', fontSize: '0.65rem', minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: 1, minWidth: 200 }} placeholder="Search products…"
          value={keyword} onChange={e => { setKeyword(e.target.value); setPage(0); }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(0); }}
              className="btn btn-sm"
              style={{ background: category === cat ? 'var(--accent)' : 'var(--surface)', color: category === cat ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state card" style={{ padding: '3rem' }}>No products found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-3)' }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Shipping address prompt */}
      {showAddr && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card animate-in" style={{ padding: '1.5rem', width: 360 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Shipping address</div>
            <textarea className="form-input" rows={3} placeholder="123 Main St, City, State 110001"
              value={address} onChange={e => setAddress(e.target.value)} style={{ resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-secondary btn-full" onClick={() => setShowAddr(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={handleCheckout} disabled={!address.trim() || checkingOut}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <CartDrawer cart={cart} onRemove={removeFromCart} onQtyChange={changeQty}
          onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setShowAddr(true); }}
          checkingOut={checkingOut} />
      )}
    </div>
  );
}
