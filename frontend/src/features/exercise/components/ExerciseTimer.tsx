import { useEffect } from "react";
import { Clock } from "lucide-react";
import { usePracticeStore } from "../store/practice.store";

export function ExerciseTimer() {
  const timerSeconds = usePracticeStore((state) => state.timerSeconds);
  const incrementTimer = usePracticeStore((state) => state.incrementTimer);

  useEffect(() => {
    const interval = setInterval(() => {
      incrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [incrementTimer]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-card text-text-primary font-mono text-sm font-semibold border border-neutral-border shadow-inner">
      <Clock className="h-4 w-4 text-primary animate-pulse" />
      <span>{formatTime(timerSeconds)}</span>
    </div>
  );
}
export default ExerciseTimer;
