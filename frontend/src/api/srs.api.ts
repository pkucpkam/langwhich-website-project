import { vocabApiClient } from "@/lib/vocab-api-client";
import type { SrsCard, SrsRating } from "@/types/vocab";

export const srsApi = {
  getDueCards: async (): Promise<SrsCard[]> => {
    const { data } = await vocabApiClient.get("/srs/cards/due");
    return data;
  },

  getCardsForLesson: async (lessonId: number): Promise<SrsCard[]> => {
    const { data } = await vocabApiClient.get(
      `/srs/lessons/${lessonId}/cards`
    );
    return data;
  },

  initializeCards: async (
    lessonId: number
  ): Promise<{ created: number }> => {
    const { data } = await vocabApiClient.post(
      `/srs/lessons/${lessonId}/init`
    );
    return data;
  },

  reviewCard: async (cardId: number, rating: SrsRating): Promise<SrsCard> => {
    const { data } = await vocabApiClient.post(
      `/srs/cards/${cardId}/review`,
      { rating }
    );
    return data;
  },
};
