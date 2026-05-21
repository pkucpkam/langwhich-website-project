"use client";

import { useMemo } from "react";

interface ActivityHeatmapProps {
  data: Record<string, number>; // "YYYY-MM-DD" -> count
}

const DAYS_TO_SHOW = 365;
const COLS = Math.ceil(DAYS_TO_SHOW / 7);

function getDaysArray(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-[#1F2937]";
  if (count === 1) return "bg-[#2563EB]/30";
  if (count === 2) return "bg-[#2563EB]/50";
  if (count === 3) return "bg-[#2563EB]/70";
  return "bg-[#2563EB]";
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const days = useMemo(() => getDaysArray(), []);

  // Pad start so grid aligns to Sunday=0
  const firstDay = days[0].getDay();
  const paddedDays: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...days,
  ];

  // Build weeks (columns)
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const totalSessions = Object.values(data).reduce((a, b) => a + b, 0);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; colIdx: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wIdx) => {
      const firstValidDay = week.find((d) => d !== null) as Date | undefined;
      if (firstValidDay) {
        const m = firstValidDay.getMonth();
        if (m !== lastMonth) {
          labels.push({ label: MONTHS[m], colIdx: wIdx });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Study Activity</h3>
        <span className="text-xs text-[#9CA3AF]">
          {totalSessions} sessions in the past year
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div
            className="flex mb-1"
            style={{ paddingLeft: "28px" }}
          >
            {weeks.map((_, idx) => {
              const labelEntry = monthLabels.find((l) => l.colIdx === idx);
              return (
                <div
                  key={idx}
                  className="w-[13px] mr-[2px] text-[9px] text-[#9CA3AF]"
                  style={{ minWidth: "13px" }}
                >
                  {labelEntry ? labelEntry.label : ""}
                </div>
              );
            })}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-0">
            {/* Day of week labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
                <div
                  key={d}
                  className="text-[9px] text-[#9CA3AF] leading-none"
                  style={{ height: "13px", lineHeight: "13px" }}
                >
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[2px]">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={dIdx}
                          className="w-[13px] h-[13px] rounded-[3px] bg-transparent"
                        />
                      );
                    }
                    const dateStr = toDateStr(day);
                    const count = data[dateStr] ?? 0;
                    return (
                      <div
                        key={dIdx}
                        title={`${dateStr}: ${count} session${count !== 1 ? "s" : ""}`}
                        className={`w-[13px] h-[13px] rounded-[3px] cursor-default transition-opacity hover:opacity-80 ${getIntensity(count)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 ml-8">
            <span className="text-[10px] text-[#9CA3AF]">Less</span>
            {["bg-[#1F2937]", "bg-[#2563EB]/30", "bg-[#2563EB]/50", "bg-[#2563EB]/70", "bg-[#2563EB]"].map((cls) => (
              <div key={cls} className={`w-3 h-3 rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[10px] text-[#9CA3AF]">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
