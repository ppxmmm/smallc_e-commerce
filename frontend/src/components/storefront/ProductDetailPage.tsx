"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import { ProductArt, ProductGrid } from "@/components/storefront/StorefrontUi";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { formatBaht } from "@/lib/cartMath.mjs";
import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";
import { useCartActions } from "@/hooks/useCartActions";
import { products } from "@/lib/products.mjs";

type ProductDetailPageProps = {
  product: StorefrontProduct;
  userEmail?: string;
  onSignOut: () => void;
};

export function ProductDetailPage({ product, userEmail, onSignOut }: ProductDetailPageProps) {
  const router = useRouter();
  const { addToCart } = useCartActions();
  const [cartMessage, setCartMessage] = useState("");

  function handleAddToCart() {
    addToCart(product);
    setCartMessage(`Added ${product.name} to cart`);
    window.setTimeout(() => setCartMessage(""), 2500);
  }

  function handleBuyNow() {
    addToCart(product);
    router.push("/checkout");
  }

  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .concat(products.filter((item) => item.category !== product.category && item.id !== product.id))
    .slice(0, 4);

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      {cartMessage ? (
        <p
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
          role="status"
        >
          {cartMessage}
        </p>
      ) : null}

      <section className="m-3 rounded-lg border border-slate-200 bg-white p-6">
        <Link className="text-sm font-bold text-emerald-700 hover:text-emerald-900" href="/home#shop">
          ← Back to shop
        </Link>

        <div className="mt-6 grid grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-8 max-lg:grid-cols-1">
          <div className="grid gap-4">
            <ProductArt product={product} large />
            <div className="grid grid-cols-3 gap-3">
              {[product.name, product.category, product.brand].map((label) => (
                <div
                  className={`aspect-[4/3] overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br ${product.tone}`}
                  key={label}
                >
                  {product.image ? (
                    <Image
                      alt={`${product.name} ${label}`}
                      className="h-full w-full object-cover"
                      height={240}
                      loading="lazy"
                      src={product.image}
                      unoptimized
                      width={320}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-normal">
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                {product.stock} in stock
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                {product.category}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                {product.brand}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-black leading-tight max-md:text-3xl">
                {product.name}
              </h1>
              <WishlistButton product={product} />
            </div>
            <p className="mt-2 text-lg text-slate-600">{product.subtitle ?? product.category}</p>
            {product.description ? (
              <p className="mt-4 leading-7 text-slate-600">{product.description}</p>
            ) : null}
            <p className="mt-4 text-3xl font-black">
              {formatBaht(product.price)}{" "}
              {product.original ? (
                <span className="text-base text-slate-400 line-through">
                  {formatBaht(product.original)}
                </span>
              ) : null}
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-500">
              ★★★★★{" "}
              <span className="text-slate-500">
                {product.rating.toFixed(1)} rating · 412 reviews
              </span>
            </p>

            <ul className="my-5 grid gap-2 text-slate-600">
              {(product.features ?? ["In Stock"]).map((feature) => (
                <li className="flex gap-2" key={feature}>
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="h-11 w-full cursor-pointer rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              data-testid={`add-product-${product.id}`}
              onClick={handleAddToCart}
              type="button"
            >
              Add to cart
            </button>
            <button
              className="mt-2 h-11 w-full rounded-lg border border-emerald-600 font-bold text-emerald-700"
              onClick={handleBuyNow}
              type="button"
            >
              Buy now
            </button>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm max-md:grid-cols-1">
              {["Free returns", "Secure checkout", "Fast delivery"].map((item) => (
                <span className="rounded-lg border border-slate-200 px-3 py-2 font-semibold" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="m-3 grid grid-cols-[1fr_1fr_0.9fr] gap-4 max-lg:grid-cols-1">
        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-xl font-black">Product Details</h2>
          <ul className="mt-4 grid gap-3 text-slate-600">
            {(product.highlights ?? product.features ?? []).map((item) => (
              <li className="flex gap-3" key={item}>
                <span className="mt-2 size-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-xl font-black">Specifications</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            {(product.specifications ?? []).map(([label, value]) => (
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0" key={label}>
                <dt className="font-bold text-slate-500">{label}</dt>
                <dd className="text-right text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-xl font-black">Delivery & Support</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {product.delivery ?? "Ships quickly from our fulfillment center with tracking."}
          </p>
          <p className="mt-3 leading-7 text-slate-600">
            Every order includes secure payment processing and smallC customer support.
          </p>
        </article>
      </section>

      <section className="m-3 rounded-lg border border-slate-200 p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">You May Also Like</h2>
            <p className="mt-1 text-slate-500">More picks from smallC</p>
          </div>
          <Link className="font-bold text-emerald-700" href="/home#shop">
            View All
          </Link>
        </div>
        <ProductGrid products={relatedProducts} onAdd={handleAddToCart} compact />
      </section>

      <StorefrontFooter />
    </main>
  );
}
