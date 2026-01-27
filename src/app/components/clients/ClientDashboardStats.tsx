import { formatNextWorkout } from "@/app/utils/format/formatNextWorkout";
import { Flame, CheckCircle, Calendar } from "lucide-react";

export function ClientDashboardStats({
  streak,
  completed,
  scheduled,
  nextWorkoutDate,
}: {
  streak: number;
  completed: number;
  scheduled: number;
  nextWorkoutDate: Date | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* On-Plan Streak */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center gap-2 text-orange-600">
          <Flame size={18} />
          <span className="font-medium">On-Plan Streak</span>
        </div>
        <div className="text-3xl font-bold mt-2">{streak} days</div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          <span className="font-medium">This Week</span>
        </div>
        <div className="text-3xl font-bold mt-2">
          {completed} / {scheduled}
        </div>
        <p className="text-sm text-gray-500 mt-1">workouts completed</p>
      </div>

      {/* Next Workout */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center gap-2 text-blue-600">
          <Calendar size={18} />
          <span className="font-medium">Next Workout</span>
        </div>
        <div className="text-lg font-semibold mt-2">
          {nextWorkoutDate
            ? formatNextWorkout(nextWorkoutDate)
            : "None scheduled"}
        </div>
      </div>
    </div>
  );
}
