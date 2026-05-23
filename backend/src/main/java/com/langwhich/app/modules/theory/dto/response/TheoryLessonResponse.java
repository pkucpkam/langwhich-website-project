package com.langwhich.app.modules.theory.dto.response;

import com.langwhich.app.modules.theory.entity.Difficulty;
import com.langwhich.app.modules.theory.entity.TheoryLesson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheoryLessonResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String topicSlug;
    private String title;
    private String slug;
    private String summary;
    private String thumbnail;
    private String content; // JSON string
    private Difficulty difficulty;
    private int estimatedMinutes;
    private boolean isPublished;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TheoryLessonResponse fromEntity(TheoryLesson lesson) {
        if (lesson == null) return null;
        return TheoryLessonResponse.builder()
            .id(lesson.getId())
            .topicId(lesson.getTopic().getId())
            .topicName(lesson.getTopic().getName())
            .topicSlug(lesson.getTopic().getSlug())
            .title(lesson.getTitle())
            .slug(lesson.getSlug())
            .summary(lesson.getSummary())
            .thumbnail(lesson.getThumbnail())
            .content(lesson.getContent())
            .difficulty(lesson.getDifficulty())
            .estimatedMinutes(lesson.getEstimatedMinutes())
            .isPublished(lesson.isPublished())
            .viewCount(lesson.getViewCount())
            .createdAt(lesson.getCreatedAt())
            .updatedAt(lesson.getUpdatedAt())
            .build();
    }
}
