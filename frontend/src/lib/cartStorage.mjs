const CART_KEY = "smallc:cart";
const COUPON_KEY = "smallc:appliedCoupon";
const CART_EVENT = "smallc:cart-updated";

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(CART_KEY);
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

function writeCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart() {
  return readCart();
}

export function setCart(items) {
  writeCart(items);
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function addProductToCart(product) {
  const items = readCart();
  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    writeCart(
      items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
    return;
  }

  writeCart([...items, { ...product, quantity: 1 }]);
}

export function removeProductFromCart(productId) {
  const items = readCart().filter((item) => item.id !== productId);
  writeCart(items);
}

export function updateProductQuantity(productId, quantity) {
  const nextQuantity = Math.max(0, Math.floor(quantity));
  const items = readCart();

  if (nextQuantity === 0) {
    writeCart(items.filter((item) => item.id !== productId));
    return;
  }

  writeCart(
    items.map((item) =>
      item.id === productId ? { ...item, quantity: nextQuantity } : item,
    ),
  );
}

export function changeProductQuantity(productId, delta) {
  const item = readCart().find((entry) => entry.id === productId);
  if (!item) {
    return;
  }

  updateProductQuantity(productId, item.quantity + delta);
}

export function getAppliedCoupon() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(COUPON_KEY) ?? "";
}

export function setAppliedCoupon(code) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(COUPON_KEY, code);
  window.dispatchEvent(new Event(CART_EVENT));
}

export function subscribeToCartUpdates(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(CART_EVENT, callback);
  return () => window.removeEventListener(CART_EVENT, callback);
}
