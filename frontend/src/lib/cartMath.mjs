export function formatBaht(value) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateCart(items, couponCode = "") {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const save10 = normalizedCoupon === "SAVE10" ? Math.round(subtotal * 0.1) : 0;
  const freeShip = normalizedCoupon === "FREESHIP";
  const shipping = subtotal === 0 || freeShip ? 0 : 60;
  const discount = save10;

  return {
    subtotal,
    shipping,
    discount,
    total: Math.max(subtotal + shipping - discount, 0),
    appliedCoupon: normalizedCoupon,
  };
}
