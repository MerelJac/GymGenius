"use client";

import { useOptimistic, startTransition, useState } from "react";
import {
  assignProgramToClient,
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
} from "../(trainer)/programs/[programId]/actions";
import WorkoutCard from "./WorkoutCard";
import { ProgramWithWorkouts, WorkoutWithExercises } from "@/types/workout";
import { Exercise } from "@/types/exercise";
import { updateProgramName } from "../(trainer)/programs/actions";
import { User, WorkoutDay } from "@prisma/client";
import Link from "next/link";
import { BackButton } from "./BackButton";

type WorkoutAction =
  | { type: "add"; workout: WorkoutWithExercises }
  | { type: "remove"; id: string };

export default function ProgramBuilder({
  program,
  exercises,
  clients,
}: {
  program: ProgramWithWorkouts;
  exercises: Exercise[];
  clients: User[];
}) {
  const [optimisticWorkouts, updateOptimisticWorkouts] = useOptimistic<
    WorkoutWithExercises[],
    WorkoutAction
  >(program.workouts, (state, action) => {
    switch (action.type) {
      case "add":
        return [...state, action.workout];

      case "remove":
        return state.filter((w) => w.id !== action.id);

      default:
        return state;
    }
  });
  const [editingName, setEditingName] = useState(false);
  const [programName, setProgramName] = useState(program.name);
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  async function saveProgramName() {
    setEditingName(false);

    startTransition(() => {
      updateProgramName(program.id, programName);
    });
  }

  async function handleAssign() {
    if (!clientId || !startDate) return;

    await assignProgramToClient(program.id, clientId, new Date(startDate));
  }

  async function handleAddWorkout() {
    const optimisticWorkout: WorkoutWithExercises = {
      id: crypto.randomUUID(),
      name: "New Workout",
      order: optimisticWorkouts.length,
      exercises: [],
      day: WorkoutDay.MONDAY,
    };

    startTransition(() => {
      updateOptimisticWorkouts({
        type: "add",
        workout: optimisticWorkout,
      });
    });

    await createWorkout(program.id);
  }

  async function handleDeleteWorkout(workout: WorkoutWithExercises) {
    startTransition(() => {
      updateOptimisticWorkouts({
        type: "remove",
        id: workout.id,
      });
    });

    await deleteWorkout(program.id, workout.id);
  }

  async function handleDuplicateWorkout(workout: WorkoutWithExercises) {
    const optimisticCopy: WorkoutWithExercises = {
      ...workout,
      id: crypto.randomUUID(),
      name: `${workout.name} (Copy)`,
    };

    startTransition(() => {
      updateOptimisticWorkouts({
        type: "add",
        workout: optimisticCopy,
      });
    });

    await duplicateWorkout(program.id, workout.id);
  }

  return (
    <div className="space-y-6">
      {editingName ? (
        <input
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          onBlur={saveProgramName}
          onKeyDown={(e) => e.key === "Enter" && saveProgramName()}
          className="border px-2 py-1 text-2xl font-semibold w-full"
          autoFocus
        />
      ) : (
        <>
          <BackButton route={"/programs"} />
          <h1
            className="text-2xl font-semibold cursor-pointer hover:underline"
            onClick={() => setEditingName(true)}
          >
            {programName}
          </h1>
          <div className="flex gap-2 items-center">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="">Assign to client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1"
            />

            <button onClick={handleAssign} className="border px-3 py-1 rounded">
              Assign
            </button>
          </div>
        </>
      )}

      <button onClick={handleAddWorkout} className="border px-3 py-1 rounded">
        + Add Workout
      </button>

      {optimisticWorkouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          exercises={exercises}
          programId={program.id}
          onDelete={() => handleDeleteWorkout(workout)}
          onDuplicate={() => handleDuplicateWorkout(workout)}
        />
      ))}
    </div>
  );
}
