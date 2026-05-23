package com.langwhich.app.exercise.dto;

import com.langwhich.app.exercise.entity.ExerciseAttempt;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptReviewResponse {
    private Long id;
    private Long exerciseSetId;
    private String exerciseSetTitle;
    private double score;
    private int correctCount;
    private int totalQuestions;
    private int durationSeconds;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private List<QuestionReviewResponse> questions;
    private List<AttemptAnswerReviewResponse> userAnswers;

    public static AttemptReviewResponse fromEntity(ExerciseAttempt attempt) {
        if (attempt == null) return null;
        return AttemptReviewResponse.builder()
            .id(attempt.getId())
            .exerciseSetId(attempt.getExerciseSet().getId())
            .exerciseSetTitle(attempt.getExerciseSet().getTitle())
            .score(attempt.getScore())
            .correctCount(attempt.getCorrectCount())
            .totalQuestions(attempt.getTotalQuestions())
            .durationSeconds(attempt.getDurationSeconds())
            .status(attempt.getStatus().name())
            .startedAt(attempt.getStartedAt())
            .submittedAt(attempt.getSubmittedAt())
            .questions(attempt.getExerciseSet().getQuestions() != null ?
                attempt.getExerciseSet().getQuestions().stream()
                    .map(QuestionReviewResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .userAnswers(attempt.getAnswers() != null ?
                attempt.getAnswers().stream()
                    .map(AttemptAnswerReviewResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
