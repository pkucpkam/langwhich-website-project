package com.langwhich.app.srs.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SrsCardResponse {
    private Long id;
    private Long lessonId;
    private String lessonTitle;
    private Long vocabularyItemId;
    private String word;
    private String definition;
    private String ipa;
    private String wordType;
    private String exampleEn;
    private String exampleVi;

    // SM-2 fields
    private double easeFactor;
    private int intervalDays;
    private int repetitions;
    private LocalDateTime nextReview;
    private LocalDateTime lastReview;

    // Stats
    private int totalReviews;
    private int correctCount;
    private int incorrectCount;
    private int streak;
}
