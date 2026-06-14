package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseSet;
import com.langwhich.app.modules.theory.entity.Difficulty;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSetResponse {
    private Long id;
    private String title;
    private String description;
    private Long topicId;
    private String topicName;
    private String topicSlug;
    private Long lessonId;
    private String lessonTitle;
    private String lessonSlug;
    private Difficulty difficulty;
    private int estimatedMinutes;
    private String thumbnailUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("isPublished")
    private boolean isPublished;
    private int questionCount;
    private String createdAt;

    public static ExerciseSetResponse fromEntity(ExerciseSet set) {
        if (set == null) return null;
        return ExerciseSetResponse.builder()
            .id(set.getId())
            .title(set.getTitle())
            .description(set.getDescription())
            .topicId(set.getTopic() != null ? set.getTopic().getId() : null)
            .topicName(set.getTopic() != null ? set.getTopic().getName() : null)
            .topicSlug(set.getTopic() != null ? set.getTopic().getSlug() : null)
            .lessonId(set.getLesson() != null ? set.getLesson().getId() : null)
            .lessonTitle(set.getLesson() != null ? set.getLesson().getTitle() : null)
            .lessonSlug(set.getLesson() != null ? set.getLesson().getSlug() : null)
            .difficulty(set.getDifficulty())
            .estimatedMinutes(set.getEstimatedMinutes())
            .thumbnailUrl(set.getThumbnailUrl())
            .isPublished(set.isPublished())
            .questionCount(set.getSections() != null ? 
                set.getSections().stream().mapToInt(s -> s.getQuestions().size()).sum() : 0)
            .createdAt(set.getCreatedAt() != null ? set.getCreatedAt().toString() : null)
            .build();
    }
}
