import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { WorkoutStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientProgramProgress } from "@/app/components/ClientProgramProgress";

export default async function TrainerHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const trainerId = session.user.id;

  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      trainerId,
    },
    include: {
      profile: true,
      scheduledWorkouts: {
        include: {
          workout: {
            include: {
              program: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Welcome</h1>

      {/* CLIENT PROGRESS */}
      <section>
        <h2 className="font-medium mb-3">Client Program Progress</h2>

        <div className="space-y-4">
          {clients.map((client) => (
            <ClientProgramProgress key={client.id} client={client} />
          ))}

          {clients.length === 0 && (
            <p className="text-sm text-gray-500">No clients assigned yet.</p>
          )}
        </div>
      </section>

      {/* You can fill these next */}
      <section>
        <h2 className="font-medium mb-2">Missed Workouts</h2>
      </section>

      <section>
        <h2 className="font-medium mb-2">Recently Completed</h2>
      </section>
    </div>
  );
}
