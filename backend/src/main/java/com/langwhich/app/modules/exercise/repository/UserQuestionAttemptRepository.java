package com.langwhich.app.modules.exercise.repository;

import com.langwhich.app.modules.exercise.entity.UserQuestionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserQuestionAttemptRepository extends JpaRepository<UserQuestionAttempt, Long> {
    Optional<UserQuestionAttempt> findByUserIdAndQuestionId(Long userId, Long questionId);
}
