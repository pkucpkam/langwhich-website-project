package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private ExerciseType type;
    private String questionText;
    private int points;
    private int sortOrder;
    private List<QuestionOptionResponse> options;

    public static QuestionResponse fromEntity(ExerciseQuestion question) {
        if (question == null) return null;
        return QuestionResponse.builder()
            .id(question.getId())
            .type(question.getType())
            .questionText(question.getQuestionText())
            .points(question.getPoints())
            .sortOrder(question.getSortOrder())
            .options(question.getOptions() != null ? 
                question.getOptions().stream()
                    .map(QuestionOptionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
