import { apiRequest } from "@/services/apiClient.mjs";

const DEFAULT_TONE = "from-slate-100 to-slate-200";

function asText(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asOptionalNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === "string" && item.trim() !== "");
}

function asSpecifications(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => Array.isArray(item) && item.length === 2)
    .map(([label, detail]) => [String(label), String(detail)]);
}

export function mapApiProduct(product) {
  const stock = asNumber(product?.stock);
  const features = asStringArray(product?.features);

  return {
    id: asNumber(product?.id),
    name: asText(product?.name, "Untitled product"),
    category: asText(product?.category, "General"),
    brand: asText(product?.brand, "smallC"),
    price: asNumber(product?.price),
    original: asOptionalNumber(product?.original),
    rating: asNumber(product?.rating),
    stock,
    tone: asText(product?.tone, DEFAULT_TONE),
    subtitle: asText(product?.subtitle),
    image: asText(product?.image),
    description: asText(product?.description),
    features: features.length ? features : [stock > 0 ? "In Stock" : "Out of Stock"],
    highlights: asStringArray(product?.highlights),
    specifications: asSpecifications(product?.specifications),
    delivery: asText(product?.delivery),
    seller_id: asNumber(product?.seller_id),
    created_at: asText(product?.created_at),
  };
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProducts(options = {}) {
  const params = new URLSearchParams();
  if (options.search) {
    params.set("search", options.search);
  }
  if (options.sellerId) {
    params.set("seller_id", String(options.sellerId));
  }

  const query = params.toString();
  const payload = await apiRequest(`/api/products${query ? `?${query}` : ""}`);
  return Array.isArray(payload?.products) ? payload.products.map(mapApiProduct) : [];
}

export async function fetchProductById(id) {
  const payload = await apiRequest(`/api/products/${id}`);
  return mapApiProduct(payload);
}

export function buildCategories(products) {
  const unique = new Set(
    products
      .map((product) => product.category)
      .filter((category) => typeof category === "string" && category.trim() !== ""),
  );

  return ["All", ...unique];
}

export async function fetchCustomerOrders(token) {
  const payload = await apiRequest("/api/orders", {
    headers: authHeaders(token),
  });

  return Array.isArray(payload?.orders) ? payload.orders : [];
}

export async function createOrder(token, items) {
  return apiRequest("/api/orders", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ items }),
  });
}

export async function completeMockPayment(token, orderId, paymentRef, outcome) {
  return apiRequest("/api/payments/mock/complete", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      order_id: orderId,
      payment_ref: paymentRef,
      outcome,
    }),
  });
}
