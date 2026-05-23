package com.langwhich.app.modules.exercise.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;
    
    private Long selectedOptionId;
    private String textAnswer;
}
