"use client";

import { useEffect, useState } from "react";
import { historyApi } from "@/api/history.api";
import type { StudySession } from "@/types/vocab";
import { ActivityHeatmap } from "@/components/features/home/ActivityHeatmap";
import { Clock, BookOpen, Brain, Calendar, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const mins = Math.floor(sec / 60);
  const remaining = sec % 60;
  return remaining > 0 ? `${mins}m ${remaining}s` : `${mins}m`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudyHistoryPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const [sData, hData] = await Promise.all([
          historyApi.getMyHistory(),
          historyApi.getDailyActivity(),
        ]);
        setSessions(sData);
        setHeatmapData(hData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((acc, s) => acc + s.timeSpent, 0);
  const totalWordsLearned = sessions.reduce((acc, s) => acc + s.knowCount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Study History</h1>
        <p className="text-sm text-[#9CA3AF]">
          Review your learning statistics and track your progress over time
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Total Time Spent
                </p>
                <p className="text-lg font-bold text-[#F9FAFB]">
                  {formatDuration(totalSeconds)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Sessions Completed
                </p>
                <p className="text-lg font-bold text-[#F9FAFB]">
                  {totalSessions} sessions
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase">
                  Terms Reviewed
                </p>
                <p className="text-lg font-bold text-[#F9FAFB]">
                  {totalWordsLearned} words
                </p>
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap data={heatmapData} />

          {/* Detailed sessions */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F9FAFB]">
              Recent Activity Logs
            </h2>

            {sessions.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#1F2937] rounded-2xl">
                <Calendar size={36} className="mx-auto text-[#9CA3AF] mb-3" />
                <p className="text-[#9CA3AF] text-sm">No activity logged yet.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-xs font-semibold text-[#9CA3AF] grid grid-cols-4 gap-4">
                  <span>LESSON</span>
                  <span>STUDY MODE</span>
                  <span>DURATION</span>
                  <span className="text-right">ACCURACY / SCORE</span>
                </div>
                <div className="divide-y divide-[#1F2937]">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="px-6 py-4 text-sm grid grid-cols-4 gap-4 items-center"
                    >
                      <span className="text-[#F9FAFB] font-semibold truncate">
                        {session.lessonTitle}
                      </span>
                      <div>
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                            session.studyMode === "FLASHCARD" && "bg-blue-500/10 text-blue-400",
                            session.studyMode === "REVIEW" && "bg-emerald-500/10 text-emerald-400",
                            session.studyMode === "TEST" && "bg-amber-500/10 text-amber-400",
                            session.studyMode === "SRS_REVIEW" && "bg-purple-500/10 text-purple-400"
                          )}
                        >
                          {session.studyMode.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[#9CA3AF]">
                        {formatDuration(session.timeSpent)}
                      </span>
                      <span className="text-right font-medium text-[#F9FAFB]">
                        {session.knowCount} / {session.totalCount} ({Math.round((session.knowCount / session.totalCount) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
