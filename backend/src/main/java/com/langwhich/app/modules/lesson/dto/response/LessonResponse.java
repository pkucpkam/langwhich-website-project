package com.langwhich.app.modules.lesson.dto.response;

import com.langwhich.app.modules.vocabulary.dto.response.VocabularyItemResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class LessonResponse {
    private Long id;
    private String title;
    private String description;
    private int wordCount;
    private boolean isPrivate;
    private boolean isOfficial;
    private Long creatorId;
    private String creatorUsername;
    private Long folderId;
    private String folderName;
    private LocalDateTime createdAt;
    private List<VocabularyItemResponse> vocabularyItems;
}
