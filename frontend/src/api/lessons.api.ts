import { vocabApiClient } from "@/lib/vocab-api-client";
import type {
  CreateLessonRequest,
  Lesson,
  PaginatedResponse,
} from "@/types/vocab";

export const lessonsApi = {
  getPublicLessons: async (
    params: { q?: string; page?: number; size?: number; sort?: string } = {}
  ): Promise<PaginatedResponse<Lesson>> => {
    const { data } = await vocabApiClient.get("/lessons", { params });
    return data;
  },

  getLessonById: async (id: number): Promise<Lesson> => {
    const { data } = await vocabApiClient.get(`/lessons/${id}`);
    return data;
  },

  getMyLessons: async (): Promise<Lesson[]> => {
    const { data } = await vocabApiClient.get("/lessons/my");
    return data;
  },

  createLesson: async (request: CreateLessonRequest): Promise<Lesson> => {
    const { data } = await vocabApiClient.post("/lessons", request);
    return data;
  },

  updateLesson: async (
    id: number,
    request: CreateLessonRequest
  ): Promise<Lesson> => {
    const { data } = await vocabApiClient.put(`/lessons/${id}`, request);
    return data;
  },

  deleteLesson: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/lessons/${id}`);
  },

  togglePrivacy: async (id: number): Promise<Lesson> => {
    const { data } = await vocabApiClient.patch(`/lessons/${id}/privacy`);
    return data;
  },

  moveToFolder: async (
    id: number,
    folderId: number | null
  ): Promise<Lesson> => {
    const { data } = await vocabApiClient.patch(`/lessons/${id}/folder`, {
      folderId,
    });
    return data;
  },
};
