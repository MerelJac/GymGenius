// app/components/DeleteExerciseButton.tsx
"use client";

export function DeleteExerciseButton() {
  return (
    <button
      type="submit"
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
      onClick={(e) => {
        if (!confirm("Are you sure you want to delete this exercise?")) {
          e.preventDefault();
        }
      }}
    >
      Delete Exercise
    </button>
  );
}
