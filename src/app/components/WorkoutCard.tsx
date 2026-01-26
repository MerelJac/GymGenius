"use client";
import { useOptimistic, startTransition, useState, useEffect } from "react";
import {
  addWorkoutExercise,
  updateWorkoutName,
  deleteWorkoutExercise,
  updateWorkoutDay,
  createWorkoutSection,
  updateWorkoutSectionTitle,
  reorderWorkoutSections,
  moveWorkoutExercise,
} from "../(trainer)/programs/[programId]/actions";
import {
  SectionExercise,
  WorkoutSectionWithExercises,
  WorkoutWithSections,
} from "@/types/workout"; // ← update this type!
import { Exercise } from "@/types/exercise";
import { formatPrescribed } from "../utils/prescriptionFormatter";
import { WorkoutDay } from "@/types/enums";
import { Prescribed } from "@/types/prescribed";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkoutCard({
  workout,
  exercises,
  programId,
  onDelete,
  onDuplicate,
}: {
  workout: WorkoutWithSections;
  exercises: Exercise[];
  programId: string;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const router = useRouter();
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id || "");
  const [sectionId, setSectionId] = useState("");

  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [name, setName] = useState(workout.name);
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState<WorkoutDay>(workout.day);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>(
    {},
  );
  const selectedExercise = exercises.find((e) => e.id === exerciseId);

  const showStrengthFields =
    selectedExercise?.type === "STRENGTH" ||
    selectedExercise?.type === "HYBRID" ||
    selectedExercise?.type === "BODYWEIGHT";

  const showTimedFields = selectedExercise?.type === "TIMED";

  function normalizeSections(
    sections: WorkoutWithSections["workoutSections"],
  ): WorkoutSectionWithExercises[] {
    return sections.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      exercises: section.exercises.map((we) => ({
        id: we.id,
        order: we.order,
        exerciseId: we.exercise?.id ?? "__missing__", // required
        exercise: we.exercise
          ? ({
              ...we.exercise,
            } as Exercise)
          : null,
        prescribed: we.prescribed,
        notes: we.notes,
      })),
    }));
  }

  // ── Optimistic updates for sections + nested exercises ──
  const [optimisticSections, updateOptimisticSections] = useOptimistic<
    WorkoutSectionWithExercises[],
    | {
        type: "add-exercise";
        sectionId: string;
        exercise: SectionExercise;
        exerciseId: string;
      }
    | { type: "remove-exercise"; exerciseId: string }
    | { type: "add-section"; section: WorkoutSectionWithExercises }
    | {
        type: "replace-section";
        tempId: string;
        section: WorkoutSectionWithExercises;
      }
    | { type: "update-section-title"; sectionId: string; title: string }
    | {
        type: "move-exercise";
        exerciseId: string;
        fromSectionId: string;
        toSectionId: string;
      }
    | {
        type: "reorder-sections";
        orderedSectionIds: string[];
      }
  >(normalizeSections(workout.workoutSections), (currentSections, action) => {
    switch (action.type) {
      case "replace-section":
        return currentSections.map((s) =>
          s.id === action.tempId ? action.section : s,
        );

      case "add-section":
        return [...currentSections, action.section];
      case "update-section-title":
        return currentSections.map((section) =>
          section.id === action.sectionId
            ? { ...section, title: action.title }
            : section,
        );

      case "reorder-sections":
        return action.orderedSectionIds.map((id, index) => ({
          ...currentSections.find((s) => s.id === id)!,
          order: index,
        }));

      case "add-exercise":
        return currentSections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: [...section.exercises, action.exercise],
              }
            : section,
        );

      case "remove-exercise":
        return currentSections.map((section) => ({
          ...section,
          exercises: section.exercises.filter(
            (e) => e.id !== action.exerciseId,
          ),
        }));

      case "move-exercise": {
        let movedExercise: SectionExercise | null = null;

        const withoutExercise = currentSections.map((section) => {
          if (section.id === action.fromSectionId) {
            const remaining = section.exercises.filter((e) => {
              if (e.id === action.exerciseId) {
                movedExercise = e;
                return false;
              }
              return true;
            });
            return { ...section, exercises: remaining };
          }
          return section;
        });

        if (!movedExercise) return currentSections;

        return withoutExercise.map((section) =>
          section.id === action.toSectionId
            ? {
                ...section,
                exercises: [...section.exercises, movedExercise!],
              }
            : section,
        );
      }

      default:
        return currentSections;
    }
  });

  useEffect(() => {
    if (!sectionId && workout.workoutSections?.length) {
      setSectionId(workout.workoutSections[0].id);
    }
  }, [workout.workoutSections, sectionId]);

  function saveName() {
    setEditing(false);
    startTransition(() => {
      updateWorkoutName(programId, workout.id, name);
    });
  }

  function saveDay(newDay: WorkoutDay) {
    setDay(newDay);
    startTransition(() => {
      updateWorkoutDay(programId, workout.id, newDay);
    });
  }

  const startEditSection = (sectionId: string) => {
    setEditingSectionId(sectionId);

    setSectionTitles((prev) => {
      if (prev[sectionId] !== undefined) return prev;

      const section = optimisticSections.find((s) => s.id === sectionId);
      if (!section) return prev;

      return {
        ...prev,
        [sectionId]: section.title,
      };
    });
  };
  async function handleAddExercise() {
    if (!exerciseId || !sectionId) return;

    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    let prescribed: Prescribed;

    if (showTimedFields) {
      prescribed = { kind: "timed", duration: time ?? 0 };
    } else if (exercise.type === "BODYWEIGHT") {
      prescribed = { kind: "bodyweight", sets, reps };
    } else if (exercise.type === "HYBRID") {
      prescribed = { kind: "hybrid", sets, reps, weight };
    } else {
      // STRENGTH + fallback
      prescribed = { kind: "strength", sets, reps, weight };
    }

    // Optimistic shape should roughly match what your backend returns
    const optimisticExercise = {
      id: crypto.randomUUID(), // temporary id
      order:
        optimisticSections.find((s) => s.id === sectionId)?.exercises.length ??
        0,
      sectionId, // important for relation
      exercise, // full exercise object
      exerciseId,
      prescribed,
      notes: notes || null,
    };

    startTransition(() => {
      updateOptimisticSections({
        type: "add-exercise",
        sectionId,
        exerciseId,
        exercise: optimisticExercise,
      });
    });

    // Real server call
    try {
      await addWorkoutExercise(
        programId,
        workout.id,
        sectionId, // ← now required
        exerciseId,
        prescribed,
        notes.trim() || undefined,
      );
      setNotes(""); // clear only on success
    } catch (err) {
      console.error("Failed to add exercise", err);
      // TODO: rollback optimistic update (more advanced)
    }
  }

  async function handleDeleteExercise(workoutExerciseId: string) {
    startTransition(() => {
      updateOptimisticSections({
        type: "remove-exercise",
        exerciseId: workoutExerciseId,
      });
    });
    try {
      await deleteWorkoutExercise(programId, workoutExerciseId);
    } catch (err) {
      console.error("Delete failed", err);
      // TODO: revert optimistic state
    }
  }

  async function saveSectionTitle(sectionId: string, newTitle: string) {
    if (!newTitle.trim()) {
      // Optional: revert or show error
      return;
    }

    const trimmed = newTitle.trim();

    // Optimistic update
    startTransition(() => {
      updateOptimisticSections({
        type: "update-section-title",
        sectionId,
        title: trimmed,
      });
    });

    setEditingSectionId(null);

    try {
      await updateWorkoutSectionTitle(programId, sectionId, trimmed);
    } catch (err) {
      console.error("Failed to update section title", err);
      // TODO: rollback (advanced) or show toast/error
    }
  }

  async function handleAddSection() {
    const tempId = crypto.randomUUID();

    const optimisticSection: WorkoutSectionWithExercises = {
      id: tempId,
      title: "New Section",
      order: optimisticSections.length,
      exercises: [],
    };

    startTransition(() => {
      updateOptimisticSections({
        type: "add-section",
        section: optimisticSection,
      });
    });

    try {
      const realSection = await createWorkoutSection(
        programId,
        workout.id,
        "New Section",
      );

      startTransition(() => {
        updateOptimisticSections({
          type: "replace-section",
          tempId,
          section: {
            ...realSection,
            exercises: [],
          },
        });
      });

      setSectionId(realSection.id); // ✅ REAL ID
    } catch (err) {
      console.error("Failed to create section", err);
    }
  }

  function moveSectionUp(sectionId: string) {
    const index = optimisticSections.findIndex((s) => s.id === sectionId);
    if (index <= 0) return;

    const reordered = [...optimisticSections];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];

    const ids = reordered.map((s) => s.id);

    startTransition(() => {
      updateOptimisticSections({
        type: "reorder-sections",
        orderedSectionIds: ids,
      });
    });

    reorderWorkoutSections(workout.id, ids);
     router.refresh();
  }

  function moveSectionDown(sectionId: string) {
    const index = optimisticSections.findIndex((s) => s.id === sectionId);
    if (index === -1 || index >= optimisticSections.length - 1) return;

    const reordered = [...optimisticSections];
    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];

    const ids = reordered.map((s) => s.id);

    startTransition(() => {
      updateOptimisticSections({
        type: "reorder-sections",
        orderedSectionIds: ids,
      });
    });

    reorderWorkoutSections(workout.id, ids);
     router.refresh();
  }

  function moveExerciseWithinSection(
    sectionId: string,
    exerciseId: string,
    direction: "up" | "down",
  ) {
    const section = optimisticSections.find((s) => s.id === sectionId);
    if (!section) return;

    const index = section.exercises.findIndex((e) => e.id === exerciseId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= section.exercises.length) return;

    const reorderedExercises = [...section.exercises];
    [reorderedExercises[index], reorderedExercises[targetIndex]] = [
      reorderedExercises[targetIndex],
      reorderedExercises[index],
    ];

    startTransition(() => {
      updateOptimisticSections({
        type: "replace-section",
        tempId: section.id,
        section: {
          ...section,
          exercises: reorderedExercises.map((e, i) => ({
            ...e,
            order: i,
          })),
        },
      });
    });

     router.refresh();
  }

  return (
    <div className="border p-4 space-y-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="border px-3 py-1.5 font-medium flex-1 min-w-[200px]"
            autoFocus
          />
        ) : (
          <h2
            className="font-semibold text-lg cursor-pointer hover:underline"
            onClick={() => setEditing(true)}
          >
            {name}
          </h2>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">Sections</h3>

          <button
            className="text-sm underline text-blue-600"
            onClick={handleAddSection}
          >
            + Add section
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="border px-2 py-1 text-sm rounded"
          >
            {optimisticSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>

          <select
            value={day}
            onChange={(e) => saveDay(e.target.value as WorkoutDay)}
            className="border px-2 py-1 text-sm rounded"
          >
            <option value="MONDAY">Mon</option>
            <option value="TUESDAY">Tue</option>
            <option value="WEDNESDAY">Wed</option>
            <option value="THURSDAY">Thu</option>
            <option value="FRIDAY">Fri</option>
            <option value="SATURDAY">Sat</option>
            <option value="SUNDAY">Sun</option>
          </select>

          <div className="flex gap-3 text-sm">
            <button
              onClick={onDuplicate}
              className="text-blue-600 hover:underline"
            >
              Duplicate
            </button>
            <button onClick={onDelete} className="text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Sections + Exercises */}
      <div className="space-y-5">
        {optimisticSections.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No sections yet. Add one to start building this workout.
          </p>
        ) : (
          optimisticSections.map((section) => (
            <div
              key={section.id}
              className="border rounded-md p-3 bg-gray-50 group relative" // ← group here for hover
            >
              {/* Section title – either editable input or clickable h3 */}
              <div className="mb-2.5 flex items-center gap-2">
                {editingSectionId === section.id ? (
                  <input
                    type="text"
                    value={sectionTitles[section.id] ?? section.title}
                    onChange={(e) =>
                      setSectionTitles((prev) => ({
                        ...prev,
                        [section.id]: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      saveSectionTitle(
                        section.id,
                        sectionTitles[section.id] ?? section.title,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveSectionTitle(
                          section.id,
                          sectionTitles[section.id] ?? section.title,
                        );
                      }
                      if (e.key === "Escape") {
                        setEditingSectionId(null);
                        // Optional: revert title if you want
                        // setSectionTitles((prev) => ({ ...prev, [section.id]: section.title }));
                      }
                    }}
                    className="font-semibold uppercase text-xs text-gray-700 border-b border-gray-400 px-1 py-0.5 bg-white focus:outline-none focus:border-blue-500 min-w-[140px] flex-1"
                    autoFocus
                  />
                ) : (
                  <h3
                    className="font-semibold uppercase text-xs text-gray-600 tracking-wide cursor-pointer flex items-center gap-1.5 group-hover:text-gray-800"
                    onClick={() => startEditSection(section.id)}
                  >
                    {section.title}
                    <span className="opacity-0 group-hover:opacity-70 text-gray-400 text-[10px] hover:text-gray-600 transition-opacity">
                      ✎
                    </span>
                  </h3>
                )}
                {/* section controls */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => moveSectionUp(section.id)}
                    className="text-xs text-gray-500 hover:text-black"
                    title="Move section up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSectionDown(section.id)}
                    className="text-xs text-gray-500 hover:text-black"
                    title="Move section down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              {/* Exercises list */}
              <ul className="space-y-2">
                {section.exercises.length === 0 ? (
                  <li className="text-xs text-gray-500 italic pl-1">
                    No exercises yet
                  </li>
                ) : (
                  section.exercises.map((we) => (
                    <li
                      key={we.id}
                      className="flex justify-between items-center text-sm py-0.5"
                    >
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            moveExerciseWithinSection(section.id, we.id, "up")
                          }
                          className="text-xs text-gray-400 hover:text-black"
                          title="Move exercise up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() =>
                            moveExerciseWithinSection(section.id, we.id, "down")
                          }
                          className="text-xs text-gray-400 hover:text-black"
                          title="Move exercise down"
                        >
                          ↓
                        </button>
                      </div>

                      <select
                        value={section.id}
                        onChange={async (e) => {
                          const newSectionId = e.target.value;

                          startTransition(() => {
                            updateOptimisticSections({
                              type: "move-exercise",
                              exerciseId: we.id,
                              fromSectionId: section.id,
                              toSectionId: newSectionId,
                            });
                          });

                          await moveWorkoutExercise(
                            programId,
                            we.id,
                            newSectionId,
                          );
                        }}
                        className="text-xs border rounded px-1 py-0.5"
                      >
                        {optimisticSections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2 items-baseline flex-1">
                        <Link
                          href={`/exercises/${we.exercise?.id}/modal`}
                          scroll={false}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {we.exercise?.name || "Missing exercise"}
                        </Link>
                        <span className="text-gray-600">
                          — {formatPrescribed(we.prescribed)}
                        </span>
                        {we.notes && (
                          <span className="text-gray-500 text-xs italic">
                            ({we.notes})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteExercise(we.id)}
                        className="text-red-600 hover:text-red-800 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Add new exercise form */}
      <div className="border-t pt-4 mt-2">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="min-w-[180px]">
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="border px-3 py-1.5 w-full rounded"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {showStrengthFields && (
            <>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                placeholder="Sets"
                className="border px-2 py-1.5 w-16 rounded"
              />
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                placeholder="Reps"
                className="border px-2 py-1.5 w-16 rounded"
              />
              {selectedExercise?.type !== "BODYWEIGHT" && (
                <input
                  type="number"
                  value={weight ?? ""}
                  onChange={(e) =>
                    setWeight(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Weight"
                  className="border px-2 py-1.5 w-20 rounded"
                />
              )}
            </>
          )}

          {showTimedFields && (
            <input
              type="number"
              value={time ?? ""}
              onChange={(e) =>
                setTime(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Seconds"
              className="border px-2 py-1.5 w-24 rounded"
            />
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes / tempo / cues / rest"
            className="border px-3 py-2 text-sm flex-1 min-w-[220px] rounded resize-none"
            rows={2}
          />

          <button
            onClick={handleAddExercise}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
            disabled={!exerciseId || !sectionId}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
