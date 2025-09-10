"use client";

export default function WorkoutPreviewModal({
  title = "Preview Workout",
  plans,
  onConfirm,
  onClose,
  children,
}: {
  title?: string;
  plans: any[];
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--card-background)] rounded-2xl w-[500px] max-h-[85vh] flex flex-col shadow-xl border border-[var(--card-border)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[var(--card-border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Plans Preview */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)] shadow-sm"
              >
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                  📅{" "}
                  {plan.createdAt?.seconds
                    ? new Date(plan.createdAt.seconds * 1000).toLocaleDateString()
                    : "Workout"}
                </p>

                {plan.exercises?.length > 0 ? (
                  <div className="grid gap-3">
                    {plan.exercises.map((ex: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[var(--surface-light)] border border-[var(--card-border)] hover:bg-[var(--surface-hover)] transition"
                      >
                        <p className="font-semibold text-[var(--text-primary)]">
                          {ex.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {ex.sets} sets • {ex.reps} reps • {ex.difficulty}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {ex.muscleGroup}{" "}
                          {ex.subGroup ? `• ${ex.subGroup}` : ""}
                        </p>
                        {ex.equipment?.length > 0 && (
                          <p className="text-xs text-[var(--text-muted)]">
                            Equipment: {ex.equipment.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    No exercises in this plan.
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Extra content */}
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--card-border)] flex gap-3 bg-[var(--surface-dark)]">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-[var(--text-primary)] font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-green)] text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}