import { vocabApiClient } from "@/lib/vocab-api-client";
import type { PaginatedResponse } from "@/types/vocab";
import type { TheoryArticle, TheoryFolder } from "@/types/theory";

export const theoryApi = {
  getArticles: async (
    q?: string,
    folderId?: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<TheoryArticle>> => {
    const { data } = await vocabApiClient.get("/theory", {
      params: { q, folderId, page, size },
    });
    return data;
  },

  getArticleById: async (id: number): Promise<TheoryArticle> => {
    const { data } = await vocabApiClient.get(`/theory/${id}`);
    return data;
  },

  getFolders: async (): Promise<TheoryFolder[]> => {
    const { data } = await vocabApiClient.get("/theory/folders");
    return data;
  },
};
