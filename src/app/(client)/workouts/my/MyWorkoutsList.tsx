"use client";
import { useState } from "react";
import Link from "next/link";
import { RescheduleWorkoutModal } from "@/app/components/workout/RescheduleWorkoutModal";
import { Calendar } from "lucide-react";

type ScheduledWorkout = {
  id: string;
  scheduledDate: Date;
  workout: { id: string; name: string };
};

export default function MyWorkoutsList({
  workouts,
}: {
  workouts: ScheduledWorkout[];
}) {
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  return (
    <ul className="feed">
      {workouts.map((sw) => (
        <li key={sw.id}>
          <div className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 feed-item">
            <Link
              href={`/workouts/${sw.id}`}
              className="flex items-center gap-3 flex-1 active:scale-[0.98] transition-transform"
            >
              <div className="feed-info">
                <p className="feed-name">{sw.workout.name}</p>
                <p className="feed-date">
                  {sw.scheduledDate.toLocaleDateString()}
                </p>
              </div>

              <span className="btn-arrow">→</span>
            </Link>
            <button
              onClick={() => setRescheduleId(sw.id)}
              className="text-muted hover:text-lime-green transition-colors p-1.5"
              title="Reschedule workout"
            >
              <Calendar size={14} />
            </button>
          </div>
          {rescheduleId === sw.id && (
            <RescheduleWorkoutModal
              scheduledWorkoutId={sw.id}
              currentDate={sw.scheduledDate}
              onClose={() => setRescheduleId(null)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
