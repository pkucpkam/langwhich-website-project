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
import { Loader2, AlertCircle, CheckCircle2, XCircle, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const practiceMode = usePracticeStore((state) => state.practiceMode);
  const checkedQuestions = usePracticeStore((state) => state.checkedQuestions);
  const setPracticeMode = usePracticeStore((state) => state.setPracticeMode);
  const markQuestionAsChecked = usePracticeStore((state) => state.markQuestionAsChecked);

  // Background Autosaving
  const { isAutosaving } = useAutosave();

  // Internal component UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [checkingQuestionId, setCheckingQuestionId] = useState<number | null>(null);

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

        let activeAttemptId = id as number;
        let attemptData;

        try {
          attemptData = await exerciseApi.getActiveAttempt(activeAttemptId);
        } catch (err: any) {
          if (err.response?.status !== 404) {
            throw err;
          }

          const startedAttempt = await exerciseApi.startAttempt(id as number);
          activeAttemptId = startedAttempt.attemptId;

          if (activeAttemptId !== id) {
            router.replace(`/exercises/${activeAttemptId}`);
            return;
          }

          attemptData = await exerciseApi.getActiveAttempt(activeAttemptId);
        }

        // If attempt is already completed, redirect directly to review
        if (attemptData.status === "COMPLETED") {
          router.replace(`/exercises/attempts/${activeAttemptId}/review`);
          return;
        }

        // Initialize state inside Zustand store
        initPractice(activeAttemptId, {
          id: attemptData.exerciseSetId,
          title: attemptData.exerciseSetTitle,
          difficulty: attemptData.difficulty,
          estimatedMinutes: 10,
          isPublished: true,
          questions: attemptData.questions,
        });

        // Set duration recovery if any
        // In this implementation, time is stored in local storage, so timer is preserved!

        // Restore previously synced answers and checked status
        attemptData.savedAnswers.forEach((ans) => {
          updateAnswer(ans.questionId, ans.payload || {});
          markAsSaved(ans.questionId, true);

          if (ans.isCorrect !== undefined && ans.isCorrect !== null) {
            markQuestionAsChecked(ans.questionId, {
              isCorrect: ans.isCorrect,
              score: ans.score,
              maxScore: ans.score,
              feedback: ans.feedback,
              explanation: ans.explanation,
              correctOptionId: (ans as any).correctOptionId,
              correctAnswers: (ans as any).correctAnswers,
            });
          }
        });

      } catch (err: any) {
        console.error("Failed to load attempt details:", err);
        setError(err.response?.data?.message || "Failed to load practice attempt.");
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId, initPractice, updateAnswer, markAsSaved, markQuestionAsChecked, router]);

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

  const currentAnswer = answers[currentQuestion.id];
  const hasProvidedAnswer = !!(
    currentAnswer &&
    Object.keys(currentAnswer).length > 0 &&
    Object.values(currentAnswer).some(val => val !== null && val !== undefined && val !== "")
  );

  // Compute total answered questions
  const answeredCount = Object.keys(answers).filter((qIdStr) => {
    const ans = answers[parseInt(qIdStr)];
    return (
      ans &&
      Object.keys(ans).length > 0 &&
      Object.values(ans).some(val => val !== null && val !== undefined && val !== "")
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

  const handleAnswerChange = (data: Record<string, unknown>) => {
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

  const handleCheckQuestion = async (questionId: number) => {
    if (!attemptId) return;
    const ans = answers[questionId];
    if (!ans) return;

    try {
      setCheckingQuestionId(questionId);
      const res = await exerciseApi.saveAnswer(attemptId, {
        questionId,
        payload: ans,
      });

      markQuestionAsChecked(questionId, {
        isCorrect: res.isCorrect ?? false,
        score: res.score,
        maxScore: res.maxScore,
        feedback: res.feedback,
        explanation: res.explanation,
        correctOptionId: (res as any).correctOptionId,
        correctAnswers: (res as any).correctAnswers,
      });
      markAsSaved(questionId, true);
    } catch (err) {
      console.error("Failed to check question:", err);
      alert("Không thể kiểm tra đáp án. Vui lòng thử lại!");
    } finally {
      setCheckingQuestionId(null);
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
            payload={answers[currentQuestion.id]}
            onChange={handleAnswerChange}
            checkedFeedback={checkedQuestions[currentQuestion.id]}
          />

          {/* INSTANT CHECK CONTROLS */}
          {practiceMode === "INSTANT" && (
            <div className="bg-neutral-card border border-neutral-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
              {checkedQuestions[currentQuestion.id] ? (
                <>
                  <div className="flex items-center gap-3">
                    {checkedQuestions[currentQuestion.id].isCorrect ? (
                      <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20">
                        <XCircle className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        {checkedQuestions[currentQuestion.id].isCorrect
                          ? "Chính xác! Bạn đã hoàn thành câu hỏi này."
                          : "Chưa chính xác! Xem giải thích bên dưới."}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {checkedQuestions[currentQuestion.id].isCorrect
                          ? `Chúc mừng! Bạn nhận được +${currentQuestion.points} điểm.`
                          : "Đừng nản lòng, hãy cố gắng ở câu tiếp theo!"}
                      </p>
                    </div>
                  </div>
                  
                  {storeIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>Câu tiếp theo</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitAttempt}
                      className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Nộp bài & Kết thúc</span>
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="text-xs text-text-secondary leading-relaxed max-w-md">
                    Chọn đáp án của bạn ở trên và nhấn nút kiểm tra để xem kết quả ngay lập tức!
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCheckQuestion(currentQuestion.id)}
                    disabled={checkingQuestionId === currentQuestion.id || !hasProvidedAnswer}
                    className={cn(
                      "w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                      hasProvidedAnswer
                        ? "bg-primary hover:bg-primary-hover text-white cursor-pointer"
                        : "bg-neutral-border text-text-secondary cursor-not-allowed border border-neutral-border"
                    )}
                  >
                    {checkingQuestionId === currentQuestion.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <span>Kiểm tra đáp án</span>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Sidebar Navigation Palette */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            
            {/* Practice Mode Selector */}
            <div className="bg-neutral-card border border-neutral-border rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-xs">
                Chế độ làm bài
              </h4>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPracticeMode("ALL_AT_ONCE")}
                  className={cn(
                    "w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-200 text-left cursor-pointer flex items-center justify-between",
                    practiceMode === "ALL_AT_ONCE"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-neutral-background border-neutral-border text-text-secondary hover:text-text-primary hover:border-text-secondary"
                  )}
                >
                  <span>Nộp bài rồi check</span>
                  {practiceMode === "ALL_AT_ONCE" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPracticeMode("INSTANT")}
                  className={cn(
                    "w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-200 text-left cursor-pointer flex items-center justify-between",
                    practiceMode === "INSTANT"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-neutral-background border-neutral-border text-text-secondary hover:text-text-primary hover:border-text-secondary"
                  )}
                >
                  <span>Làm tới đâu check tới đó</span>
                  {practiceMode === "INSTANT" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                {practiceMode === "INSTANT"
                  ? "Hệ thống sẽ chấm điểm và hiển thị giải thích chi tiết ngay lập tức sau khi kiểm tra mỗi câu."
                  : "Bạn có thể tự do thay đổi đáp án và chỉ xem điểm số, giải thích chi tiết sau khi nộp bài."}
              </p>
            </div>

            <QuestionPalette
              questions={questions}
              currentIndex={storeIndex}
              onSelect={setQuestionIndex}
              answers={answers}
              savedAnswers={savedAnswers}
              practiceMode={practiceMode}
              checkedQuestions={checkedQuestions}
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
