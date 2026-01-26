"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createClient(email: string) {
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
    throw new Error("A client with this email already exists.");
  }

  
  const client = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: "CLIENT",
      trainerId: session.user.id,
      password: "TEMP", // replace later with invite / reset flow
    },
  });

  revalidatePath("/trainer/clients");
  return { id: client.id };
}
