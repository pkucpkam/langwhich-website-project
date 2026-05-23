package com.langwhich.app.modules.exercise.repository;

import com.langwhich.app.modules.exercise.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findAllByQuestionIdOrderBySortOrderAscIdAsc(Long questionId);
}
