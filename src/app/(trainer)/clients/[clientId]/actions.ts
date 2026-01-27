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
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.bodyMetric.create({
    data: {
      clientId,
      weight,
      bodyFat,
    },
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

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
    throw new Error("Client not found or unauthorized");
  }

  // Delete dependent data first
  await prisma.$transaction([
    prisma.bodyMetric.deleteMany({ where: { clientId } }),
    prisma.additionalWorkout.deleteMany({ where: { clientId } }),
    prisma.workoutLog.deleteMany({ where: { clientId } }),
    prisma.scheduledWorkout.deleteMany({ where: { clientId } }),
    prisma.profile.deleteMany({ where: { userId: clientId } }),

    // finally, delete the user
    prisma.user.delete({ where: { id: clientId } }),
  ]);

  revalidatePath("/clients");
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
    throw new Error("Unauthorized");
  }

  if (!clientId) {
    throw new Error("Missing crucial Data");
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
}
