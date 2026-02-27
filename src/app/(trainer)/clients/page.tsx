// src/app/trainer/clients/page.tsx
import { prisma } from "@/lib/prisma";
import ClientPageClient from "@/app/components/trainer/clients/ClientPageClient";

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

    return <ClientPageClient initialClients={clients} />;
}