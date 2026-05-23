package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionResponse {
    private Long id;
    private ExerciseType type;
    private String questionText;
    private String explanation;
    private int points;
    private int sortOrder;
    private List<AdminQuestionOptionResponse> options;
    private List<String> correctAnswers;

    public static AdminQuestionResponse fromEntity(ExerciseQuestion question) {
        if (question == null) return null;
        return AdminQuestionResponse.builder()
            .id(question.getId())
            .type(question.getType())
            .questionText(question.getQuestionText())
            .explanation(question.getExplanation())
            .points(question.getPoints())
            .sortOrder(question.getSortOrder())
            .options(question.getOptions() != null ? 
                question.getOptions().stream()
                    .map(AdminQuestionOptionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .correctAnswers(question.getAnswers() != null ?
                question.getAnswers().stream()
                    .map(ans -> ans.getCorrectAnswer())
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
