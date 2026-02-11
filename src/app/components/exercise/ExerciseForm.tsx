import { Exercise } from "@prisma/client";

type Props = {
  exercise?: Exercise; // present when editing
  action: (formData: FormData) => Promise<void>;
  title: string;
  submitLabel?: string;
};

export default function ExerciseForm({
  exercise,
  action,
  title,
  submitLabel = "Save Exercise",
}: Props) {
  return (
    <form
      action={action}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Exercise Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="e.g. Barbell Back Squat"
            defaultValue={exercise?.name ?? ""}
            required
            autoFocus
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-base"
          />
        </div>

        {/* Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Exercise Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={exercise?.type ?? "STRENGTH"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm bg-white "
          >
            <option value="STRENGTH">Strength</option>
            <option value="TIMED">Timed</option>
            <option value="HYBRID">Hybrid</option>
            <option value="BODYWEIGHT">Bodyweight</option>
            <option value="CORE">Core</option>
            <option value="MOBILITY">Mobility</option>
          </select>
        </div>

        {/* Equipment */}
        <div>
          <label
            htmlFor="equipment"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Equipment (optional)
          </label>
          <input
            id="equipment"
            name="equipment"
            placeholder="e.g. Barbell, Bench"
            defaultValue={exercise?.equipment ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-base"
          />
        </div>

        {/* Muscle Group */}
        <div>
          <label
            htmlFor="muscleGroup"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Muscle Group (optional)
          </label>
          <input
            id="muscleGroup"
            name="muscleGroup"
            placeholder="Upper Back / Shoulders"
            defaultValue={exercise?.muscleGroup ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-base"
          />
        </div>

        {/* Video URL */}
        <div>
          <label
            htmlFor="videoUrl"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Demo Video URL (optional)
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            placeholder="https://youtube.com/watch?v=..."
            defaultValue={exercise?.videoUrl ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-base"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Coaching Cues / Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            placeholder="e.g. Keep chest up, drive through heels, brace core..."
            defaultValue={exercise?.notes ?? ""}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm resize-y"
          />
        </div>
      </div>

      <input type="hidden" name="exerciseId" value={exercise?.id} />
      <input type="hidden" name="trainerId" value={exercise?.trainerId ?? ""} />
      
      <div className="pt-2">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-sm"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
