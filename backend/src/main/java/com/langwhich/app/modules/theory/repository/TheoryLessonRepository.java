package com.langwhich.app.modules.theory.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.langwhich.app.modules.theory.entity.TheoryLesson;

@Repository
public interface TheoryLessonRepository extends JpaRepository<TheoryLesson, Long>, JpaSpecificationExecutor<TheoryLesson> {
    Optional<TheoryLesson> findBySlug(String slug);
    Optional<TheoryLesson> findBySlugAndIsPublishedTrue(String slug);

    Page<TheoryLesson> findAllByTopicIdAndIsPublishedTrue(Long topicId, Pageable pageable);
    Page<TheoryLesson> findAllByTopicSlugAndIsPublishedTrue(String topicSlug, Pageable pageable);

    Page<TheoryLesson> findAllByIsPublishedTrue(Pageable pageable);

    @Query("SELECT l FROM TheoryLesson l WHERE l.isPublished = true AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.summary) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TheoryLesson> searchPublicLessons(@Param("search") String search, Pageable pageable);

    @Query("SELECT l FROM TheoryLesson l WHERE l.topic.slug = :topicSlug AND l.isPublished = true AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.summary) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TheoryLesson> searchPublicLessonsInTopic(@Param("topicSlug") String topicSlug, @Param("search") String search, Pageable pageable);

    List<TheoryLesson> findTop5ByIsPublishedTrueOrderByViewCountDesc();
    List<TheoryLesson> findTop5ByIsPublishedTrueOrderByCreatedAtDesc();

    @Query("SELECT l FROM TheoryLesson l WHERE l.topic.id = :topicId AND l.isPublished = true AND l.id != :excludeId")
    List<TheoryLesson> findRelatedLessons(@Param("topicId") Long topicId, @Param("excludeId") Long excludeId, Pageable pageable);

    @Query("SELECT l FROM TheoryLesson l WHERE l.topic.id = :topicId AND l.isPublished = true AND l.createdAt < :createdAt ORDER BY l.createdAt DESC")
    List<TheoryLesson> findPreviousLesson(@Param("topicId") Long topicId, @Param("createdAt") java.time.LocalDateTime createdAt, Pageable pageable);

    @Query("SELECT l FROM TheoryLesson l WHERE l.topic.id = :topicId AND l.isPublished = true AND l.createdAt > :createdAt ORDER BY l.createdAt ASC")
    List<TheoryLesson> findNextLesson(@Param("topicId") Long topicId, @Param("createdAt") java.time.LocalDateTime createdAt, Pageable pageable);

    boolean existsBySlug(String slug);
}
