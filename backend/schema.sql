CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'seller', 'admin')) DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
    payment_ref TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase INTEGER NOT NULL,
    fulfillment_status TEXT NOT NULL CHECK(fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered')) DEFAULT 'pending',
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(seller_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(seller_id) REFERENCES users(id)
);

-- Mock accounts
-- Password for every seeded user: secret123
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at) VALUES
(1, 'Alice Customer', 'alice.customer@gmail.com', '$2a$10$1z25SPyqgAtxZyheT4W9i.Yf7UbcPUMrkkokGgsQmAPNyoSQ3p9s6', 'customer', '2026-05-01 09:00:00'),
(2, 'Nova Gadgets', 'nova.seller@gmail.com', '$2a$10$1z25SPyqgAtxZyheT4W9i.Yf7UbcPUMrkkokGgsQmAPNyoSQ3p9s6', 'seller', '2026-05-01 09:05:00'),
(3, 'HomeFit Store', 'homefit.seller@gmail.com', '$2a$10$1z25SPyqgAtxZyheT4W9i.Yf7UbcPUMrkkokGgsQmAPNyoSQ3p9s6', 'seller', '2026-05-01 09:10:00'),
(4, 'Bob Customer', 'bob.customer@gmail.com', '$2a$10$1z25SPyqgAtxZyheT4W9i.Yf7UbcPUMrkkokGgsQmAPNyoSQ3p9s6', 'customer', '2026-05-01 09:15:00'),
(5, 'Admin User', 'admin@gmail.com', '$2a$10$1z25SPyqgAtxZyheT4W9i.Yf7UbcPUMrkkokGgsQmAPNyoSQ3p9s6', 'admin', '2026-05-01 09:20:00');

-- Seller catalog
INSERT OR IGNORE INTO products (id, seller_id, name, description, price, stock, created_at) VALUES
(1, 2, 'Wireless Mouse', 'Ergonomic wireless mouse with silent click buttons', 599, 46, '2026-05-02 10:00:00'),
(2, 2, 'Mechanical Keyboard', 'RGB mechanical keyboard with hot-swappable switches', 1990, 18, '2026-05-02 10:05:00'),
(3, 2, 'USB-C Hub', '6-in-1 USB-C hub with HDMI, USB-A, and SD card reader', 1290, 24, '2026-05-02 10:10:00'),
(4, 2, 'Laptop Stand', 'Adjustable aluminum laptop stand for desk setups', 890, 30, '2026-05-02 10:15:00'),
(5, 3, 'Office Chair', 'Ergonomic office chair with lumbar support', 5990, 7, '2026-05-02 11:00:00'),
(6, 3, 'Yoga Mat', 'Non-slip yoga mat with carrying strap', 790, 40, '2026-05-02 11:05:00'),
(7, 3, 'Dumbbell Set', 'Adjustable dumbbell set for compact home workouts', 4590, 9, '2026-05-02 11:10:00'),
(8, 3, 'Air Fryer', '5L digital air fryer with preset cooking modes', 3590, 11, '2026-05-02 11:15:00');

-- Customer orders
INSERT OR IGNORE INTO orders (id, user_id, total_amount, status, payment_ref, created_at) VALUES
(1, 1, 2880, 'paid', 'PAY-MOCK-1001', '2026-05-05 14:00:00'),
(2, 1, 4380, 'pending', 'PAY-MOCK-1002', '2026-05-06 15:30:00'),
(3, 4, 6589, 'cancelled', 'PAY-MOCK-1003', '2026-05-07 17:45:00');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, seller_id, quantity, price_at_purchase, fulfillment_status) VALUES
(1, 1, 2, 2, 1, 1990, 'delivered'),
(2, 1, 4, 2, 1, 890, 'delivered'),
(3, 2, 8, 3, 1, 3590, 'pending'),
(4, 2, 6, 3, 1, 790, 'pending'),
(5, 3, 5, 3, 1, 5990, 'pending'),
(6, 3, 1, 2, 1, 599, 'pending');

-- Active shopping carts
INSERT OR IGNORE INTO carts (id, user_id, created_at, updated_at) VALUES
(1, 1, '2026-05-08 09:00:00', '2026-05-08 09:05:00'),
(2, 4, '2026-05-08 09:10:00', '2026-05-08 09:12:00');

INSERT OR IGNORE INTO cart_items (id, cart_id, product_id, seller_id, quantity, created_at) VALUES
(1, 1, 1, 2, 2, '2026-05-08 09:01:00'),
(2, 1, 6, 3, 1, '2026-05-08 09:03:00'),
(3, 2, 4, 2, 1, '2026-05-08 09:11:00'),
(4, 2, 7, 3, 1, '2026-05-08 09:12:00');
