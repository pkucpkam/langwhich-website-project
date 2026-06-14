export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface TheoryTopic {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessonCount?: number;
}

export interface TheoryLesson {
  id: number;
  topicId?: number;
  topicName?: string;
  topicSlug?: string;
  title: string;
  slug: string;
  summary?: string;
  thumbnail?: string;
  content: string; // Rich Tiptap JSON stored as string
  difficulty: Difficulty;
  estimatedMinutes: number;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TheoryTopicRequest {
  name: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
  isPublished?: boolean;
}

export interface TheoryLessonRequest {
  topicId?: number;
  title: string;
  summary?: string;
  thumbnail?: string;
  content: string; // Tiptap JSON content stored as string
  difficulty: Difficulty;
  estimatedMinutes: number;
  isPublished?: boolean;
}

export interface LessonNavigation {
  previous: TheoryLesson | null;
  next: TheoryLesson | null;
}
