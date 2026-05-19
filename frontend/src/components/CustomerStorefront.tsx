"use client";

import { useMemo, useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import {
  ProductArt,
  ProductGrid,
  Section,
} from "@/components/storefront/StorefrontUi";
import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";
import { ProductSearchBar } from "@/components/storefront/ProductSearchBar";
import { useCartActions } from "@/hooks/useCartActions";
import { categories, products } from "@/lib/products.mjs";

type CustomerStorefrontProps = {
  userEmail?: string;
  onSignOut: () => void;
};

export function CustomerStorefront({ userEmail, onSignOut }: CustomerStorefrontProps) {
  const { addToCart } = useCartActions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Best selling");
  const [cartMessage, setCartMessage] = useState("");

  function handleAddToCart(product: StorefrontProduct) {
    addToCart(product);
    setCartMessage(`Added ${product.name} to cart`);
    window.setTimeout(() => setCartMessage(""), 2500);
  }

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

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      {cartMessage ? (
        <p
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
          role="status"
        >
          {cartMessage}
        </p>
      ) : null}

      <section
        id="home"
        className="mx-2 grid min-h-[320px] grid-cols-[0.65fr_1.35fr] overflow-hidden rounded-b-lg border border-t-0 border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50 px-16 py-14 max-md:grid-cols-1 max-md:px-6"
      >
        <div className="self-center">
          <h1 className="max-w-xl text-6xl font-black leading-none tracking-normal max-md:text-4xl">
            New Season Sale
          </h1>
          <p className="mt-5 text-2xl text-slate-700 max-md:text-lg">
            Up to 50% off selected items
          </p>
          <a
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-emerald-600 px-8 font-bold text-white hover:bg-emerald-700"
            href="#shop"
          >
            Shop Now
          </a>
        </div>
        <div className="grid grid-cols-3 gap-5 max-md:mt-8">
          {products.slice(0, 6).map((product) => (
            <ProductArt product={product} key={product.id} large />
          ))}
        </div>
      </section>

      <section className="mx-2 grid grid-cols-4 border-x border-b border-slate-200 max-lg:grid-cols-2 max-md:grid-cols-1">
        {[
          "Free Shipping|On orders over ฿999",
          "30-Day Returns|No questions asked",
          "Secure Payments|100% secure checkout",
          "Customer Support|24/7 support center",
        ].map((item) => {
          const [title, text] = item.split("|");
          return (
            <article
              className="flex gap-4 border-r border-slate-200 px-10 py-6 last:border-r-0"
              key={title}
            >
              <span className="grid size-8 place-items-center rounded-lg border border-emerald-200 text-emerald-700">
                ✓
              </span>
              <div>
                <strong>{title}</strong>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </article>
          );
        })}
      </section>

      <Section id="categories" title="Shop by Category" subtitle="Browse our top categories">
        <div className="grid grid-cols-6 gap-4 max-lg:grid-cols-3 max-md:grid-cols-1">
          {categories.slice(1).map((item, index) => (
            <button
              className="rounded-lg border border-slate-200 p-4 text-center hover:border-emerald-400"
              onClick={() => setCategory(item)}
              key={item}
              type="button"
            >
              <div className="mb-3 h-24 rounded-lg bg-gradient-to-br from-slate-50 to-sky-100" />
              <strong>{item}</strong>
              <p className="text-sm text-slate-500">
                {[2345, 4120, 1876, 1230, 2642, 1118][index].toLocaleString()} products
              </p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Featured Products" subtitle="Hand-picked just for you">
        <ProductGrid products={products.slice(0, 6)} onAdd={handleAddToCart} />
      </Section>

      <section
        id="flash-sale"
        className="m-3 grid grid-cols-[260px_1fr] gap-5 rounded-lg border border-red-100 bg-red-50/30 p-5 max-lg:grid-cols-1"
      >
        <aside>
          <h2 className="text-2xl font-black text-red-500">Flash Sale</h2>
          <p className="mt-1 text-slate-600">Limited time, limited stock</p>
          <div className="my-6 grid grid-cols-4 gap-2">
            {["02 Days", "14 Hours", "35 Mins", "48 Secs"].map((item) => (
              <span
                className="rounded-lg bg-red-500 p-3 text-center text-sm font-black text-white"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <a
            className="inline-flex h-11 items-center rounded-lg bg-red-500 px-6 font-bold text-white"
            href="#shop"
          >
            View All Deals
          </a>
        </aside>
        <ProductGrid products={products.slice(0, 5)} onAdd={handleAddToCart} compact />
      </section>

      <Section
        id="shop"
        title="Shop - Explore Products"
        subtitle={`Showing ${filteredProducts.length} of ${products.length} products`}
      >
        <div className="grid grid-cols-[230px_1fr] gap-5 max-lg:grid-cols-1">
          <aside className="rounded-lg border border-slate-200 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black">Filters</h3>
              <button
                className="text-sm font-bold text-emerald-700"
                onClick={() => setCategory("All")}
                type="button"
              >
                Clear All
              </button>
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-2 font-bold">Category</legend>
              {categories.map((item) => (
                <label className="flex gap-2 text-sm text-slate-700" key={item}>
                  <input
                    checked={category === item}
                    onChange={() => setCategory(item)}
                    type="radio"
                  />
                  {item}
                </label>
              ))}
            </fieldset>
          </aside>
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <ProductSearchBar onChange={setQuery} value={query} />
              <label className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
                Sort by:
                <select
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 shadow-sm"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option>Best selling</option>
                  <option>Lowest price</option>
                  <option>Highest price</option>
                  <option>Best rated</option>
                </select>
              </label>
            </div>
            {filteredProducts.length ? (
              <ProductGrid products={filteredProducts} onAdd={handleAddToCart} />
            ) : (
              <div
                className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center"
                data-testid="empty-state"
              >
                <h3 className="text-xl font-black">No products found.</h3>
                <p className="mt-2 text-slate-500">
                  Try changing your search or filter options.
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <StorefrontFooter />
    </main>
  );
}
