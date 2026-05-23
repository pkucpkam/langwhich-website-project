package com.langwhich.app.exercise.dto;

import com.langwhich.app.exercise.entity.ExerciseSet;
import com.langwhich.app.theory.Difficulty;
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
    private Difficulty difficulty;
    private int estimatedMinutes;
    private String thumbnailUrl;
    private boolean isPublished;
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
            .difficulty(set.getDifficulty())
            .estimatedMinutes(set.getEstimatedMinutes())
            .thumbnailUrl(set.getThumbnailUrl())
            .isPublished(set.isPublished())
            .questions(set.getQuestions() != null ? 
                set.getQuestions().stream()
                    .map(AdminQuestionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
