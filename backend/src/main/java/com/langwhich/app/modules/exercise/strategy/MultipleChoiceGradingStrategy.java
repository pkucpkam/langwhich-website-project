package com.langwhich.app.modules.exercise.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import org.springframework.stereotype.Component;

@Component
public class MultipleChoiceGradingStrategy implements GradingStrategy {

    @Override
    public boolean supports(ExerciseType type) {
        return type == ExerciseType.MULTIPLE_CHOICE;
    }

    @Override
    public GradeResult grade(ExerciseQuestion question, JsonNode userPayload) {
        if (userPayload == null || !userPayload.has("selectedOption")) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(question.getPoints())
                    .correct(false)
                    .feedback("No option was selected.")
                    .explanation(question.getExplanation())
                    .build();
        }

        String userAns = userPayload.get("selectedOption").asText().trim();
        
        JsonNode metadata = question.getMetadata();
        String correctAns = "";
        if (metadata != null && metadata.has("correctAnswer")) {
            correctAns = metadata.get("correctAnswer").asText().trim();
        }

        boolean isCorrect = userAns.equalsIgnoreCase(correctAns);
        double score = isCorrect ? question.getPoints() : 0.0;

        return GradeResult.builder()
                .score(score)
                .maxScore(question.getPoints())
                .correct(isCorrect)
                .feedback(isCorrect ? "Correct answer!" : "Incorrect option selected.")
                .explanation(question.getExplanation())
                .build();
    }
}
