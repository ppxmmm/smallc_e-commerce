import { expect, test, type APIRequestContext } from '@playwright/test';

const uniqueEmail = (prefix: string) => `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

async function register(request: APIRequestContext, role: 'customer' | 'seller' | 'admin') {
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

test('registers a customer and logs in successfully', async ({ request }) => {
  const credentials = await register(request, 'customer');
  const token = await login(request, credentials.email, credentials.password);

  const meResponse = await request.get('/api/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(meResponse.status()).toBe(200);
  expect(await meResponse.json()).toMatchObject({
    role: 'customer',
  });
});

test('rejects protected access without a token', async ({ request }) => {
  const response = await request.get('/api/customer/ping');

  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({
    error: 'missing or invalid authorization header',
  });
});

test('blocks a seller from admin-only routes', async ({ request }) => {
  const credentials = await register(request, 'seller');
  const token = await login(request, credentials.email, credentials.password);

  const response = await request.get('/api/admin/ping', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(403);
  expect(await response.json()).toMatchObject({
    error: 'forbidden',
  });
});
