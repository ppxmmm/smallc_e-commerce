"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearAuthSession, useAuthSession } from "@/lib/authSession.mjs";
import { isSellerRole, userFromToken } from "@/lib/authToken.mjs";

export function useCustomerAuth() {
  const router = useRouter();
  const { token, user } = useAuthSession();
  const identity = token ? userFromToken(token) : null;
  const role = user?.role ?? identity?.role ?? "customer";

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    if (isSellerRole(role)) {
      router.replace("/home");
    }
  }, [role, router, token]);

  function signOut() {
    clearAuthSession();
    router.push("/login");
  }

  return {
    isReady: Boolean(token) && !isSellerRole(role),
    userEmail: user?.email,
    signOut,
  };
}
