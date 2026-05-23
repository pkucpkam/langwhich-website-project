package com.langwhich.app.modules.exercise.repository;

import com.langwhich.app.modules.exercise.entity.QuestionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswer, Long> {
    List<QuestionAnswer> findAllByQuestionId(Long questionId);
}
