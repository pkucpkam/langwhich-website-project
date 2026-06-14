package com.langwhich.app.modules.exercise.repository;

import com.langwhich.app.modules.exercise.entity.ExerciseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExerciseSectionRepository extends JpaRepository<ExerciseSection, Long> {
    List<ExerciseSection> findAllByExerciseSetIdOrderBySortOrderAscIdAsc(Long exerciseSetId);
}
