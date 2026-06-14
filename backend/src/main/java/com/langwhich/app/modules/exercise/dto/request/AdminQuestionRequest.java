package com.langwhich.app.modules.exercise.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionRequest {

    private Long exerciseSectionId;

    @NotBlank(message = "Question type is required")
    private String type; // e.g. MULTIPLE_CHOICE, FILL_IN_BLANK, FIND_AND_CORRECT, SENTENCE_REWRITE

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String explanation;

    @Min(value = 1, message = "Points must be at least 1")
    private int points;

    private int sortOrder;

    private JsonNode metadata; // Flexible JSONB metadata

    private JsonNode grammarTags; // e.g. ["present-simple", "verbs"]

    private JsonNode skillTags; // e.g. ["grammar", "reading"]
}
