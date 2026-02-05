import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExerciseForm from "../../../../components/exercise/ExerciseForm";
import { parseExerciseType } from "@/lib/exerciseValidation";
import SubstitutionsEditor from "@/app/components/exercise/SubstitutionsEditor";
import { BackButton } from "@/app/components/BackButton";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
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

  async function updateExercise(formData: FormData) {
    "use server";

    const type = parseExerciseType(formData.get("type"));

    await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        name: String(formData.get("name")),
        type,
        muscleGroup: String(formData.get("muscleGroup") || ""),
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
      <SubstitutionsEditor exercise={exercise}/>
    </div>
  );
}
