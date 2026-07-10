/* ============================================================
   DRIPKITS SHARED CART SYSTEM
   Include this file on every page (Home, Mens, Contact, etc.),
   AFTER config.js and auth.js.
   Cart data now lives on the backend, tied to the logged-in
   customer's account — it's the same cart on any device they
   log in from. Adding to cart requires being logged in.
   ============================================================ */

/* ---------- Resolve product image paths ----------
   Images uploaded via the admin panel are stored as "/uploads/xxx.jpg"
   which only resolves correctly on the backend's own origin (localhost:4000).
   Images from the original static catalog are plain "img/xxx.jpeg" paths
   relative to this website folder, so those are left untouched. */
function resolveImg(src) {
    if (!src) return 'favicon.png';
    if (src.startsWith('/uploads')) return `${BACKEND_URL}${src}`;
    return src;
}

let cart = { items: [], subtotal: 0 };

/* ---------- Load the logged-in customer's cart from the backend ---------- */
async function refreshCart() {
    if (!isLoggedIn()) {
        cart = { items: [], subtotal: 0 };
        renderCart();
        return cart;
    }
    try {
        const res = await apiFetch('/api/cart');
        cart = await res.json();
    } catch (err) {
        console.error('Failed to load cart:', err);
        cart = { items: [], subtotal: 0 };
    }
    renderCart();
    return cart;
}

/* ---------- Add item (size/customization optional — pass null if not used) ----------
   Must be logged in — sends the customer straight to the login page otherwise. */
async function addToCart(product, size = null, customization = null) {
    if (!isLoggedIn()) {
        window.location.href = `login.html?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
        return;
    }

    try {
        const res = await apiFetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId: product.id, qty: 1, size, customization })
        });
        cart = await res.json();
        renderCart();

        const sizeText = size ? ` (Size ${size})` : '';
        const custText = customization ? ` · #${customization.number || ''}${customization.name ? ' ' + customization.name : ''} +Tk 350` : '';
        showToast(`${product.name}${sizeText}${custText} added to cart`);
    } catch (err) {
        showToast(err.message || 'Could not add to cart');
    }
}

/* ---------- Change quantity of an existing cart line ---------- */
async function changeQty(cartItemId, delta) {
    const item = cart.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;
    try {
        const res = await apiFetch(`/api/cart/${cartItemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ qty: item.qty + delta })
        });
        cart = await res.json();
        renderCart();
    } catch (err) {
        showToast(err.message || 'Could not update cart');
    }
}

/* ---------- Remove item ---------- */
async function removeItem(cartItemId) {
    try {
        const res = await apiFetch(`/api/cart/${cartItemId}`, { method: 'DELETE' });
        cart = await res.json();
        renderCart();
    } catch (err) {
        showToast(err.message || 'Could not remove item');
    }
}

/* ---------- Render cart drawer ---------- */
function renderCart() {
    const itemsWrap = document.getElementById('cartItems');
    const countEl = document.getElementById('cartCount');
    const subtotalEl = document.getElementById('cartSubtotal');
    if (!itemsWrap) return;

    const items = cart.items || [];
    const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
    if (countEl) countEl.textContent = totalQty;

    if (items.length === 0) {
        itemsWrap.innerHTML = `<div class="cart-empty"><span class="emoji">🛒</span>Your cart is empty.<br>Time to fix that.</div>`;
        if (subtotalEl) subtotalEl.textContent = "Tk 0";
        return;
    }

    itemsWrap.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${resolveImg(item.image)}" alt="${item.name}">
      <div class="ci-info">
        <h5>${item.name}</h5>
        <div class="ci-meta">${item.size ? 'Size ' + item.size : ''}${item.customization ? ` • <span style="color:var(--gold);font-weight:600;">⚽ #${item.customization.number || ''}${item.customization.name ? ' ' + item.customization.name : ''} <span style="font-size:0.7rem;">(+Tk 350)</span></span>` : ''}</div>
        <div class="ci-row">
          <div class="qty-control">
            <button data-action="dec" data-cart-item-id="${item.cartItemId}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-cart-item-id="${item.cartItemId}" aria-label="Increase quantity">+</button>
          </div>
          <span class="ci-price">Tk ${item.price * item.qty}</span>
        </div>
        <button class="ci-remove" data-action="remove" data-cart-item-id="${item.cartItemId}">Remove</button>
      </div>
    </div>
  `).join('');

    if (subtotalEl) subtotalEl.textContent = `Tk ${cart.subtotal}`;
}

/* ---------- Cart item button clicks (qty +/-, remove) + drawer open/close ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const itemsWrap = document.getElementById('cartItems');
    if (itemsWrap) {
        itemsWrap.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;
            const cartItemId = Number(action.dataset.cartItemId);
            if (action.dataset.action === 'inc') changeQty(cartItemId, 1);
            if (action.dataset.action === 'dec') changeQty(cartItemId, -1);
            if (action.dataset.action === 'remove') removeItem(cartItemId);
        });
    }

    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');

    function openCart() { cartDrawer?.classList.add('show'); cartOverlay?.classList.add('show'); }
    function closeCart() { cartDrawer?.classList.remove('show'); cartOverlay?.classList.remove('show'); }

    cartBtn?.addEventListener('click', () => {
        if (!isLoggedIn()) {
            window.location.href = `login.html?returnTo=${encodeURIComponent(location.pathname)}`;
            return;
        }
        openCart();
    });
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn?.addEventListener('click', () => {
        if (!cart.items || cart.items.length === 0) { showToast("Your cart is empty"); return; }
        window.location.href = 'checkout.html';
    });

    refreshCart();
});

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
