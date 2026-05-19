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
      name: `${role} user`,
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

test('lists and fetches public products', async ({ request }) => {
  const seller = await registerAndLogin(request, 'seller');
  const product = await createProduct(request, seller.token, {
    name: 'Mechanical Keyboard',
    description: 'Hot-swappable 75% keyboard',
    price: 8999,
    stock: 8,
  });

  const listResponse = await request.get('/api/products');
  expect(listResponse.status()).toBe(200);
  expect(await listResponse.json()).toEqual({
    products: [
      expect.objectContaining({
        id: product.id,
        name: 'Mechanical Keyboard',
      }),
    ],
  });

  const detailResponse = await request.get(`/api/products/${product.id}`);
  expect(detailResponse.status()).toBe(200);
  expect(await detailResponse.json()).toMatchObject({
    id: product.id,
    seller_id: product.seller_id,
    stock: 8,
  });
});

test('supports search and seller filters', async ({ request }) => {
  const firstSeller = await registerAndLogin(request, 'seller');
  const secondSeller = await registerAndLogin(request, 'seller');

  const mug = await createProduct(request, firstSeller.token, {
    name: 'Blue Mug',
    description: 'Ceramic coffee mug',
    price: 299,
    stock: 10,
  });
  await createProduct(request, secondSeller.token, {
    name: 'Desk Lamp',
    description: 'Warm bedside lamp',
    price: 2599,
    stock: 4,
  });

  const searchResponse = await request.get('/api/products?search=coffee');
  expect(searchResponse.status()).toBe(200);
  expect(await searchResponse.json()).toEqual({
    products: [
      expect.objectContaining({
        id: mug.id,
        name: 'Blue Mug',
      }),
    ],
  });

  const sellerFilterResponse = await request.get(`/api/products?seller_id=${mug.seller_id}`);
  expect(sellerFilterResponse.status()).toBe(200);
  expect(await sellerFilterResponse.json()).toEqual({
    products: [
      expect.objectContaining({
        id: mug.id,
        seller_id: mug.seller_id,
      }),
    ],
  });
});

test('seller can update and delete own product', async ({ request }) => {
  const seller = await registerAndLogin(request, 'seller');
  const product = await createProduct(request, seller.token, {
    name: 'Monitor Stand',
    description: 'Wood riser',
    price: 1899,
    stock: 6,
  });

  const updateResponse = await request.put(`/api/seller/products/${product.id}`, {
    headers: {
      Authorization: `Bearer ${seller.token}`,
    },
    data: {
      name: 'Monitor Stand Pro',
      description: 'Wood riser with drawer',
      price: 2499,
      stock: 9,
    },
  });

  expect(updateResponse.status()).toBe(200);
  expect(await updateResponse.json()).toMatchObject({
    id: product.id,
    name: 'Monitor Stand Pro',
    stock: 9,
  });

  const deleteResponse = await request.delete(`/api/seller/products/${product.id}`, {
    headers: {
      Authorization: `Bearer ${seller.token}`,
    },
  });

  expect(deleteResponse.status()).toBe(200);
  expect(await deleteResponse.json()).toEqual({
    message: 'product deleted',
  });

  const detailResponse = await request.get(`/api/products/${product.id}`);
  expect(detailResponse.status()).toBe(404);
});

test('seller cannot update another seller product', async ({ request }) => {
  const owner = await registerAndLogin(request, 'seller');
  const intruder = await registerAndLogin(request, 'seller');
  const product = await createProduct(request, owner.token, {
    name: 'Notebook',
    description: 'Grid notebook',
    price: 499,
    stock: 18,
  });

  const updateResponse = await request.put(`/api/seller/products/${product.id}`, {
    headers: {
      Authorization: `Bearer ${intruder.token}`,
    },
    data: {
      name: 'Stolen Notebook',
      description: 'Should fail',
      price: 999,
      stock: 1,
    },
  });

  expect(updateResponse.status()).toBe(403);
  expect(await updateResponse.json()).toEqual({
    error: 'forbidden',
  });

  const detailResponse = await request.get(`/api/products/${product.id}`);
  expect(detailResponse.status()).toBe(200);
  expect(await detailResponse.json()).toMatchObject({
    id: product.id,
    name: 'Notebook',
  });
});
