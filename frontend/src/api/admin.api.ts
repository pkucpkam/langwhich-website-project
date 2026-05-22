import { vocabApiClient } from "@/lib/vocab-api-client";
import type { Lesson, Folder, CreateLessonRequest, FolderRequest, PaginatedResponse } from "@/types/vocab";
import type { TheoryArticle, TheoryFolder } from "@/types/theory";

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const adminApi = {
  getUsers: async (page = 0, size = 20): Promise<PaginatedResponse<UserSummary>> => {
    const { data } = await vocabApiClient.get("/admin/users", { params: { page, size } });
    return data;
  },

  getAllLessons: async (page = 0, size = 20): Promise<PaginatedResponse<Lesson>> => {
    const { data } = await vocabApiClient.get("/admin/lessons", { params: { page, size } });
    return data;
  },

  createOfficialLesson: async (request: CreateLessonRequest): Promise<Lesson> => {
    const { data } = await vocabApiClient.post("/admin/lessons", request);
    return data;
  },

  deleteLesson: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/lessons/${id}`);
  },

  getOfficialFolders: async (): Promise<Folder[]> => {
    const { data } = await vocabApiClient.get("/admin/folders");
    return data;
  },

  createOfficialFolder: async (request: FolderRequest): Promise<Folder> => {
    const { data } = await vocabApiClient.post("/admin/folders", request);
    return data;
  },

  // ===== THEORY ARTICLES =====
  createTheoryArticle: async (request: TheoryArticle, folderId?: number): Promise<TheoryArticle> => {
    const { data } = await vocabApiClient.post("/admin/theory", request, {
      params: folderId ? { folderId } : {},
    });
    return data;
  },

  updateTheoryArticle: async (id: number, request: TheoryArticle, folderId?: number): Promise<TheoryArticle> => {
    const { data } = await vocabApiClient.put(`/admin/theory/${id}`, request, {
      params: folderId ? { folderId } : {},
    });
    return data;
  },

  deleteTheoryArticle: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/theory/${id}`);
  },

  // ===== THEORY FOLDERS =====
  createTheoryFolder: async (request: TheoryFolder): Promise<TheoryFolder> => {
    const { data } = await vocabApiClient.post("/admin/theory/folders", request);
    return data;
  },

  updateTheoryFolder: async (id: number, request: TheoryFolder): Promise<TheoryFolder> => {
    const { data } = await vocabApiClient.put(`/admin/theory/folders/${id}`, request);
    return data;
  },

  deleteTheoryFolder: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/theory/folders/${id}`);
  },
};
