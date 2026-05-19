"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomerStorefront } from "@/components/CustomerStorefront";
import { SellerDashboard } from "@/components/SellerDashboard";
import { clearAuthSession, getAuthToken, getAuthUser } from "@/lib/authSession.mjs";
import { userFromToken, isSellerRole } from "@/lib/authToken.mjs";

export default function HomePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [showSellerView, setShowSellerView] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getAuthUser();
    const identity = userFromToken(token);
    const role = user?.role ?? identity?.role ?? "customer";

    setUserEmail(user?.email);
    setShowSellerView(isSellerRole(role));
    setIsReady(true);
  }, [router]);

  function handleSignOut() {
    clearAuthSession();
    router.push("/login");
  }

  if (!isReady) {
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
