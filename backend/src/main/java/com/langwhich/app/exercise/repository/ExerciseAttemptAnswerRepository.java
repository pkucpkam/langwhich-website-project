package com.langwhich.app.exercise.repository;

import com.langwhich.app.exercise.entity.ExerciseAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseAttemptAnswerRepository extends JpaRepository<ExerciseAttemptAnswer, Long> {
    
    Optional<ExerciseAttemptAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    
    List<ExerciseAttemptAnswer> findAllByAttemptId(Long attemptId);
}
