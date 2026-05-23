package com.langwhich.app.modules.theory.dto.response;

import com.langwhich.app.modules.theory.entity.TheoryTopic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheoryTopicResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String icon;
    private int orderIndex;
    private boolean isPublished;
    private int lessonCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TheoryTopicResponse fromEntity(TheoryTopic topic) {
        if (topic == null) return null;
        return TheoryTopicResponse.builder()
            .id(topic.getId())
            .name(topic.getName())
            .slug(topic.getSlug())
            .description(topic.getDescription())
            .icon(topic.getIcon())
            .orderIndex(topic.getOrderIndex())
            .isPublished(topic.isPublished())
            .lessonCount(topic.getLessons() != null ? topic.getLessons().size() : 0)
            .createdAt(topic.getCreatedAt())
            .updatedAt(topic.getUpdatedAt())
            .build();
    }
}
