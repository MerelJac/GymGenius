// src/app/(auth)/login/page.tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-6 rounded w-80"
      >
        <h1 className="text-xl font-semibold">Login</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          required
        />

        <button
          type="submit"
          className="bg-black text-white p-2 w-full"
        >
          Login
        </button>
      </form>
    </div>
  )
}
