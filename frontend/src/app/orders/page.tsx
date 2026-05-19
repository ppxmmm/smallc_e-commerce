"use client";

import { CustomerRoute } from "@/components/storefront/CustomerRoute";
import { OrdersPage } from "@/components/storefront/OrdersPage";

export default function Orders() {
  return (
    <CustomerRoute>
      {(props) => <OrdersPage {...props} />}
    </CustomerRoute>
  );
}
