package com.langwhich.app.vocabulary;

import com.langwhich.app.lesson.Lesson;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vocabulary_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false, length = 300)
    private String word;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definition;

    @Column(length = 200)
    private String ipa;

    @Column(name = "word_type", length = 50)
    private String wordType;

    @Column(name = "example_en", columnDefinition = "TEXT")
    private String exampleEn;

    @Column(name = "example_vi", columnDefinition = "TEXT")
    private String exampleVi;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private int orderIndex = 0;
}
