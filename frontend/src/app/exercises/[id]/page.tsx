"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePracticeStore } from "@/features/exercise/store/practice.store";
import { useAutosave } from "@/features/exercise/hooks/useAutosave";
import { exerciseApi } from "@/features/exercise/api";
import { ExerciseHeader } from "@/features/exercise/components/ExerciseHeader";
import { ExerciseNavigation } from "@/features/exercise/components/ExerciseNavigation";
import { QuestionPalette } from "@/features/exercise/components/QuestionPalette";
import { QuestionRenderer } from "@/features/exercise/components/QuestionRenderer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Loader2, AlertCircle } from "lucide-react";

export default function PracticeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.id ? parseInt(params.id as string) : null;

  // Zustand Store binding
  const storeSet = usePracticeStore((state) => state.exerciseSet);
  const storeIndex = usePracticeStore((state) => state.currentQuestionIndex);
  const answers = usePracticeStore((state) => state.answers);
  const savedAnswers = usePracticeStore((state) => state.savedAnswers);
  
  const initPractice = usePracticeStore((state) => state.initPractice);
  const setQuestionIndex = usePracticeStore((state) => state.setQuestionIndex);
  const updateAnswer = usePracticeStore((state) => state.updateAnswer);
  const markAsSaved = usePracticeStore((state) => state.markAsSaved);
  const clearPractice = usePracticeStore((state) => state.clearPractice);
  const setTimer = usePracticeStore((state) => state.setTimer);

  // Background Autosaving
  const { isAutosaving } = useAutosave();

  // Internal component UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const id = attemptId;
    if (id === null || isNaN(id)) {
      setError("Invalid practice session ID.");
      setLoading(false);
      return;
    }

    async function loadAttempt() {
      try {
        setLoading(true);
        setError(null);

        const attemptData = await exerciseApi.getActiveAttempt(id as number);

        // If attempt is already completed, redirect directly to review
        if (attemptData.status === "COMPLETED") {
          router.replace(`/exercises/attempts/${id}/review`);
          return;
        }

        // Initialize state inside Zustand store
        initPractice(id as number, {
          id: attemptData.exerciseSetId,
          title: attemptData.exerciseSetTitle,
          difficulty: attemptData.difficulty,
          estimatedMinutes: 10,
          isPublished: true,
          questions: attemptData.questions,
        });

        // Set duration recovery if any
        // In this implementation, time is stored in local storage, so timer is preserved!

        // Restore previously synced answers
        attemptData.savedAnswers.forEach((ans) => {
          updateAnswer(ans.questionId, {
            selectedOptionId: ans.selectedOptionId,
            textAnswer: ans.textAnswer,
          });
          markAsSaved(ans.questionId, true);
        });

      } catch (err: any) {
        console.error("Failed to load attempt details:", err);
        setError(err.response?.data?.message || "Failed to load practice attempt.");
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId, initPractice, updateAnswer, markAsSaved, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase animate-pulse">
          Loading Practice Session...
        </p>
      </div>
    );
  }

  if (error || !storeSet) {
    return (
      <div className="min-h-screen bg-neutral-background flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full bg-neutral-card border border-neutral-border rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-text-primary">Practice Error</h2>
          <p className="text-sm text-text-secondary">
            {error || "We encountered an error loading your practice session."}
          </p>
          <button
            onClick={() => router.push("/exercises")}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-all text-sm"
          >
            Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  const questions = storeSet.questions;
  const currentQuestion = questions[storeIndex];

  // Compute total answered questions
  const answeredCount = Object.keys(answers).filter((qIdStr) => {
    const ans = answers[parseInt(qIdStr)];
    return (
      ans &&
      ((ans.selectedOptionId !== undefined && ans.selectedOptionId !== null) ||
        (ans.textAnswer !== undefined && ans.textAnswer !== null && ans.textAnswer !== ""))
    );
  }).length;

  const handlePrev = () => {
    if (storeIndex > 0) {
      setQuestionIndex(storeIndex - 1);
    }
  };

  const handleNext = () => {
    if (storeIndex < questions.length - 1) {
      setQuestionIndex(storeIndex + 1);
    }
  };

  const handleAnswerChange = (data: {
    selectedOptionId?: number | null;
    textAnswer?: string | null;
  }) => {
    updateAnswer(currentQuestion.id, data);
  };

  const handleExitPractice = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    clearPractice();
    router.push("/exercises");
  };

  const handleSubmitAttempt = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitModal(false);
    if (!attemptId) return;

    try {
      setIsSubmitting(true);
      await exerciseApi.submitAttempt(attemptId);
      clearPractice();
      router.replace(`/exercises/attempts/${attemptId}/review`);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit your practice answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-background flex flex-col justify-between">
      {/* Session Header */}
      <ExerciseHeader
        title={storeSet.title}
        difficulty={storeSet.difficulty}
        answeredCount={answeredCount}
        totalCount={questions.length}
        onExit={handleExitPractice}
        isAutosaving={isAutosaving}
      />

      {/* Main Practice Hub */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Question content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-neutral-card px-3 py-1.5 rounded-lg border border-neutral-border shadow-sm">
              Question {storeIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
              {currentQuestion.points} Point{currentQuestion.points !== 1 ? "s" : ""}
            </span>
          </div>

          <QuestionRenderer
            question={currentQuestion}
            selectedOptionId={answers[currentQuestion.id]?.selectedOptionId}
            textAnswer={answers[currentQuestion.id]?.textAnswer}
            onChange={handleAnswerChange}
          />
        </div>

        {/* Right Side: Sidebar Navigation Palette */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <QuestionPalette
              questions={questions}
              currentIndex={storeIndex}
              onSelect={setQuestionIndex}
              answers={answers}
              savedAnswers={savedAnswers}
            />

            <div className="bg-neutral-card border border-neutral-border rounded-xl p-5 shadow-sm text-xs text-text-secondary leading-relaxed">
              <h4 className="font-semibold text-text-primary uppercase tracking-wider mb-2">
                Practice Guidelines
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Background auto-saves sync answers continuously.</li>
                <li>Your time spent is logged automatically.</li>
                <li>You can resume later at any time.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <ExerciseNavigation
        currentIndex={storeIndex}
        totalQuestions={questions.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmitAttempt}
        isSubmitting={isSubmitting}
      />

      {/* Exit Modal Dialogue */}
      <ConfirmModal
        isOpen={showExitModal}
        title="Pause Practice Session?"
        description="Your inputs have been autosaved. You can safely close this browser or return later to resume this attempt without losing progress."
        confirmLabel="Pause and Exit"
        onConfirm={handleConfirmExit}
        onClose={() => setShowExitModal(false)}
      />

      {/* Submit Modal Dialogue */}
      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit Exercise Set?"
        description={`Are you sure you want to end and submit your practice session? You have answered ${answeredCount} of ${questions.length} questions.`}
        confirmLabel="Submit Practice"
        onConfirm={handleConfirmSubmit}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
