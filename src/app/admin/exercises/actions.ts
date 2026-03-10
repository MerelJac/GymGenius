"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";

export async function approveExercise(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.exercise.update({
    where: { id },
    data: {
      trainerId: null,
    },
  });
}
