/**
 * routes/customers.js
 * Customer accounts: sign up, log in, view/update their own profile,
 * view their own order history. Also exposes admin-only endpoints to
 * list and inspect registered customers.
 *
 * Passwords are never stored in plain text — only a bcrypt hash.
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAdmin, requireCustomer } = require('../middleware/auth');

function signToken(customer) {
    return jwt.sign(
        { role: 'customer', id: customer.id, name: customer.name },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // long-lived so customers stay logged in across visits/devices
    );
}

// Never send the password hash back to the client
function publicCustomer(row) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        createdAt: row.createdAt
    };
}

/* ---------- PUBLIC: sign up ---------- */
router.post('/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }
    if (!email && !phone) {
        return res.status(400).json({ error: 'Please provide an email or a phone number' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (email) {
        const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email);
        if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
    }
    if (phone) {
        const existing = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
        if (existing) return res.status(409).json({ error: 'An account with this phone number already exists. Please log in instead.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
        INSERT INTO customers (name, email, phone, passwordHash)
        VALUES (@name, @email, @phone, @passwordHash)
    `).run({
        name,
        email: email || null,
        phone: phone || null,
        passwordHash
    });

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    const token = signToken(customer);
    res.status(201).json({ token, customer: publicCustomer(customer) });
});

/* ---------- PUBLIC: log in with email OR phone ---------- */
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    const customer = db.prepare('SELECT * FROM customers WHERE email = ? OR phone = ?').get(identifier, identifier);
    if (!customer) {
        return res.status(401).json({ error: 'No account found with that email/phone' });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = signToken(customer);
    res.json({ token, customer: publicCustomer(customer) });
});

/* ---------- CUSTOMER: my profile ---------- */
router.get('/me', requireCustomer, (req, res) => {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.customer.id);
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    res.json(publicCustomer(customer));
});

/* ---------- CUSTOMER: update my profile (name, address, city; email/phone with uniqueness check) ---------- */
router.put('/me', requireCustomer, (req, res) => {
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.customer.id);
    if (!existing) return res.status(404).json({ error: 'Account not found' });

    const { name, email, phone, address, city } = req.body;

    if (email && email !== existing.email) {
        const clash = db.prepare('SELECT id FROM customers WHERE email = ? AND id != ?').get(email, req.customer.id);
        if (clash) return res.status(409).json({ error: 'Another account already uses this email' });
    }
    if (phone && phone !== existing.phone) {
        const clash = db.prepare('SELECT id FROM customers WHERE phone = ? AND id != ?').get(phone, req.customer.id);
        if (clash) return res.status(409).json({ error: 'Another account already uses this phone number' });
    }

    db.prepare(`
        UPDATE customers SET
          name = @name, email = @email, phone = @phone, address = @address, city = @city
        WHERE id = @id
    `).run({
        id: req.customer.id,
        name: name ?? existing.name,
        email: email !== undefined ? (email || null) : existing.email,
        phone: phone !== undefined ? (phone || null) : existing.phone,
        address: address !== undefined ? address : existing.address,
        city: city !== undefined ? city : existing.city
    });

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.customer.id);
    res.json(publicCustomer(updated));
});

/* ---------- CUSTOMER: my order history ---------- */
router.get('/me/orders', requireCustomer, (req, res) => {
    const rows = db.prepare('SELECT * FROM orders WHERE customerId = ? ORDER BY id DESC').all(req.customer.id);
    res.json(rows.map(row => ({
        id: row.id,
        orderStatus: row.orderStatus,
        paymentStatus: row.paymentStatus,
        deliveryArea: row.deliveryArea,
        deliveryFee: row.deliveryFee,
        itemsTotal: row.itemsTotal,
        grandTotal: row.grandTotal,
        customerAddress: row.customerAddress,
        customerCity: row.customerCity,
        items: JSON.parse(row.itemsJson),
        createdAt: row.createdAt
    })));
});

/* ---------- ADMIN: list all registered customers ---------- */
router.get('/', requireAdmin, (req, res) => {
    const rows = db.prepare(`
        SELECT c.*,
          (SELECT COUNT(*) FROM orders o WHERE o.customerId = c.id) AS orderCount,
          (SELECT COALESCE(SUM(o.grandTotal), 0) FROM orders o WHERE o.customerId = c.id) AS totalSpent
        FROM customers c
        ORDER BY c.id DESC
    `).all();
    res.json(rows.map(r => ({ ...publicCustomer(r), orderCount: r.orderCount, totalSpent: r.totalSpent })));
});

/* ---------- ADMIN: one customer + their orders ---------- */
router.get('/:id', requireAdmin, (req, res) => {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const orders = db.prepare('SELECT * FROM orders WHERE customerId = ? ORDER BY id DESC').all(req.params.id);
    res.json({
        ...publicCustomer(customer),
        orders: orders.map(row => ({
            id: row.id,
            orderStatus: row.orderStatus,
            paymentStatus: row.paymentStatus,
            grandTotal: row.grandTotal,
            items: JSON.parse(row.itemsJson),
            createdAt: row.createdAt
        }))
    });
});

module.exports = router;
