// src/app/components/workout/WorkoutComponents.tsx
export function SetInput({
  value,
  placeholder,
  label,
  onChange,
  onBlur,
  onFocus,
  nullOnEmpty = true,
}: {
  value: number | null | undefined;
  placeholder?: string;
  label: string;
  onChange: (val: number | null) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  nullOnEmpty?: boolean;
}) {
  const cls = "w-full bg-surface2 border border-surface2 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-lime-green/50 outline-none";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-muted">
        {label}
      </span>
      <input
        type="number"
        value={value || ""}
        placeholder={placeholder ?? "—"}
        className={cls}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        onBlur={(e) => {
          if (nullOnEmpty && (e.target.value === "" || e.target.value === "0")) {
            onChange(null);
          }
          onBlur?.();
        }}
      />
    </div>
  );
}

export function SetRow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="bg-bg rounded-xl px-3 py-3 space-y-2">
      <span className="text-xs font-semibold text-muted">Set {index + 1}</span>
      {children}
    </div>
  );
}