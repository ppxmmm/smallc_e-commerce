"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import { OrderSummary, ProductArt } from "@/components/storefront/StorefrontUi";
import { calculateCart, formatBaht } from "@/lib/cartMath.mjs";
import {
  changeProductQuantity,
  getAppliedCoupon,
  getCart,
  removeProductFromCart,
  setAppliedCoupon,
  subscribeToCartUpdates,
} from "@/lib/cartStorage.mjs";

type CartPageProps = {
  userEmail?: string;
  onSignOut: () => void;
};

export function CartPage({ userEmail, onSignOut }: CartPageProps) {
  const [cart, setCart] = useState(getCart);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCouponState] = useState(getAppliedCoupon);

  useEffect(() => {
    const sync = () => {
      setCart(getCart());
      setAppliedCouponState(getAppliedCoupon());
    };
    sync();
    return subscribeToCartUpdates(sync);
  }, []);

  const totals = calculateCart(cart, appliedCoupon);

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedCoupon(coupon);
    setAppliedCouponState(coupon);
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      <section className="m-3 max-w-3xl rounded-lg border border-slate-200 p-6">
        <h1 className="text-3xl font-black">Your cart</h1>
        <p className="mt-1 text-slate-500">Review items before checkout.</p>

        <div className="my-6 grid gap-4">
          {cart.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Your cart is empty.{" "}
              <Link className="font-bold text-emerald-700" href="/home#shop">
                Continue shopping
              </Link>
            </p>
          ) : (
            cart.map((item) => (
              <div
                className="grid grid-cols-[48px_1fr_auto] items-start gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                key={item.id}
              >
                <ProductArt product={item} />
                <div className="min-w-0">
                  <strong className="block text-sm">{item.name}</strong>
                  <p className="mt-1 text-sm text-slate-500">{formatBaht(item.price)} each</p>
                  <button
                    className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
                    onClick={() => removeProductFromCart(item.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <QuantityStepper
                    onDecrease={() => changeProductQuantity(item.id, -1)}
                    onIncrease={() => changeProductQuantity(item.id, 1)}
                    productName={item.name}
                    quantity={item.quantity}
                  />
                  <span className="font-bold">{formatBaht(item.price * item.quantity)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="grid grid-cols-[1fr_auto] gap-2" onSubmit={applyCoupon}>
          <input
            className="h-10 rounded-lg border border-slate-200 px-3"
            aria-label="Coupon code"
            placeholder="SAVE10 or FREESHIP"
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
          />
          <button className="rounded-lg bg-emerald-600 px-5 font-bold text-white" type="submit">
            Apply
          </button>
        </form>

        <OrderSummary totals={totals} />

        {cart.length > 0 ? (
          <Link
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-emerald-600 px-6 font-bold text-white"
            href="/checkout"
          >
            Continue to checkout
          </Link>
        ) : null}
      </section>

      <StorefrontFooter />
    </main>
  );
}

function QuantityStepper({
  productName,
  quantity,
  onDecrease,
  onIncrease,
}: {
  productName: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200"
      role="group"
      aria-label={`Quantity for ${productName}`}
    >
      <button
        aria-label={`Decrease quantity of ${productName}`}
        className="grid size-9 place-items-center bg-slate-50 text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onDecrease}
        type="button"
      >
        −
      </button>
      <span className="min-w-10 border-x border-slate-200 px-2 text-center text-sm font-bold">
        {quantity}
      </span>
      <button
        aria-label={`Increase quantity of ${productName}`}
        className="grid size-9 place-items-center bg-slate-50 text-lg font-bold text-slate-700 transition hover:bg-slate-100"
        onClick={onIncrease}
        type="button"
      >
        +
      </button>
    </div>
  );
}
