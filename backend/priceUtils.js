/**
 * priceUtils.js
 * Single source of truth for price/fee math, shared by routes/products.js,
 * routes/cart.js, and routes/orders.js. Keeping this in one place means the
 * price a customer sees on the site, in their cart, and in a placed order
 * can never drift apart from each other.
 */

const CUSTOM_FEE = 350;                              // Tk 350 jersey name/number customization fee
const DELIVERY_FEES = { inside: 80, outside: 130 };  // must match DELIVERY_FEES in checkout.html

function effectivePrice(price, discountType, discountValue) {
    if (!discountType || !discountValue) return price;
    if (discountType === 'percent') return Math.round(price * (1 - discountValue / 100));
    if (discountType === 'fixed') return Math.max(0, price - discountValue);
    return price;
}

module.exports = { CUSTOM_FEE, DELIVERY_FEES, effectivePrice };
