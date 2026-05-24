export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "FIND_AND_CORRECT"
  | "SENTENCE_REWRITE"
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
  lessonId?: number;
  lessonTitle?: string;
  lessonSlug?: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  thumbnailUrl?: string;
  isPublished: boolean;
  questionCount: number;
  createdAt?: string;
}

export interface MultipleChoiceMetadata {
  options: { key: string; content: string }[];
  correctAnswer?: string;
}

export interface FindAndCorrectMetadata {
  mistakeText: string;
  acceptedAnswers: string[];
}

export interface SentenceRewriteMetadata {
  keyword?: string;
  acceptedAnswers: string[];
}

export type QuestionMetadata = 
  | MultipleChoiceMetadata 
  | FindAndCorrectMetadata 
  | SentenceRewriteMetadata 
  | Record<string, unknown>;

export interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuestionOptionReview {
  id: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface AdminQuestionOption {
  id: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  type: ExerciseType;
  questionText: string;
  points: number;
  sortOrder: number;
  metadata?: QuestionMetadata;
  options?: QuestionOption[];
  correctAnswers?: string[];
}

export interface ExerciseSection {
  id: number;
  title: string;
  instruction?: string;
  sortOrder: number;
  questions: Question[];
}

export interface ExerciseSetDetail extends Omit<ExerciseSet, "questionCount"> {
  sections?: ExerciseSection[];
  questions: Question[];
}

export interface StartAttemptResponse {
  attemptId: number;
}

export interface SaveAnswerRequest {
  questionId: number;
  payload: Record<string, unknown>;
}

export interface SaveAnswerResponse {
  success: boolean;
  message: string;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  feedback?: string;
  explanation?: string | null;
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
  payload: Record<string, unknown>;
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
  explanation?: string;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

export interface QuestionReview {
  id: number;
  type: ExerciseType;
  questionText: string;
  explanation?: string;
  points: number;
  sortOrder: number;
  metadata?: QuestionMetadata;
  grammarTags?: string[];
  skillTags?: string[];
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
  payload: Record<string, unknown>;
  isCorrect?: boolean;
  feedback?: string;
  explanation?: string | null;
  score?: number;
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

export interface AdminExerciseSection {
  id: number;
  title: string;
  instruction?: string;
  sortOrder: number;
  questions: AdminQuestion[];
}

export interface AdminQuestion {
  id: number;
  type: ExerciseType;
  questionText: string;
  explanation?: string;
  points: number;
  sortOrder: number;
  metadata?: QuestionMetadata;
  grammarTags?: string[];
  skillTags?: string[];
  options?: AdminQuestionOption[];
  correctAnswers?: string[];
}

export interface AdminExerciseSetDetail extends Omit<ExerciseSet, "questionCount"> {
  sections?: AdminExerciseSection[];
  questions?: AdminQuestion[];
}

export interface AdminExerciseSetRequest {
  title: string;
  description?: string;
  topicId?: number | null;
  lessonId?: number | null;
  difficulty: Difficulty;
  estimatedMinutes: number;
  thumbnailUrl?: string;
  isPublished: boolean;
}

export interface AdminQuestionRequest {
  exerciseSectionId: number;
  type: ExerciseType;
  questionText: string;
  explanation?: string;
  points: number;
  sortOrder: number;
  metadata?: QuestionMetadata;
  grammarTags?: string[];
  skillTags?: string[];
}

export interface AdminExerciseSectionRequest {
  title: string;
  instruction?: string;
  sortOrder: number;
}
