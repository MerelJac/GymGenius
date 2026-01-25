import { prisma } from "@/lib/prisma";
import ExerciseModal from "../../components/ExerciseModal";

export default async function ExerciseModalPage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: params.exerciseId },
    include: {
      substitutionsFrom: {
        include: {
          substituteExercise: true,
        },
      },
    },
  });

  if (!exercise) return null;

  return <ExerciseModal exercise={exercise} />;
}
