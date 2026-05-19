"use client";

import { useEffect, useState } from "react";
import { CustomerHeader, StorefrontFooter } from "@/components/storefront/CustomerHeader";
import { DataTable, OrderSummary } from "@/components/storefront/StorefrontUi";
import { formatBaht } from "@/lib/cartMath.mjs";
import { getAuthToken } from "@/lib/authSession.mjs";
import { fetchCustomerOrders } from "@/lib/products.mjs";

type CustomerOrder = {
  id: number;
  total_amount: number;
  status: string;
  items: Array<{ fulfillment_status: string }>;
};

type OrdersPageProps = {
  userEmail?: string;
  onSignOut: () => void;
};

export function OrdersPage({ userEmail, onSignOut }: OrdersPageProps) {
  const [showConfirmation] = useState(readOrderPlacedFlag);
  const [confirmationTotals] = useState(readOrderSummary);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("smallc:orderPlaced");
      window.sessionStorage.removeItem("smallc:orderSummary");
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");
        const token = getAuthToken();
        const nextOrders = await fetchCustomerOrders(token ?? "");
        if (isActive) {
          setOrders(nextOrders);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const latestOrder = orders[0];
  const orderRows = orders.map((order) => [
    `SC${String(order.id).padStart(8, "0")}`,
    sentenceCase(order.status),
    summarizeFulfillment(order.items),
    formatBaht(order.total_amount),
  ]);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CustomerHeader onSignOut={onSignOut} userEmail={userEmail} />

      <section className="m-3 grid gap-5 max-xl:grid-cols-1 xl:grid-cols-[320px_320px_1fr]">
        {showConfirmation ? (
          <article className="rounded-lg border border-slate-200 p-5">
            <span className="grid size-12 place-items-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-700">
              ✓
            </span>
            <h1 className="mt-4 text-2xl font-black">Thank you for your order!</h1>
            <p className="text-slate-500">Your payment was successful.</p>
            <OrderSummary totals={confirmationTotals} />
          </article>
        ) : null}

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">Order Timeline</h2>
          {["Order Placed", "Payment Confirmed", "Processing", "Shipped", "Delivered"].map(
            (step, index) => (
              <p className="mt-4 flex gap-3" key={step}>
                <span
                  className={`mt-1 size-3 rounded-full ${index < timelineStepCount(latestOrder) ? "bg-emerald-600" : "bg-slate-300"}`}
                />
                {step}
              </p>
            ),
          )}
        </article>

        <article className="rounded-lg border border-slate-200 p-5">
          <h2 className="text-2xl font-black">My Orders</h2>
          {loading ? (
            <p className="mt-4 text-slate-500">Loading orders...</p>
          ) : error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </p>
          ) : orderRows.length ? (
            <DataTable
              headers={["Order ID", "Payment", "Fulfillment", "Total"]}
              rows={orderRows}
            />
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No orders yet. Place your first order from the shop.
            </p>
          )}
        </article>
      </section>

      <StorefrontFooter />
    </main>
  );
}

function sentenceCase(value: string) {
  if (!value) {
    return "Pending";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readOrderPlacedFlag() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem("smallc:orderPlaced") === "true";
}

function readOrderSummary() {
  const emptySummary = {
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    appliedCoupon: "",
  };

  if (typeof window === "undefined") {
    return emptySummary;
  }

  const rawSummary = window.sessionStorage.getItem("smallc:orderSummary");
  if (!rawSummary) {
    return emptySummary;
  }

  try {
    return JSON.parse(rawSummary);
  } catch {
    return emptySummary;
  }
}

function summarizeFulfillment(items: Array<{ fulfillment_status: string }>) {
  if (!items.length) {
    return "Pending";
  }

  if (items.every((item) => item.fulfillment_status === "delivered")) {
    return "Delivered";
  }

  if (items.some((item) => item.fulfillment_status === "shipped")) {
    return "Shipped";
  }

  if (items.some((item) => item.fulfillment_status === "processing")) {
    return "Processing";
  }

  return "Pending";
}

function timelineStepCount(order?: CustomerOrder) {
  if (!order) {
    return 1;
  }

  if (order.status === "paid") {
    const fulfillment = summarizeFulfillment(order.items);
    if (fulfillment === "Delivered") {
      return 5;
    }
    if (fulfillment === "Shipped") {
      return 4;
    }
    return 3;
  }

  return 1;
}
