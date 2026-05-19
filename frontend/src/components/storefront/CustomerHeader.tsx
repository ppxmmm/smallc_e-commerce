"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/authSession.mjs";
import { getCartCount, subscribeToCartUpdates } from "@/lib/cartStorage.mjs";
import { getDisplayName } from "@/lib/displayName.mjs";
import { getWishlistCount, subscribeToWishlistUpdates } from "@/lib/wishlistStorage.mjs";
import { HeaderUserMenu } from "@/components/storefront/HeaderUserMenu";

type CustomerHeaderProps = {
  userEmail?: string;
  onSignOut: () => void;
};

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Shop", href: "/home#shop" },
  { label: "Orders", href: "/orders" },
];

export function CustomerHeader({ userEmail, onSignOut }: CustomerHeaderProps) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const authUser = getAuthUser();
  const displayName = getDisplayName({
    name: authUser?.name,
    email: userEmail ?? authUser?.email,
  });

  useEffect(() => {
    const syncCart = () => setCartCount(getCartCount());
    const syncWishlist = () => setWishlistCount(getWishlistCount());
    syncCart();
    syncWishlist();
    const unsubscribeCart = subscribeToCartUpdates(syncCart);
    const unsubscribeWishlist = subscribeToWishlistUpdates(syncWishlist);
    return () => {
      unsubscribeCart();
      unsubscribeWishlist();
    };
  }, []);

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-4 px-6 py-3">
        <Link className="text-3xl font-black tracking-normal" href="/home">
          small<span className="text-emerald-600">C</span>
        </Link>

        <nav
          className="flex gap-6 text-sm font-semibold"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              className={
                pathname === item.href || (item.href === "/home#shop" && pathname === "/home")
                  ? "text-emerald-700"
                  : "hover:text-emerald-700"
              }
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {displayName ? <HeaderUserMenu displayName={displayName} onSignOut={onSignOut} /> : null}

        <Link
          aria-label={`Favourites with ${wishlistCount} items`}
          className={`relative grid size-10 place-items-center rounded-lg border font-semibold transition ${wishlistCount > 0 ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500"}`}
          href="/wishlist"
        >
          <HeaderHeartIcon filled={wishlistCount > 0} />
          {wishlistCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {wishlistCount}
            </span>
          ) : null}
        </Link>

        <Link
          className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 font-semibold text-white"
          data-testid="cart-button"
          href="/cart"
          aria-label={`Cart with ${cartCount} items`}
        >
          <CartIcon />
          <span>Cart {cartCount}</span>
        </Link>
      </div>
    </header>
    <div aria-hidden="true" className="h-16 shrink-0" />
    </>
  );
}

function HeaderHeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      viewBox="0 0 24 24"
    >
      <path d="M12 21s-7.2-4.35-9.9-8.55C-.5 8.55 2.4 4 6.6 4c2.1 0 3.3 1.05 4.2 2.25C11.7 5.05 12.9 4 15 4c4.2 0 7.1 4.55 4.5 8.45C19.2 16.65 12 21 12 21Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 6h15l-1.5 9h-12L6 6Z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="m-3 rounded-lg border border-slate-200 bg-slate-950 px-6 py-8 text-slate-300">
      <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
        <div>
          <Link className="text-3xl font-black tracking-normal text-white" href="/home">
            small<span className="text-emerald-400">C</span>
          </Link>
          <p className="mt-4 max-w-sm leading-7 text-slate-400">
            Everyday essentials, electronics, home goods, and fashion delivered with secure checkout
            and friendly customer support.
          </p>
          <div className="mt-5 flex gap-2">
            {["Facebook", "Instagram", "TikTok"].map((item) => (
              <a
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:border-emerald-400 hover:text-white"
                href="#"
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-black text-white">Shop</h2>
          <nav className="mt-4 grid gap-3 text-sm" aria-label="Footer shop links">
            {["Electronics", "Fashion", "Beauty", "Home & Living"].map((item) => (
              <Link className="hover:text-white" href="/home#shop" key={item}>
                {item}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="font-black text-white">Support</h2>
          <nav className="mt-4 grid gap-3 text-sm" aria-label="Footer support links">
            {["Customer support", "Shipping", "Returns", "Track order"].map((item) => (
              <Link className="hover:text-white" href="/orders" key={item}>
                {item}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="font-black text-white">Contact</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            <span>support@smallc.store</span>
            <span>Bangkok fulfillment center</span>
            <span>Secure payments: Visa · Mastercard · PromptPay</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-4 border-t border-slate-800 pt-5 text-sm text-slate-500 max-md:flex-col">
        <span>© 2026 smallC. All rights reserved.</span>
        <span>Privacy policy · Terms and conditions</span>
      </div>
    </footer>
  );
}
