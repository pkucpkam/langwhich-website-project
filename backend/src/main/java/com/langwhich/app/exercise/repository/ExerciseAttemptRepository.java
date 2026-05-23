package com.langwhich.app.exercise.repository;

import com.langwhich.app.exercise.entity.AttemptStatus;
import com.langwhich.app.exercise.entity.ExerciseAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {
    
    Page<ExerciseAttempt> findAllByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);
    
    List<ExerciseAttempt> findAllByUserIdAndExerciseSetIdOrderByStartedAtDesc(Long userId, Long exerciseSetId);
    
    Optional<ExerciseAttempt> findFirstByUserIdAndExerciseSetIdOrderByStartedAtDesc(Long userId, Long exerciseSetId);
    
    boolean existsByUserIdAndExerciseSetIdAndStatus(Long userId, Long exerciseSetId, AttemptStatus status);
}
