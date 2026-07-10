/**
 * routes/cart.js
 * Server-side cart, tied to the logged-in customer's account so it's the
 * same cart no matter which device they log in from. All routes require
 * a valid customer login — there is no "guest cart" anymore.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireCustomer } = require('../middleware/auth');
const { CUSTOM_FEE } = require('../priceUtils');

// Build the full cart response: each saved cart row joined with live product
// data, so price/name/image/stock always reflect the current catalog.
function buildCart(customerId) {
    const rows = db.prepare('SELECT * FROM cart_items WHERE customerId = ? ORDER BY id').all(customerId);
    const items = [];

    for (const row of rows) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(row.productId);
        if (!product || !product.active) continue; // silently drop items for products that no longer exist/are hidden

        const customization = row.customization ? JSON.parse(row.customization) : null;
        // product.price is already the final price the admin panel saved
        // (discount, if any, is already baked in) — do not recalculate it here.
        let price = product.price;
        if (customization && (customization.name || customization.number)) price += CUSTOM_FEE;

        items.push({
            cartItemId: row.id,
            productId: product.id,
            name: product.name,
            image: JSON.parse(product.images || '[]')[0] || null,
            price,
            qty: row.qty,
            size: row.size,
            customization,
            addedAt: row.addedAt
        });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    return { items, subtotal };
}

/* ---------- Get my cart ---------- */
router.get('/', requireCustomer, (req, res) => {
    res.json(buildCart(req.customer.id));
});

/* ---------- Add an item to my cart ---------- */
router.post('/', requireCustomer, (req, res) => {
    const { productId, qty, size, customization } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(productId);
    if (!product) return res.status(400).json({ error: 'This product is not available' });

    const qtyNum = Math.max(1, Number(qty) || 1);
    const sizeVal = size || null;
    const customizationJson = customization && (customization.name || customization.number)
        ? JSON.stringify(customization)
        : null;

    // If the same product+size+customization is already in the cart, just bump the quantity
    const existing = db.prepare(`
        SELECT * FROM cart_items
        WHERE customerId = ? AND productId = ? AND IFNULL(size,'') = IFNULL(?,'') AND IFNULL(customization,'') = IFNULL(?,'')
    `).get(req.customer.id, productId, sizeVal, customizationJson);

    if (existing) {
        db.prepare('UPDATE cart_items SET qty = qty + ? WHERE id = ?').run(qtyNum, existing.id);
    } else {
        db.prepare(`
            INSERT INTO cart_items (customerId, productId, qty, size, customization)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.customer.id, productId, qtyNum, sizeVal, customizationJson);
    }

    res.status(201).json(buildCart(req.customer.id));
});

/* ---------- Update quantity of one cart item ---------- */
router.patch('/:cartItemId', requireCustomer, (req, res) => {
    const row = db.prepare('SELECT * FROM cart_items WHERE id = ? AND customerId = ?').get(req.params.cartItemId, req.customer.id);
    if (!row) return res.status(404).json({ error: 'Cart item not found' });

    const qty = Number(req.body.qty);
    if (!qty || qty < 1) {
        db.prepare('DELETE FROM cart_items WHERE id = ?').run(row.id);
    } else {
        db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(qty, row.id);
    }

    res.json(buildCart(req.customer.id));
});

/* ---------- Remove one cart item ---------- */
router.delete('/:cartItemId', requireCustomer, (req, res) => {
    const row = db.prepare('SELECT * FROM cart_items WHERE id = ? AND customerId = ?').get(req.params.cartItemId, req.customer.id);
    if (!row) return res.status(404).json({ error: 'Cart item not found' });
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(row.id);
    res.json(buildCart(req.customer.id));
});

/* ---------- Clear my entire cart ---------- */
router.delete('/', requireCustomer, (req, res) => {
    db.prepare('DELETE FROM cart_items WHERE customerId = ?').run(req.customer.id);
    res.json({ items: [], subtotal: 0 });
});

module.exports = router;