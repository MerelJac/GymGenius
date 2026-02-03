"use client";

import { useOptimistic, startTransition } from "react";
import Link from "next/link";
import { Program } from "@/types/program";
import {
  deleteProgram,
  duplicateProgram,
} from "@/app/(trainer)/programs/actions";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgramsPageClient({
  initialPrograms,
}: {
  initialPrograms: Program[];
}) {
  const router = useRouter();
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
    router.refresh();
  }
return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>

        <Link
          href="/programs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-sm"
        >
          <Plus size={18} />
          New Program
        </Link>
      </div>

      {/* Programs List */}
      {programs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No programs yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first training program to get started.
          </p>
          <Link
            href="/programs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Create Program
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {programs.map((program) => (
            <div
              key={program.id}
              className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors group flex-col md:flex-row"
            >
              <Link
                href={`/programs/${program.id}`}
                className="flex-1 min-w-0"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                  {program.name}
                </div>
                {/* Optional: show more info if you have it */}
                {/* <div className="text-sm text-gray-500 mt-0.5">
                  {program.workouts?.length || 0} workouts • Last edited ...
                </div> */}
              </Link>

              <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDuplicate(program)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-700 transition"
                  title="Duplicate program"
                >
                  <Copy size={16} />
                  Duplicate
                </button>

                <button
                  onClick={() => handleDelete(program)}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition"
                  title="Delete program"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}