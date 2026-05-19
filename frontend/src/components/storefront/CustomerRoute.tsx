"use client";

import type { ReactNode } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

type CustomerRouteProps = {
  children: (props: { userEmail?: string; onSignOut: () => void }) => ReactNode;
};

export function CustomerRoute({ children }: CustomerRouteProps) {
  const { isReady, userEmail, signOut } = useCustomerAuth();

  if (!isReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-white text-slate-600">
        Loading...
      </main>
    );
  }

  return <>{children({ userEmail, onSignOut: signOut })}</>;
}
