package com.langwhich.app.modules.srs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.langwhich.app.modules.srs.entity.SrsCard;

@Repository
public interface SrsCardRepository extends JpaRepository<SrsCard, Long> {

    List<SrsCard> findByUserId(Long userId);

    List<SrsCard> findByUserIdAndLessonId(Long userId, Long lessonId);

    Optional<SrsCard> findByUserIdAndVocabularyItemId(Long userId, Long vocabularyItemId);

    boolean existsByUserIdAndVocabularyItemId(Long userId, Long vocabularyItemId);

    // Due cards: nextReview <= now
    @Query("SELECT c FROM SrsCard c WHERE c.user.id = :userId AND c.nextReview <= :now ORDER BY c.nextReview ASC")
    List<SrsCard> findDueCards(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Count due cards
    @Query("SELECT COUNT(c) FROM SrsCard c WHERE c.user.id = :userId AND c.nextReview <= :now")
    long countDueCards(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Check if cards already initialized for a lesson
    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
}
