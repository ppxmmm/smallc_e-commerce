export function userFromToken(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(globalThis.atob(normalized));

    return {
      id: Number(payload.sub),
      role: typeof payload.role === "string" ? payload.role : null,
    };
  } catch {
    return null;
  }
}

export function isSellerRole(role) {
  return role === "seller" || role === "admin";
}
