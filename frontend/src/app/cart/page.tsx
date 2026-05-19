"use client";

import { CartPage } from "@/components/storefront/CartPage";
import { CustomerRoute } from "@/components/storefront/CustomerRoute";

export default function Cart() {
  return (
    <CustomerRoute>
      {(props) => <CartPage {...props} />}
    </CustomerRoute>
  );
}
