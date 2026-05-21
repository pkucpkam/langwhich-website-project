package com.langwhich.app.srs;

import com.langwhich.app.exception.ResourceNotFoundException;
import com.langwhich.app.lesson.Lesson;
import com.langwhich.app.lesson.LessonRepository;
import com.langwhich.app.srs.dto.ReviewCardRequest;
import com.langwhich.app.srs.dto.SrsCardResponse;
import com.langwhich.app.user.User;
import com.langwhich.app.vocabulary.VocabularyItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SrsService {

    private final SrsCardRepository srsCardRepository;
    private final LessonRepository lessonRepository;

    public List<SrsCardResponse> getDueCards(User user) {
        return srsCardRepository.findDueCards(user.getId(), LocalDateTime.now())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public List<SrsCardResponse> getCardsForLesson(Long lessonId, User user) {
        return srsCardRepository.findByUserIdAndLessonId(user.getId(), lessonId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public int initializeCardsForLesson(Long lessonId, User user) {
        Lesson lesson = lessonRepository.findByIdWithItems(lessonId)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        int created = 0;
        for (VocabularyItem item : lesson.getVocabularyItems()) {
            boolean exists = srsCardRepository.existsByUserIdAndVocabularyItemId(user.getId(), item.getId());
            if (!exists) {
                SrsCard card = SrsAlgorithm.buildNewCard(user, lesson, item);
                srsCardRepository.save(card);
                created++;
            }
        }
        return created;
    }

    @Transactional
    public SrsCardResponse reviewCard(Long cardId, ReviewCardRequest request, User user) {
        SrsCard card = srsCardRepository.findById(cardId)
            .orElseThrow(() -> new ResourceNotFoundException("SRS card not found"));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new com.langwhich.app.exception.ForbiddenException("Access denied");
        }

        int rating = request.getRating();
        SrsAlgorithm.ReviewResult result = SrsAlgorithm.calculate(
            rating,
            card.getRepetitions(),
            card.getIntervalDays(),
            card.getEaseFactor()
        );

        // Update card
        card.setRepetitions(result.newRepetitions());
        card.setIntervalDays(result.newIntervalDays());
        card.setEaseFactor(result.newEaseFactor());
        card.setNextReview(result.nextReview());
        card.setLastReview(LocalDateTime.now());
        card.setTotalReviews(card.getTotalReviews() + 1);

        if (rating >= 3) {
            card.setCorrectCount(card.getCorrectCount() + 1);
            card.setStreak(card.getStreak() + 1);
        } else {
            card.setIncorrectCount(card.getIncorrectCount() + 1);
            card.setStreak(0);
        }

        return toResponse(srsCardRepository.save(card));
    }

    private SrsCardResponse toResponse(SrsCard card) {
        VocabularyItem item = card.getVocabularyItem();
        return SrsCardResponse.builder()
            .id(card.getId())
            .lessonId(card.getLesson().getId())
            .lessonTitle(card.getLesson().getTitle())
            .vocabularyItemId(item.getId())
            .word(item.getWord())
            .definition(item.getDefinition())
            .ipa(item.getIpa())
            .wordType(item.getWordType())
            .exampleEn(item.getExampleEn())
            .exampleVi(item.getExampleVi())
            .easeFactor(card.getEaseFactor())
            .intervalDays(card.getIntervalDays())
            .repetitions(card.getRepetitions())
            .nextReview(card.getNextReview())
            .lastReview(card.getLastReview())
            .totalReviews(card.getTotalReviews())
            .correctCount(card.getCorrectCount())
            .incorrectCount(card.getIncorrectCount())
            .streak(card.getStreak())
            .build();
    }
}
