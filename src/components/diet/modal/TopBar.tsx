import { X, Share2 } from "lucide-react";

export default function TopBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5 text-gray-300">
        <X size={18} />
      </button>
      <button onClick={() => console.log("share")} className="rounded-full p-2 hover:bg-white/5 text-gray-300">
        <Share2 size={18} />
      </button>
    </div>
  );
}