import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExerciseTimer } from "./ExerciseTimer";
import type { Difficulty } from "../types";

interface ExerciseHeaderProps {
  title: string;
  difficulty: Difficulty;
  answeredCount: number;
  totalCount: number;
  onExit: () => void;
  isAutosaving?: boolean;
}

export function ExerciseHeader({
  title,
  difficulty,
  answeredCount,
  totalCount,
  onExit,
  isAutosaving = false,
}: ExerciseHeaderProps) {
  const percentage = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  return (
    <div className="bg-neutral-card border-b border-neutral-border py-4 px-6 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onExit} className="p-2 h-auto text-text-secondary hover:text-text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-text-primary truncate max-w-xs md:max-w-md">{title}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase mt-1 tracking-wider">
                {difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAutosaving && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 animate-pulse">
                Saving...
              </span>
            )}
            <ExerciseTimer />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <span>Completed {answeredCount} of {totalCount}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-neutral-border h-2.5 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ExerciseHeader;
