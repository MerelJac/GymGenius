"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signupAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const passwordConfirm = String(formData.get("password-confirm"));

  if (!email || !password || !passwordConfirm) {
    throw new Error("Missing required fields");
  }

  if (password !== passwordConfirm) {
    throw new Error("Passwords do not match");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("This email is not authorized to register.");
  }

  if (user.password) {
    throw new Error("Account already exists. Please log in.");
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
    },
  });
}
