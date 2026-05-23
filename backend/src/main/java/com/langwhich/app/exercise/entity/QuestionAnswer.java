package com.langwhich.app.exercise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_answers", indexes = {
    @Index(name = "idx_question_answers_question", columnList = "question_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExerciseQuestion question;

    @Column(name = "correct_answer", nullable = false, length = 500)
    private String correctAnswer;

    @Column(name = "is_case_sensitive", nullable = false)
    @Builder.Default
    private boolean isCaseSensitive = false;
}
