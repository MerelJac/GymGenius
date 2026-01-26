"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
  },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!clientId) {
    throw new Error("Missing crucial Data");
  }
  await prisma.profile.upsert({
    where: { userId: clientId },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      experience: data.experience,
      injuryNotes: data.injuryNotes,
    },
    create: {
      userId: clientId,
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      experience: data.experience,
      injuryNotes: data.injuryNotes,
    },
  });
}
