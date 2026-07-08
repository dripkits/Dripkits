const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'dripkits.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cat TEXT NOT NULL,
    catLabel TEXT NOT NULL,
    price INTEGER NOT NULL,
    oldPrice INTEGER,
    discountType TEXT DEFAULT NULL,   -- "percent" or "fixed" or NULL
    discountValue INTEGER DEFAULT 0,  -- e.g. 10 means 10% off or Tk 10 off
    badge TEXT,
    images TEXT NOT NULL DEFAULT '[]',
    description TEXT,
    sizes TEXT NOT NULL DEFAULT '[]',
    outOfStock TEXT DEFAULT '[]',
    sizeGuide TEXT DEFAULT '{}',
    active INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    passwordHash TEXT NOT NULL,
    address TEXT,
    city TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    size TEXT,
    customization TEXT,
    addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    customerEmail TEXT,
    customerAddress TEXT NOT NULL,
    customerCity TEXT NOT NULL,
    orderNotes TEXT,
    deliveryArea TEXT NOT NULL,
    deliveryFee INTEGER NOT NULL,
    itemsTotal INTEGER NOT NULL,
    grandTotal INTEGER NOT NULL,
    paymentMethod TEXT NOT NULL,
    paymentStatus TEXT NOT NULL,
    amountPaidOnline INTEGER DEFAULT 0,
    orderStatus TEXT DEFAULT 'pending',
    sslTransactionId TEXT,
    itemsJson TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migrations — add columns that didn't exist in older versions
const orderCols = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);
const productCols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);

function addCol(table, name, def, existing) {
  if (!existing.includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
}

// Orders
addCol('orders', 'paymentApp', 'TEXT', orderCols);
addCol('orders', 'payerNumber', 'TEXT', orderCols);
addCol('orders', 'paymentTransactionId', 'TEXT', orderCols);
addCol('orders', 'customerId', 'INTEGER', orderCols);

// Products
addCol('products', 'discountType', "TEXT DEFAULT NULL", productCols);
addCol('products', 'discountValue', 'INTEGER DEFAULT 0', productCols);

module.exports = db;