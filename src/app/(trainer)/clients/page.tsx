// src/app/trainer/clients/page.tsx
import { prisma } from "@/lib/prisma";
import AddClientForm from "@/app/components/AddClientFomr";

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
          <li
            key={c.id}
            className="border p-3 flex justify-between"
          >
            <div>
              <div className="font-medium">
                { c.email}
              </div>
              <div className="text-sm text-gray-500">
                {c.email}
              </div>
            </div>
          </li>
        ))}

        {clients.length === 0 && (
          <div className="text-sm text-gray-500">
            No clients yet.
          </div>
        )}
      </ul>
    </div>
  );
}
