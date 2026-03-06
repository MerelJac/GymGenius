import { Suspense } from "react";
import { BillingToast } from "../components/billing/BillingToast";
import { ClientHeader } from "../components/clients/ClientHeader";

// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <ClientHeader />

      <main className="p-6 max-w-6xl mx-auto bg-black">{children}</main>
      <Suspense>
        <BillingToast />
      </Suspense>
    </div>
  );
}
