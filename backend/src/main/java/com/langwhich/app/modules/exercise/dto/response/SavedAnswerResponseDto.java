package com.langwhich.app.modules.exercise.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedAnswerResponseDto {
    private Long questionId;
    private JsonNode payload;
    private Boolean isCorrect;
    private String feedback;
    private String explanation;
    private Double score;

    public static SavedAnswerResponseDto fromEntity(ExerciseAttemptAnswer answer) {
        return SavedAnswerResponseDto.builder()
                .questionId(answer.getQuestion().getId())
                .payload(answer.getPayload())
                .isCorrect(answer.isCorrect())
                .feedback(answer.getFeedback())
                .explanation(answer.getExplanation())
                .score((double) answer.getPointsEarned())
                .build();
    }
}
