"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { srsApi } from "@/api/srs.api";
import { historyApi } from "@/api/history.api";
import type { SrsCard, SrsRating } from "@/types/vocab";
import { ArrowLeft, Brain, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RATINGS: { label: string; value: SrsRating; color: string; bg: string }[] = [
  { label: "Again", value: 0, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20" },
  { label: "Hard", value: 3, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20" },
  { label: "Good", value: 4, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" },
  { label: "Easy", value: 5, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" },
];

export default function SrsReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<SrsCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    srsApi.getDueCards()
      .then((data) => {
        if (data.length === 0) {
          router.replace("/vocab");
          return;
        }
        setCards(data);
      })
      .catch(() => router.replace("/vocab"))
      .finally(() => setLoading(false));
  }, [router]);

  const current = cards[currentIdx];

  const handleRate = async (rating: SrsRating) => {
    try {
      await srsApi.reviewCard(current.id, rating);
      if (rating >= 3) setCorrectCount((c) => c + 1);
    } catch {
      // ignore
    }

    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(currentIdx + 1);
      setRevealed(false);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      await historyApi.saveSession({
        lessonId: current.lessonId,
        studyMode: "SRS_REVIEW",
        timeSpent,
        knowCount: correctCount + (rating >= 3 ? 1 : 0),
        totalCount: cards.length,
      }).catch(() => {});
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">SRS Review Done! 🧠</h1>
        <p className="text-[#9CA3AF] mb-8">
          Reviewed {cards.length} cards · {correctCount} correct
        </p>
        <Link
          href="/vocab"
          id="srs-done-home-btn"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all font-medium"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vocab" className="p-2 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]" id="srs-back-btn">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-purple-400" />
            <h1 className="text-lg font-semibold text-[#F9FAFB]">SRS Review</h1>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Card {currentIdx + 1} of {cards.length} · {current.lessonTitle}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-[#1F2937] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        {/* Front */}
        <div className="p-10 text-center border-b border-[#1F2937]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
            {current.wordType ?? "word"}
          </p>
          <h2 className="text-4xl font-bold text-[#F9FAFB]">{current.word}</h2>
          {current.ipa && (
            <p className="mt-2 text-[#2563EB] font-mono">{current.ipa}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#9CA3AF]">
            <span>Streak: {current.streak}</span>
            <span>·</span>
            <span>Interval: {current.intervalDays}d</span>
            <span>·</span>
            <span>EF: {current.easeFactor.toFixed(2)}</span>
          </div>
        </div>

        {/* Back */}
        {revealed ? (
          <div className="p-8 text-center">
            <p className="text-xl font-semibold text-[#F9FAFB] mb-3">
              {current.definition}
            </p>
            {current.exampleEn && (
              <p className="text-sm text-[#9CA3AF] italic">"{current.exampleEn}"</p>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <button
              type="button"
              id="srs-reveal-btn"
              onClick={() => setRevealed(true)}
              className="px-8 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all font-semibold"
            >
              Show Answer
            </button>
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {revealed && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {RATINGS.map(({ label, value, color, bg }) => (
            <button
              type="button"
              key={value}
              id={`srs-rate-${label.toLowerCase()}`}
              onClick={() => handleRate(value)}
              className={cn(
                "py-3 rounded-xl border font-semibold text-sm transition-all duration-200",
                bg,
                color
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
