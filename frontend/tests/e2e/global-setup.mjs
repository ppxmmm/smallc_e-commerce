const apiUrl = (process.env.SMALLC_API_URL ?? "http://127.0.0.1:8080").replace(
  /\/$/,
  "",
);

async function seedUser({ email, password, role }) {
  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const body = await response.text();
  throw new Error(
    `Failed to seed ${role} user (${response.status}): ${body || response.statusText}`,
  );
}

export default async function globalSetup() {
  await seedUser({
    email: "customer@smallc.test",
    password: "correct-password",
    role: "customer",
  });

  await seedUser({
    email: "seller@smallc.test",
    password: "correct-password",
    role: "seller",
  });
}
