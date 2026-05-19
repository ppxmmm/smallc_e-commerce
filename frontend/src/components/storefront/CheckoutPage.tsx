"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import { OrderSummary } from "@/components/storefront/StorefrontUi";
import { calculateCart } from "@/lib/cartMath.mjs";
import { getAuthToken } from "@/lib/authSession.mjs";
import { completeMockPayment, createOrder } from "@/lib/products.mjs";
import {
  getAppliedCoupon,
  getCart,
  setAppliedCoupon as persistAppliedCoupon,
  setCart as persistCart,
} from "@/lib/cartStorage.mjs";

type CheckoutPageProps = {
  userEmail?: string;
  onSignOut: () => void;
};

export function CheckoutPage({ userEmail, onSignOut }: CheckoutPageProps) {
  const router = useRouter();
  const [payment, setPayment] = useState("Credit/Debit Card (Mock)");
  const [paymentState, setPaymentState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [cart] = useState(getCart);
  const [appliedCoupon] = useState(getAppliedCoupon);

  const totals = calculateCart(cart, appliedCoupon);

  async function placeOrder() {
    if (payment === "Cash on Delivery") {
      setPaymentState("error");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setPaymentState("error");
      return;
    }

    setPaymentState("loading");

    try {
      const response = await createOrder(
        token,
        cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      );

      await completeMockPayment(token, response.order.id, response.payment.payment_ref, "paid");

      window.sessionStorage.setItem("smallc:orderPlaced", "true");
      window.sessionStorage.setItem("smallc:orderSummary", JSON.stringify(totals));
      persistCart([]);
      persistAppliedCoupon("");
      setPaymentState("success");
      router.push("/orders");
    } catch {
      setPaymentState("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      <section className="m-3 max-w-2xl rounded-lg border border-slate-200 p-6">
        <h1 className="text-3xl font-black">Checkout</h1>
        <p className="mt-1 text-slate-500">Shipping and payment details.</p>

        <div className="my-6 grid grid-cols-2 gap-3">
          <input
            className="h-10 rounded-lg border border-slate-200 px-3"
            defaultValue="Somchai Chaiwong"
          />
          <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="081 234 5678" />
          <input
            className="col-span-2 h-10 rounded-lg border border-slate-200 px-3"
            defaultValue="123 Sukhumvit Rd."
          />
          <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="Bangkok" />
          <input className="h-10 rounded-lg border border-slate-200 px-3" defaultValue="10110" />
        </div>

        <div className="grid gap-2">
          {["Credit/Debit Card (Mock)", "PromptPay QR (Mock)", "Cash on Delivery"].map((method) => (
            <label className="rounded-lg border border-slate-200 p-3" key={method}>
              <input
                className="mr-2"
                checked={payment === method}
                onChange={() => {
                  setPayment(method);
                  setPaymentState("idle");
                }}
                type="radio"
              />
              {method}
            </label>
          ))}
        </div>

        <OrderSummary totals={totals} />

        <button
          className="mt-4 h-11 w-full rounded-lg bg-emerald-600 font-bold text-white disabled:opacity-60"
          disabled={paymentState === "loading"}
          onClick={placeOrder}
          type="button"
        >
          {paymentState === "loading" ? "Processing Payment..." : "Place Order"}
        </button>

        {paymentState === "error" ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 font-bold text-red-700">
            Payment failed. Please try again or use another payment method.
          </p>
        ) : null}

        <Link className="mt-4 inline-block font-bold text-emerald-700" href="/cart">
          Back to cart
        </Link>
      </section>

      <StorefrontFooter />
    </main>
  );
}
