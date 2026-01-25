import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export default function SignupPage() {
  async function signup(formData: FormData) {
    "use server";

    const firstName = String(formData.get("firstName"));
    const lastName = String(formData.get("lastName"));
    const email = String(formData.get("email")).toLowerCase();
    const password = String(formData.get("password"));

    if (!firstName || !lastName || !email || !password) {
      throw new Error("Missing required fields");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.CLIENT, // ✅ unattached client
        trainerId: null,

        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
    });

    redirect("/login");
  }

  return (
    <form action={signup} className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>

      <input
        name="firstName"
        placeholder="First name"
        required
        className="border p-2 w-full"
      />

      <input
        name="lastName"
        placeholder="Last name"
        required
        className="border p-2 w-full"
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="border p-2 w-full"
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="border p-2 w-full"
      />

      <button type="submit" className="border px-4 py-2 rounded">
        Sign up
      </button>
    </form>
  );
}
