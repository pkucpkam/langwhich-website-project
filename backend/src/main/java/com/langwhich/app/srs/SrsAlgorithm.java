package com.langwhich.app.srs;

import java.time.LocalDateTime;

/**
 * SM-2 Spaced Repetition Algorithm
 * Ported from TypeScript srsAlgorithm.ts
 *
 * Ratings:
 *   0 = again (blackout, complete failure)
 *   3 = hard (correct with serious difficulty)
 *   4 = good (correct after hesitation)
 *   5 = easy (perfect response)
 */
public class SrsAlgorithm {

    private static final double MIN_EASE_FACTOR = 1.3;
    private static final double DEFAULT_EASE_FACTOR = 2.5;

    public record ReviewResult(
        int newRepetitions,
        int newIntervalDays,
        double newEaseFactor,
        LocalDateTime nextReview
    ) {}

    /**
     * Calculate the next review schedule based on SM-2 algorithm
     *
     * @param rating       0 (again), 3 (hard), 4 (good), 5 (easy)
     * @param repetitions  current repetitions count
     * @param intervalDays current interval in days
     * @param easeFactor   current ease factor (1.3–2.5)
     * @return ReviewResult with updated values
     */
    public static ReviewResult calculate(int rating, int repetitions, int intervalDays, double easeFactor) {
        int newRepetitions;
        int newIntervalDays;
        double newEaseFactor;

        if (rating < 3) {
            // Again: reset
            newRepetitions = 0;
            newIntervalDays = 1;
            newEaseFactor = easeFactor; // don't change EF on failure
        } else {
            // Correct response: update repetitions and interval
            newRepetitions = repetitions + 1;

            if (newRepetitions == 1) {
                newIntervalDays = 1;
            } else if (newRepetitions == 2) {
                newIntervalDays = 6;
            } else {
                newIntervalDays = (int) Math.round(intervalDays * easeFactor);
            }

            // Apply modifier based on rating
            if (rating == 3) { // hard
                newIntervalDays = (int) Math.round(newIntervalDays * 0.8);
            } else if (rating == 5) { // easy
                newIntervalDays = (int) Math.round(newIntervalDays * 1.3);
            }

            // Ensure minimum interval
            newIntervalDays = Math.max(1, newIntervalDays);

            // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
            double q = rating;
            newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
            newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);
        }

        LocalDateTime nextReview = LocalDateTime.now().plusDays(newIntervalDays);

        return new ReviewResult(newRepetitions, newIntervalDays, newEaseFactor, nextReview);
    }

    public static SrsCard buildNewCard(com.langwhich.app.user.User user,
                                      com.langwhich.app.lesson.Lesson lesson,
                                      com.langwhich.app.vocabulary.VocabularyItem item) {
        return SrsCard.builder()
            .user(user)
            .lesson(lesson)
            .vocabularyItem(item)
            .easeFactor(DEFAULT_EASE_FACTOR)
            .intervalDays(1)
            .repetitions(0)
            .nextReview(LocalDateTime.now())
            .totalReviews(0)
            .correctCount(0)
            .incorrectCount(0)
            .streak(0)
            .build();
    }
}
