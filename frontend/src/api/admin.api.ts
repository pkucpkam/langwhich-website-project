import { vocabApiClient } from "@/lib/vocab-api-client";
import type { Lesson, Folder, CreateLessonRequest, FolderRequest, PaginatedResponse } from "@/types/vocab";

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

  getOfficialFolders: async (): Promise<Folder[]> => {
    const { data } = await vocabApiClient.get("/admin/folders");
    return data;
  },

  createOfficialFolder: async (request: FolderRequest): Promise<Folder> => {
    const { data } = await vocabApiClient.post("/admin/folders", request);
    return data;
  },
};
