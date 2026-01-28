"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RescheduleWorkoutModal } from "./workout/RescheduleWorkoutModal";

// Minimal shape based on your existing schema
export type CalendarScheduledWorkout = {
  id: string;
  scheduledDate: string | Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  workout: {
    id: string;
    name: string;
  };
};
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function WorkoutCalendarWeek({
  scheduledWorkouts,
  referenceDate = new Date(),
  onPrevWeek,
  onNextWeek,
}: {
  scheduledWorkouts: CalendarScheduledWorkout[];
  referenceDate?: Date;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}) {
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const normalized = useMemo(() => {
    return scheduledWorkouts.map((w) => ({
      ...w,
      scheduledDate: new Date(w.scheduledDate),
    }));
  }, [scheduledWorkouts]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <div className="font-semibold text-gray-900">
          Week of {weekStart.toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate((d) => addDays(d, -7))}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setCurrentDate((d) => addDays(d, 7))}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 divide-x divide-gray-200">
        {days.map((day) => {
          const workoutsForDay = normalized.filter((w) =>
            sameDay(w.scheduledDate as Date, day),
          );

          return (
            <div key={day.toISOString()} className="min-h-[160px] p-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                {day.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {workoutsForDay.length === 0 ? (
                <div className="text-xs text-gray-400 italic">No workouts</div>
              ) : (
                <div className="space-y-2">
                  {workoutsForDay.map((w) => (
                    <div
                      key={w.id}
                      className={`rounded-lg px-2 py-1.5 text-xs border flex flex-col gap-0.5
                        ${
                          w.status === "COMPLETED"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : w.status === "IN_PROGRESS"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : w.status === "SKIPPED"
                                ? "bg-gray-100 border-gray-200 text-gray-500"
                                : "bg-white border-gray-200 text-gray-800"
                        }
                      `}
                    >
                      <span className="font-medium truncate">
                        {w.workout.name}
                      </span>
                      <span className="text-[10px] opacity-70">{w.status}</span>

                      <button
                        onClick={() => setRescheduleId(w.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Reschedule
                      </button>

                      {rescheduleId === w.id && (
                        <RescheduleWorkoutModal
                          scheduledWorkoutId={w.id}
                          currentDate={w.scheduledDate}
                          onClose={() => setRescheduleId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
