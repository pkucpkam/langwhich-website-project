package com.langwhich.app.modules.theory.dto.request;

import com.langwhich.app.modules.theory.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheoryLessonRequest {

    private Long topicId;

    @NotBlank(message = "Lesson title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Summary cannot exceed 1000 characters")
    private String summary;

    @Size(max = 500, message = "Thumbnail URL cannot exceed 500 characters")
    private String thumbnail;

    @NotBlank(message = "Lesson content is required")
    private String content; // JSON Tiptap string

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    private int estimatedMinutes;

    private Boolean isPublished;
}
