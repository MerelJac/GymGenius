"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/app/components/BackButton";

export default function NewProgramPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/trainer/programs", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error("Failed to create program");
    }

    const program = await res.json();
    router.push(`/programs/${program.id}`);
  }

  return (
    <>
      <BackButton route={"/programs"} />
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Create Program</h1>

        <input
          className="border p-2 w-full"
          placeholder="Program name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button className="bg-black text-white px-4 py-2">
          Create Program
        </button>
      </form>
    </>
  );
}
