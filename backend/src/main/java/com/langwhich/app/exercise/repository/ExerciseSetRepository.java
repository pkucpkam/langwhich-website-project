package com.langwhich.app.exercise.repository;

import com.langwhich.app.exercise.entity.ExerciseSet;
import com.langwhich.app.theory.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseSetRepository extends JpaRepository<ExerciseSet, Long>, JpaSpecificationExecutor<ExerciseSet> {
    
    Page<ExerciseSet> findAllByIsPublishedTrue(Pageable pageable);
    
    @Query("SELECT s FROM ExerciseSet s WHERE s.isPublished = true AND " +
           "(:topicSlug IS NULL OR s.topic.slug = :topicSlug) AND " +
           "(:difficulty IS NULL OR s.difficulty = :difficulty) AND " +
           "(:search IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ExerciseSet> filterExercises(
        @Param("topicSlug") String topicSlug,
        @Param("difficulty") Difficulty difficulty,
        @Param("search") String search,
        Pageable pageable
    );
}
