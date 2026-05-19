import { apiRequest } from "./apiClient.mjs";

export async function loginWithApi({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerWithApi({ email, password, role = "customer" }) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}
