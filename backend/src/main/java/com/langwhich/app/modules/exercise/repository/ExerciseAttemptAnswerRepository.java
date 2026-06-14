package com.langwhich.app.modules.exercise.repository;

import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseAttemptAnswerRepository extends JpaRepository<ExerciseAttemptAnswer, Long> {
    
    Optional<ExerciseAttemptAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    
    List<ExerciseAttemptAnswer> findAllByAttemptId(Long attemptId);

    @Modifying
    @Query("DELETE FROM ExerciseAttemptAnswer e WHERE e.attempt.id = :attemptId")
    void deleteByAttemptId(@Param("attemptId") Long attemptId);
}
