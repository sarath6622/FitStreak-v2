export default function FooterActions({
  disabled,
  onClose,
  onAdd,
}: {
  disabled: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <button
        onClick={onClose}
        className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 transition"
      >
        Cancel
      </button>
      <button
        disabled={disabled}
        onClick={onAdd}
        className={`h-11 flex-1 rounded-xl transition ${
          disabled
            ? "bg-emerald-800/40 text-emerald-200/60 cursor-not-allowed"
            : "bg-emerald-700 hover:bg-emerald-600 text-white"
        }`}
      >
        Add
      </button>
    </div>
  );
}