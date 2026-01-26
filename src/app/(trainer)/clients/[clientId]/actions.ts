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
