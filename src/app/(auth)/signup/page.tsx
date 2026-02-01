"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction } from "./actions";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

async function signup(formData: FormData) {
  setError(null);

  const result = await signupAction(formData);

  if (!result.success) {
    setError(result.error);
    return;
  }

  router.push("/login");
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <form
          action={signup}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
        >
          <h1 className="text-2xl font-bold text-center">
            Create your account
          </h1>

          {error && (
            <section className="flex flex-col gap-2 mb-4">
              <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
              <small className="text-black text-sm">
                Thanks for your interest! At the moment, registration is limited
                to invited users only. We appreciate your patience and will be
                opening access soon.{" "}
                <a
                  href="mailto:coachmerel.training@gmail.com?subject=Dialed%20Fitness%20Inquiry"
                  className="underline text-blue-600 hover:text-blue-700"
                >
                  Contact us
                </a>{" "}
                for more information.
              </small>
            </section>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition text-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition text-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              name="password-confirm"
              type="password"
              required
              placeholder="Password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Create account
          </button>

          <Link href="/login" className="text-sm text-center block underline">
            Already have an account?
          </Link>
        </form>
      </div>
    </div>
  );
}
