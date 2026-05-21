package com.langwhich.app.history;

import com.langwhich.app.lesson.Lesson;
import com.langwhich.app.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(name = "lesson_title", length = 200)
    private String lessonTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "study_mode", nullable = false, length = 20)
    private StudyMode studyMode;

    @Column(name = "time_spent", nullable = false)
    @Builder.Default
    private int timeSpent = 0; // seconds

    @Column(name = "know_count", nullable = false)
    @Builder.Default
    private int knowCount = 0;

    @Column(name = "total_count", nullable = false)
    @Builder.Default
    private int totalCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
