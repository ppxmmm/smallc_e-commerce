"use client";

import { CheckoutPage } from "@/components/storefront/CheckoutPage";
import { CustomerRoute } from "@/components/storefront/CustomerRoute";

export default function Checkout() {
  return (
    <CustomerRoute>
      {(props) => <CheckoutPage {...props} />}
    </CustomerRoute>
  );
}
