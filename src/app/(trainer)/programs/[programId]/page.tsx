import { prisma } from "@/lib/prisma";
import ProgramBuilder from "@/app/components/ProgramBuilder";
import { Prescribed } from "@/types/prescribed";

export default async function ProgramBuilderPage({
  params,
}: {
  params: { programId: string };
}) {
  const program = await prisma.program.findUnique({
    where: { id: params.programId },
    include: {
      workouts: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true },
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

  const programWithTypedPrescriptions = {
    ...program,
    workouts: program.workouts.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((we) => ({
        ...we,
        prescribed: we.prescribed as Prescribed,
      })),
    })),
  };

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
      program={programWithTypedPrescriptions}
      exercises={exercises}
        clients={clients}
    />
  );
}
