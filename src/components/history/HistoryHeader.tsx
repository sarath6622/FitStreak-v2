import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function HistoryHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-white p-2">Workout History</h1>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter size={16} /> Filter
      </Button>
    </div>
  );
}