"use client";

import { useState, startTransition } from "react";
import { createClient } from "@/app/(trainer)/clients/actions";

export default function AddClientForm() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    startTransition(() => {
      createClient(email);
    });

    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="client@example.com"
        required
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
      />
      <button
        type="submit"
        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
        disabled={!email.trim()}
      >
        Add Client
      </button>
    </form>
  );
}
