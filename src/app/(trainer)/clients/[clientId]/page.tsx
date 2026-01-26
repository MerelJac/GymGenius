import { prisma } from "@/lib/prisma";
import ClientProfile from "@/app/components/clients/ClientProfile";
import { notFound } from "next/navigation";

export default async function ClientPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { clientId } = params;
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      profile: true,
      bodyMetrics: {
        orderBy: { recordedAt: "asc" },
      },
      scheduledWorkouts: {
        include: {
          workout: {
            include: {
              program: true,
            },
          },
        },
      },
      additionalWorkouts: {
        orderBy: { performedAt: "desc" },
        include: {
          type: true,
        },
      },
    },
  });

  if (!client) notFound();

  return <ClientProfile client={client} />;
}
