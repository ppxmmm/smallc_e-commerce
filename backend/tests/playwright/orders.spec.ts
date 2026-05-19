import { expect, test, type APIRequestContext } from '@playwright/test';

const uniqueEmail = (prefix: string) => `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

type UserRole = 'customer' | 'seller' | 'admin';

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

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

async function createProduct(request: APIRequestContext, token: string, payload: ProductPayload) {
  const response = await request.post('/api/seller/products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });

  expect(response.status()).toBe(201);
  return await response.json();
}

test('customer can checkout across multiple sellers', async ({ request }) => {
  const sellerOne = await registerAndLogin(request, 'seller');
  const sellerTwo = await registerAndLogin(request, 'seller');
  const customer = await registerAndLogin(request, 'customer');

  const productOne = await createProduct(request, sellerOne.token, {
    name: 'Ergonomic Keyboard',
    description: 'Mechanical keyboard',
    price: 4999,
    stock: 5,
  });
  const productTwo = await createProduct(request, sellerTwo.token, {
    name: 'Desk Lamp',
    description: 'Warm LED lamp',
    price: 2599,
    stock: 3,
  });

  const checkoutResponse = await request.post('/api/orders', {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      items: [
        { product_id: productOne.id, quantity: 2 },
        { product_id: productTwo.id, quantity: 1 },
      ],
    },
  });

  expect(checkoutResponse.status()).toBe(201);
  const checkout = await checkoutResponse.json();
  expect(checkout.order).toMatchObject({
    status: 'pending',
    total_amount: 12597,
  });
  expect(checkout.order.items).toHaveLength(2);
  expect(checkout.payment).toMatchObject({
    payment_ref: expect.any(String),
    auto_approve: false,
    complete_endpoint: '/api/payments/mock/complete',
  });

  const firstProduct = await request.get(`/api/products/${productOne.id}`);
  expect(firstProduct.status()).toBe(200);
  expect(await firstProduct.json()).toMatchObject({
    id: productOne.id,
    stock: 3,
  });

  const secondProduct = await request.get(`/api/products/${productTwo.id}`);
  expect(secondProduct.status()).toBe(200);
  expect(await secondProduct.json()).toMatchObject({
    id: productTwo.id,
    stock: 2,
  });
});

test('checkout rolls back when one item is out of stock', async ({ request }) => {
  const sellerOne = await registerAndLogin(request, 'seller');
  const sellerTwo = await registerAndLogin(request, 'seller');
  const customer = await registerAndLogin(request, 'customer');

  const lowStockProduct = await createProduct(request, sellerOne.token, {
    name: 'Limited Edition Cap',
    description: 'Only one left',
    price: 1200,
    stock: 1,
  });
  const healthyStockProduct = await createProduct(request, sellerTwo.token, {
    name: 'Notebook Set',
    description: 'Four-pack',
    price: 800,
    stock: 4,
  });

  const failedCheckout = await request.post('/api/orders', {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      items: [
        { product_id: lowStockProduct.id, quantity: 2 },
        { product_id: healthyStockProduct.id, quantity: 1 },
      ],
    },
  });

  expect(failedCheckout.status()).toBe(409);
  expect(await failedCheckout.json()).toEqual({
    error: 'insufficient stock for one or more items',
  });

  const retryCheckout = await request.post('/api/orders', {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      items: [
        { product_id: lowStockProduct.id, quantity: 1 },
        { product_id: healthyStockProduct.id, quantity: 4 },
      ],
    },
  });

  expect(retryCheckout.status()).toBe(201);
  const retryOrder = await retryCheckout.json();
  expect(retryOrder.order).toMatchObject({
    status: 'pending',
    total_amount: 4400,
  });

  const firstProduct = await request.get(`/api/products/${lowStockProduct.id}`);
  expect(firstProduct.status()).toBe(200);
  expect(await firstProduct.json()).toMatchObject({
    id: lowStockProduct.id,
    stock: 0,
  });

  const secondProduct = await request.get(`/api/products/${healthyStockProduct.id}`);
  expect(secondProduct.status()).toBe(200);
  expect(await secondProduct.json()).toMatchObject({
    id: healthyStockProduct.id,
    stock: 0,
  });
});
