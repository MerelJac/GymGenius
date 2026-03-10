// src/app/admin/exercises/page.tsx
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminExerciseReview from "./AdminExerciseReview";
import { getServerSession } from "next-auth";

export default async function AdminExercisesPage() {
     const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/trainer");
  }

  const exercises = await prisma.exercise.findMany({
    where: {
      trainerId: {
        not: null,
      },
    },
    include: {
      trainer: {
        include: { profile: true },
      },
    },
  });

  return <AdminExerciseReview exercises={exercises} />;
}