package com.langwhich.app.modules.exercise.entity;

import com.langwhich.app.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_question_attempts",
    indexes = {
        @Index(name = "idx_user_question_attempts_user", columnList = "user_id"),
        @Index(name = "idx_user_question_attempts_question", columnList = "question_id")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQuestionAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExerciseQuestion question;

    @Column(name = "duration_seconds", nullable = false)
    @Builder.Default
    private int durationSeconds = 0;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private int retryCount = 0;

    @Column(name = "first_attempt_correct", nullable = false)
    @Builder.Default
    private boolean firstAttemptCorrect = false;

    @Column(name = "final_score", nullable = false)
    @Builder.Default
    private double finalScore = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
