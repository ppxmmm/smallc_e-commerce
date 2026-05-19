export function formatBaht(value: number): string;

export function calculateCart(
  items: Array<{ price: number; quantity: number }>,
  couponCode?: string,
): {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  appliedCoupon: string;
};
