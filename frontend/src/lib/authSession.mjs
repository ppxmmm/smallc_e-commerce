const TOKEN_KEY = "smallc:authToken";
const USER_KEY = "smallc:user";

export function saveAuthSession({ token, user }) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(TOKEN_KEY, token);

  if (user) {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
