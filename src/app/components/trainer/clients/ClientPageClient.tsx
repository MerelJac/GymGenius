"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ClientListItem } from "@/types/client";
import AddClientForm from "../../clients/AddClientForm";

export default function ClientPageClient({
  initialClients,
}: {
  initialClients: ClientListItem[];
}) {
  // ✅ Client now owns the data
  const [clients, setClients] = useState<ClientListItem[]>(initialClients);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Clients
        </h1>

        <div className="flex-shrink-0">
          <AddClientForm
            onClientCreated={(newClient: ClientListItem) => {
              setClients((prev) => [newClient, ...prev]);
            }}
          />
        </div>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            No clients added yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your first client to start tracking progress, assigning
            programs, and logging metrics.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {clients.map((c) => (
            <div
              key={c.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/70 transition-colors group relative"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                  {c.profile?.firstName} {c.profile?.lastName || ""}
                  {!c.profile?.firstName && !c.profile?.lastName && (
                    <span className="text-gray-500">(no name)</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{c.email}</div>
              </div>

              <div className="flex flex-row gap-2 items-center relative">
                {!c.profile?.waiverSignedAt && (
                  <div className="relative group">
                    <AlertCircle
                      size={16}
                      className="text-amber-500 cursor-help"
                    />

                    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
                      Waiver has not been signed
                    </div>
                  </div>
                )}

                <Link
                  href={`/clients/${c.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition whitespace-nowrap"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
