package com.langwhich.app.modules.lesson.dto.request;

import com.langwhich.app.modules.vocabulary.dto.request.VocabularyItemRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateLessonRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private boolean isPrivate = false;

    private Long folderId;

    @Valid
    private List<VocabularyItemRequest> vocabularyItems;
}
