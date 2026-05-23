package com.langwhich.app.modules.lesson.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.langwhich.app.modules.lesson.entity.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    // Public lessons (not private)
    Page<Lesson> findByIsPrivateFalse(Pageable pageable);

    // Search public lessons by title or creator username
    @Query("SELECT l FROM Lesson l WHERE l.isPrivate = false AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.creator.username) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Lesson> searchPublicLessons(@Param("query") String query, Pageable pageable);

    // My lessons
    List<Lesson> findByCreatorId(Long creatorId);

    // My lessons in folder
    List<Lesson> findByCreatorIdAndFolderId(Long creatorId, Long folderId);

    // Lessons in a specific folder (public)
    List<Lesson> findByFolderIdAndIsPrivateFalse(Long folderId);

    // All lessons in a folder (for owner/admin)
    List<Lesson> findByFolderId(Long folderId);

    // Official lessons
    List<Lesson> findByIsOfficialTrue();

    // Check ownership
    Optional<Lesson> findByIdAndCreatorId(Long id, Long creatorId);

    // Lesson with vocab items eagerly loaded
    @Query("SELECT DISTINCT l FROM Lesson l LEFT JOIN FETCH l.vocabularyItems WHERE l.id = :id")
    Optional<Lesson> findByIdWithItems(@Param("id") Long id);
}
