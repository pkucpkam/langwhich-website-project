package com.langwhich.app.modules.exercise.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;

public interface GradingStrategy {
    
    boolean supports(ExerciseType type);
    
    GradeResult grade(ExerciseQuestion question, JsonNode userPayload);
}
