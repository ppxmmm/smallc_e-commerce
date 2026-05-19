"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CustomerStorefront } from "@/components/CustomerStorefront";
import { SellerDashboard } from "@/components/SellerDashboard";
import { clearAuthSession, useAuthSession } from "@/lib/authSession.mjs";
import { userFromToken, isSellerRole } from "@/lib/authToken.mjs";

export default function HomePage() {
  const router = useRouter();
  const { token, user } = useAuthSession();
  const identity = token ? userFromToken(token) : null;
  const role = user?.role ?? identity?.role ?? "customer";
  const userEmail = user?.email;
  const showSellerView = isSellerRole(role);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  function handleSignOut() {
    clearAuthSession();
    router.push("/login");
  }

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-white text-slate-600">
        Loading your workspace...
      </main>
    );
  }

  if (showSellerView) {
    return <SellerDashboard onSignOut={handleSignOut} userEmail={userEmail} />;
  }

  return <CustomerStorefront onSignOut={handleSignOut} userEmail={userEmail} />;
}
