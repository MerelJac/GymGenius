import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { WorkoutStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
          {clients.map((client) => {
            // group workouts by program (same logic as client page)
            const programs = Object.values(
              client.scheduledWorkouts.reduce<Record<
                string,
                {
                  program: { id: string; name: string };
                  workouts: typeof client.scheduledWorkouts;
                }
              >>((acc, sw) => {
                const program = sw.workout.program;

                if (!acc[program.id]) {
                  acc[program.id] = {
                    program: {
                      id: program.id,
                      name: program.name,
                    },
                    workouts: [],
                  };
                }

                acc[program.id].workouts.push(sw);
                return acc;
              }, {})
            );

            if (programs.length === 0) return null;

            return (
              <div key={client.id} className="border rounded p-4 space-y-3">
                {/* Client header */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {client.profile?.firstName}{" "}
                      {client.profile?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {client.email}
                    </div>
                  </div>

                  <Link
                    href={`/clients/${client.id}`}
                    className="text-sm underline"
                  >
                    View
                  </Link>
                </div>

                {/* Programs */}
                <div className="space-y-2">
                  {programs.map(({ program, workouts }) => {
                    const completed = workouts.filter(
                      (w) => w.status === WorkoutStatus.COMPLETED
                    ).length;

                    const percent =
                      workouts.length > 0
                        ? Math.round(
                            (completed / workouts.length) * 100
                          )
                        : 0;

                    return (
                      <div key={program.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{program.name}</span>
                          <span className="text-gray-600">
                            {completed}/{workouts.length} ({percent}%)
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-2"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {clients.length === 0 && (
            <p className="text-sm text-gray-500">
              No clients assigned yet.
            </p>
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
