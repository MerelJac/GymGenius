// src/app/(trainer)/programs/[programId]/page.tsx
import { prisma } from "@/lib/prisma";
import ProgramBuilder from "@/app/components/ProgramBuilder";
import notFound from "@/app/not-found";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function ProgramBuilderPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const { programId } = await params;
  console.log("Program ID:", programId);
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      workouts: {
        orderBy: { order: "asc" },
        include: {
          workoutSections: {
            orderBy: { order: "asc" },
            include: {
              exercises: {
                orderBy: { order: "asc" },
                include: {
                  exercise: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [{ trainerId: null }, { trainerId: program?.trainerId }],
    },
    orderBy: { name: "asc" },
  });

  if (!program) return notFound();

  const clients = await prisma.user.findMany({
    where: {
      trainerId: program.trainerId || null,
      role: "CLIENT",
    },
    include: {
      profile: true,
    },
  });

  const clientsAssignedProgram = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      trainerId: program.trainerId,
      scheduledWorkouts: {
        some: {
          workout: {
            programId: program.id,
          },
        },
      },
    },
    include: {
      profile: true,
      scheduledWorkouts: {
        where: {
          workout: {
            programId: program.id,
          },
        },
        include: {
          workout: {
            include: {
              program: true, //  satisfy ScheduledWorkout type
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allPrograms = await prisma.program.findMany({
    where: { trainerId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProgramBuilder
      program={program}
      exercises={exercises}
      clients={clients}
      clientsAssignedProgram={clientsAssignedProgram}
      allPrograms={allPrograms}
    />
  );
}
