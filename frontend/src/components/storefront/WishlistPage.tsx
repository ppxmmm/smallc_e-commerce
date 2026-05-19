"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import { ProductArt } from "@/components/storefront/StorefrontUi";
import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";
import { useCartActions } from "@/hooks/useCartActions";
import { formatBaht } from "@/lib/cartMath.mjs";
import { products } from "@/lib/products.mjs";
import {
  getWishlist,
  removeFromWishlist,
  subscribeToWishlistUpdates,
} from "@/lib/wishlistStorage.mjs";

type WishlistPageProps = {
  userEmail?: string;
  onSignOut: () => void;
};

function enrichWishlistItem(item: StorefrontProduct): StorefrontProduct {
  const catalogProduct = products.find((product) => product.id === item.id);
  return catalogProduct ? { ...catalogProduct, ...item } : item;
}

export function WishlistPage({ userEmail, onSignOut }: WishlistPageProps) {
  const { addToCart } = useCartActions();
  const [items, setItems] = useState<StorefrontProduct[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setItems(getWishlist().map(enrichWishlistItem));
    sync();
    return subscribeToWishlistUpdates(sync);
  }, []);

  function handleAddToCart(product: StorefrontProduct) {
    addToCart(enrichWishlistItem(product));
    setMessage(`Added ${product.name} to cart`);
    window.setTimeout(() => setMessage(""), 2500);
  }

  function handleRemove(productId: number) {
    removeFromWishlist(productId);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      {message ? (
        <p
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <section className="m-3 max-w-4xl rounded-lg border border-slate-200 p-6">
        <h1 className="text-3xl font-black">Favourites</h1>
        <p className="mt-1 text-slate-500">Products you saved for later.</p>

        {items.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            No favourites yet. Tap the heart on any product to save it here.{" "}
            <Link className="font-bold text-emerald-700" href="/home#shop">
              Browse shop
            </Link>
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100">
            {items.map((product) => (
              <li
                className="grid grid-cols-[72px_1fr] gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[72px_1fr_auto]"
                key={product.id}
              >
                <Link
                  className="block shrink-0"
                  href={`/products/${product.id}`}
                >
                  <ProductArt product={product} thumbnail />
                </Link>

                <div className="min-w-0">
                  <Link
                    className="font-bold leading-snug hover:text-emerald-700"
                    href={`/products/${product.id}`}
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{formatBaht(product.price)}</p>
                  <button
                    className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
                    onClick={() => handleRemove(product.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>

                <div className="col-span-2 flex gap-2 sm:col-span-1 sm:flex-col sm:items-stretch">
                  <button
                    className="h-10 flex-1 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 sm:flex-none"
                    onClick={() => handleAddToCart(product)}
                    type="button"
                  >
                    Add to cart
                  </button>
                  <Link
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 sm:flex-none"
                    href={`/products/${product.id}`}
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StorefrontFooter />
    </main>
  );
}
