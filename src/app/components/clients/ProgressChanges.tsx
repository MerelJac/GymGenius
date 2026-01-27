import { ProgressChangesProps } from "@/types/progress";

export function ProgressChanges({
  strength,
  weight,
  bodyFat,
}: ProgressChangesProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      <h3 className="text-sm font-semibold text-gray-700">
        Progress Changes
      </h3>

      {/* Strength */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-gray-500 uppercase">
          Strength
        </div>

        {strength.length === 0 ? (
          <p className="text-sm text-gray-500">
            Not enough data yet
          </p>
        ) : (
          strength.map((lift) => {
            const diff = lift.current1RM - lift.previous1RM;
            const positive = diff > 0;

            return (
              <div
                key={lift.exerciseName}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-800">
                  {lift.exerciseName}
                </span>
                <span
                  className={
                    positive
                      ? "text-green-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  {positive && "+"}
                  {diff} lb 1RM
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weight */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">
            Body Weight
          </div>
          {weight ? (
            <div className="text-sm font-medium text-gray-900">
              {weight.current} lb{" "}
              <span className="text-gray-500">
                ({weight.current - weight.previous > 0 ? "+" : ""}
                {weight.current - weight.previous})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data</p>
          )}
        </div>

        {/* Body Fat */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">
            Body Fat %
          </div>
          {bodyFat ? (
            <div className="text-sm font-medium text-gray-900">
              {bodyFat.current}%{" "}
              <span className="text-gray-500">
                ({bodyFat.current - bodyFat.previous > 0 ? "+" : ""}
                {bodyFat.current - bodyFat.previous}%)
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
