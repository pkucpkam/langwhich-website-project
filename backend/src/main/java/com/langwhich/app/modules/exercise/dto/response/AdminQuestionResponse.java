package com.langwhich.app.modules.exercise.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private JsonNode metadata;
    private JsonNode grammarTags;
    private JsonNode skillTags;

    public static AdminQuestionResponse fromEntity(ExerciseQuestion question) {
        if (question == null) return null;
        return AdminQuestionResponse.builder()
            .id(question.getId())
            .type(question.getType())
            .questionText(question.getQuestionText())
            .explanation(question.getExplanation())
            .points(question.getPoints())
            .sortOrder(question.getSortOrder())
            .metadata(question.getMetadata())
            .grammarTags(question.getGrammarTags())
            .skillTags(question.getSkillTags())
            .build();
    }
}
