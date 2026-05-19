import { expect, test, type APIRequestContext } from '@playwright/test';

const uniqueEmail = (prefix: string) => `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

type UserRole = 'customer' | 'seller' | 'admin';

async function register(request: APIRequestContext, role: UserRole) {
  const email = uniqueEmail(role);
  const response = await request.post('/api/auth/register', {
    data: {
      email,
      password: 'secret123',
      role,
    },
  });

  expect(response.status()).toBe(201);
  return { email, password: 'secret123' };
}

async function login(request: APIRequestContext, email: string, password: string) {
  const response = await request.post('/api/auth/login', {
    data: { email, password },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  return body.token as string;
}

async function registerAndLogin(request: APIRequestContext, role: UserRole) {
  const credentials = await register(request, role);
  const token = await login(request, credentials.email, credentials.password);
  return { ...credentials, token };
}

async function createProduct(
  request: APIRequestContext,
  token: string,
  payload: { name: string; description: string; price: number; stock: number },
) {
  const response = await request.post('/api/seller/products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });

  expect(response.status()).toBe(201);
  return await response.json();
}

test('phase 5 seller fulfillment and admin dashboard flow works', async ({ request }) => {
  const sellerOne = await registerAndLogin(request, 'seller');
  const sellerTwo = await registerAndLogin(request, 'seller');
  const customer = await registerAndLogin(request, 'customer');
  const admin = await registerAndLogin(request, 'admin');

  const laptopStand = await createProduct(request, sellerOne.token, {
    name: 'Laptop Stand',
    description: 'Aluminum stand',
    price: 1500,
    stock: 5,
  });
  const deskLamp = await createProduct(request, sellerTwo.token, {
    name: 'Desk Lamp',
    description: 'Warm task light',
    price: 2200,
    stock: 4,
  });

  const prePaymentSellerOrders = await request.get('/api/seller/orders', {
    headers: {
      Authorization: `Bearer ${sellerOne.token}`,
    },
  });
  expect(prePaymentSellerOrders.status()).toBe(200);
  expect(await prePaymentSellerOrders.json()).toEqual({ items: [] });

  const checkoutResponse = await request.post('/api/orders', {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      items: [
        { product_id: laptopStand.id, quantity: 2 },
        { product_id: deskLamp.id, quantity: 1 },
      ],
    },
  });

  expect(checkoutResponse.status()).toBe(201);
  const checkoutBody = await checkoutResponse.json();
  expect(checkoutBody).toMatchObject({
    order: {
      status: 'pending',
      total_amount: 5200,
    },
    payment: {
      payment_ref: expect.any(String),
    },
  });

  const orderId = checkoutBody.order.id as number;

  const paymentResponse = await request.post('/api/payments/mock/complete', {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      order_id: orderId,
      status: 'paid',
    },
  });

  expect(paymentResponse.status()).toBe(200);
  expect(await paymentResponse.json()).toMatchObject({
    id: orderId,
    status: 'paid',
  });

  const sellerOneOrders = await request.get('/api/seller/orders', {
    headers: {
      Authorization: `Bearer ${sellerOne.token}`,
    },
  });
  expect(sellerOneOrders.status()).toBe(200);
  const sellerOneBody = await sellerOneOrders.json();
  expect(sellerOneBody.items).toHaveLength(1);
  expect(sellerOneBody.items[0]).toMatchObject({
    product_id: laptopStand.id,
    order_status: 'paid',
    fulfillment_status: 'processing',
  });

  const sellerTwoOrders = await request.get('/api/seller/orders', {
    headers: {
      Authorization: `Bearer ${sellerTwo.token}`,
    },
  });
  expect(sellerTwoOrders.status()).toBe(200);
  const sellerTwoBody = await sellerTwoOrders.json();
  expect(sellerTwoBody.items).toHaveLength(1);
  expect(sellerTwoBody.items[0]).toMatchObject({
    product_id: deskLamp.id,
  });

  const shipResponse = await request.patch(`/api/seller/orders/items/${sellerOneBody.items[0].id}/ship`, {
    headers: {
      Authorization: `Bearer ${sellerOne.token}`,
    },
  });
  expect(shipResponse.status()).toBe(200);
  expect(await shipResponse.json()).toMatchObject({
    id: sellerOneBody.items[0].id,
    fulfillment_status: 'shipped',
  });

  const orderDetailResponse = await request.get(`/api/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });
  expect(orderDetailResponse.status()).toBe(200);
  const orderDetail = await orderDetailResponse.json();
  expect(orderDetail.status).toBe('paid');
  expect(orderDetail.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        product_id: laptopStand.id,
        fulfillment_status: 'shipped',
      }),
      expect.objectContaining({
        product_id: deskLamp.id,
        fulfillment_status: 'processing',
      }),
    ]),
  );

  const statsResponse = await request.get('/api/admin/dashboard/stats', {
    headers: {
      Authorization: `Bearer ${admin.token}`,
    },
  });
  expect(statsResponse.status()).toBe(200);
  expect(await statsResponse.json()).toMatchObject({
    user_count: expect.any(Number),
    customer_count: expect.any(Number),
    seller_count: expect.any(Number),
    product_count: expect.any(Number),
    paid_order_count: expect.any(Number),
    gross_revenue: expect.any(Number),
  });
});
