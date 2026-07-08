/**
 * routes/auth.js
 * Single endpoint: admin logs in with the ADMIN_PASSWORD from .env
 * and gets back a JWT token, valid for 12 hours, to use on all
 * other admin-protected requests.
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { password } = req.body;

    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
});

module.exports = router;