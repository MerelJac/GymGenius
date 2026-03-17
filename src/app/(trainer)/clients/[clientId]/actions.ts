"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { normalizePhoneNumber } from "@/app/utils/format/formatPhoneNumber";
import { normalizeEmail } from "@/app/utils/format/normalizeEmail";

export async function addBodyMetric(
  clientId: string,
  weight: number | null,
  bodyFat: number | null,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.bodyMetric.create({
    data: {
      clientId,
      weight,
      bodyFat,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

export async function deleteClient(clientId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    // Ensure this client belongs to the trainer
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        trainerId: session.user.id,
        role: "CLIENT",
      },
      select: { id: true },
    });

    if (!client) {
      return { ok: false, error: "Client not found or unauthorized" };
    }

    await prisma.$transaction([
      prisma.exerciseLog.deleteMany({
        where: { workoutLog: { clientId } },
      }),
      prisma.exerciseOneRepMax.deleteMany({ where: { clientId } }),
      prisma.bodyMetric.deleteMany({ where: { clientId } }),
      prisma.additionalWorkout.deleteMany({ where: { clientId } }),
      prisma.workoutLog.deleteMany({ where: { clientId } }),
      prisma.scheduledWorkout.deleteMany({ where: { clientId } }),
      prisma.message.deleteMany({
        where: { OR: [{ senderId: clientId }, { recipientId: clientId }] },
      }),
      prisma.profile.deleteMany({ where: { userId: clientId } }),
      prisma.subscription.deleteMany({ where: { userId: clientId } }),
      prisma.user.delete({ where: { id: clientId } }),
    ]);

    revalidatePath("/clients");
    return { ok: true };
  } catch (error) {
    process.stdout.write(`deleteClient error: ${JSON.stringify(error)}\n`);
    console.error("Error deleting client:", error);
    return { ok: false, error: "An error occurred while deleting the client" };
  }
}
export async function updateClientProfile(
  clientId: string,
  data: {
    firstName: string;
    lastName: string;
    dob?: Date | null;
    experience?: string | null;
    injuryNotes?: string | null;
    phone?: string | null;
    email?: string | null;
  },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!clientId) {
    return { ok: false, error: "Missing client ID" };
  }

  let normalizedPhone;
  if (data.phone) {
    normalizedPhone = normalizePhoneNumber(data.phone);
  }

  let normalizedEmail;
  if (data.email) {
    normalizedEmail = normalizeEmail(data.email);
  }
  await prisma.$transaction([
    // 1️⃣ Update USER (email only)
    prisma.user.update({
      where: { id: clientId },
      data: {
        email: normalizedEmail ?? undefined,
      },
    }),

    // 2️⃣ Update PROFILE (phone + profile fields)
    prisma.profile.upsert({
      where: { userId: clientId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        experience: data.experience,
        injuryNotes: data.injuryNotes,
        phone: normalizedPhone,
      },
      create: {
        userId: clientId,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        experience: data.experience,
        injuryNotes: data.injuryNotes,
        phone: normalizedPhone,
      },
    }),
  ]);
  return { ok: true };
}
export async function rescheduleWorkout(
  scheduledWorkoutId: string,
  newDate: Date,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.scheduledWorkout.update({
    where: { id: scheduledWorkoutId },
    data: {
      scheduledDate: newDate,
    },
  });

  return { ok: true };
}
