import { renderPrescribed } from "@/app/utils/workoutFunctions";
import { ExerciseLog } from "@/types/workout";

export function ExerciseLogViewer({
  logs,
}: {
  logs: ExerciseLog[];
}) {
  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="border p-3 rounded">
          <div className="font-medium">
            {log.exerciseId}
          </div>

          <div className="text-sm text-gray-600">
            Prescribed: {log.prescribed ? renderPrescribed(log.prescribed) : "N/A"}
          </div>

          <pre className="text-sm mt-1 bg-gray-50 p-2 rounded">
            {JSON.stringify(log.performed, null, 2)}
          </pre>

          {log.substitutionReason && (
            <div className="text-sm italic text-gray-500">
              Notes: {log.substitutionReason}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
