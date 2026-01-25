import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExerciseForm from "../components/ExerciseForm";
import { parseExerciseType } from "@/lib/exerciseValidation";

export default function NewExercisePage() {
  async function createExercise(formData: FormData) {
    "use server";

    const type = parseExerciseType(formData.get("type"));

    const exercise = await prisma.exercise.create({
      data: {
        name: String(formData.get("name")),
        type,
        equipment: String(formData.get("equipment") || ""),
        videoUrl: String(formData.get("videoUrl") || ""),
        notes: String(formData.get("notes") || ""),
      },
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
