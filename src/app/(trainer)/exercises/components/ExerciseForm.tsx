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
    <form action={action} className="space-y-4 max-w-xl">
      <h1 className="text-xl font-semibold">{title}</h1>

      <input
        name="name"
        placeholder="Exercise name"
        defaultValue={exercise?.name}
        required
        className="border p-2 w-full"
      />

      <select
        name="type"
        defaultValue={exercise?.type ?? "STRENGTH"}
        className="border p-2 w-full"
      >
        <option value="STRENGTH">Strength</option>
        <option value="TIMED">Timed</option>
        <option value="HYBRID">Hybrid</option>
        <option value="BODYWEIGHT">Bodyweight</option>
      </select>

      <input
        name="equipment"
        placeholder="Equipment (optional)"
        defaultValue={exercise?.equipment ?? ""}
        className="border p-2 w-full"
      />

      <input
        name="videoUrl"
        placeholder="Video Url (optional)"
        defaultValue={exercise?.videoUrl ?? ""}
        className="border p-2 w-full"
      />
      <textarea
        name="notes"
        placeholder="Notes / cues"
        defaultValue={exercise?.notes ?? ""}
        className="border p-2 w-full"
      />

      <button type="submit" className="border px-4 py-2 rounded">
        {submitLabel}
      </button>
    </form>
  );
}
