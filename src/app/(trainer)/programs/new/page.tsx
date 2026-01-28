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
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button – assuming your component */}
        <BackButton route="/programs" />

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Program
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Give your training program a clear name to get started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="program-name"
                className="block text-sm font-medium text-gray-700"
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
                placeholder="e.g. 5/3/1 Beginner, Push-Pull-Legs, Upper/Lower..."
                className={`
                  w-full px-4 py-3 rounded-lg border border-gray-300 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                  focus:outline-none transition-all
                  placeholder:text-gray-400
                  disabled:opacity-60 disabled:cursor-not-allowed text-base
                `}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="program-description"
                className="block text-sm font-medium text-gray-700"
              >
                Description{" "}
                <small>(optional)</small>
              </label>
              <input
                id="program-description"
                type="text"
                name="description"
                maxLength={80}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Focus on full body strength, mobility, etc..."
                className={`
                  w-full px-4 py-3 rounded-lg border border-gray-300 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                  focus:outline-none transition-all
                  placeholder:text-gray-400
                  disabled:opacity-60 disabled:cursor-not-allowed text-base
                `}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`
                w-full px-6 py-3.5 font-medium rounded-lg
                bg-black text-white shadow-sm
                hover:bg-gray-900 focus:outline-none focus:ring-2 
                focus:ring-black focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
              `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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

        {/* Optional helpful footer note */}
        <p className="mt-6 text-center text-sm text-gray-500">
          You can add workouts and assign clients after creation.
        </p>
      </div>
    </div>
  );
}
