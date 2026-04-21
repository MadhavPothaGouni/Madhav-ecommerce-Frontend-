# Ecommerce Frontend — React.js

A clean, minimal React.js frontend for the Ecommerce Microservices platform.
Built with React 18, React Router v6, and Axios.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests to backend |
| Context API | Global auth state |
| CSS Variables | Design system / theming |
| DM Sans font | Typography |

---

## Project Structure

```
ecommerce-frontend/
├── public/
│   └── index.html                  ← HTML entry point
├── src/
│   ├── index.js                    ← React app entry point
│   ├── index.css                   ← Global design system (fonts, variables, utilities)
│   ├── App.jsx                     ← Root component with all routes and route guards
│   │
│   ├── context/
│   │   └── AuthContext.jsx         ← Global auth state (user, login, logout)
│   │
│   ├── hooks/
│   │   └── useToast.js             ← Toast notification hook
│   │
│   ├── services/
│   │   └── api.js                  ← All Axios API calls (authApi, userApi, productApi, orderApi, paymentApi)
│   │
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx          ← Sidebar + main content layout
│   │
│   └── pages/
│       ├── Login.jsx               ← Sign in page
│       ├── Register.jsx            ← Create account page
│       ├── Dashboard.jsx           ← Home with stats and recent orders
│       ├── Products.jsx            ← Product listing, search, cart, checkout
│       ├── Orders.jsx              ← My orders list + order detail
│       ├── Payments.jsx            ← Payment history + refund
│       ├── Profile.jsx             ← View and edit profile
│       └── Admin.jsx               ← Admin: manage users and all orders
│
├── package.json                    ← Dependencies + proxy config
└── .env                            ← (optional) PORT override
```

---

## Prerequisites

Before running the frontend, make sure the following are running:

- **Node.js** v16 or above — download from https://nodejs.org
- **npm** v8 or above (comes with Node.js)
- **Backend API Gateway** running on port `8080` (via Docker or IntelliJ)

Check your versions:
```bash
node --version
npm --version
```

---

## Installation

```bash
# Step 1 — Navigate to the frontend folder
cd ecommerce-frontend

# Step 2 — Install all dependencies (only needed once)
npm install
```

---

## Running the App

```bash
npm start
```

This starts the development server.
Open your browser at: **http://localhost:3000**

> If port 3000 is already taken (e.g. by Grafana running in Docker),
> React will ask to use another port. Press **Y** to accept,
> or set a fixed port using a `.env` file (see below).

---

## Port Configuration

If Grafana or another service is using port 3000, create a `.env` file
in the root of the frontend folder:

```
PORT=3005
```

Now `npm start` will always use port 3005.

---

## How Frontend Connects to Backend

The frontend does NOT talk directly to individual microservices.
All requests go through the **API Gateway on port 8080**.

This works via the proxy setting in `package.json`:

```json
"proxy": "http://localhost:8080"
```

**Request flow:**

```
React (port 3000)
    │
    │  axios.get('/api/products/public/all')
    │
    ▼
React Dev Server proxy
    │
    │  forwards to http://localhost:8080/api/products/public/all
    │
    ▼
API Gateway (port 8080)
    │
    │  validates JWT, routes to correct service
    │
    ▼
product-service (port 8082)  ←→  MySQL
```

---

## Backend Startup Order

Start your backend services in this order before using the frontend:

```
1. config-server     → port 8888
2. eureka-server     → port 8761
3. user-service      → port 8081
4. product-service   → port 8082
5. order-service     → port 8083
6. payment-service   → port 8084
7. notification-service → port 8085
8. api-gateway       → port 8080  ← start this LAST
```

If running via Docker:
```bash
docker-compose up -d
```

Verify gateway is up before opening the frontend:
```
http://localhost:8080/actuator/health
```
Expected: `{"status":"UP"}`

---

## Pages Overview

### Public Pages (no login required)
| Page | URL | Description |
|---|---|---|
| Login | `/login` | Sign in with email and password |
| Register | `/register` | Create a new account |

### Authenticated Pages
| Page | URL | Description |
|---|---|---|
| Dashboard | `/dashboard` | Stats overview and recent orders |
| Products | `/products` | Browse, search, filter, add to cart, checkout |
| Orders | `/orders` | Your order history |
| Order Detail | `/orders/:id` | View a specific order and cancel if needed |
| Payments | `/payments` | Payment history and refund requests |
| Profile | `/profile` | View and edit your account details |

### Admin Pages (ROLE_ADMIN only)
| Page | URL | Description |
|---|---|---|
| All Users | `/admin/users` | View and delete any user |
| All Orders | `/admin/orders` | View all orders and update their status |

---

## Authentication Flow

1. Register or login → backend returns a JWT token
2. Token is saved in `localStorage`
3. Every API request automatically includes `Authorization: Bearer <token>`
   via an Axios request interceptor in `src/services/api.js`
4. On 401 response → token is cleared and you are redirected to `/login`
5. Token expires after 24 hours (configurable in backend)

---

## Route Guards

```
/login, /register  → redirects to /dashboard if already logged in
/dashboard, etc    → redirects to /login if not authenticated
/admin/*           → redirects to /dashboard if not ROLE_ADMIN
```

---

## How to Place an Order (User Flow)

```
1. Register or Login
2. Go to Products page
3. Click "Add to cart" on any product
4. Click the Cart button (top right)
5. Review cart items and quantities
6. Click "Place order"
7. Enter your shipping address and click Confirm
8. You are redirected to Orders page
9. Your new order appears with status PAID or PAYMENT_FAILED
```

---

## How to Add Products (via Postman — no seller UI yet)

Products must be added via Postman or API since there is no seller dashboard UI yet.

```
POST http://localhost:8080/api/products
Authorization: Bearer <your token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Apple flagship smartphone",
  "price": 999.99,
  "stockQuantity": 50,
  "category": "Electronics",
  "sku": "APPL-IP15P"
}
```

Valid categories: `Electronics`, `Clothing`, `Books`, `Home`, `Sports`, `Beauty`

---

## Common Issues and Fixes

### "No products found" on Products page
The database is empty. Add products via Postman first (see above).

### "An unexpected error occurred" when placing order
Check order-service logs:
```bash
docker logs order-service --tail=50
```

### Proxy error: ECONNRESET
The API Gateway is not running or not reachable.
- Check: `http://localhost:8080/actuator/health`
- Make sure gateway container is running: `docker ps | grep api-gateway`

### Port 3000 already in use
Grafana (in Docker) uses port 3000. Either:
- Stop Grafana: `docker stop grafana`
- Or set a different port in `.env`: `PORT=3005`

### 403 Forbidden on profile or other pages
The downstream service (user-service etc.) is blocking the request.
Make sure `SecurityConfig.java` in user-service allows `/api/users/**`.

### Token expired / redirected to login
JWT tokens expire after 24 hours. Simply log in again to get a new token.

---

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.
You can serve it with any static file server or Nginx.

Example with Nginx:
```nginx
server {
    listen 80;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
    }
}
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the React dev server |
| `REACT_APP_API_URL` | (uses proxy) | Not needed in dev — proxy handles it |

---

## Design System

The app uses a custom CSS variable-based design system defined in `src/index.css`.

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#f7f6f3` | Page background |
| `--surface` | `#ffffff` | Card backgrounds |
| `--accent` | `#2563eb` | Primary buttons, links |
| `--text-1` | `#1a1916` | Primary text |
| `--text-2` | `#5c5a54` | Secondary text |
| `--text-3` | `#9b9890` | Muted/hint text |
| `--green` | `#16a34a` | Success states |
| `--red` | `#dc2626` | Error/danger states |
| `--amber` | `#d97706` | Warning states |
| `--font-sans` | DM Sans | Body font |
| `--font-mono` | DM Mono | Code/IDs |

---

## API Services Reference

All API functions are in `src/services/api.js`:

```js
// Auth
authApi.register(data)
authApi.login(data)

// Users
userApi.getProfile()
userApi.getById(id)
userApi.updateUser(id, data)
userApi.getAllUsers(page)      // admin only
userApi.deleteUser(id)        // admin only

// Products
productApi.getAll(page)
productApi.getById(id)
productApi.search(keyword, page)
productApi.getByCategory(category, page)
productApi.getMyProducts(page)
productApi.create(data)
productApi.update(id, data)
productApi.delete(id)

// Orders
orderApi.create(data)
orderApi.getMyOrders(page)
orderApi.getById(id)
orderApi.cancel(id)
orderApi.getAllOrders(page)         // admin only
orderApi.updateStatus(id, status)  // admin only

// Payments
paymentApi.getMyPayments(page)
paymentApi.getById(id)
paymentApi.getByOrder(orderId)
paymentApi.refund(id, data)
```

---

## License

MIT — free to use and modify.
#   M a d h a v - e c o m m e r c e - F r o n t e n d -  
 