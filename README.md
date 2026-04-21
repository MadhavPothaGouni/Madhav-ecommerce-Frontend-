# Ecommerce Frontend — React.js

A clean, minimal React.js frontend for the Ecommerce Microservices platform.
Built with React 18, React Router v6, and Axios.

---

# Tech Stack

| Technology      | Purpose                  |
| --------------- | ------------------------ |
| React 18        | UI framework             |
| React Router v6 | Client-side routing      |
| Axios           | HTTP requests to backend |
| Context API     | Global auth state        |
| CSS Variables   | Design system / theming  |
| DM Sans font    | Typography               |

---

# Project Structure

```
ecommerce-frontend/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   ├── index.css
│   ├── App.jsx
│
│   ├── context/
│   │   └── AuthContext.jsx
│
│   ├── hooks/
│   │   └── useToast.js
│
│   ├── services/
│   │   └── api.js
│
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx
│
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Orders.jsx
│       ├── Payments.jsx
│       ├── Profile.jsx
│       └── Admin.jsx
│
├── package.json
└── .env
```

---

# Prerequisites

Before running the frontend:

* Node.js v16+
* npm v8+
* Backend API Gateway running on port 8080

Check versions:

```bash
node --version
npm --version
```

---

# Installation

```bash
cd ecommerce-frontend
npm install
```

---

# Running the App

```bash
npm start
```

Open:
http://localhost:3000

---

# Port Configuration

If port 3000 is busy:

Create `.env` file:

```
PORT=3005
```

---

# Backend Connection

Frontend communicates with:

```
http://localhost:8080
```

Proxy (in package.json):

```json
"proxy": "http://localhost:8080"
```

---

# Request Flow

```
React (3000)
   ↓
API Gateway (8080)
   ↓
Microservices
```

---

# Authentication Flow

1. Login → get JWT
2. Store in localStorage
3. Send with every request
4. Gateway validates
5. Redirect on failure

---

# Features

## User

* Register / Login
* Browse Products
* Add to Cart
* Place Orders
* View Orders
* Payment History

## Admin

* Manage Users
* Manage Orders

---

# API Example

```bash
POST /api/users/auth/login
GET /api/products/public/all
POST /api/orders
```

---

# Build for Production

```bash
npm run build
```

---

# Common Issues

### Backend not running

Check:
http://localhost:8080

### Port conflict

Change `.env` port

### No products

Add via backend API

---

# License

MIT License
