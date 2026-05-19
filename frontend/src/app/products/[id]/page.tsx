"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CustomerRoute } from "@/components/storefront/CustomerRoute";
import { ProductDetailPage } from "@/components/storefront/ProductDetailPage";
import { getProductById } from "@/lib/products.mjs";

export default function ProductPage() {
  const params = useParams();
  const product = getProductById(params.id);

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-black">Product not found</h1>
          <Link className="mt-4 inline-block font-bold text-emerald-700" href="/home">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <CustomerRoute>
      {(props) => <ProductDetailPage product={product} {...props} />}
    </CustomerRoute>
  );
}
