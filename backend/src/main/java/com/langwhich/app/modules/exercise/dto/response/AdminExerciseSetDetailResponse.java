package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseSet;
import com.langwhich.app.modules.theory.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminExerciseSetDetailResponse {
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
    private List<AdminExerciseSectionResponse> sections;
    private List<AdminQuestionResponse> questions;

    public static AdminExerciseSetDetailResponse fromEntity(ExerciseSet set) {
        if (set == null) return null;
        return AdminExerciseSetDetailResponse.builder()
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
            .sections(set.getSections() != null ? 
                set.getSections().stream()
                    .map(AdminExerciseSectionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .questions(set.getSections() != null ?
                set.getSections().stream()
                    .flatMap(s -> s.getQuestions() != null ? s.getQuestions().stream() : java.util.stream.Stream.empty())
                    .map(AdminQuestionResponse::fromEntity)
                    .collect(Collectors.toList()) : new java.util.ArrayList<>())
            .build();
    }
}
