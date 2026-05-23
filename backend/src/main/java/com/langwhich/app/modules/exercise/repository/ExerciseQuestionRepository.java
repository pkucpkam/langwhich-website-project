package com.langwhich.app.modules.exercise.repository;

import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExerciseQuestionRepository extends JpaRepository<ExerciseQuestion, Long> {
    List<ExerciseQuestion> findAllByExerciseSetIdOrderBySortOrderAscIdAsc(Long exerciseSetId);
}
