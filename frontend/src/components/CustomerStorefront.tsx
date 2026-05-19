"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { calculateCart, formatBaht } from "@/lib/cartMath.mjs";

type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  original?: number;
  rating: number;
  stock: number;
  tone: string;
};

type CartItem = Product & { quantity: number };

const products: Product[] = [
  { id: 1, name: "Soundcore Life Q30", category: "Electronics", brand: "Soundcore", price: 2590, original: 3990, rating: 4.8, stock: 24, tone: "from-slate-900 to-slate-500" },
  { id: 2, name: "Uniqlo U Crew Neck T-Shirt", category: "Fashion", brand: "Uniqlo", price: 390, rating: 4.7, stock: 58, tone: "from-stone-100 to-emerald-100" },
  { id: 3, name: "The Ordinary Niacinamide 10%", category: "Beauty", brand: "The Ordinary", price: 320, rating: 4.9, stock: 32, tone: "from-sky-100 to-white" },
  { id: 4, name: "Baseus 100W GaN Charger", category: "Accessories", brand: "Baseus", price: 1290, original: 1590, rating: 4.6, stock: 18, tone: "from-zinc-900 to-zinc-500" },
  { id: 5, name: "IKEA KALLAX Shelf Unit", category: "Home & Living", brand: "IKEA", price: 2990, rating: 4.5, stock: 12, tone: "from-emerald-100 to-sky-100" },
  { id: 6, name: "Nike Air Max 270", category: "Sports", brand: "Nike", price: 4290, rating: 4.7, stock: 7, tone: "from-rose-100 to-orange-100" },
  { id: 7, name: "Casio G-Shock GA-2100", category: "Accessories", brand: "Casio", price: 4590, rating: 4.9, stock: 5, tone: "from-neutral-950 to-neutral-500" },
  { id: 8, name: "Samsung Galaxy Buds2", category: "Electronics", brand: "Samsung", price: 3190, rating: 4.6, stock: 16, tone: "from-slate-100 to-sky-200" },
];

const categories = ["All", "Electronics", "Fashion", "Beauty", "Accessories", "Home & Living", "Sports"];
const orderRows = [
  ["SC250517-0036", "Somchai C.", "Paid", "Processing", "฿3,040"],
  ["SC250517-0005", "Nattaporn R.", "Paid", "Packed", "฿1,290"],
  ["SC250509-0064", "Worawut K.", "Paid", "Delivered", "฿3,590"],
  ["SC250426-0011", "May P.", "Refunded", "Returned", "฿1,090"],
];

type CustomerStorefrontProps = {
  userEmail?: string;
  onSignOut: () => void;
};

export function CustomerStorefront({ userEmail, onSignOut }: CustomerStorefrontProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Best selling");
  const [cart, setCart] = useState<CartItem[]>([
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 1 },
  ]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [payment, setPayment] = useState("Credit/Debit Card (Mock)");
  const [paymentState, setPaymentState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const searchable = `${product.name} ${product.category} ${product.brand}`.toLowerCase();
      return searchable.includes(value) && (category === "All" || product.category === category);
    });

    return filtered.sort((a, b) => {
      if (sort === "Lowest price") return a.price - b.price;
      if (sort === "Highest price") return b.price - a.price;
      if (sort === "Best rated") return b.rating - a.rating;
      return b.stock - a.stock;
    });
  }, [category, query, sort]);

  const totals = calculateCart(cart, appliedCoupon);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: Product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { ...product, quantity: 1 }];
    });
  }

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedCoupon(coupon);
  }

  function placeOrder() {
    setPaymentState("loading");
    window.setTimeout(() => setPaymentState(payment === "Cash on Delivery" ? "error" : "success"), 500);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-20 grid grid-cols-[auto_1fr_minmax(220px,440px)_auto_auto] items-center gap-5 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur max-lg:grid-cols-[auto_1fr_auto]">
        <a className="text-3xl font-black tracking-normal" href="#home">small<span className="text-emerald-600">C</span></a>
        <nav className="flex gap-6 text-sm font-semibold max-lg:hidden" aria-label="Primary navigation">
          {["Home", "Shop", "Categories", "Flash Sale", "Orders", "Profile"].map((item) => (
            <a className="hover:text-emerald-700" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</a>
          ))}
        </nav>
        <label className="flex h-10 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-500 max-lg:col-span-3">
          <span className="sr-only">Search for products</span>
          <input
            data-testid="global-search"
            aria-label="Search for products"
            className="w-full outline-none"
            placeholder="Search for products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button className="h-10 rounded-lg border border-slate-200 px-3 font-semibold" aria-label="Wishlist">♡</button>
        <button className="h-10 rounded-lg bg-emerald-600 px-4 font-semibold text-white" data-testid="cart-button" aria-label={`Cart with ${cartCount} items`}>Cart {cartCount}</button>
        <div className="col-span-full flex items-center justify-end gap-3 border-t border-slate-100 pt-2 text-sm max-lg:col-span-3">
          {userEmail ? <span className="text-slate-600">Signed in as {userEmail}</span> : null}
          <button className="font-bold text-emerald-700 hover:text-emerald-900" onClick={onSignOut} type="button">
            Sign out
          </button>
        </div>
      </header>

      <section id="home" className="mx-2 grid min-h-[320px] grid-cols-[0.65fr_1.35fr] overflow-hidden rounded-b-lg border border-t-0 border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50 px-16 py-14 max-md:grid-cols-1 max-md:px-6">
        <div className="self-center">
          <h1 className="max-w-xl text-6xl font-black leading-none tracking-normal max-md:text-4xl">New Season Sale</h1>
          <p className="mt-5 text-2xl text-slate-700 max-md:text-lg">Up to 50% off selected items</p>
          <a className="mt-8 inline-flex h-12 items-center rounded-lg bg-emerald-600 px-8 font-bold text-white hover:bg-emerald-700" href="#shop">Shop Now</a>
        </div>
        <div className="grid grid-cols-3 gap-5 max-md:mt-8">
          {products.slice(0, 6).map((product) => <ProductArt product={product} key={product.id} large />)}
        </div>
      </section>

      <section className="mx-2 grid grid-cols-4 border-x border-b border-slate-200 max-lg:grid-cols-2 max-md:grid-cols-1">
        {["Free Shipping|On orders over ฿999", "30-Day Returns|No questions asked", "Secure Payments|100% secure checkout", "Customer Support|24/7 support center"].map((item) => {
          const [title, text] = item.split("|");
          return <article className="flex gap-4 border-r border-slate-200 px-10 py-6 last:border-r-0" key={title}><span className="grid size-8 place-items-center rounded-lg border border-emerald-200 text-emerald-700">✓</span><div><strong>{title}</strong><p className="text-sm text-slate-500">{text}</p></div></article>;
        })}
      </section>

      <Section id="categories" title="Shop by Category" subtitle="Browse our top categories">
        <div className="grid grid-cols-6 gap-4 max-lg:grid-cols-3 max-md:grid-cols-1">
          {categories.slice(1).map((item, index) => (
            <button className="rounded-lg border border-slate-200 p-4 text-center hover:border-emerald-400" onClick={() => setCategory(item)} key={item}>
              <div className="mb-3 h-24 rounded-lg bg-gradient-to-br from-slate-50 to-sky-100" />
              <strong>{item}</strong>
              <p className="text-sm text-slate-500">{[2345, 4120, 1876, 1230, 2642, 1118][index].toLocaleString()} products</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Featured Products" subtitle="Hand-picked just for you">
        <ProductGrid products={products.slice(0, 6)} onAdd={addToCart} />
      </Section>

      <section id="flash-sale" className="m-3 grid grid-cols-[260px_1fr] gap-5 rounded-lg border border-red-100 bg-red-50/30 p-5 max-lg:grid-cols-1">
        <aside>
          <h2 className="text-2xl font-black text-red-500">Flash Sale</h2>
          <p className="mt-1 text-slate-600">Limited time, limited stock</p>
          <div className="my-6 grid grid-cols-4 gap-2">
            {["02 Days", "14 Hours", "35 Mins", "48 Secs"].map((item) => <span className="rounded-lg bg-red-500 p-3 text-center text-sm font-black text-white" key={item}>{item}</span>)}
          </div>
          <a className="inline-flex h-11 items-center rounded-lg bg-red-500 px-6 font-bold text-white" href="#shop">View All Deals</a>
        </aside>
        <ProductGrid products={products.slice(0, 5)} onAdd={addToCart} compact />
      </section>

      <Section id="shop" title="Shop - Explore Products" subtitle={`Showing ${filteredProducts.length} of ${products.length} products`}>
        <div className="grid grid-cols-[230px_1fr_300px] gap-5 max-xl:grid-cols-[220px_1fr] max-lg:grid-cols-1">
          <aside className="rounded-lg border border-slate-200 p-5">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-black">Filters</h3><button className="text-sm font-bold text-emerald-700" onClick={() => setCategory("All")}>Clear All</button></div>
            <fieldset className="grid gap-2">
              <legend className="mb-2 font-bold">Category</legend>
              {categories.map((item) => <label className="flex gap-2 text-sm text-slate-700" key={item}><input checked={category === item} onChange={() => setCategory(item)} type="radio" />{item}</label>)}
            </fieldset>
            <fieldset className="mt-6 grid gap-2">
              <legend className="mb-2 font-bold">Rating</legend>
              {["4 stars and above", "In stock only", "Discount products"].map((item) => <label className="flex gap-2 text-sm text-slate-700" key={item}><input type="checkbox" />{item}</label>)}
            </fieldset>
          </aside>
          <div>
            <div className="mb-4 flex justify-end">
              <label className="flex items-center gap-2 text-sm text-slate-500">Sort by:
                <select className="h-10 rounded-lg border border-slate-200 px-3 text-slate-900" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option>Best selling</option><option>Lowest price</option><option>Highest price</option><option>Best rated</option>
                </select>
              </label>
            </div>
            {filteredProducts.length ? <ProductGrid products={filteredProducts} onAdd={addToCart} /> : <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center" data-testid="empty-state"><h3 className="text-xl font-black">No products found.</h3><p className="mt-2 text-slate-500">Try changing your search or filter options.</p></div>}
          </div>
          <aside className="rounded-lg border border-slate-200 p-4 max-xl:hidden">
            <div className="mb-3 flex justify-between"><strong className="text-2xl">small<span className="text-emerald-600">C</span></strong><span>♡ Cart</span></div>
            <div className="rounded-lg bg-gradient-to-br from-slate-50 to-emerald-50 p-5"><h3 className="text-2xl font-black">New Season Sale</h3><button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Shop Now</button></div>
            <ProductCard product={products[0]} onAdd={addToCart} compact />
          </aside>
        </div>
      </Section>

      <section className="m-3 grid grid-cols-[1.2fr_0.8fr_1fr] gap-5 rounded-lg border border-slate-200 p-5 max-xl:grid-cols-1">
        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">Product Detail Preview</h2>
          <div className="mt-5 grid grid-cols-[1fr_0.9fr] gap-5 max-md:grid-cols-1">
            <ProductArt product={products[0]} large />
            <div>
              <h3 className="text-2xl font-black">{products[0].name}</h3>
              <p className="mt-1 text-slate-500">Wireless Headphones</p>
              <p className="mt-4 text-3xl font-black">{formatBaht(products[0].price)} <span className="text-base text-slate-400 line-through">{formatBaht(products[0].original ?? 0)}</span></p>
              <p className="mt-2 text-amber-500">★★★★★ <span className="text-slate-500">(412 reviews)</span></p>
              <ul className="my-4 list-disc pl-5 text-slate-600"><li>In Stock</li><li>Hi-Res Audio with LDAC</li><li>Active Noise Cancellation</li></ul>
              <button className="h-11 w-full rounded-lg bg-emerald-600 font-bold text-white" onClick={() => addToCart(products[0])}>Add to cart</button>
              <button className="mt-2 h-11 w-full rounded-lg border border-emerald-600 font-bold text-emerald-700">Buy now</button>
            </div>
          </div>
        </article>

        <article id="cart" className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">Cart & Checkout Preview</h2>
          <div className="my-5 grid gap-3">
            {cart.map((item) => <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3" key={item.id}><ProductArt product={item} /><div><strong className="block text-sm">{item.name}</strong><span className="text-sm text-slate-500">{formatBaht(item.price)} x {item.quantity}</span></div><span className="font-bold">{formatBaht(item.price * item.quantity)}</span></div>)}
          </div>
          <form className="grid grid-cols-[1fr_auto] gap-2" onSubmit={applyCoupon}>
            <input className="h-10 rounded-lg border border-slate-200 px-3" aria-label="Coupon code" placeholder="SAVE10 or FREESHIP" value={coupon} onChange={(event) => setCoupon(event.target.value)} />
            <button className="rounded-lg bg-emerald-600 px-5 font-bold text-white">Apply</button>
          </form>
          <Summary totals={totals} />
        </article>

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">Shipping & Payment</h2>
          <div className="my-5 grid grid-cols-2 gap-3">
            <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="Somchai Chaiwong" />
            <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="081 234 5678" />
            <input className="col-span-2 h-10 rounded-lg border border-slate-200 px-3" defaultValue="123 Sukhumvit Rd." />
            <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="Bangkok" />
            <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="10110" />
          </div>
          <div className="grid gap-2">
            {["Credit/Debit Card (Mock)", "PromptPay QR (Mock)", "Cash on Delivery"].map((method) => <label className="rounded-lg border border-slate-200 p-3" key={method}><input className="mr-2" checked={payment === method} onChange={() => { setPayment(method); setPaymentState("idle"); }} type="radio" />{method}</label>)}
          </div>
          <button className="mt-4 h-11 w-full rounded-lg bg-emerald-600 font-bold text-white disabled:opacity-60" disabled={paymentState === "loading"} onClick={placeOrder}>{paymentState === "loading" ? "Processing Payment..." : "Place Order"}</button>
          {paymentState === "success" && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-800">Payment successful. Your order has been placed.</p>}
          {paymentState === "error" && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 font-bold text-red-700">Payment failed. Please try again or use another payment method.</p>}
        </article>
      </section>

      <section id="orders" className="m-3 grid grid-cols-[320px_320px_1fr] gap-5 rounded-lg border border-slate-200 p-5 max-xl:grid-cols-1">
        <article className="rounded-lg border border-slate-200 p-5"><span className="grid size-12 place-items-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-700">✓</span><h2 className="mt-4 text-2xl font-black">Thank you for your order!</h2><p className="text-slate-500">Your payment was successful.</p><Summary totals={totals} /></article>
        <article className="rounded-lg border border-slate-200 p-5"><h2 className="text-2xl font-black">Order Timeline</h2>{["Order Placed", "Payment Confirmed", "Processing", "Shipped", "Delivered"].map((step, index) => <p className="mt-4 flex gap-3" key={step}><span className={`mt-1 size-3 rounded-full ${index < 3 ? "bg-emerald-600" : "bg-slate-300"}`} />{step}</p>)}</article>
        <article id="profile" className="rounded-lg border border-slate-200 p-5"><h2 className="text-2xl font-black">Profile & My Orders</h2><Table headers={["Order ID", "Customer", "Payment", "Fulfillment", "Total"]} rows={orderRows} /></article>
      </section>


      <footer className="m-3 flex justify-between gap-5 border-t border-slate-200 py-8 text-slate-500 max-md:flex-col"><strong className="text-2xl text-slate-950">smallC</strong><span>Contact · About us · Privacy policy · Terms and conditions · Customer support</span><span>Facebook · Instagram · TikTok</span></footer>
    </main>
  );
}

function Section({ id, title, subtitle, children }: { id?: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section id={id} className="m-3 rounded-lg border border-slate-200 bg-white p-5"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{title}</h2><p className="mt-1 text-slate-500">{subtitle}</p></div><a className="font-bold text-emerald-700" href="#shop">View All</a></div>{children}</section>;
}

function ProductGrid({ products: items, onAdd, compact = false }: { products: Product[]; onAdd: (product: Product) => void; compact?: boolean }) {
  return <div className={`grid gap-4 ${compact ? "grid-cols-5 max-xl:grid-cols-3 max-md:grid-cols-1" : "grid-cols-4 max-xl:grid-cols-3 max-md:grid-cols-1"}`}>{items.map((product) => <ProductCard product={product} onAdd={onAdd} compact={compact} key={product.id} />)}</div>;
}

function ProductCard({ product, onAdd, compact = false }: { product: Product; onAdd: (product: Product) => void; compact?: boolean }) {
  return <article className="relative rounded-lg border border-slate-200 bg-white p-4"><button className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-slate-200 bg-white" aria-label={`Wishlist ${product.name}`}>♡</button>{compact && <span className="absolute left-3 top-3 rounded-md bg-red-500 px-2 py-1 text-xs font-black text-white">-35%</span>}<ProductArt product={product} large /><h3 className="mt-3 min-h-10 text-sm font-black">{product.name}</h3><p className="mt-2 font-black">{formatBaht(product.price)} {product.original && <span className="text-sm font-normal text-slate-400 line-through">{formatBaht(product.original)}</span>}</p><p className="mt-1 text-xs text-amber-500">★★★★★ <span className="text-slate-500">In Stock</span></p><button className="mt-3 h-10 w-full rounded-lg bg-emerald-600 text-sm font-bold text-white" data-testid={`add-product-${product.id}`} onClick={() => onAdd(product)}>Add to cart</button></article>;
}

function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className={`${large ? "h-36" : "size-12"} rounded-lg border border-slate-100 bg-gradient-to-br ${product.tone}`} aria-hidden="true" />;
}

function Summary({ totals }: { totals: ReturnType<typeof calculateCart> }) {
  return <dl className="mt-5 grid gap-2 border-t border-slate-200 pt-4 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBaht(totals.subtotal)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{formatBaht(totals.shipping)}</dd></div><div className="flex justify-between"><dt>Discount</dt><dd>-{formatBaht(totals.discount)}</dd></div><div className="flex justify-between text-lg font-black"><dt>Total</dt><dd>{formatBaht(totals.total)}</dd></div></dl>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr>{headers.map((header) => <th className="border-b border-slate-200 px-3 py-2 text-left text-slate-500" key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td className="border-b border-slate-100 px-3 py-2" key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
