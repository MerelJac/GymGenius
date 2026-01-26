import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExerciseForm from "../../../../components/exercise/ExerciseForm";
import { parseExerciseType } from "@/lib/exerciseValidation";
import SubstitutionsEditor from "@/app/components/exercise/SubstitutionsEditor";
import { BackButton } from "@/app/components/BackButton";

export default async function EditExercisePage({
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

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const allExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  async function updateExercise(formData: FormData) {
    "use server";

    const type = parseExerciseType(formData.get("type"));

    await prisma.exercise.update({
      where: { id: params.exerciseId },
      data: {
        name: String(formData.get("name")),
        type,
        equipment: String(formData.get("equipment") || ""),
        notes: String(formData.get("notes") || ""),
      },
    });

    redirect("/exercises");
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      <BackButton route={"/exercises"} />
      <ExerciseForm
        title="Edit Exercise"
        submitLabel="Update Exercise"
        exercise={exercise}
        action={updateExercise}
      />
      <SubstitutionsEditor exercise={exercise} allExercises={allExercises} />
    </div>
  );
}
