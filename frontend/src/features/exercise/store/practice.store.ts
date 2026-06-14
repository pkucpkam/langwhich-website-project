import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ExerciseSetDetail } from "../types";

interface CheckedQuestionFeedback {
  isCorrect: boolean;
  score?: number;
  maxScore?: number;
  feedback?: string;
  explanation?: string | null;
  correctOptionId?: number | null;
  correctAnswers?: string[] | null;
}

interface PracticeState {
  attemptId: number | null;
  exerciseSet: ExerciseSetDetail | null;
  currentQuestionIndex: number;
  answers: Record<number, Record<string, unknown>>;
  savedAnswers: Record<number, boolean>;
  timerSeconds: number;
  practiceMode: "INSTANT" | "ALL_AT_ONCE";
  checkedQuestions: Record<number, CheckedQuestionFeedback>;

  initPractice: (attemptId: number, set: ExerciseSetDetail) => void;
  setQuestionIndex: (index: number) => void;
  updateAnswer: (
    questionId: number,
    data: Record<string, unknown>
  ) => void;
  markAsSaved: (questionId: number, status: boolean) => void;
  incrementTimer: () => void;
  setTimer: (seconds: number) => void;
  clearPractice: () => void;
  setPracticeMode: (mode: "INSTANT" | "ALL_AT_ONCE") => void;
  markQuestionAsChecked: (
    questionId: number,
    feedback: CheckedQuestionFeedback
  ) => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      attemptId: null,
      exerciseSet: null,
      currentQuestionIndex: 0,
      answers: {},
      savedAnswers: {},
      timerSeconds: 0,
      practiceMode: "ALL_AT_ONCE",
      checkedQuestions: {},

      initPractice: (attemptId, exerciseSet) => {
        set((state) => {
          if (state.attemptId === attemptId) {
            return {};
          }
          return {
            attemptId,
            exerciseSet,
            currentQuestionIndex: 0,
            answers: {},
            savedAnswers: {},
            timerSeconds: 0,
            practiceMode: "ALL_AT_ONCE",
            checkedQuestions: {},
          };
        });
      },

      setQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      updateAnswer: (questionId, data) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: data,
          },
          savedAnswers: {
            ...state.savedAnswers,
            [questionId]: false,
          },
        })),

      markAsSaved: (questionId, status) =>
        set((state) => ({
          savedAnswers: {
            ...state.savedAnswers,
            [questionId]: status,
          },
        })),

      incrementTimer: () => set((state) => ({ timerSeconds: state.timerSeconds + 1 })),
      setTimer: (seconds) => set({ timerSeconds: seconds }),

      setPracticeMode: (mode) => set({ practiceMode: mode }),

      markQuestionAsChecked: (questionId, feedback) =>
        set((state) => ({
          checkedQuestions: {
            ...state.checkedQuestions,
            [questionId]: feedback,
          },
        })),

      clearPractice: () =>
        set({
          attemptId: null,
          exerciseSet: null,
          currentQuestionIndex: 0,
          answers: {},
          savedAnswers: {},
          timerSeconds: 0,
          practiceMode: "ALL_AT_ONCE",
          checkedQuestions: {},
        }),
    }),
    {
      name: "langwhich-practice",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
export default usePracticeStore;
