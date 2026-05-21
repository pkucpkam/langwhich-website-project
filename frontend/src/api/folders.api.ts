import { vocabApiClient } from "@/lib/vocab-api-client";
import type { Folder, FolderRequest, Lesson } from "@/types/vocab";

export const foldersApi = {
  getOfficialFolders: async (): Promise<Folder[]> => {
    const { data } = await vocabApiClient.get("/folders/official");
    return data;
  },

  getMyFolders: async (): Promise<Folder[]> => {
    const { data } = await vocabApiClient.get("/folders/my");
    return data;
  },

  getLessonsInFolder: async (folderId: number): Promise<Lesson[]> => {
    const { data } = await vocabApiClient.get(`/folders/${folderId}/lessons`);
    return data;
  },

  createFolder: async (request: FolderRequest): Promise<Folder> => {
    const { data } = await vocabApiClient.post("/folders", request);
    return data;
  },

  updateFolder: async (
    id: number,
    request: FolderRequest
  ): Promise<Folder> => {
    const { data } = await vocabApiClient.put(`/folders/${id}`, request);
    return data;
  },

  deleteFolder: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/folders/${id}`);
  },
};
