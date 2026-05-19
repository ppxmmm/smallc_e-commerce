const WISHLIST_KEY = "smallc:wishlist";
const WISHLIST_EVENT = "smallc:wishlist-updated";

function readWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(WISHLIST_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function getWishlist() {
  return readWishlist();
}

export function getWishlistCount() {
  return readWishlist().length;
}

export function isProductInWishlist(productId) {
  return readWishlist().some((item) => item.id === productId);
}

export function removeFromWishlist(productId) {
  writeWishlist(readWishlist().filter((item) => item.id !== productId));
}

export function toggleWishlistProduct(product) {
  const items = readWishlist();
  const exists = items.some((item) => item.id === product.id);

  if (exists) {
    writeWishlist(items.filter((item) => item.id !== product.id));
    return false;
  }

  writeWishlist([
    ...items,
    {
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      original: product.original,
      rating: product.rating,
      stock: product.stock,
      tone: product.tone,
      image: product.image,
    },
  ]);
  return true;
}

export function subscribeToWishlistUpdates(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(WISHLIST_EVENT, callback);
  return () => window.removeEventListener(WISHLIST_EVENT, callback);
}
