/**
 * middleware/auth.js
 * Protects admin-only routes (viewing orders, editing products) with a
 * simple JWT token. The admin logs in with ADMIN_PASSWORD (from .env),
 * gets a token back, and the admin panel sends that token on every
 * request afterward.
 */
const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Missing admin token. Please log in.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== 'admin') throw new Error('Not an admin token');
        req.admin = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired admin session. Please log in again.' });
    }
}

/**
 * Protects customer-only routes (account page, cart, order history, checkout).
 * A customer logs in via /api/customers/login and gets a JWT back, sent as
 * "Authorization: Bearer <token>" on every request after that.
 */
function requireCustomer(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Please log in to continue.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== 'customer') throw new Error('Not a customer token');
        req.customer = payload; // { role: 'customer', id, name }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }
}

module.exports = { requireAdmin, requireCustomer };