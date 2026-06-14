package com.langwhich.app.modules.exercise.dto.request;

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
public class AdminExerciseSetRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Long topicId;
    
    private Long lessonId;


    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @Min(value = 1, message = "Estimated minutes must be at least 1")
    private int estimatedMinutes;

    private String thumbnailUrl;

    @com.fasterxml.jackson.annotation.JsonProperty("isPublished")
    private boolean isPublished;
}
