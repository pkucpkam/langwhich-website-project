"use client";

import { useEffect, useState } from "react";
import { leaderboardApi } from "@/api/history.api";
import type { LeaderboardEntry } from "@/types/vocab";
import { Trophy, Clock, Medal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const mins = Math.floor(sec / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardApi.getLeaderboard()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Reorder top three for visual layout (2nd, 1st, 3rd)
  const podiumLayout = [];
  if (topThree[1]) podiumLayout.push({ ...topThree[1], rank: 2 });
  if (topThree[0]) podiumLayout.push({ ...topThree[0], rank: 1 });
  if (topThree[2]) podiumLayout.push({ ...topThree[2], rank: 3 });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB] flex items-center gap-2">
          <Trophy className="text-amber-400" />
          Global Leaderboard
        </h1>
        <p className="text-sm text-[#9CA3AF]">
          See who spent the most time mastering English vocabulary on LangWhich
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1F2937] rounded-2xl">
          <Trophy size={40} className="mx-auto text-[#9CA3AF] mb-4" />
          <p className="text-[#9CA3AF]">No leaderboard data yet. Start studying to make history!</p>
        </div>
      ) : (
        <>
          {/* Podium section */}
          {topThree.length > 0 && (
            <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 pt-10 pb-6 max-w-2xl mx-auto">
              {podiumLayout.map((entry) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;

                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "w-full sm:w-44 flex flex-col items-center rounded-2xl border bg-[#111827] p-5 relative transition-all duration-200",
                      isFirst && "border-amber-500/50 bg-[#111827] shadow-xl shadow-amber-500/5 sm:-translate-y-4",
                      isSecond && "border-slate-400/30",
                      isThird && "border-amber-700/30"
                    )}
                  >
                    {/* Crown or Badge */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold absolute -top-4 shadow-lg",
                        isFirst && "bg-amber-500 text-neutral-900",
                        isSecond && "bg-slate-400 text-neutral-900",
                        isThird && "bg-amber-700 text-white"
                      )}
                    >
                      {entry.rank}
                    </div>

                    {/* Profile Avatar placeholder */}
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mb-3",
                        isFirst && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        isSecond && "bg-slate-400/20 text-slate-300 border border-slate-400/30",
                        isThird && "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                      )}
                    >
                      {entry.username[0]?.toUpperCase()}
                    </div>

                    <h3 className="font-semibold text-[#F9FAFB] text-sm truncate max-w-full">
                      {entry.username}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Clock size={12} />
                      <span>{formatDuration(entry.totalTimeSpent)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranking list table */}
          {rest.length > 0 && (
            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden max-w-3xl mx-auto">
              <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0B1220]/50 text-xs font-semibold text-[#9CA3AF] grid grid-cols-12 gap-2">
                <span className="col-span-2">RANK</span>
                <span className="col-span-7">LEARNER</span>
                <span className="col-span-3 text-right">TOTAL STUDY TIME</span>
              </div>
              <div className="divide-y divide-[#1F2937]">
                {rest.map((entry, idx) => (
                  <div
                    key={entry.userId}
                    className="px-6 py-4 text-sm grid grid-cols-12 gap-2 items-center"
                  >
                    <span className="col-span-2 text-[#9CA3AF] font-bold">
                      #{idx + 4}
                    </span>
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex items-center justify-center text-xs font-bold">
                        {entry.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-[#F9FAFB] font-semibold">
                        {entry.username}
                      </span>
                    </div>
                    <span className="col-span-3 text-right text-[#9CA3AF] font-medium">
                      {formatDuration(entry.totalTimeSpent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
