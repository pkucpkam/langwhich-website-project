package com.langwhich.app.exercise.strategy;

import com.langwhich.app.exercise.entity.ExerciseQuestion;
import com.langwhich.app.exercise.entity.ExerciseAttemptAnswer;
import com.langwhich.app.exercise.entity.ExerciseType;

public interface GradingStrategy {
    
    boolean supports(ExerciseType type);
    
    void grade(ExerciseQuestion question, ExerciseAttemptAnswer attemptAnswer);
}
