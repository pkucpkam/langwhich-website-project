package com.langwhich.app.exercise.dto;

import com.langwhich.app.exercise.entity.ExerciseQuestion;
import com.langwhich.app.exercise.entity.ExerciseType;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionReviewResponse {
    private Long id;
    private ExerciseType type;
    private String questionText;
    private String explanation;
    private int points;
    private int sortOrder;
    private List<QuestionOptionReviewResponse> options;
    private List<String> correctAnswers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionOptionReviewResponse {
        private Long id;
        private String optionText;
        private boolean isCorrect;
        private int sortOrder;
    }

    public static QuestionReviewResponse fromEntity(ExerciseQuestion question) {
        if (question == null) return null;
        return QuestionReviewResponse.builder()
            .id(question.getId())
            .type(question.getType())
            .questionText(question.getQuestionText())
            .explanation(question.getExplanation())
            .points(question.getPoints())
            .sortOrder(question.getSortOrder())
            .options(question.getOptions() != null ? 
                question.getOptions().stream()
                    .map(o -> QuestionOptionReviewResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .isCorrect(o.isCorrect())
                        .sortOrder(o.getSortOrder())
                        .build())
                    .collect(Collectors.toList()) : null)
            .correctAnswers(question.getAnswers() != null ?
                question.getAnswers().stream()
                    .map(o -> o.getCorrectAnswer())
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
