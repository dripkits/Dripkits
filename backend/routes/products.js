const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

function rowToProduct(row) {
    return {
        id: row.id,
        name: row.name,
        cat: row.cat,
        catLabel: row.catLabel,
        price: row.price,
        oldPrice: row.oldPrice,
        discountType: row.discountType || null,
        discountValue: row.discountValue || 0,
        badge: row.badge,
        images: JSON.parse(row.images || '[]'),
        description: row.description,
        sizes: JSON.parse(row.sizes || '[]'),
        outOfStock: JSON.parse(row.outOfStock || '[]'),
        sizeGuide: JSON.parse(row.sizeGuide || '{}'),
        active: !!row.active,
        createdAt: row.createdAt
    };
}

/* The admin panel already saves the FINAL price customers should pay in
   `price`, and the original (pre-discount) price in `oldPrice`. So the
   public routes below just serve those fields as-is — no recalculation.
   (Recalculating here was applying the discount a second time on top of
   the already-discounted price, which is the bug this fixes.) */
function withBadge(p) {
    if (p.oldPrice && p.discountType && p.discountValue && !p.badge) {
        p.badge = p.discountType === 'percent' ? `${p.discountValue}% OFF` : `Tk ${p.discountValue} OFF`;
    }
    return p;
}

router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY id').all();
    res.json(rows.map(r => withBadge(rowToProduct(r))));
});

/* PUBLIC: single product */
router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(withBadge(rowToProduct(row)));
});

/* ADMIN: all products including hidden — MUST be before /:id */
router.get('/admin/all', requireAdmin, (req, res) => {
    const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(rows.map(rowToProduct)); // return raw price for admin editing
});

/* ADMIN: create */
router.post('/', requireAdmin, (req, res) => {
    const p = req.body;
    if (!p.name || !p.cat || !p.price)
        return res.status(400).json({ error: 'name, cat, and price are required' });

    const result = db.prepare(`
        INSERT INTO products
          (name,cat,catLabel,price,oldPrice,discountType,discountValue,badge,images,description,sizes,outOfStock,sizeGuide,active)
        VALUES
          (@name,@cat,@catLabel,@price,@oldPrice,@discountType,@discountValue,@badge,@images,@description,@sizes,@outOfStock,@sizeGuide,@active)
    `).run({
        name: p.name,
        cat: p.cat,
        catLabel: p.catLabel || p.cat,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        discountType: p.discountType || null,
        discountValue: p.discountValue ? Number(p.discountValue) : 0,
        badge: p.badge || null,
        images: JSON.stringify(p.images || []),
        description: p.description || '',
        sizes: JSON.stringify(p.sizes || []),
        outOfStock: JSON.stringify(p.outOfStock || []),
        sizeGuide: JSON.stringify(p.sizeGuide || {}),
        active: p.active === false ? 0 : 1
    });
    res.status(201).json({ id: result.lastInsertRowid });
});

/* ADMIN: update */
router.put('/:id', requireAdmin, (req, res) => {
    const p = req.body;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare(`
        UPDATE products SET
          name=@name, cat=@cat, catLabel=@catLabel, price=@price, oldPrice=@oldPrice,
          discountType=@discountType, discountValue=@discountValue,
          badge=@badge, images=@images, description=@description, sizes=@sizes,
          outOfStock=@outOfStock, sizeGuide=@sizeGuide, active=@active
        WHERE id=@id
    `).run({
        id: req.params.id,
        name: p.name ?? existing.name,
        cat: p.cat ?? existing.cat,
        catLabel: p.catLabel ?? existing.catLabel,
        price: p.price != null ? Number(p.price) : existing.price,
        oldPrice: p.oldPrice != null ? Number(p.oldPrice) : existing.oldPrice,
        discountType: p.discountType !== undefined ? (p.discountType || null) : existing.discountType,
        discountValue: p.discountValue != null ? Number(p.discountValue) : (existing.discountValue || 0),
        badge: p.badge !== undefined ? (p.badge || null) : existing.badge,
        images: p.images ? JSON.stringify(p.images) : existing.images,
        description: p.description !== undefined ? p.description : existing.description,
        sizes: p.sizes ? JSON.stringify(p.sizes) : existing.sizes,
        outOfStock: p.outOfStock ? JSON.stringify(p.outOfStock) : existing.outOfStock,
        sizeGuide: p.sizeGuide ? JSON.stringify(p.sizeGuide) : existing.sizeGuide,
        active: p.active !== undefined ? (p.active ? 1 : 0) : existing.active
    });
    res.json({ success: true });
});

/* ADMIN: toggle active */
router.patch('/:id/toggle', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT active FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    db.prepare('UPDATE products SET active = ? WHERE id = ?').run(row.active ? 0 : 1, req.params.id);
    res.json({ active: !row.active });
});

/* ADMIN: delete */
router.delete('/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;