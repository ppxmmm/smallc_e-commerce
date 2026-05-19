"use client";

import { useCallback } from "react";
import { addProductToCart } from "@/lib/cartStorage.mjs";
import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";

export function useCartActions() {
  const addToCart = useCallback((product: StorefrontProduct) => {
    addProductToCart(product);
  }, []);

  return { addToCart };
}
