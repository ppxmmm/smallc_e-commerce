"use client";

import { useEffect, useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import { DataTable, OrderSummary } from "@/components/storefront/StorefrontUi";
import { calculateCart } from "@/lib/cartMath.mjs";
import { getAppliedCoupon, getCart } from "@/lib/cartStorage.mjs";
import { customerOrderRows } from "@/lib/products.mjs";

type OrdersPageProps = {
  userEmail?: string;
  onSignOut: () => void;
};

export function OrdersPage({ userEmail, onSignOut }: OrdersPageProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const totals = calculateCart(getCart(), getAppliedCoupon());

  useEffect(() => {
    const placed = window.sessionStorage.getItem("smallc:orderPlaced") === "true";
    setShowConfirmation(placed);
    if (placed) {
      window.sessionStorage.removeItem("smallc:orderPlaced");
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      <section className="m-3 grid gap-5 max-xl:grid-cols-1 xl:grid-cols-[320px_320px_1fr]">
        {showConfirmation ? (
          <article className="rounded-lg border border-slate-200 p-5">
            <span className="grid size-12 place-items-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-700">
              ✓
            </span>
            <h1 className="mt-4 text-2xl font-black">Thank you for your order!</h1>
            <p className="text-slate-500">Your payment was successful.</p>
            <OrderSummary totals={totals} />
          </article>
        ) : null}

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">Order Timeline</h2>
          {["Order Placed", "Payment Confirmed", "Processing", "Shipped", "Delivered"].map(
            (step, index) => (
              <p className="mt-4 flex gap-3" key={step}>
                <span
                  className={`mt-1 size-3 rounded-full ${index < 3 ? "bg-emerald-600" : "bg-slate-300"}`}
                />
                {step}
              </p>
            ),
          )}
        </article>

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">My Orders</h2>
          <DataTable
            headers={["Order ID", "Payment", "Fulfillment", "Total"]}
            rows={customerOrderRows}
          />
        </article>
      </section>

      <StorefrontFooter />
    </main>
  );
}
