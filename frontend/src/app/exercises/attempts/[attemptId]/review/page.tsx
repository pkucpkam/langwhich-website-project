"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { exerciseApi } from "@/features/exercise/api";
import type { AttemptReview, QuestionReview } from "@/features/exercise/types";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PracticeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId ? parseInt(params.attemptId as string) : null;

  const [review, setReview] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    const id = attemptId;
    if (id === null || isNaN(id)) {
      setError("Invalid attempt ID.");
      setLoading(false);
      return;
    }

    async function loadReview() {
      try {
        setLoading(true);
        setError(null);
        const data = await exerciseApi.getAttemptReview(id as number);
        setReview(data);
      } catch (err: any) {
        console.error("Failed to load attempt review:", err);
        setError(err.response?.data?.message || "Failed to load practice review.");
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase animate-pulse">
          Loading Review Dashboard...
        </p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-neutral-background flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full bg-neutral-card border border-neutral-border rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-text-primary">Review Error</h2>
          <p className="text-sm text-text-secondary">
            {error || "We encountered an error loading your review."}
          </p>
          <button
            onClick={() => router.push("/exercises")}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-all text-sm"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const score = Math.round(review.score);

  // Give contextual positive reinforcement feedback
  const getBannerMessage = () => {
    if (score >= 90) return { title: "Outstanding Work!", desc: "Master class status! You have absolute command over these structures.", style: "border-green-500/25 bg-green-500/5 text-green-400" };
    if (score >= 70) return { title: "Excellent Performance!", desc: "Very solid job! You hold a firm understanding of these concepts.", style: "border-primary/20 bg-primary/5 text-primary-light" };
    if (score >= 50) return { title: "Good Attempt!", desc: "You are on the right path. Review your incorrect answers and build total confidence.", style: "border-amber-500/20 bg-amber-500/5 text-amber-400" };
    return { title: "Keep Practicing!", desc: "A great learning opportunity. Analyze correct formats below to solidify your grammar core.", style: "border-rose-500/20 bg-rose-500/5 text-rose-400" };
  };

  const feedback = getBannerMessage();

  const handleTryAgain = async () => {
    try {
      setRestarting(true);
      const res = await exerciseApi.startAttempt(review.exerciseSetId);
      router.push(`/exercises/${res.attemptId}`);
    } catch (err) {
      console.error("Failed to restart attempt:", err);
      alert("Failed to create a new practice attempt. Please try again.");
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* Review Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
              Practice Review
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-2">
              {review.exerciseSetTitle}
            </h1>
          </div>
          
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push("/exercises")}
            >
              <BookOpen className="h-4 w-4" />
              <span>All Exercises</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover"
              onClick={handleTryAgain}
              isLoading={restarting}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Exercise</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Performance Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Score metric */}
          <div className="bg-neutral-card border border-neutral-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Final Score
              </span>
              <span className="text-3xl font-extrabold text-text-primary mt-1 block">
                {score}%
              </span>
            </div>
          </div>

          {/* Correct count metric */}
          <div className="bg-neutral-card border border-neutral-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Accuracy Count
              </span>
              <span className="text-3xl font-extrabold text-text-primary mt-1 block">
                {review.correctCount} / {review.totalQuestions}
              </span>
            </div>
          </div>

          {/* Duration metric */}
          <div className="bg-neutral-card border border-neutral-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Time Taken
              </span>
              <span className="text-2xl font-extrabold text-text-primary mt-2 block truncate">
                {formatDuration(review.durationSeconds)}
              </span>
            </div>
          </div>
        </section>

        {/* Banner reinforcement */}
        <section className={cn("border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm", feedback.style)}>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg">{feedback.title}</h3>
            <p className="text-sm opacity-85 leading-relaxed">{feedback.desc}</p>
          </div>
          <Button
            variant="outline"
            className="self-start md:self-auto border-current text-current hover:bg-neutral-border/20 text-xs font-bold"
            onClick={handleTryAgain}
            isLoading={restarting}
          >
            <span>Retake Exam</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </section>

        {/* Question Details List */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary">
            Detailed Answers Analysis
          </h2>

          <div className="space-y-6">
            {review.questions.map((q, idx) => {
              const uAns = review.userAnswers.find((a) => a.questionId === q.id);
              const isCorrect = uAns?.isCorrect ?? false;
              const pointsEarned = uAns?.pointsEarned ?? 0;

              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-2xl border bg-neutral-card p-6 shadow-sm space-y-5 transition-all duration-200 hover:border-neutral-border/80",
                    isCorrect ? "border-green-500/20" : "border-red-500/20"
                  )}
                >
                  
                  {/* Top Bar for each question */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-neutral-background border border-neutral-border px-3 py-1 rounded">
                      Question {idx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Incorrect</span>
                        </span>
                      )}

                      <span className="text-xs font-bold text-text-secondary">
                        {pointsEarned} / {q.points} Point{q.points !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-base md:text-lg font-medium text-text-primary leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Question Sub-render based on type */}
                  {(() => {
                    const metadata = q.metadata as Record<string, any> | undefined;
                    const payload = uAns?.payload as Record<string, any> | undefined;

                    switch (q.type) {
                      case "MULTIPLE_CHOICE": {
                        const mcOptions = q.options ?? metadata?.options?.map((o: any, idx: number) => ({
                          id: idx,
                          optionText: o.optionText ? o.optionText : (o.key && o.content ? `${o.key}. ${o.content}` : o.content || ""),
                          isCorrect: !!o.isCorrect || o.key === metadata?.correctAnswer,
                        })) ?? [];

                        const activeOptionId = payload?.selectedOptionId as number | undefined;

                        return (
                          <div className="grid grid-cols-1 gap-2.5">
                            {mcOptions.map((opt: any, oIdx: number) => {
                              const letter = String.fromCharCode(65 + oIdx);
                              const isUserSelection = activeOptionId === opt.id || uAns?.selectedOptionId === opt.id;
                              const isCorrectOption = opt.isCorrect;

                              return (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    "flex items-center gap-3.5 w-full p-4 rounded-xl border text-sm font-medium",
                                    isCorrectOption
                                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                                      : isUserSelection
                                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                                      : "bg-neutral-background border-neutral-border/50 text-text-secondary"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold text-xs",
                                      isCorrectOption
                                        ? "bg-green-500 text-white"
                                        : isUserSelection
                                        ? "bg-red-500 text-white"
                                        : "bg-neutral-border text-text-secondary"
                                    )}
                                  >
                                    {letter}
                                  </span>
                                  <span className="flex-1">{opt.optionText}</span>
                                  
                                  {isCorrectOption && (
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-green-400">
                                      Correct Answer
                                    </span>
                                  )}
                                  {isUserSelection && !isCorrectOption && (
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">
                                      Your Selection
                                    </span>
                                  )}
                                  {isUserSelection && isCorrectOption && (
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-green-400">
                                      Your Correct Selection
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      case "FILL_IN_BLANK": {
                        const userText = payload?.textAnswer ?? uAns?.textAnswer ?? "";
                        const accepted = q.correctAnswers ?? metadata?.acceptedAnswers ?? [];

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-neutral-background border border-neutral-border rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                                Your Input
                              </span>
                              <span className={cn("text-base font-bold", isCorrect ? "text-green-400" : "text-red-400")}>
                                {userText || "(No Answer Entered)"}
                              </span>
                            </div>
                            <div className="bg-neutral-background border border-neutral-border rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                                Accepted Answer(s)
                              </span>
                              <span className="text-base font-bold text-green-400">
                                {accepted.join("  /  ") || "N/A"}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      case "FIND_AND_CORRECT": {
                        const userMistake = payload?.selectedMistake ?? "";
                        const userCorrection = payload?.correction ?? "";
                        const targetMistake = metadata?.mistakeText ?? "";
                        const acceptedCorrections = metadata?.acceptedAnswers ?? [];

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-neutral-background border border-neutral-border rounded-xl p-4 space-y-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                                Your Input
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                  Incorrect Part:{" "}
                                  <span className={cn(isCorrect ? "text-green-400" : "text-red-400")}>
                                    &quot;{userMistake || "(None)"}&quot;
                                  </span>
                                </p>
                                <p className="text-sm font-semibold">
                                  Correction:{" "}
                                  <span className={cn(isCorrect ? "text-green-400" : "text-red-400")}>
                                    &quot;{userCorrection || "(None)"}&quot;
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="bg-neutral-background border border-neutral-border rounded-xl p-4 space-y-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                                Correct Mistake &amp; Corrections
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-green-400">
                                  Mistake Word: &quot;{targetMistake}&quot;
                                </p>
                                <p className="text-sm font-semibold text-green-400">
                                  Accepted: {acceptedCorrections.join(" or ")}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      case "SENTENCE_REWRITE": {
                        const userRewrite = payload?.text ?? "";
                        const acceptedRewrites = q.correctAnswers ?? metadata?.acceptedAnswers ?? [];

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-neutral-background border border-neutral-border rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                                Your Input
                              </span>
                              <span className={cn("text-base font-bold", isCorrect ? "text-green-400" : "text-red-400")}>
                                {userRewrite || "(No Answer Entered)"}
                              </span>
                            </div>
                            <div className="bg-neutral-background border border-neutral-border rounded-xl p-4 space-y-1.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                                Accepted Answer(s)
                              </span>
                              <ul className="list-disc pl-5 text-sm font-bold text-green-400 space-y-0.5">
                                {acceptedRewrites.map((ans: string, i: number) => (
                                  <li key={i}>{ans}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      }
                      default:
                        return null;
                    }
                  })()}

                  {/* Comprehensive feedback explanation */}
                  {q.explanation && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mt-2 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">
                        Grammar Explanation
                      </span>
                      <p className="text-xs text-text-secondary leading-relaxed font-normal">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Panel Actions */}
        <section className="flex flex-col sm:flex-row justify-center gap-4 border-t border-neutral-border pt-8">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 text-sm py-3"
            onClick={() => router.push("/exercises")}
          >
            <BookOpen className="h-4 w-4" />
            <span>Practice Other Topics</span>
          </Button>

          <Button
            variant="primary"
            className="flex items-center justify-center gap-2 text-sm py-3"
            onClick={handleTryAgain}
            isLoading={restarting}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake this Practice Set</span>
          </Button>
        </section>

      </main>
    </div>
  );
}
