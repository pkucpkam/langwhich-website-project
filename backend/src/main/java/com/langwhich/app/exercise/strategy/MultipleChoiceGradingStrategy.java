package com.langwhich.app.exercise.strategy;

import com.langwhich.app.exercise.entity.ExerciseAttemptAnswer;
import com.langwhich.app.exercise.entity.ExerciseQuestion;
import com.langwhich.app.exercise.entity.ExerciseType;
import com.langwhich.app.exercise.entity.QuestionOption;
import org.springframework.stereotype.Component;

@Component
public class MultipleChoiceGradingStrategy implements GradingStrategy {

    @Override
    public boolean supports(ExerciseType type) {
        return type == ExerciseType.MULTIPLE_CHOICE;
    }

    @Override
    public void grade(ExerciseQuestion question, ExerciseAttemptAnswer attemptAnswer) {
        QuestionOption selected = attemptAnswer.getSelectedOption();
        if (selected != null && selected.isCorrect()) {
            attemptAnswer.setCorrect(true);
            attemptAnswer.setPointsEarned(question.getPoints());
        } else {
            attemptAnswer.setCorrect(false);
            attemptAnswer.setPointsEarned(0);
        }
    }
}
