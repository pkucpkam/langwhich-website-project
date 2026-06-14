package com.langwhich.app.modules.exercise.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import lombok.*;

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
    private JsonNode metadata;

    public static QuestionResponse fromEntity(ExerciseQuestion question) {
        if (question == null) return null;
        
        // Strip sensitive answers from metadata for client-side practice delivery to prevent cheating
        JsonNode clientMetadata = null;
        if (question.getMetadata() != null) {
            ObjectNode copy = question.getMetadata().deepCopy();
            copy.remove("correctAnswer");
            copy.remove("acceptedAnswers");
            copy.remove("mistakeText");
            clientMetadata = copy;
        }

        return QuestionResponse.builder()
            .id(question.getId())
            .type(question.getType())
            .questionText(question.getQuestionText())
            .points(question.getPoints())
            .sortOrder(question.getSortOrder())
            .metadata(clientMetadata)
            .build();
    }
}
