"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addBodyMetric(
  clientId: string,
  weight: number | null,
  bodyFat: number | null
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
  firstName: string,
  lastName: string,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

    if (!clientId) {
    throw new Error("Missing Data");
  }

  await prisma.profile.upsert({
    where: {
      userId: clientId,
    },
    update: {
      firstName,
      lastName,
    },
    create: {
      userId: clientId,
      firstName,
      lastName,
    },
  });
}