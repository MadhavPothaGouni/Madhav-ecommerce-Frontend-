import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT to every request
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => API.post('/users/auth/register', data),
  login:    (data) => API.post('/users/auth/login',    data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile:  ()           => API.get('/users/profile'),
  getById:     (id)         => API.get(`/users/${id}`),
  updateUser:  (id, data)   => API.put(`/users/${id}`, data),
  getAllUsers:  (page = 0)   => API.get(`/users/admin/all?page=${page}&size=10`),
  deleteUser:  (id)         => API.delete(`/users/admin/${id}`),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productApi = {
  getAll:      (page = 0)      => API.get(`/products/public/all?page=${page}&size=12`),
  getById:     (id)            => API.get(`/products/${id}`),
  search:      (kw, page = 0)  => API.get(`/products/public/search?keyword=${kw}&page=${page}&size=12`),
  getByCategory:(cat, page = 0)=> API.get(`/products/public/category/${cat}?page=${page}&size=12`),
  getMyProducts:(page = 0)     => API.get(`/products/my-products?page=${page}&size=12`),
  create:      (data)          => API.post('/products', data),
  update:      (id, data)      => API.put(`/products/${id}`, data),
  delete:      (id)            => API.delete(`/products/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create:      (data)      => API.post('/orders', data),
  getMyOrders: (page = 0)  => API.get(`/orders/my-orders?page=${page}&size=10`),
  getById:     (id)        => API.get(`/orders/${id}`),
  cancel:      (id)        => API.patch(`/orders/${id}/cancel`),
  getAllOrders: (page = 0)  => API.get(`/orders/admin/all?page=${page}&size=10`),
  updateStatus:(id, status) => API.patch(`/orders/admin/${id}/status?status=${status}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  getMyPayments:    (page = 0) => API.get(`/payments/my-payments?page=${page}&size=10`),
  getById:          (id)       => API.get(`/payments/${id}`),
  getByOrder:       (orderId)  => API.get(`/payments/order/${orderId}`),
  refund:           (id, data) => API.post(`/payments/${id}/refund`, data),
};

export default API;
