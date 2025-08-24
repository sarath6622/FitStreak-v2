import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
}

export default function GenerateButton({ onClick, loading }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Generating...
        </>
      ) : (
        "Generate Workout"
      )}
    </button>
  );
}