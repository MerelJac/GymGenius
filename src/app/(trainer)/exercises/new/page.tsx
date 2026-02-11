import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExerciseForm from "../../../components/exercise/ExerciseForm";
import { buildExerciseData } from "@/app/utils/exercise/buildExerciseData";

export default function NewExercisePage() {
  async function createExercise(formData: FormData) {
    "use server";

    const data = buildExerciseData(formData);
    const exercise = await prisma.exercise.create({
      data
    });

    // 👇 immediately go to edit where substitutions exist
    redirect(`/exercises/${exercise.id}/edit`);
  }

  return (
    <ExerciseForm
      title="New Exercise"
      submitLabel="Create Exercise"
      action={createExercise}
    />
  );
}
