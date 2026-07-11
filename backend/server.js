require('dotenv').config();

// Railway's network can't reach IPv6 addresses, but Node sometimes resolves
// external hosts (like Gmail's SMTP server) to IPv6 first, causing
// "connect ENETUNREACH" errors. This forces IPv4 to be tried first for
// all outbound connections app-wide.
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const rateLimit = require('express-rate-limit');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const customersRouter = require('./routes/customers');
const cartRouter = require('./routes/cart');
const db = require('./db');

const app = express();

function getOriginOnly(url) {
    try { const p = new URL(url); return `${p.protocol}//${p.host}`; }
    catch { return url; }
}
const allowedOrigin = process.env.FRONTEND_URL ? getOriginOnly(process.env.FRONTEND_URL) : '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.get(['/admin', '/admin/'], (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ── Image upload ──────────────────────────────────────────────────────────────
// Uploaded images must live on the persistent Railway volume (same one the
// database uses), not inside the app's code folder — otherwise every
// redeploy wipes them out even though the database still remembers their
// filenames. Set UPLOAD_DIR=/data/uploads in Railway's Variables tab to
// match the mounted volume; falls back to a local folder for local dev.
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded product images publicly from that same persistent folder
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `img_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
        cb(ok ? null : new Error('Only image files allowed'), ok);
    }
});

const { requireAdmin } = require('./middleware/auth');

app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
});

// ── Stats / Sales report ─────────────────────────────────────────────────────
app.get('/api/stats', requireAdmin, (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    const todayOrders = db.prepare(`SELECT COUNT(*) c FROM orders WHERE date(createdAt)=?`).get(today).c;
    const todayRevenue = db.prepare(`SELECT COALESCE(SUM(itemsTotal),0) s FROM orders WHERE date(createdAt)=? AND orderStatus != 'cancelled'`).get(today).s;
    const pendingOrders = db.prepare(`SELECT COUNT(*) c FROM orders WHERE orderStatus='pending'`).get().c;
    const totalOrders = db.prepare(`SELECT COUNT(*) c FROM orders`).get().c;
    const totalRevenue = db.prepare(`SELECT COALESCE(SUM(itemsTotal),0) s FROM orders WHERE orderStatus != 'cancelled'`).get().s;
    const unverified = db.prepare(`SELECT COUNT(*) c FROM orders WHERE paymentStatus='pending' AND orderStatus != 'cancelled'`).get().c;

    // Weekly — last 7 days
    const weekRows = db.prepare(`
        SELECT date(createdAt) d, COUNT(*) orders, COALESCE(SUM(itemsTotal),0) revenue
        FROM orders WHERE date(createdAt) >= date('now','-6 days') AND orderStatus != 'cancelled'
        GROUP BY date(createdAt) ORDER BY d
    `).all();

    // Monthly — last 30 days grouped by week
    const monthRevenue = db.prepare(`
        SELECT COALESCE(SUM(itemsTotal),0) s FROM orders
        WHERE date(createdAt) >= date('now','-29 days') AND orderStatus != 'cancelled'
    `).get().s;
    const monthOrders = db.prepare(`
        SELECT COUNT(*) c FROM orders WHERE date(createdAt) >= date('now','-29 days')
    `).get().c;

    // Top products (by qty sold)
    const allOrders = db.prepare(`SELECT itemsJson FROM orders WHERE orderStatus != 'cancelled'`).all();
    const productSales = {};
    for (const row of allOrders) {
        try {
            const items = JSON.parse(row.itemsJson);
            for (const item of items) {
                const key = item.name;
                if (!productSales[key]) productSales[key] = { name: key, qty: 0, revenue: 0 };
                productSales[key].qty += item.qty;
                productSales[key].revenue += item.price * item.qty;
            }
        } catch { }
    }
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    res.json({
        today: { orders: todayOrders, revenue: todayRevenue },
        pending: pendingOrders,
        unverified,
        total: { orders: totalOrders, revenue: totalRevenue },
        month: { orders: monthOrders, revenue: monthRevenue },
        weekChart: weekRows,
        topProducts
    });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/cart', cartRouter);

// Limit brute-force attempts against the admin login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                  // 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRouter);

// Same brute-force protection for customer signup/login
const customerAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,                  // a bit more generous than admin — real customers share networks/routers
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' }
});
app.use('/api/customers/signup', customerAuthLimiter);
app.use('/api/customers/login', customerAuthLimiter);
app.use('/api/customers', customersRouter);

app.get('/', (req, res) => res.send('Dripkits backend running. Admin: /admin'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅  Backend  → http://localhost:${PORT}`);
    console.log(`✅  Admin    → http://localhost:${PORT}/admin`);
});