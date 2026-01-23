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
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Client email"
        className="border px-3 py-2 flex-1"
        required
      />

      <button
        type="submit"
        className="border px-4 py-2 rounded"
      >
        Add Client
      </button>
    </form>
  );
}
