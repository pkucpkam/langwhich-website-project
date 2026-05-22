package com.langwhich.app.theory;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "theory_articles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheoryArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "folder_id")
    private TheoryFolder folder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (category == null && folder != null) {
            category = folder.getName();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (category == null && folder != null) {
            category = folder.getName();
        }
    }
}
