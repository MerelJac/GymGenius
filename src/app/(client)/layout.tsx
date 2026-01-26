"use client";

import { ClientHeader } from "../components/clients/ClientHeader";

// src/app/(client)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden
">
      <ClientHeader />

      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
