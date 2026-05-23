// Vocabulary & Lesson Types

export interface VocabularyItem {
  id: number;
  word: string;
  definition: string;
  ipa?: string;
  wordType?: string;
  exampleEn?: string;
  exampleVi?: string;
  orderIndex: number;
}

export interface VocabularyItemRequest {
  word: string;
  definition: string;
  ipa?: string;
  wordType?: string;
  exampleEn?: string;
  exampleVi?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  wordCount: number;
  isPrivate: boolean;
  isOfficial: boolean;
  creatorId: number;
  creatorUsername: string;
  folderId?: number;
  folderName?: string;
  createdAt: string;
  vocabularyItems?: VocabularyItem[];
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  isPrivate?: boolean;
  folderId?: number;
  vocabularyItems: VocabularyItemRequest[];
}

// Folder Types

export interface Folder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isOfficial: boolean;
  creatorId: number;
  creatorUsername: string;
  lessonCount: number;
  createdAt: string;
}

export interface FolderRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// SRS Types

export type SrsRating = 0 | 3 | 4 | 5; // again | hard | good | easy

export interface SrsCard {
  id: number;
  lessonId: number;
  lessonTitle: string;
  vocabularyItemId: number;
  word: string;
  definition: string;
  ipa?: string;
  wordType?: string;
  exampleEn?: string;
  exampleVi?: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
  totalReviews: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
}

// Study History Types

export type StudyMode = 'FLASHCARD' | 'REVIEW' | 'TEST' | 'SRS_REVIEW';

export interface StudySession {
  id: number;
  lessonId?: number;
  lessonTitle: string;
  studyMode: StudyMode;
  timeSpent: number;
  knowCount: number;
  totalCount: number;
  createdAt: string;
}

export interface StudySessionRequest {
  lessonId: number;
  lessonTitle?: string;
  studyMode: StudyMode;
  timeSpent: number;
  knowCount: number;
  totalCount: number;
}


// Pagination

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
