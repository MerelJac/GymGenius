// src/app/trainer/clients/page.tsx
import { prisma } from "@/lib/prisma";
import AddClientForm from "@/app/components/AddClientFomr";
import Link from "next/link";

export default async function TrainerClientsPage() {
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      trainerId: { not: null },
    },
    include: {
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>

      <AddClientForm />

      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id} className="border p-3 flex justify-between">
            <div>
              <div className="font-medium">{c.email}</div>
              <div className="text-sm text-gray-500">{c.email}</div>
            </div>
            <Link
              href={`/clients/${c.id}`}
              className="border px-3 py-1 rounded text-sm hover:bg-gray-50 flex items-center"
            >
              View client
            </Link>
          </li>
        ))}

        {clients.length === 0 && (
          <div className="text-sm text-gray-500">No clients yet.</div>
        )}
      </ul>
    </div>
  );
}
