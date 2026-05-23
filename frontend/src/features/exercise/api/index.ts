import { vocabApiClient } from "@/lib/vocab-api-client";
import type {
  ExerciseSet,
  ExerciseSetDetail,
  StartAttemptResponse,
  SaveAnswerRequest,
  SaveAnswerResponse,
  SubmitAttemptResponse,
  AttemptReview,
  ActiveAttemptResponse,
} from "../types";

export interface PaginationResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  empty: boolean;
}

export const exerciseApi = {
  getExerciseSets: async (params?: {
    topicSlug?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginationResponse<ExerciseSet>> => {
    const response = await vocabApiClient.get<PaginationResponse<ExerciseSet>>(
      "/exercises",
      { params }
    );
    return response.data;
  },

  getExerciseSetDetail: async (id: number): Promise<ExerciseSetDetail> => {
    const response = await vocabApiClient.get<ExerciseSetDetail>(`/exercises/${id}`);
    return response.data;
  },

  startAttempt: async (id: number): Promise<StartAttemptResponse> => {
    const response = await vocabApiClient.post<StartAttemptResponse>(
      `/exercises/${id}/start`
    );
    return response.data;
  },

  saveAnswer: async (
    attemptId: number,
    data: SaveAnswerRequest
  ): Promise<SaveAnswerResponse> => {
    const response = await vocabApiClient.post<SaveAnswerResponse>(
      `/exercises/attempts/${attemptId}/answers`,
      data
    );
    return response.data;
  },

  submitAttempt: async (attemptId: number): Promise<SubmitAttemptResponse> => {
    const response = await vocabApiClient.post<SubmitAttemptResponse>(
      `/exercises/attempts/${attemptId}/submit`
    );
    return response.data;
  },

  getActiveAttempt: async (attemptId: number): Promise<ActiveAttemptResponse> => {
    const response = await vocabApiClient.get<ActiveAttemptResponse>(
      `/exercises/attempts/${attemptId}`
    );
    return response.data;
  },

  getAttemptReview: async (attemptId: number): Promise<AttemptReview> => {
    const response = await vocabApiClient.get<AttemptReview>(
      `/exercises/attempts/${attemptId}/review`
    );
    return response.data;
  },
};
export default exerciseApi;
