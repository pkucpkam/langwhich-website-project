import { vocabApiClient } from "@/lib/vocab-api-client";
import type { PaginatedResponse } from "@/types/vocab";
import type {
  Difficulty,
  TheoryTopic,
  TheoryLesson,
  TheoryTopicRequest,
  TheoryLessonRequest,
  LessonNavigation,
} from "@/types/theory";

export const theoryApi = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  getPublishedTopics: async (): Promise<TheoryTopic[]> => {
    const { data } = await vocabApiClient.get("/theory/topics");
    return data;
  },

  getTopicBySlug: async (slug: string): Promise<TheoryTopic> => {
    const { data } = await vocabApiClient.get(`/theory/topics/${slug}`);
    return data;
  },

  getPublishedLessons: async (params: {
    search?: string;
    difficulty?: Difficulty;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<TheoryLesson>> => {
    const { data } = await vocabApiClient.get("/theory/lessons", { params });
    return data;
  },

  getLessonBySlug: async (
    slug: string,
    incrementView = true
  ): Promise<TheoryLesson> => {
    const { data } = await vocabApiClient.get(`/theory/lessons/${slug}`, {
      params: { incrementView },
    });
    return data;
  },

  getLessonsByTopicSlug: async (
    slug: string,
    params: { search?: string; difficulty?: Difficulty; page?: number; size?: number }
  ): Promise<PaginatedResponse<TheoryLesson>> => {
    const { data } = await vocabApiClient.get(`/theory/topics/${slug}/lessons`, {
      params,
    });
    return data;
  },

  getPopularLessons: async (): Promise<TheoryLesson[]> => {
    const { data } = await vocabApiClient.get("/theory/lessons/popular");
    return data;
  },

  getLatestLessons: async (): Promise<TheoryLesson[]> => {
    const { data } = await vocabApiClient.get("/theory/lessons/latest");
    return data;
  },

  getRelatedLessons: async (
    id: number,
    topicId: number
  ): Promise<TheoryLesson[]> => {
    const { data } = await vocabApiClient.get(`/theory/lessons/${id}/related`, {
      params: { topicId },
    });
    return data;
  },

  getLessonNavigation: async (
    id: number,
    topicId: number
  ): Promise<LessonNavigation> => {
    const { data } = await vocabApiClient.get(`/theory/lessons/${id}/navigation`, {
      params: { topicId },
    });
    return data;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  createTopic: async (request: TheoryTopicRequest): Promise<TheoryTopic> => {
    const { data } = await vocabApiClient.post("/admin/theory/topics", request);
    return data;
  },

  getAllTopicsAdmin: async (): Promise<TheoryTopic[]> => {
    const { data } = await vocabApiClient.get("/admin/theory/topics");
    return data;
  },

  updateTopic: async (
    id: number,
    request: TheoryTopicRequest
  ): Promise<TheoryTopic> => {
    const { data } = await vocabApiClient.patch(
      `/admin/theory/topics/${id}`,
      request
    );
    return data;
  },

  deleteTopic: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/theory/topics/${id}`);
  },

  createLesson: async (request: TheoryLessonRequest): Promise<TheoryLesson> => {
    const { data } = await vocabApiClient.post("/admin/theory/lessons", request);
    return data;
  },

  getAllLessonsAdmin: async (params: {
    search?: string;
    difficulty?: Difficulty;
    topicId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<TheoryLesson>> => {
    const { data } = await vocabApiClient.get("/admin/theory/lessons", { params });
    return data;
  },

  getLessonByIdAdmin: async (id: number): Promise<TheoryLesson> => {
    const { data } = await vocabApiClient.get(`/admin/theory/lessons/${id}`);
    return data;
  },

  updateLesson: async (
    id: number,
    request: TheoryLessonRequest
  ): Promise<TheoryLesson> => {
    const { data } = await vocabApiClient.patch(
      `/admin/theory/lessons/${id}`,
      request
    );
    return data;
  },

  deleteLesson: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/theory/lessons/${id}`);
  },
};
