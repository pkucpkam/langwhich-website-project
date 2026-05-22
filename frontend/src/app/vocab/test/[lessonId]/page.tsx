"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { lessonsApi } from "@/api/lessons.api";
import { historyApi } from "@/api/history.api";
import type { Lesson, VocabularyItem } from "@/types/vocab";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TestQuestion {
  item: VocabularyItem;
  userAnswer: string;
  isCorrect: boolean | null;
  showHint: boolean;
}

export default function TestPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await lessonsApi.getLessonById(Number(lessonId));
        setLesson(data);
        if (data.vocabularyItems && data.vocabularyItems.length > 0) {
          const shuffled = [...data.vocabularyItems].sort(() => Math.random() - 0.5);
          setQuestions(
            shuffled.map((item) => ({
              item,
              userAnswer: "",
              isCorrect: null,
              showHint: false,
            }))
          );
        }
      } catch {
        router.push("/vocab");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, router]);

  const current = questions[currentIdx];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || current.isCorrect !== null) return;

    const trimmedAns = inputValue.trim().toLowerCase();
    const correctAns = current.item.word.trim().toLowerCase();
    const isCorrect = trimmedAns === correctAns;

    if (isCorrect) setCorrectCount((c) => c + 1);

    const updated = questions.map((q, idx) =>
      idx === currentIdx
        ? { ...q, userAnswer: inputValue, isCorrect }
        : q
    );
    setQuestions(updated);

    // Auto-advance after a short delay
    setTimeout(async () => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
        setInputValue("");
      } else {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        await historyApi.saveSession({
          lessonId: Number(lessonId),
          studyMode: "TEST",
          timeSpent,
          knowCount: isCorrect ? correctCount + 1 : correctCount,
          totalCount: questions.length,
        }).catch(() => {});
        setCompleted(true);
      }
    }, 1500);
  };

  const handleRevealLetter = () => {
    const word = current.item.word;
    const currentLength = inputValue.length;
    if (currentLength < word.length) {
      setInputValue(inputValue + word[currentLength]);
    }
  };

  const handleToggleHint = () => {
    setQuestions(
      questions.map((q, idx) =>
        idx === currentIdx ? { ...q, showHint: !q.showHint } : q
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-[#9CA3AF]">This lesson has no words for testing.</p>
        <Link href="/vocab" className="text-[#2563EB] hover:underline mt-4 inline-block">
          ← Back
        </Link>
      </div>
    );
  }

  if (completed) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">Test Complete!</h1>
        <p className="text-[#9CA3AF] mb-2">
          Score: <span className="text-[#F9FAFB] font-bold">{pct}%</span>
        </p>
        <p className="text-[#9CA3AF] mb-8">
          {correctCount} / {questions.length} correct
        </p>

        {/* Breakdown table */}
        <div className="text-left mb-8 rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1F2937] bg-[#0B1220]/50 text-xs font-semibold text-[#9CA3AF] grid grid-cols-3 gap-2">
            <span>PROMPT</span>
            <span>YOUR ANSWER</span>
            <span>CORRECT ANSWER</span>
          </div>
          <div className="divide-y divide-[#1F2937] max-h-80 overflow-y-auto">
            {questions.map((q) => (
              <div key={q.item.id} className="px-4 py-3 text-sm grid grid-cols-3 gap-2 items-center">
                <span className="text-[#9CA3AF] truncate" title={q.item.definition}>
                  {q.item.definition}
                </span>
                <span className={cn("font-medium truncate flex items-center gap-1.5", q.isCorrect ? "text-green-400" : "text-red-400")}>
                  {q.isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {q.userAnswer}
                </span>
                <span className="text-[#F9FAFB] font-semibold">{q.item.word}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/vocab"
            className="px-6 py-3 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
            id="test-completed-home"
          >
            ← Home
          </Link>
          <button
            type="button"
            onClick={() => {
              const shuffled = [...lesson!.vocabularyItems!].sort(() => Math.random() - 0.5);
              setQuestions(
                shuffled.map((item) => ({
                  item,
                  userAnswer: "",
                  isCorrect: null,
                  showHint: false,
                }))
              );
              setCurrentIdx(0);
              setInputValue("");
              setCorrectCount(0);
              setCompleted(false);
            }}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white hover:bg-amber-400 transition-all font-medium"
            id="test-completed-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = current.isCorrect !== null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vocab" className="p-2 rounded-xl border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]" id="test-back-btn">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[#F9FAFB]">{lesson?.title}</h1>
          <p className="text-xs text-[#9CA3AF]">Question {currentIdx + 1} of {questions.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-[#1F2937] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentIdx / questions.length) * 100}%` }}
        />
      </div>

      {/* Prompt Card */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 mb-6 text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
          Type the correct word matching the definition
        </p>
        <h2 className="text-2xl font-bold text-[#F9FAFB]">
          {current.item.definition}
        </h2>

        {current.item.wordType && (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B1220] text-[#9CA3AF] uppercase">
            {current.item.wordType}
          </span>
        )}

        {current.showHint && current.item.exampleEn && (
          <p className="text-sm text-[#9CA3AF] italic mt-2">
            Example: "{current.item.exampleEn.replace(new RegExp(current.item.word, "gi"), "_____")}"
          </p>
        )}
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            id="test-answer-input"
            type="text"
            placeholder="Type your answer..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnswered}
            autoFocus
            className={cn(
              "w-full px-5 py-4 rounded-xl border text-base transition-all focus:outline-none focus:ring-2",
              !isAnswered && "border-[#1F2937] bg-[#111827] text-[#F9FAFB] focus:ring-[#2563EB] focus:border-transparent",
              isAnswered && current.isCorrect && "border-green-500/50 bg-green-500/10 text-green-400 font-bold",
              isAnswered && !current.isCorrect && "border-red-500/50 bg-red-500/10 text-red-400 font-bold"
            )}
          />
          {isAnswered && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {current.isCorrect ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <XCircle size={20} className="text-red-400" />
              )}
            </div>
          )}
        </div>

        {/* Feedback info when wrong */}
        {isAnswered && !current.isCorrect && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>
              Incorrect. The correct word is{" "}
              <strong className="underline font-bold">{current.item.word}</strong>.
            </span>
          </div>
        )}

        {/* Buttons: Hint, Letter-Hint, Submit */}
        <div className="flex gap-2">
          {!isAnswered && (
            <>
              <button
                type="button"
                id="test-hint-toggle"
                onClick={handleToggleHint}
                className="px-4 py-3 rounded-xl border border-[#1F2937] text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
              >
                {current.showHint ? "Hide Hint" : "Show Hint"}
              </button>
              <button
                type="button"
                id="test-letter-reveal"
                onClick={handleRevealLetter}
                className="px-4 py-3 rounded-xl border border-[#1F2937] text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
              >
                Reveal Letter
              </button>
            </>
          )}
          <button
            type="submit"
            id="test-submit-btn"
            disabled={isAnswered || !inputValue.trim()}
            className="flex-1 py-3.5 rounded-xl font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            Submit Answer
          </button>
        </div>
      </form>
    </div>
  );
}
