import { Suspense } from "react";
import { BillingToast } from "../components/billing/BillingToast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientLayout from "../(client)/layout";

// src/app/dashboard/layout.tsx
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-black">
      <ClientLayout>
        {children}
      </ClientLayout>

      <Suspense>
        <BillingToast />
      </Suspense>
    </div>
  );
}
