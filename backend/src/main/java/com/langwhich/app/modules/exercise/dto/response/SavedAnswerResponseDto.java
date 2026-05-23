package com.langwhich.app.modules.exercise.dto.response;

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
    private Long selectedOptionId;
    private String textAnswer;

    public static SavedAnswerResponseDto fromEntity(ExerciseAttemptAnswer answer) {
        return SavedAnswerResponseDto.builder()
                .questionId(answer.getQuestion().getId())
                .selectedOptionId(answer.getSelectedOption() != null ? answer.getSelectedOption().getId() : null)
                .textAnswer(answer.getTextAnswer())
                .build();
    }
}
