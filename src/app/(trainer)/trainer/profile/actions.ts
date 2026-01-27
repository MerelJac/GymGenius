// src/app/(trainer)/profile/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateTrainerProfile(
  firstName: string,
  lastName: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { firstName, lastName },
    create: {
      userId: session.user.id,
      firstName,
      lastName,
    },
  });

  revalidatePath("/trainer/profile");
}

export async function createTrainer(email: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // ✅ normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // ✅ check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const trainer = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: "TRAINER",
      trainerId: session.user.id,
      password: "TEMP", // replace later with invite / reset flow
    },
  });

  revalidatePath("/trainer/profile");
  return { id: trainer.id };
}
