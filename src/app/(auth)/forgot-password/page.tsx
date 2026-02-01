"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true); // always show success to prevent email enumeration
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow p-6 rounded max-w-sm text-center space-y-3">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p>
            If an account with <strong>{email}</strong> exists, we’ve sent a
            password reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="bg-white shadow p-6 rounded w-80 space-y-3"
      >
        <h1 className="text-xl font-semibold text-center">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Enter your email and we’ll send you a reset link.
        </p>
        <input
          className="w-full border-2 rounded p-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button className="w-full px-4 py-2 rounded bg-black text-white hover:bg-gray-800">
          Send reset link
        </button>
      </form>
    </section>
  );
}
