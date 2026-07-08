# Dripkits Backend

Express + SQLite backend for the Dripkits e-commerce site. Handles products, orders, and the admin panel. Payment is **Cash on Delivery (COD)** — customers pay the delivery charge in advance via bKash or Nagad "Send Money" and enter their Transaction ID at checkout. No payment gateway subscription needed.

---

## Setup

```bash
cd backend
npm install
cp .env.example .env     # fill in your values
node seed.js             # seed the product catalog into the DB
npm start                # runs on http://localhost:4000
```

---

## .env values

| Key | Description |
|---|---|
| `PORT` | Port to run the server on (default: 4000) |
| `JWT_SECRET` | A random secret string used to sign admin login tokens |
| `ADMIN_PASSWORD` | Password for the admin panel at /admin |
| `FRONTEND_URL` | Full URL to your website (used for CORS) |

---

## How ordering works

1. Customer picks a delivery area (Inside Dhaka: Tk 80 / Outside Dhaka: Tk 130)
2. Customer sends the **delivery charge only** via **bKash or Nagad "Send Money"** to your personal number shown on the checkout page
3. Customer fills in their delivery info and enters their **Transaction ID** + the **number they paid from**
4. Order is saved to the DB with `paymentStatus: pending`
5. You check your bKash/Nagad app, confirm the Transaction ID matches, then mark the order `confirmed` in the admin panel
6. You ship the order — customer pays the **product price in cash** on delivery

---

## Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | All active products |
| `GET` | `/api/products/:id` | Public | Single product |
| `GET` | `/api/products/admin/all` | Admin | All products including hidden |
| `POST` | `/api/products` | Admin | Create product |
| `PATCH` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `POST` | `/api/orders` | Public | Place an order |
| `GET` | `/api/orders` | Admin | All orders |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status |
| `POST` | `/api/auth/login` | — | Admin login |

---

## Admin panel

Visit `/admin` while the backend is running. Log in with your `ADMIN_PASSWORD` from `.env`.

- **Orders tab** — see every order, the bKash/Nagad Transaction ID the customer entered, and update order status (pending → confirmed → shipped → delivered)
- **Products tab** — add, edit, hide or delete products

---

## File structure

```
backend/
  server.js          ← entry point
  db.js              ← SQLite setup & migrations
  seed.js            ← seed products from products.js into the DB
  routes/
    auth.js          ← admin login
    products.js      ← product CRUD
    orders.js        ← order creation & management
  public/
    admin.html       ← admin panel UI
  .env               ← secrets (never commit this)
```