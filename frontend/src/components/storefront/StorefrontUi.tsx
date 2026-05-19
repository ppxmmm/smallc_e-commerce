"use client";

import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { formatBaht } from "@/lib/cartMath.mjs";

export type StorefrontProduct = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  original?: number;
  rating: number;
  stock: number;
  tone: string;
  subtitle?: string;
  image?: string;
  description?: string;
  features?: string[];
  highlights?: string[];
  specifications?: string[][];
  delivery?: string;
};

export function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="m-3 rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 text-slate-500">{subtitle}</p>
        </div>
        <Link className="font-bold text-emerald-700" href="/home#shop">
          View All
        </Link>
      </div>
      {children}
    </section>
  );
}

export function ProductGrid({
  products: items,
  onAdd,
  compact = false,
}: {
  products: StorefrontProduct[];
  onAdd: (product: StorefrontProduct) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid gap-4 ${compact ? "grid-cols-5 max-xl:grid-cols-3 max-md:grid-cols-1" : "grid-cols-4 max-xl:grid-cols-3 max-md:grid-cols-1"}`}
    >
      {items.map((product) => (
        <ProductCard product={product} onAdd={onAdd} compact={compact} key={product.id} />
      ))}
    </div>
  );
}

export function ProductCard({
  product,
  onAdd,
  compact = false,
}: {
  product: StorefrontProduct;
  onAdd: (product: StorefrontProduct) => void;
  compact?: boolean;
}) {
  function handleAddToCart() {
    onAdd(product);
  }

  return (
    <article className="relative flex flex-col rounded-lg border border-slate-200 bg-white p-4">
      <WishlistButton className="absolute right-3 top-3" product={product} />
      {compact ? (
        <span className="absolute left-3 top-3 z-20 rounded-md bg-red-500 px-2 py-1 text-xs font-black text-white">
          -35%
        </span>
      ) : null}

      <Link href={`/products/${product.id}`} className="block">
        <ProductArt product={product} large />
      </Link>

      <Link
        href={`/products/${product.id}`}
        className="mt-3 block min-h-10 text-sm font-black hover:text-emerald-700"
      >
        {product.name}
      </Link>

      <p className="mt-2 font-black">
        {formatBaht(product.price)}{" "}
        {product.original ? (
          <span className="text-sm font-normal text-slate-400 line-through">
            {formatBaht(product.original)}
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-amber-500">
        ★★★★★ <span className="text-slate-500">In Stock</span>
      </p>

      <button
        className="relative z-20 mt-3 h-10 w-full cursor-pointer rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/30"
        data-testid={`add-product-${product.id}`}
        onClick={handleAddToCart}
        type="button"
      >
        Add to cart
      </button>
    </article>
  );
}

export function ProductArt({
  product,
  large = false,
  thumbnail = false,
}: {
  product: StorefrontProduct;
  large?: boolean;
  thumbnail?: boolean;
}) {
  const sizeClass = large
    ? "aspect-[4/3] min-h-36 w-full"
    : thumbnail
      ? "size-[72px] shrink-0"
      : "size-12";

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br ${product.tone ?? "from-slate-100 to-slate-200"} ${sizeClass}`}
    >
      {product.image ? (
        <Image
          alt={product.name}
          className="h-full w-full object-cover"
          height={large ? 600 : 96}
          loading="lazy"
          src={product.image}
          unoptimized
          width={large ? 800 : 96}
        />
      ) : null}
    </div>
  );
}

export function OrderSummary({
  totals,
}: {
  totals: ReturnType<typeof import("@/lib/cartMath.mjs").calculateCart>;
}) {
  return (
    <dl className="mt-5 grid gap-2 border-t border-slate-200 pt-4 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd>{formatBaht(totals.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Shipping</dt>
        <dd>{formatBaht(totals.shipping)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Discount</dt>
        <dd>-{formatBaht(totals.discount)}</dd>
      </div>
      <div className="flex justify-between text-lg font-black">
        <dt>Total</dt>
        <dd>{formatBaht(totals.total)}</dd>
      </div>
    </dl>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                className="border-b border-slate-200 px-3 py-2 text-left text-slate-500"
                key={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td className="border-b border-slate-100 px-3 py-2" key={cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
