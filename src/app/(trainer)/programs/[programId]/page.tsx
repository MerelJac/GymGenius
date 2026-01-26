import { prisma } from "@/lib/prisma";
import ProgramBuilder from "@/app/components/ProgramBuilder";

export default async function ProgramBuilderPage({
  params,
}: {
  params: { programId: string };
}) {
  const { programId } = params;
  console.log("Program ID:", programId);
  const program = await prisma.program.findUnique({
    where: { id: params.programId },
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

  if (!program) return <div>Program not found</div>;



  const clients = await prisma.user.findMany({
    where: {
      trainerId: program.trainerId,
      role: "CLIENT",
    },
    include: {
      profile: true,
    },
  });

  
  return (
    <ProgramBuilder
      program={program}
      exercises={exercises}
      clients={clients}
    />
  );
}
