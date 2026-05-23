package com.langwhich.app.exercise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionOptionRequest {

    private Long id; // Optional ID for matching existing options

    @NotBlank(message = "Option text is required")
    private String optionText;

    private boolean isCorrect;

    private int sortOrder;
}
