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
  AdminQuestion,
  AdminExerciseSetDetail,
  AdminExerciseSetRequest,
  AdminQuestionRequest,
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

  // ===== ADMIN APIS =====

  adminGetExerciseSets: async (params?: {
    search?: string;
    difficulty?: string;
    isPublished?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginationResponse<ExerciseSet>> => {
    const response = await vocabApiClient.get<PaginationResponse<ExerciseSet>>(
      "/admin/exercise-sets",
      { params }
    );
    return response.data;
  },

  adminGetExerciseSetDetail: async (id: number): Promise<AdminExerciseSetDetail> => {
    const response = await vocabApiClient.get<AdminExerciseSetDetail>(`/admin/exercise-sets/${id}`);
    return response.data;
  },

  adminCreateExerciseSet: async (data: AdminExerciseSetRequest): Promise<ExerciseSet> => {
    const response = await vocabApiClient.post<ExerciseSet>("/admin/exercise-sets", data);
    return response.data;
  },

  adminUpdateExerciseSet: async (id: number, data: AdminExerciseSetRequest): Promise<ExerciseSet> => {
    const response = await vocabApiClient.put<ExerciseSet>(`/admin/exercise-sets/${id}`, data);
    return response.data;
  },

  adminDeleteExerciseSet: async (id: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/exercise-sets/${id}`);
  },

  adminPublishExerciseSet: async (id: number, publish: boolean): Promise<ExerciseSet> => {
    const response = await vocabApiClient.patch<ExerciseSet>(
      `/admin/exercise-sets/${id}/publish`,
      null,
      { params: { publish } }
    );
    return response.data;
  },

  adminCreateQuestion: async (setId: number, data: AdminQuestionRequest): Promise<AdminQuestion> => {
    const response = await vocabApiClient.post<AdminQuestion>(
      `/admin/exercise-sets/${setId}/questions`,
      data
    );
    return response.data;
  },

  adminUpdateQuestion: async (questionId: number, data: AdminQuestionRequest): Promise<AdminQuestion> => {
    const response = await vocabApiClient.put<AdminQuestion>(
      `/admin/questions/${questionId}`,
      data
    );
    return response.data;
  },

  adminDeleteQuestion: async (questionId: number): Promise<void> => {
    await vocabApiClient.delete(`/admin/questions/${questionId}`);
  },

  adminReorderQuestions: async (questionIds: number[]): Promise<void> => {
    await vocabApiClient.patch("/admin/questions/reorder", { questionIds });
  },
};
export default exerciseApi;
