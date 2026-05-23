export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "LISTENING"
  | "MATCHING"
  | "WRITING"
  | "SPEAKING";

export interface ExerciseSet {
  id: number;
  title: string;
  description?: string;
  topicId?: number;
  topicName?: string;
  topicSlug?: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  thumbnailUrl?: string;
  isPublished: boolean;
  questionCount: number;
  createdAt?: string;
}

export interface QuestionOption {
  id: number;
  optionText: string;
  sortOrder: number;
}

export interface Question {
  id: number;
  type: ExerciseType;
  questionText: string;
  points: number;
  sortOrder: number;
  options?: QuestionOption[];
}

export interface ExerciseSetDetail extends Omit<ExerciseSet, "questionCount"> {
  questions: Question[];
}

export interface StartAttemptResponse {
  attemptId: number;
}

export interface SaveAnswerRequest {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

export interface SaveAnswerResponse {
  success: boolean;
  message: string;
  isCorrect?: boolean;
  explanation?: string | null;
  correctOptionId?: number | null;
  correctAnswers?: string[] | null;
}

export interface SubmitAttemptResponse {
  attemptId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  submittedAt: string;
}

export interface AttemptAnswerReview {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuestionOptionReview {
  id: number;
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionReview {
  id: number;
  type: ExerciseType;
  questionText: string;
  explanation?: string;
  points: number;
  sortOrder: number;
  options?: QuestionOptionReview[];
  correctAnswers?: string[];
}

export interface AttemptReview {
  id: number;
  exerciseSetId: number;
  exerciseSetTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  submittedAt?: string;
  questions: QuestionReview[];
  userAnswers: AttemptAnswerReview[];
}

export interface SavedAnswer {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
  isCorrect?: boolean;
  explanation?: string | null;
  correctOptionId?: number | null;
  correctAnswers?: string[] | null;
}

export interface ActiveAttemptResponse {
  attemptId: number;
  exerciseSetId: number;
  exerciseSetTitle: string;
  difficulty: Difficulty;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  questions: Question[];
  savedAnswers: SavedAnswer[];
}

export interface AdminQuestionOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface AdminQuestion {
  id: number;
  type: ExerciseType;
  questionText: string;
  explanation?: string;
  points: number;
  sortOrder: number;
  options?: AdminQuestionOption[];
  correctAnswers?: string[];
}

export interface AdminExerciseSetDetail extends Omit<ExerciseSet, "questionCount"> {
  questions: AdminQuestion[];
}

export interface AdminExerciseSetRequest {
  title: string;
  description?: string;
  topicId?: number | null;
  difficulty: Difficulty;
  estimatedMinutes: number;
  thumbnailUrl?: string;
  isPublished: boolean;
}

export interface AdminQuestionRequest {
  type: ExerciseType;
  questionText: string;
  explanation?: string;
  points: number;
  sortOrder: number;
  options?: AdminQuestionOption[];
  correctAnswers?: string[];
}
