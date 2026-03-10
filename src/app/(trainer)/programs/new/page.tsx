"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/BackButton";

export default function NewProgramPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/trainer/programs", {
        method: "POST",
        body: JSON.stringify({ name, notes: description }),
      });

      if (!res.ok) {
        throw new Error("Failed to create program");
      }

      const program = await res.json();
      router.push(`/programs/${program.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <BackButton route="/programs" />

        <div className="mt-8 gradient-bg rounded-2xl border border-surface2 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface2">
            <h1 className="nav-logo">Create New Program</h1>
            <p className="mt-1.5 text-sm text-muted">
              Give your training program a clear name to get started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="program-name"
                className="block text-xs font-semibold uppercase tracking-widest text-muted"
              >
                Name
              </label>
              <input
                id="program-name"
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5/3/1 Beginner, Push-Pull-Legs..."
                className="w-full px-4 py-3 rounded-xl border border-surface2 bg-surface2/50
              text-foreground placeholder:text-muted text-sm
              focus:outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30
              disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="program-description"
                className="block text-xs font-semibold uppercase tracking-widest text-muted"
              >
                Description{" "}
                <span className="normal-case font-normal tracking-normal">
                  (optional)
                </span>
              </label>
              <input
                id="program-description"
                type="text"
                name="description"
                maxLength={80}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Focus on full body strength, mobility, etc..."
                className="w-full px-4 py-3 rounded-xl border border-surface2 bg-surface2/50
              text-foreground placeholder:text-muted text-sm
              focus:outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30
              disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5
            bg-lime-green text-black font-syne font-bold rounded-xl
            hover:opacity-90 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Program"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          You can add workouts and assign clients after creation.
        </p>
      </div>
    </div>
  );
}
