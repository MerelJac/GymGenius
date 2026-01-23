"use client";

import { useOptimistic, startTransition } from "react";
import Link from "next/link";
import { Program } from "@/types/program";
import {
  deleteProgram,
  duplicateProgram,
} from "@/app/(trainer)/programs/actions";

export default function ProgramsPageClient({
  initialPrograms,
}: {
  initialPrograms: Program[];
}) {
  type ProgramAction =
    | { type: "remove"; id: string }
    | { type: "add"; program: Program };

  const [programs, updatePrograms] = useOptimistic<Program[], ProgramAction>(
    initialPrograms,
    (state, action) => {
      switch (action.type) {
        case "remove":
          return state.filter((p) => p.id !== action.id);
        case "add":
          return [...state, action.program];
        default:
          return state;
      }
    },
  );

  async function handleDelete(program: Program) {
    const confirmed = window.confirm(
      "Deleting this workout will also remove all scheduled workouts for clients.\n\nThis action can’t be undone.",
    );

    if (!confirmed) return;

    startTransition(() => {
      updatePrograms({ type: "remove", id: program.id });
    });

    await deleteProgram(program.id);
  }

  async function handleDuplicate(program: Program) {
    const optimisticCopy: Program = {
      ...program,
      id: crypto.randomUUID(),
      name: `${program.name} (Copy)`,
    };

    startTransition(() => {
      updatePrograms({ type: "add", program: optimisticCopy });
    });

    await duplicateProgram(program.id);
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Programs</h1>
        <Link href="/programs/new" className="underline">
          New Program
        </Link>
      </div>

      <ul className="space-y-3">
        {programs.map((p) => (
          <li
            key={p.id}
            className="border p-3 flex justify-between items-center"
          >
            <Link href={`/programs/${p.id}`} className="font-medium">
              {p.name}
            </Link>

            <div className="flex gap-3 text-sm">
              <button
                onClick={() => handleDuplicate(p)}
                className="text-blue-600 hover:underline"
              >
                Duplicate
              </button>

              <button
                onClick={() => handleDelete(p)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
