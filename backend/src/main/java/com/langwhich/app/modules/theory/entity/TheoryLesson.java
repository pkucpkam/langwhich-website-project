package com.langwhich.app.modules.theory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "theory_lessons", indexes = {
        @Index(name = "idx_theory_lesson_slug", columnList = "slug", unique = true),
        @Index(name = "idx_theory_lesson_topic_id", columnList = "topic_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheoryLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private TheoryTopic topic;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(length = 500)
    private String thumbnail;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // Stored as Tiptap Rich Text JSON string

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "estimated_minutes", nullable = false)
    @Builder.Default
    private int estimatedMinutes = 5;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private boolean isPublished = false;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
