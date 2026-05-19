"use client";

import { CustomerRoute } from "@/components/storefront/CustomerRoute";
import { WishlistPage } from "@/components/storefront/WishlistPage";

export default function Wishlist() {
  return (
    <CustomerRoute>
      {(props) => <WishlistPage {...props} />}
    </CustomerRoute>
  );
}
