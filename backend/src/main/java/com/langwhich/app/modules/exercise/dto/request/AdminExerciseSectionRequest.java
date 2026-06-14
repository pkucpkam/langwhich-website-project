package com.langwhich.app.modules.exercise.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminExerciseSectionRequest {
    @NotBlank(message = "Section title is required")
    private String title;
    
    private String instruction;
    
    private int sortOrder;
}
