"use client";

import { useCallback, useEffect, useState } from "react";
import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";
import {
  getWishlist,
  getWishlistCount,
  isProductInWishlist,
  subscribeToWishlistUpdates,
  toggleWishlistProduct,
} from "@/lib/wishlistStorage.mjs";

export function useWishlist() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getWishlistCount());
    sync();
    return subscribeToWishlistUpdates(sync);
  }, []);

  const toggle = useCallback((product: StorefrontProduct) => {
    toggleWishlistProduct(product);
  }, []);

  return { count, items: getWishlist, toggle };
}

export function useWishlistProduct(productId: number) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const sync = () => setIsFavorited(isProductInWishlist(productId));
    sync();
    return subscribeToWishlistUpdates(sync);
  }, [productId]);

  const toggle = useCallback(
    (product: StorefrontProduct) => {
      toggleWishlistProduct(product);
    },
    [],
  );

  return { isFavorited, toggle };
}
