// src/app/trainer/clients/page.tsx
import { prisma } from "@/lib/prisma";
import ClientPageClient from "@/app/components/trainer/clients/ClientPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function TrainerClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      trainerId: session.user.id,
    },
    include: {
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <ClientPageClient initialClients={clients} />;
}
