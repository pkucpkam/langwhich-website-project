"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { lessonsApi } from "@/api/lessons.api";
import { historyApi } from "@/api/history.api";
import type { Lesson, VocabularyItem } from "@/types/vocab";
import { CheckCircle, XCircle, ArrowLeft, Loader2, SkipForward } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuizCard {
  item: VocabularyItem;
  options: string[]; // 4 definitions
  selected: string | null;
  correct: boolean | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuizCards(items: VocabularyItem[]): QuizCard[] {
  return shuffle(items).map((item) => {
    const distractors = shuffle(
      items.filter((it) => it.id !== item.id)
    )
      .slice(0, 3)
      .map((it) => it.definition);
    const options = shuffle([item.definition, ...distractors]);
    return { item, options, selected: null, correct: null };
  });
}

export default function ReviewPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [cards, setCards] = useState<QuizCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await lessonsApi.getLessonById(Number(lessonId));
        setLesson(data);
        if (data.vocabularyItems && data.vocabularyItems.length >= 2) {
          setCards(buildQuizCards(data.vocabularyItems));
        }
      } catch {
        router.push("/vocab");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, router]);

  const current = cards[currentIdx];

  const handleSelect = async (option: string) => {
    if (current.selected !== null) return; // already answered

    const isCorrect = option === current.item.definition;
    if (isCorrect) setCorrectCount((c) => c + 1);

    const updatedCards = cards.map((c, idx) =>
      idx === currentIdx ? { ...c, selected: option, correct: isCorrect } : c
    );
    setCards(updatedCards);

    // Auto-advance after 1.5s
    setTimeout(async () => {
      if (currentIdx + 1 < cards.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        await historyApi.saveSession({
          lessonId: Number(lessonId),
          studyMode: "REVIEW",
          timeSpent,
          knowCount: isCorrect ? correctCount + 1 : correctCount,
          totalCount: cards.length,
        }).catch(() => {});
        setCompleted(true);
      }
    }, 1200);
  };

  const handleSkip = () => {
    const updatedCards = cards.map((c, idx) =>
      idx === currentIdx ? { ...c, selected: "SKIPPED", correct: false } : c
    );
    setCards(updatedCards);
    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
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

  if (cards.length < 2) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-[#9CA3AF]">Need at least 2 words for quiz mode.</p>
        <Link href="/vocab" className="text-[#2563EB] hover:underline mt-4 inline-block">
          ← Back
        </Link>
      </div>
    );
  }

  if (completed) {
    const pct = Math.round((correctCount / cards.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">Quiz Complete!</h1>
        <p className="text-[#9CA3AF] mb-2">
          Score: <span className="text-[#F9FAFB] font-bold">{pct}%</span>
        </p>
        <p className="text-[#9CA3AF] mb-8">
          {correctCount} / {cards.length} correct
        </p>

        {/* Wrong answers summary */}
        {cards.some((c) => !c.correct) && (
          <div className="text-left mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-semibold text-red-400 mb-3">Words to review:</p>
            {cards.filter((c) => !c.correct).map((c) => (
              <div key={c.item.id} className="flex justify-between text-sm py-1 border-b border-[#1F2937] last:border-0">
                <span className="text-[#F9FAFB]">{c.item.word}</span>
                <span className="text-[#9CA3AF]">{c.item.definition}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/vocab"
            id="review-back-btn"
            className="px-6 py-3 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
          >
            ← Home
          </Link>
          <button
            type="button"
            onClick={() => {
              setCards(buildQuizCards(lesson!.vocabularyItems!));
              setCurrentIdx(0);
              setCorrectCount(0);
              setCompleted(false);
            }}
            id="review-retry-btn"
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vocab" className="p-2 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]" id="review-back-btn">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[#F9FAFB]">{lesson?.title}</h1>
          <p className="text-xs text-[#9CA3AF]">Question {currentIdx + 1} of {cards.length}</p>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={current?.selected !== null}
          className="p-2 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-amber-400 disabled:opacity-40 transition-all"
          id="review-skip-btn"
          title="Skip"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-[#1F2937] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx) / cards.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
          Choose the correct definition
        </p>
        <h2 className="text-3xl font-bold text-[#F9FAFB]">{current?.item.word}</h2>
        {current?.item.ipa && (
          <p className="mt-2 text-sm text-[#2563EB] font-mono">{current.item.ipa}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current?.options.map((option, idx) => {
          const isSelected = current.selected === option;
          const isCorrect = option === current.item.definition;
          const answered = current.selected !== null;

          return (
            <button
              type="button"
              key={idx}
              id={`review-option-${idx}`}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={cn(
                "p-4 rounded-xl border text-sm text-left leading-relaxed font-medium transition-all duration-200",
                !answered && "border-[#1F2937] bg-[#111827] text-[#F9FAFB] hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer",
                answered && isCorrect && "border-green-500/50 bg-green-500/10 text-green-400",
                answered && isSelected && !isCorrect && "border-red-500/50 bg-red-500/10 text-red-400",
                answered && !isSelected && !isCorrect && "border-[#1F2937] bg-[#111827] text-[#9CA3AF] opacity-50"
              )}
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
                {answered && isCorrect && <CheckCircle size={16} className="ml-auto flex-shrink-0 text-green-400" />}
                {answered && isSelected && !isCorrect && <XCircle size={16} className="ml-auto flex-shrink-0 text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
