"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CustomerRoute } from "@/components/storefront/CustomerRoute";
import { ProductDetailPage } from "@/components/storefront/ProductDetailPage";
import type { StorefrontProduct } from "@/components/storefront/StorefrontUi";
import { fetchProductById, fetchProducts } from "@/lib/products.mjs";

export default function ProductPage() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [catalog, setCatalog] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProduct() {
      if (!productId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const [detail, products] = await Promise.all([
          fetchProductById(productId),
          fetchProducts(),
        ]);

        if (!isActive) {
          return;
        }

        setProduct(detail);
        setCatalog(products);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        const status = loadError && typeof loadError === "object" ? Reflect.get(loadError, "status") : undefined;
        if (status === 404) {
          setNotFound(true);
        } else {
          setError(loadError instanceof Error ? loadError.message : "Failed to load product.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [productId]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return catalog
      .filter((item) => item.category === product.category && item.id !== product.id)
      .concat(catalog.filter((item) => item.category !== product.category && item.id !== product.id))
      .slice(0, 4);
  }, [catalog, product]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-white text-slate-600">
        Loading product...
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-black">Could not load product</h1>
          <p className="mt-2 text-slate-500">{error}</p>
          <Link className="mt-4 inline-block font-bold text-emerald-700" href="/home">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
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
      {(props) => <ProductDetailPage product={product} relatedProducts={relatedProducts} {...props} />}
    </CustomerRoute>
  );
}
