package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseSet;
import com.langwhich.app.modules.theory.entity.Difficulty;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSetDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Long topicId;
    private String topicName;
    private String topicSlug;
    private Difficulty difficulty;
    private int estimatedMinutes;
    private String thumbnailUrl;
    private List<QuestionResponse> questions;

    public static ExerciseSetDetailResponse fromEntity(ExerciseSet set) {
        if (set == null) return null;
        return ExerciseSetDetailResponse.builder()
            .id(set.getId())
            .title(set.getTitle())
            .description(set.getDescription())
            .topicId(set.getTopic() != null ? set.getTopic().getId() : null)
            .topicName(set.getTopic() != null ? set.getTopic().getName() : null)
            .topicSlug(set.getTopic() != null ? set.getTopic().getSlug() : null)
            .difficulty(set.getDifficulty())
            .estimatedMinutes(set.getEstimatedMinutes())
            .thumbnailUrl(set.getThumbnailUrl())
            .questions(set.getQuestions() != null ? 
                set.getQuestions().stream()
                    .map(QuestionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
