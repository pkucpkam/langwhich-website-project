package com.langwhich.app.modules.exercise.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionRequest {

    @NotBlank(message = "Question type is required")
    private String type; // e.g. MULTIPLE_CHOICE, FILL_IN_BLANK

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String explanation;

    @Min(value = 1, message = "Points must be at least 1")
    private int points;

    private int sortOrder;

    @Valid
    private List<AdminQuestionOptionRequest> options; // Used for MULTIPLE_CHOICE

    private List<String> correctAnswers; // Used for FILL_IN_BLANK (multiple accepted)
}
