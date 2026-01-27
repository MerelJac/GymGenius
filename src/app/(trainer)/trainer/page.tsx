import { prisma } from "@/lib/prisma";
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
  <div className="space-y-10">
    {/* Page header */}
    <div className="space-y-1">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back
      </h1>
      <p className="text-sm text-gray-500">
        Here’s an overview of your clients’ training activity
      </p>
    </div>

    {/* CLIENT PROGRESS */}
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Client Program Progress
        </h2>
      </div>

      <div className="space-y-4">
        {clients.map((client) => (
          <ClientProgramProgress key={client.id} client={client} />
        ))}

        {clients.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">
              No clients assigned yet.
            </p>
          </div>
        )}
      </div>
    </section>

    {/* MISSED WORKOUTS */}
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Missed Workouts
      </h2>

      <p className="text-sm text-gray-400 italic">
        No missed workouts to show.
      </p>
    </section>

    {/* RECENTLY COMPLETED */}
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Recently Completed
      </h2>

      <p className="text-sm text-gray-400 italic">
        Completed workouts will appear here.
      </p>
    </section>
  </div>
);

}
