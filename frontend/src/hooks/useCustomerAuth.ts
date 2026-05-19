"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getAuthToken, getAuthUser } from "@/lib/authSession.mjs";
import { isSellerRole, userFromToken } from "@/lib/authToken.mjs";

export function useCustomerAuth() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getAuthUser();
    const identity = userFromToken(token);
    const role = user?.role ?? identity?.role ?? "customer";

    if (isSellerRole(role)) {
      router.replace("/home");
      return;
    }

    setUserEmail(user?.email);
    setIsReady(true);
  }, [router]);

  function signOut() {
    clearAuthSession();
    router.push("/login");
  }

  return { isReady, userEmail, signOut };
}
