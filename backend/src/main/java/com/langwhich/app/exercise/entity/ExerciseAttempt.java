package com.langwhich.app.exercise.entity;

import com.langwhich.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercise_attempts", indexes = {
    @Index(name = "idx_exercise_attempts_user", columnList = "user_id"),
    @Index(name = "idx_exercise_attempts_set", columnList = "exercise_set_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_set_id", nullable = false)
    private ExerciseSet exerciseSet;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    @Builder.Default
    private double score = 0.0;

    @Column(name = "correct_count", nullable = false)
    @Builder.Default
    private int correctCount = 0;

    @Column(name = "total_questions", nullable = false)
    @Builder.Default
    private int totalQuestions = 0;

    @Column(name = "duration_seconds", nullable = false)
    @Builder.Default
    private int durationSeconds = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExerciseAttemptAnswer> answers = new ArrayList<>();
}
