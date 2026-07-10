/* ============================================================
   DRIPKITS SHARED CUSTOMER AUTH
   Include this file AFTER config.js and BEFORE cart.js on every page.
   Handles storing the customer's login session and talking to the
   backend with it attached.
   ============================================================ */

const CUSTOMER_TOKEN_KEY = 'dripkits_customer_token';
const CUSTOMER_KEY = 'dripkits_customer';

function getToken() {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

function getCurrentCustomer() {
    try {
        const raw = localStorage.getItem(CUSTOMER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveSession(token, customer) {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

function clearSession() {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}

/**
 * Wraps fetch() so every request automatically goes to the backend with the
 * customer's token attached. If the session has expired (401), it clears the
 * stored session and sends the customer to log in again.
 */
async function apiFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
        clearSession();
        const here = location.pathname.split('/').pop();
        if (here !== 'login.html' && here !== 'signup.html') {
            window.location.href = `login.html?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
        }
        throw new Error('Your session has expired. Please log in again.');
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    return res;
}

/* Updates the "Account" nav link (if this page has <... id="accountLink">) to
   show either "Login" or the customer's first name, depending on session state. */
function updateAccountLink() {
    const link = document.getElementById('accountLink');
    if (!link) return;
    const customer = getCurrentCustomer();
    if (customer) {
        link.textContent = `👤 ${customer.name.split(' ')[0]}`;
        link.href = 'account.html';
    } else {
        link.textContent = '👤 Login';
        link.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', updateAccountLink);
