import { vocabApiClient } from "@/lib/vocab-api-client";
import type {
  StudySession,
  StudySessionRequest,
} from "@/types/vocab";

export const historyApi = {
  saveSession: async (request: StudySessionRequest): Promise<StudySession> => {
    const { data } = await vocabApiClient.post("/history/sessions", request);
    return data;
  },

  getMyHistory: async (): Promise<StudySession[]> => {
    const { data } = await vocabApiClient.get("/history/sessions");
    return data;
  },

  getDailyActivity: async (): Promise<Record<string, number>> => {
    const { data } = await vocabApiClient.get("/history/daily");
    return data;
  },
};
