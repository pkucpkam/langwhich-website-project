package com.langwhich.app.exercise.dto;

import com.langwhich.app.exercise.entity.AttemptStatus;
import com.langwhich.app.exercise.entity.ExerciseAttempt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveAttemptResponse {
    private Long attemptId;
    private Long exerciseSetId;
    private String exerciseSetTitle;
    private String difficulty;
    private AttemptStatus status;
    private LocalDateTime startedAt;
    private List<QuestionResponse> questions;
    private List<SavedAnswerResponseDto> savedAnswers;

    public static ActiveAttemptResponse fromEntity(ExerciseAttempt attempt, List<SavedAnswerResponseDto> savedAnswers) {
        return ActiveAttemptResponse.builder()
                .attemptId(attempt.getId())
                .exerciseSetId(attempt.getExerciseSet().getId())
                .exerciseSetTitle(attempt.getExerciseSet().getTitle())
                .difficulty(attempt.getExerciseSet().getDifficulty().name())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .questions(attempt.getExerciseSet().getQuestions().stream()
                        .map(QuestionResponse::fromEntity)
                        .collect(Collectors.toList()))
                .savedAnswers(savedAnswers)
                .build();
       }
}
