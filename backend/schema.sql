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
    category TEXT NOT NULL DEFAULT '',
    brand TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL,
    original_price INTEGER,
    rating REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    tone TEXT NOT NULL DEFAULT '',
    subtitle TEXT,
    image TEXT,
    features TEXT NOT NULL DEFAULT '[]',
    highlights TEXT NOT NULL DEFAULT '[]',
    specifications TEXT NOT NULL DEFAULT '[]',
    delivery TEXT,
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
INSERT OR IGNORE INTO products (
    id, seller_id, name, description, category, brand, price, original_price, rating, stock,
    tone, subtitle, image, features, highlights, specifications, delivery, created_at
) VALUES
(1, 2, 'Wireless Mouse', 'Ergonomic wireless mouse with silent click buttons', 'Electronics', 'Logitech', 599, NULL, 4.7, 46, 'from-slate-100 to-sky-200', 'Ergonomic wireless mouse', 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80', '["In Stock","Silent click buttons","2.4GHz wireless"]', '["Comfortable ambidextrous shape","Reliable battery life","Compact travel-friendly size"]', '[["Connectivity","2.4GHz USB receiver"],["Buttons","Silent left/right click"],["Battery","Up to 12 months"],["Use","Work and daily browsing"]]', 'Ships in protective retail packaging with quick dispatch.', '2026-05-02 10:00:00'),
(2, 2, 'Mechanical Keyboard', 'RGB mechanical keyboard with hot-swappable switches', 'Electronics', 'Keychron', 1990, 2390, 4.8, 18, 'from-zinc-900 to-zinc-500', 'RGB mechanical keyboard', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80', '["In Stock","Hot-swappable switches","Per-key RGB"]', '["Tactile typing feel","Durable aluminum frame","Ideal for work and gaming"]', '[["Switches","Hot-swappable mechanical"],["Lighting","RGB backlight"],["Layout","Compact full-size"],["Connection","USB-C"]]', 'Ships boxed with cable and switch puller included.', '2026-05-02 10:05:00'),
(3, 2, 'USB-C Hub', '6-in-1 USB-C hub with HDMI, USB-A, and SD card reader', 'Accessories', 'Anker', 1290, NULL, 4.6, 24, 'from-slate-900 to-slate-500', '6-in-1 USB-C hub', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80', '["In Stock","HDMI output","SD card reader"]', '["Single-cable desk setup","Laptop and tablet friendly","Compact aluminum build"]', '[["Ports","HDMI, USB-A, USB-C, SD"],["Video","Up to 4K HDMI"],["Material","Aluminum"],["Use","Workstation expansion"]]', 'Ships in a slim box with setup guide.', '2026-05-02 10:10:00'),
(4, 2, 'Laptop Stand', 'Adjustable aluminum laptop stand for desk setups', 'Accessories', 'Baseus', 890, NULL, 4.5, 30, 'from-stone-100 to-emerald-100', 'Adjustable laptop stand', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80', '["In Stock","Aluminum frame","Foldable design"]', '["Improves desk ergonomics","Stable anti-slip support","Easy to carry between workspaces"]', '[["Material","Aluminum alloy"],["Adjustability","Multi-angle"],["Use","Laptops up to 16 inches"],["Finish","Anodized silver"]]', 'Ships flat-packed with protective wrapping.', '2026-05-02 10:15:00'),
(5, 3, 'Office Chair', 'Ergonomic office chair with lumbar support', 'Home & Living', 'ErgoTune', 5990, 6990, 4.7, 7, 'from-emerald-100 to-sky-100', 'Ergonomic office chair', 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=900&q=80', '["In Stock","Lumbar support","Breathable mesh back"]', '["Comfort for long desk sessions","Height and tilt adjustments","Supportive seat cushioning"]', '[["Material","Mesh and foam"],["Adjustments","Height, tilt, armrests"],["Base","Five-wheel caster base"],["Use","Home office"]]', 'Large-item delivery with scheduled arrival window.', '2026-05-02 11:00:00'),
(6, 3, 'Yoga Mat', 'Non-slip yoga mat with carrying strap', 'Sports', 'Manduka', 790, NULL, 4.8, 40, 'from-rose-100 to-orange-100', 'Non-slip yoga mat', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80', '["In Stock","Non-slip texture","Carrying strap included"]', '["Comfortable floor support","Easy to roll and store","Good grip for workouts"]', '[["Length","183 cm"],["Thickness","6 mm"],["Material","High-density foam"],["Use","Yoga and stretching"]]', 'Ships wrapped and ready for gifting or daily use.', '2026-05-02 11:05:00'),
(7, 3, 'Dumbbell Set', 'Adjustable dumbbell set for compact home workouts', 'Sports', 'Bowflex', 4590, NULL, 4.6, 9, 'from-neutral-950 to-neutral-500', 'Adjustable dumbbell set', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80', '["In Stock","Compact storage","Adjustable resistance"]', '["Replaces multiple weights","Quick-change selector","Suitable for home training"]', '[["Weight range","2.5-24 kg"],["Adjustment","Dial system"],["Storage","Compact tray"],["Use","Strength training"]]', 'Heavy-item shipping with reinforced packaging.', '2026-05-02 11:10:00'),
(8, 3, 'Air Fryer', '5L digital air fryer with preset cooking modes', 'Home & Living', 'Philips', 3590, NULL, 4.7, 11, 'from-slate-50 to-amber-100', '5L digital air fryer', 'https://images.unsplash.com/photo-1585515656791-1f8e8c7cc7c7?auto=format&fit=crop&w=900&q=80', '["In Stock","Preset cooking modes","Easy-clean basket"]', '["Crispy results with less oil","Simple digital controls","Great for weeknight meals"]', '[["Capacity","5 liters"],["Controls","Digital touch panel"],["Programs","Multiple presets"],["Cleaning","Non-stick removable basket"]]', 'Ships in sealed retail packaging with manual included.', '2026-05-02 11:15:00');

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
