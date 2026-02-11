import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExerciseForm from "../../../components/exercise/ExerciseForm";
import { buildExerciseData } from "@/app/utils/exercise/buildExerciseData";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default function NewExercisePage() {
  async function createExercise(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);

    if (!session?.user) throw new Error("Unauthorized");

    const trainerId =
      session.user.role === "TRAINER"
        ? session.user.id
        : (session.user.trainerId ?? null);

    const data = buildExerciseData(formData);
    const exercise = await prisma.exercise.create({
      data: {
        ...data,
        trainerId,
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
