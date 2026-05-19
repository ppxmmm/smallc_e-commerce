"use client";

import { useSyncExternalStore } from "react";

const TOKEN_KEY = "smallc:authToken";
const USER_KEY = "smallc:user";
const AUTH_EVENT = "smallc:auth-updated";
const EMPTY_AUTH_SNAPSHOT = {
  token: null,
  user: null,
};

let cachedToken = null;
let cachedUserRaw = null;
let cachedAuthSnapshot = EMPTY_AUTH_SNAPSHOT;

function notifyAuthSessionChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function saveAuthSession({ token, user }) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(TOKEN_KEY, token);

  if (user) {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  notifyAuthSessionChanged();
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  notifyAuthSessionChanged();
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

function getAuthSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_AUTH_SNAPSHOT;
  }

  const token = window.sessionStorage.getItem(TOKEN_KEY);
  const userRaw = window.sessionStorage.getItem(USER_KEY);

  if (token === cachedToken && userRaw === cachedUserRaw) {
    return cachedAuthSnapshot;
  }

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  cachedToken = token;
  cachedUserRaw = userRaw;
  cachedAuthSnapshot = {
    token,
    user,
  };

  return cachedAuthSnapshot;
}

function getServerAuthSnapshot() {
  return EMPTY_AUTH_SNAPSHOT;
}

function subscribeToAuthSession(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();
  window.addEventListener(AUTH_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(AUTH_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function useAuthSession() {
  return useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
}
