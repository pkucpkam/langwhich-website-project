package com.langwhich.app.modules.exercise.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;
    
    private JsonNode payload;
}
