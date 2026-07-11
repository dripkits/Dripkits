/**
 * routes/orders.js
 * Customer (must be logged in): POST /api/orders  -> create a new order (called from checkout.html)
 *                                GET  /api/orders/:id/track -> public order tracking (no auth, safe fields only)
 * Admin:   GET  /api/orders            -> list all orders
 *          GET  /api/orders/:id        -> one order's full details
 *          PATCH /api/orders/:id/status -> update order status (confirmed/shipped/delivered/cancelled)
 *          PATCH /api/orders/:id/payment-status -> mark delivery-charge payment as verified
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin, requireCustomer } = require('../middleware/auth');
const { CUSTOM_FEE, DELIVERY_FEES } = require('../priceUtils');
const nodemailer = require('nodemailer');

// Gmail transporter — credentials loaded from .env
// family: 4 forces IPv4 — Railway's network can't reach Gmail's IPv6
// address, which otherwise causes "connect ENETUNREACH" errors.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    family: 4
});

// Simple HTML-escape so customer-entered text can never break/inject into the notification email
function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function rowToOrder(row) {
    return {
        id: row.id,
        customerId: row.customerId,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        customerEmail: row.customerEmail,
        customerAddress: row.customerAddress,
        customerCity: row.customerCity,
        orderNotes: row.orderNotes,
        deliveryArea: row.deliveryArea,
        deliveryFee: row.deliveryFee,
        itemsTotal: row.itemsTotal,
        grandTotal: row.grandTotal,
        paymentMethod: row.paymentMethod,
        paymentStatus: row.paymentStatus,
        amountPaidOnline: row.amountPaidOnline,
        orderStatus: row.orderStatus,
        sslTransactionId: row.sslTransactionId,
        paymentApp: row.paymentApp,
        payerNumber: row.payerNumber,
        paymentTransactionId: row.paymentTransactionId,
        items: JSON.parse(row.itemsJson),
        createdAt: row.createdAt
    };
}

/* ---------- CUSTOMER (must be logged in): create order ---------- */
router.post('/', requireCustomer, (req, res) => {
    const o = req.body;

    const required = ['customerName', 'customerPhone', 'customerAddress', 'customerCity', 'deliveryArea', 'paymentMethod', 'items'];
    for (const field of required) {
        if (!o[field]) return res.status(400).json({ error: `${field} is required` });
    }

    if (!Array.isArray(o.items) || o.items.length === 0) {
        return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    if (!DELIVERY_FEES.hasOwnProperty(o.deliveryArea)) {
        return res.status(400).json({ error: `deliveryArea must be one of: ${Object.keys(DELIVERY_FEES).join(', ')}` });
    }

    // Every order is COD now, but the delivery charge must already be paid
    // manually via bKash/Nagad "Send Money" — so we require proof of that.
    if (o.paymentMethod === 'cod') {
        const paymentRequired = ['paymentApp', 'payerNumber', 'paymentTransactionId'];
        for (const field of paymentRequired) {
            if (!o[field]) return res.status(400).json({ error: `${field} is required to confirm the delivery charge payment` });
        }
    }

    // ---------- SERVER-SIDE PRICE VALIDATION ----------
    // Never trust prices/totals sent by the browser — always recompute them
    // from the products table. product.price is already the final price the
    // admin panel saved (discount, if any, already baked in), so we use it
    // directly and only add the customization fee on top — this is what
    // stops someone from tampering with the cart in devtools to pay less
    // than the real price, without re-applying the discount a second time.
    let itemsTotal = 0;
    const verifiedItems = [];

    for (const item of o.items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(item.id);
        if (!product) {
            return res.status(400).json({ error: `Product #${item.id} is not available` });
        }

        let price = product.price;
        if (item.customization && (item.customization.name || item.customization.number)) {
            price += CUSTOM_FEE;
        }

        const qty = Math.max(1, Number(item.qty) || 1);
        itemsTotal += price * qty;

        verifiedItems.push({
            id: product.id,
            name: product.name,
            price,
            qty,
            size: item.size || null,
            customization: item.customization || null
        });
    }

    const deliveryFee = DELIVERY_FEES[o.deliveryArea];
    const grandTotal = itemsTotal + deliveryFee;
    // ---------------------------------------------------

    const result = db.prepare(`
    INSERT INTO orders (
      customerId, customerName, customerPhone, customerEmail, customerAddress, customerCity, orderNotes,
      deliveryArea, deliveryFee, itemsTotal, grandTotal, paymentMethod, paymentStatus,
      amountPaidOnline, orderStatus, paymentApp, payerNumber, paymentTransactionId, itemsJson
    ) VALUES (
      @customerId, @customerName, @customerPhone, @customerEmail, @customerAddress, @customerCity, @orderNotes,
      @deliveryArea, @deliveryFee, @itemsTotal, @grandTotal, @paymentMethod, @paymentStatus,
      @amountPaidOnline, @orderStatus, @paymentApp, @payerNumber, @paymentTransactionId, @itemsJson
    )
  `).run({
        customerId: req.customer.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail || null,
        customerAddress: o.customerAddress,
        customerCity: o.customerCity,
        orderNotes: o.orderNotes || null,
        deliveryArea: o.deliveryArea,
        deliveryFee: deliveryFee,
        itemsTotal: itemsTotal,
        grandTotal: grandTotal,
        paymentMethod: o.paymentMethod,            // always "cod" now
        paymentStatus: 'pending',                  // admin marks this "paid" after checking their bKash/Nagad app
        amountPaidOnline: 0,
        orderStatus: 'pending',
        paymentApp: o.paymentApp || null,
        payerNumber: o.payerNumber || null,
        paymentTransactionId: o.paymentTransactionId || null,
        itemsJson: JSON.stringify(verifiedItems)
    });

    const orderId = result.lastInsertRowid;

    // Order placed successfully — clear this customer's saved server-side cart
    db.prepare('DELETE FROM cart_items WHERE customerId = ?').run(req.customer.id);

    // Save/update this customer's address+city on their profile for next time
    db.prepare('UPDATE customers SET address = ?, city = ? WHERE id = ?')
        .run(o.customerAddress, o.customerCity, req.customer.id);

    // Send order notification email via Gmail
    transporter.sendMail({
        from: `"Dripkits Orders" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `New Order #${orderId} - Dripkits`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
                <h2 style="color:#D4AF37;margin-bottom:4px;">New Order #${orderId}</h2>
                <p style="color:#666;font-size:0.85rem;margin-bottom:20px;">Placed on ${new Date().toLocaleString('en-GB')}</p>

                <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">
                    <tr style="background:#1a1a1a;color:#fff;">
                        <td colspan="2" style="padding:12px 16px;font-weight:700;">Customer Details</td>
                    </tr>
                    <tr><td style="padding:10px 16px;color:#555;width:40%;">Name</td><td style="padding:10px 16px;font-weight:600;">${esc(o.customerName)}</td></tr>
                    <tr style="background:#f5f5f5;"><td style="padding:10px 16px;color:#555;">Phone</td><td style="padding:10px 16px;font-weight:600;">${esc(o.customerPhone)}</td></tr>
                    <tr><td style="padding:10px 16px;color:#555;">Address</td><td style="padding:10px 16px;">${esc(o.customerAddress)}, ${esc(o.customerCity)}</td></tr>
                    <tr style="background:#f5f5f5;"><td style="padding:10px 16px;color:#555;">Delivery Area</td><td style="padding:10px 16px;">${o.deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}</td></tr>

                    <tr style="background:#1a1a1a;color:#fff;">
                        <td colspan="2" style="padding:12px 16px;font-weight:700;">Payment Proof</td>
                    </tr>
                    <tr><td style="padding:10px 16px;color:#555;">Paid Via</td><td style="padding:10px 16px;font-weight:600;">${o.paymentApp ? esc(o.paymentApp.toUpperCase()) : '-'}</td></tr>
                    <tr style="background:#f5f5f5;"><td style="padding:10px 16px;color:#555;">Paid From</td><td style="padding:10px 16px;">${esc(o.payerNumber) || '-'}</td></tr>
                    <tr><td style="padding:10px 16px;color:#555;">Transaction ID</td><td style="padding:10px 16px;font-weight:700;color:#D4AF37;">${esc(o.paymentTransactionId) || '-'}</td></tr>

                    <tr style="background:#1a1a1a;color:#fff;">
                        <td colspan="2" style="padding:12px 16px;font-weight:700;">Items Ordered</td>
                    </tr>
                    <tr><td colspan="2" style="padding:12px 16px;">
                        ${verifiedItems.map(i => `<div style="padding:4px 0;border-bottom:1px solid #eee;">
                            <strong>${esc(i.name)}</strong> x${i.qty}${i.size ? ' | Size: ' + esc(i.size) : ''}${i.customization ? ` | <span style="color:#D4AF37;">⚽ Name: ${esc(i.customization.name) || '-'} | Number: ${esc(i.customization.number) || '-'}</span>` : ''} - Tk ${i.price * i.qty}
                        </div>`).join('')}
                    </td></tr>

                    <tr style="background:#1a1a1a;color:#fff;">
                        <td colspan="2" style="padding:12px 16px;font-weight:700;">Order Total</td>
                    </tr>
                    <tr><td style="padding:10px 16px;color:#555;">Products Total</td><td style="padding:10px 16px;">Tk ${itemsTotal}</td></tr>
                    <tr style="background:#f5f5f5;"><td style="padding:10px 16px;color:#555;">Delivery Fee</td><td style="padding:10px 16px;color:#4caf50;">Tk ${deliveryFee} (already paid via ${o.paymentApp ? esc(o.paymentApp.toUpperCase()) : 'bKash/Nagad'})</td></tr>
                    <tr><td style="padding:10px 16px;font-weight:700;">Collect on Delivery (Cash)</td><td style="padding:10px 16px;font-weight:800;color:#D4AF37;">Tk ${itemsTotal}</td></tr>
                </table>

                <p style="margin-top:20px;font-size:0.8rem;color:#999;text-align:center;">
                    Dripkits Order Notification - Verify Transaction ID in your bKash/Nagad app before confirming
                </p>
            </div>
        `
    }).catch(err => console.error('Email error:', err));

    res.status(201).json({ orderId });
});

/* ---------- ADMIN: list all orders, most recent first ---------- */
router.get('/', requireAdmin, (req, res) => {
    const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    res.json(rows.map(rowToOrder));
});

/* ---------- ADMIN: single order ---------- */
router.get('/:id', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(rowToOrder(row));
});

/* ---------- ADMIN: update order status (e.g. mark as shipped) ---------- */
router.patch('/:id/status', requireAdmin, (req, res) => {
    const { orderStatus } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(orderStatus)) {
        return res.status(400).json({ error: `orderStatus must be one of: ${allowed.join(', ')}` });
    }
    db.prepare('UPDATE orders SET orderStatus = ? WHERE id = ?').run(orderStatus, req.params.id);
    res.json({ success: true });
});

/* ---------- ADMIN: mark the delivery charge bKash/Nagad payment as verified ---------- */
router.patch('/:id/payment-status', requireAdmin, (req, res) => {
    const { paymentStatus } = req.body;
    const allowed = ['pending', 'paid'];
    if (!allowed.includes(paymentStatus)) {
        return res.status(400).json({ error: `paymentStatus must be one of: ${allowed.join(', ')}` });
    }
    db.prepare('UPDATE orders SET paymentStatus = ? WHERE id = ?').run(paymentStatus, req.params.id);
    res.json({ success: true });
});

/* ---------- PUBLIC: order tracking (no auth — returns only safe fields) ---------- */
router.get('/:id/track', (req, res) => {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Order not found. Please check your order number.' });

    // Only return what the customer needs — no phone, address, or payment details
    res.json({
        orderId: row.id,
        orderStatus: row.orderStatus,
        paymentStatus: row.paymentStatus,
        deliveryArea: row.deliveryArea,
        deliveryFee: row.deliveryFee,
        itemsTotal: row.itemsTotal,
        grandTotal: row.grandTotal,
        paymentApp: row.paymentApp,
        customerName: row.customerName,
        customerCity: row.customerCity,
        items: JSON.parse(row.itemsJson),
        createdAt: row.createdAt
    });
});

module.exports = router;