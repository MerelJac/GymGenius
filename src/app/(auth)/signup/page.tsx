import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <form
          action={signup}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="text-sm text-gray-500">
              Start building programs in GymGenius
            </p>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                name="firstName"
                placeholder="Jane"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                name="lastName"
                placeholder="Doe"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:ring-offset-2 transition"
          >
            Create account
          </button>
          <Link href="/login">
            <button
              type="button"
              className="w-full py-2.5 rounded-lg border border-gray-300
               text-gray-700 font-medium
               hover:bg-gray-50 hover:border-gray-400
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               transition"
            >
              Login
            </button>
          </Link>

          {/* Footer */}
          <p className="text-xs text-center text-gray-500">
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}
