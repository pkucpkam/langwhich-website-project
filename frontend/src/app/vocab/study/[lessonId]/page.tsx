"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { lessonsApi } from "@/api/lessons.api";
import { historyApi } from "@/api/history.api";
import { srsApi } from "@/api/srs.api";
import { Flashcard } from "@/components/features/study/Flashcard";
import type { Lesson, VocabularyItem } from "@/types/vocab";
import {
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type CardState = VocabularyItem & { known: boolean };

export default function StudyPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [cards, setCards] = useState<CardState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [knowCount, setKnowCount] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await lessonsApi.getLessonById(Number(lessonId));
        setLesson(data);
        if (data.vocabularyItems) {
          setCards(data.vocabularyItems.map((v) => ({ ...v, known: false })));
        }
      } catch {
        router.push("/vocab");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, router]);

  const unknownCards = cards.filter((c) => !c.known);
  const currentCard = unknownCards[currentIdx];
  const progress = cards.length > 0 ? ((cards.length - unknownCards.length) / cards.length) * 100 : 0;

  const handleKnow = async () => {
    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, known: true } : c
    );
    setCards(updatedCards);
    setKnowCount((k) => k + 1);
    setIsFlipped(false);

    const stillUnknown = updatedCards.filter((c) => !c.known);
    if (stillUnknown.length === 0) {
      // Completed!
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      await Promise.all([
        historyApi.saveSession({
          lessonId: Number(lessonId),
          studyMode: "FLASHCARD",
          timeSpent,
          knowCount: updatedCards.length,
          totalCount: updatedCards.length,
        }).catch(() => {}),
        srsApi.initializeCards(Number(lessonId)).catch(() => {}),
      ]);
      setCompleted(true);
    } else {
      setCurrentIdx(Math.min(currentIdx, stillUnknown.length - 1));
    }
  };

  const handleStillLearning = () => {
    setIsFlipped(false);
    const stillUnknown = cards.filter((c) => !c.known);
    setCurrentIdx((currentIdx + 1) % stillUnknown.length);
  };

  const handleRestart = () => {
    setCards(cards.map((c) => ({ ...c, known: false })));
    setCurrentIdx(0);
    setIsFlipped(false);
    setCompleted(false);
    setKnowCount(0);
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
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">
          You did it! 🎉
        </h1>
        <p className="text-[#9CA3AF] mb-8">
          You knew {knowCount} out of {cards.length} words.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#2563EB]/50 transition-all font-medium"
            id="study-restart-btn"
          >
            <RotateCcw size={16} />
            Study Again
          </button>
          <Link
            href={`/review/${lessonId}`}
            id="study-go-review-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all font-medium"
          >
            Review (Quiz)
          </Link>
          <Link
            href={`/test/${lessonId}`}
            id="study-go-test-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white hover:bg-amber-400 transition-all font-medium"
          >
            Take Test
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/vocab"
          className="p-2 rounded-xl border border-[#1F2937] hover:border-[#2563EB]/50 text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
          id="study-back-btn"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[#F9FAFB]">
            {lesson?.title}
          </h1>
          <p className="text-xs text-[#9CA3AF]">
            {unknownCards.length} remaining · {knowCount} known
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#1F2937] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <Flashcard
        item={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />

      {/* Action buttons */}
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          id="study-still-learning-btn"
          onClick={handleStillLearning}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all font-semibold text-base"
        >
          <ThumbsDown size={20} />
          Still Learning
        </button>
        <button
          type="button"
          id="study-know-btn"
          onClick={handleKnow}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all font-semibold text-base"
        >
          <ThumbsUp size={20} />
          Know It!
        </button>
      </div>

      <p className="text-center text-xs text-[#9CA3AF] mt-4">
        Card {currentIdx + 1} of {unknownCards.length}
      </p>
    </div>
  );
}
