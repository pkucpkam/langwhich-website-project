package com.langwhich.app.modules.exercise.strategy;

import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import com.langwhich.app.modules.exercise.entity.QuestionAnswer;
import org.springframework.stereotype.Component;

@Component
public class FillBlankGradingStrategy implements GradingStrategy {

    @Override
    public boolean supports(ExerciseType type) {
        return type == ExerciseType.FILL_IN_BLANK;
    }

    @Override
    public void grade(ExerciseQuestion question, ExerciseAttemptAnswer attemptAnswer) {
        String userAns = attemptAnswer.getTextAnswer();
        if (userAns == null || userAns.trim().isEmpty()) {
            attemptAnswer.setCorrect(false);
            attemptAnswer.setPointsEarned(0);
            return;
        }

        String normalizedUserAns = normalize(userAns);
        boolean isCorrect = false;

        if (question.getAnswers() != null) {
            for (QuestionAnswer correctAns : question.getAnswers()) {
                String candidate = correctAns.getCorrectAnswer();
                if (correctAns.isCaseSensitive()) {
                    if (userAns.trim().equals(candidate.trim())) {
                        isCorrect = true;
                        break;
                    }
                } else {
                    if (normalizedUserAns.equals(normalize(candidate))) {
                        isCorrect = true;
                        break;
                    }
                }
            }
        }

        if (isCorrect) {
            attemptAnswer.setCorrect(true);
            attemptAnswer.setPointsEarned(question.getPoints());
        } else {
            attemptAnswer.setCorrect(false);
            attemptAnswer.setPointsEarned(0);
        }
    }

    private String normalize(String input) {
        if (input == null) return "";
        return input.trim()
                    .toLowerCase()
                    .replaceAll("\\s+", " ");
    }
}
