package db

import (
	"database/sql"
	"fmt"
	"os"
)

const defaultSchema = `
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
`

func Migrate(database *sql.DB, schemaPath string) error {
	schema, err := loadSchema(schemaPath)
	if err != nil {
		return err
	}

	if _, err := database.Exec(`PRAGMA foreign_keys = ON;`); err != nil {
		return fmt.Errorf("re-enable foreign keys: %w", err)
	}

	if _, err := database.Exec(schema); err != nil {
		return fmt.Errorf("apply schema: %w", err)
	}

	if err := ensureProductColumns(database); err != nil {
		return fmt.Errorf("ensure product columns: %w", err)
	}

	if err := backfillSeedProductMetadata(database); err != nil {
		return fmt.Errorf("backfill product metadata: %w", err)
	}

	return nil
}

func loadSchema(schemaPath string) (string, error) {
	if schemaPath != "" {
		if contents, err := os.ReadFile(schemaPath); err == nil {
			return string(contents), nil
		}
	}

	return defaultSchema, nil
}

func ensureProductColumns(database *sql.DB) error {
	type columnDefinition struct {
		name       string
		definition string
	}

	requiredColumns := []columnDefinition{
		{name: "category", definition: "TEXT NOT NULL DEFAULT ''"},
		{name: "brand", definition: "TEXT NOT NULL DEFAULT ''"},
		{name: "original_price", definition: "INTEGER"},
		{name: "rating", definition: "REAL NOT NULL DEFAULT 0"},
		{name: "tone", definition: "TEXT NOT NULL DEFAULT ''"},
		{name: "subtitle", definition: "TEXT"},
		{name: "image", definition: "TEXT"},
		{name: "features", definition: "TEXT NOT NULL DEFAULT '[]'"},
		{name: "highlights", definition: "TEXT NOT NULL DEFAULT '[]'"},
		{name: "specifications", definition: "TEXT NOT NULL DEFAULT '[]'"},
		{name: "delivery", definition: "TEXT"},
	}

	existingColumns, err := listTableColumns(database, "products")
	if err != nil {
		return err
	}

	for _, column := range requiredColumns {
		if existingColumns[column.name] {
			continue
		}

		if _, err := database.Exec(fmt.Sprintf(`ALTER TABLE products ADD COLUMN %s %s`, column.name, column.definition)); err != nil {
			return fmt.Errorf("add column %s: %w", column.name, err)
		}
	}

	return nil
}

func listTableColumns(database *sql.DB, tableName string) (map[string]bool, error) {
	rows, err := database.Query(fmt.Sprintf(`PRAGMA table_info(%s)`, tableName))
	if err != nil {
		return nil, fmt.Errorf("table info for %s: %w", tableName, err)
	}
	defer rows.Close()

	columns := make(map[string]bool)
	for rows.Next() {
		var (
			cid        int
			name       string
			columnType string
			notNull    int
			defaultVal sql.NullString
			pk         int
		)

		if err := rows.Scan(&cid, &name, &columnType, &notNull, &defaultVal, &pk); err != nil {
			return nil, fmt.Errorf("scan table info for %s: %w", tableName, err)
		}

		columns[name] = true
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate table info for %s: %w", tableName, err)
	}

	return columns, nil
}

func backfillSeedProductMetadata(database *sql.DB) error {
	updates := []struct {
		id             int64
		category       string
		brand          string
		originalPrice  any
		rating         float64
		tone           string
		subtitle       string
		image          string
		features       string
		highlights     string
		specifications string
		delivery       string
	}{
		{
			id:             1,
			category:       "Electronics",
			brand:          "Logitech",
			rating:         4.7,
			tone:           "from-slate-100 to-sky-200",
			subtitle:       "Ergonomic wireless mouse",
			image:          "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Silent click buttons","2.4GHz wireless"]`,
			highlights:     `["Comfortable ambidextrous shape","Reliable battery life","Compact travel-friendly size"]`,
			specifications: `[["Connectivity","2.4GHz USB receiver"],["Buttons","Silent left/right click"],["Battery","Up to 12 months"],["Use","Work and daily browsing"]]`,
			delivery:       "Ships in protective retail packaging with quick dispatch.",
		},
		{
			id:             2,
			category:       "Electronics",
			brand:          "Keychron",
			originalPrice:  2390,
			rating:         4.8,
			tone:           "from-zinc-900 to-zinc-500",
			subtitle:       "RGB mechanical keyboard",
			image:          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Hot-swappable switches","Per-key RGB"]`,
			highlights:     `["Tactile typing feel","Durable aluminum frame","Ideal for work and gaming"]`,
			specifications: `[["Switches","Hot-swappable mechanical"],["Lighting","RGB backlight"],["Layout","Compact full-size"],["Connection","USB-C"]]`,
			delivery:       "Ships boxed with cable and switch puller included.",
		},
		{
			id:             3,
			category:       "Accessories",
			brand:          "Anker",
			rating:         4.6,
			tone:           "from-slate-900 to-slate-500",
			subtitle:       "6-in-1 USB-C hub",
			image:          "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","HDMI output","SD card reader"]`,
			highlights:     `["Single-cable desk setup","Laptop and tablet friendly","Compact aluminum build"]`,
			specifications: `[["Ports","HDMI, USB-A, USB-C, SD"],["Video","Up to 4K HDMI"],["Material","Aluminum"],["Use","Workstation expansion"]]`,
			delivery:       "Ships in a slim box with setup guide.",
		},
		{
			id:             4,
			category:       "Accessories",
			brand:          "Baseus",
			rating:         4.5,
			tone:           "from-stone-100 to-emerald-100",
			subtitle:       "Adjustable laptop stand",
			image:          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Aluminum frame","Foldable design"]`,
			highlights:     `["Improves desk ergonomics","Stable anti-slip support","Easy to carry between workspaces"]`,
			specifications: `[["Material","Aluminum alloy"],["Adjustability","Multi-angle"],["Use","Laptops up to 16 inches"],["Finish","Anodized silver"]]`,
			delivery:       "Ships flat-packed with protective wrapping.",
		},
		{
			id:             5,
			category:       "Home & Living",
			brand:          "ErgoTune",
			originalPrice:  6990,
			rating:         4.7,
			tone:           "from-emerald-100 to-sky-100",
			subtitle:       "Ergonomic office chair",
			image:          "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Lumbar support","Breathable mesh back"]`,
			highlights:     `["Comfort for long desk sessions","Height and tilt adjustments","Supportive seat cushioning"]`,
			specifications: `[["Material","Mesh and foam"],["Adjustments","Height, tilt, armrests"],["Base","Five-wheel caster base"],["Use","Home office"]]`,
			delivery:       "Large-item delivery with scheduled arrival window.",
		},
		{
			id:             6,
			category:       "Sports",
			brand:          "Manduka",
			rating:         4.8,
			tone:           "from-rose-100 to-orange-100",
			subtitle:       "Non-slip yoga mat",
			image:          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Non-slip texture","Carrying strap included"]`,
			highlights:     `["Comfortable floor support","Easy to roll and store","Good grip for workouts"]`,
			specifications: `[["Length","183 cm"],["Thickness","6 mm"],["Material","High-density foam"],["Use","Yoga and stretching"]]`,
			delivery:       "Ships wrapped and ready for gifting or daily use.",
		},
		{
			id:             7,
			category:       "Sports",
			brand:          "Bowflex",
			rating:         4.6,
			tone:           "from-neutral-950 to-neutral-500",
			subtitle:       "Adjustable dumbbell set",
			image:          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Compact storage","Adjustable resistance"]`,
			highlights:     `["Replaces multiple weights","Quick-change selector","Suitable for home training"]`,
			specifications: `[["Weight range","2.5-24 kg"],["Adjustment","Dial system"],["Storage","Compact tray"],["Use","Strength training"]]`,
			delivery:       "Heavy-item shipping with reinforced packaging.",
		},
		{
			id:             8,
			category:       "Home & Living",
			brand:          "Philips",
			rating:         4.7,
			tone:           "from-slate-50 to-amber-100",
			subtitle:       "5L digital air fryer",
			image:          "https://images.unsplash.com/photo-1585515656791-1f8e8c7cc7c7?auto=format&fit=crop&w=900&q=80",
			features:       `["In Stock","Preset cooking modes","Easy-clean basket"]`,
			highlights:     `["Crispy results with less oil","Simple digital controls","Great for weeknight meals"]`,
			specifications: `[["Capacity","5 liters"],["Controls","Digital touch panel"],["Programs","Multiple presets"],["Cleaning","Non-stick removable basket"]]`,
			delivery:       "Ships in sealed retail packaging with manual included.",
		},
	}

	for _, update := range updates {
		if _, err := database.Exec(
			`UPDATE products
			 SET category = CASE WHEN COALESCE(category, '') = '' THEN ? ELSE category END,
			     brand = CASE WHEN COALESCE(brand, '') = '' THEN ? ELSE brand END,
			     original_price = COALESCE(original_price, ?),
			     rating = CASE WHEN rating <= 0 THEN ? ELSE rating END,
			     tone = CASE WHEN COALESCE(tone, '') = '' THEN ? ELSE tone END,
			     subtitle = CASE WHEN COALESCE(subtitle, '') = '' THEN ? ELSE subtitle END,
			     image = CASE WHEN COALESCE(image, '') = '' THEN ? ELSE image END,
			     features = CASE WHEN COALESCE(features, '') IN ('', '[]') THEN ? ELSE features END,
			     highlights = CASE WHEN COALESCE(highlights, '') IN ('', '[]') THEN ? ELSE highlights END,
			     specifications = CASE WHEN COALESCE(specifications, '') IN ('', '[]') THEN ? ELSE specifications END,
			     delivery = CASE WHEN COALESCE(delivery, '') = '' THEN ? ELSE delivery END
			 WHERE id = ?`,
			update.category,
			update.brand,
			update.originalPrice,
			update.rating,
			update.tone,
			update.subtitle,
			update.image,
			update.features,
			update.highlights,
			update.specifications,
			update.delivery,
			update.id,
		); err != nil {
			return fmt.Errorf("backfill product %d: %w", update.id, err)
		}
	}

	return nil
}
