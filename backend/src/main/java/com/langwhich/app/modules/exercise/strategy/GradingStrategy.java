package com.langwhich.app.modules.exercise.strategy;

import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import com.langwhich.app.modules.exercise.entity.ExerciseType;

public interface GradingStrategy {
    
    boolean supports(ExerciseType type);
    
    void grade(ExerciseQuestion question, ExerciseAttemptAnswer attemptAnswer);
}
