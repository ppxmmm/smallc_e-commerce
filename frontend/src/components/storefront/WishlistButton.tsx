"use client";

import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";
import { useWishlistProduct } from "@/hooks/useWishlist";

type WishlistButtonProps = {
  product: StorefrontProduct;
  className?: string;
};

export function WishlistButton({ product, className = "" }: WishlistButtonProps) {
  const { isFavorited, toggle } = useWishlistProduct(product.id);

  return (
    <button
      aria-label={
        isFavorited
          ? `Remove ${product.name} from favourites`
          : `Add ${product.name} to favourites`
      }
      aria-pressed={isFavorited}
      className={`z-20 grid size-8 place-items-center rounded-full border bg-white shadow-sm transition ${isFavorited ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500"} ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(product);
      }}
      type="button"
    >
      <HeartIcon filled={isFavorited} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21s-7.2-4.35-9.9-8.55C-.5 8.55 2.4 4 6.6 4c2.1 0 3.3 1.05 4.2 2.25C11.7 5.05 12.9 4 15 4c4.2 0 7.1 4.55 4.5 8.45C19.2 16.65 12 21 12 21Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 21s-7.2-4.35-9.9-8.55C-.5 8.55 2.4 4 6.6 4c2.1 0 3.3 1.05 4.2 2.25C11.7 5.05 12.9 4 15 4c4.2 0 7.1 4.55 4.5 8.45C19.2 16.65 12 21 12 21Z" />
    </svg>
  );
}
