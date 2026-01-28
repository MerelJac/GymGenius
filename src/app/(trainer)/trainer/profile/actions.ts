// src/app/(trainer)/profile/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { normalizeEmail } from "@/app/utils/format/normalizeEmail";

export async function updateTrainerProfile(
  firstName: string,
  lastName: string,
  email: string,
  phone: string | null,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  await prisma.$transaction([
    // 1️⃣ Update USER (email only)
    prisma.user.update({
      where: { id: userId },
      data: { email },
    }),

    // 2️⃣ Upsert PROFILE (name + phone)
    prisma.profile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        phone,
      },
      create: {
        userId,
        firstName,
        lastName,
        phone,
      },
    }),
  ]);

  revalidatePath("/trainer/profile");
  return { ok: true };
}

export async function createTrainer(email: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  // ✅ normalize email
  const normalizedEmail = normalizeEmail(email);

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
  return { ok: true, id: trainer.id };
}
