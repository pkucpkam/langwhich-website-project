package com.langwhich.app.modules.exercise.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class FillBlankGradingStrategy implements GradingStrategy {

    @Override
    public boolean supports(ExerciseType type) {
        return type == ExerciseType.FILL_IN_BLANK;
    }

    @Override
    public GradeResult grade(ExerciseQuestion question, JsonNode userPayload) {
        if (userPayload == null || !userPayload.has("text")) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(question.getPoints())
                    .correct(false)
                    .feedback("Answer cannot be blank.")
                    .explanation(question.getExplanation())
                    .build();
        }

        String userAns = userPayload.get("text").asText().trim();
        if (userAns.isEmpty()) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(question.getPoints())
                    .correct(false)
                    .feedback("Answer cannot be blank.")
                    .explanation(question.getExplanation())
                    .build();
        }

        String normalizedUserAns = normalize(userAns);
        List<String> accepted = new ArrayList<>();
        JsonNode metadata = question.getMetadata();
        if (metadata != null && metadata.has("acceptedAnswers")) {
            JsonNode arrayNode = metadata.get("acceptedAnswers");
            if (arrayNode.isArray()) {
                for (JsonNode node : arrayNode) {
                    accepted.add(node.asText());
                }
            }
        }

        boolean isCorrect = false;
        for (String candidate : accepted) {
            if (normalizedUserAns.equals(normalize(candidate))) {
                isCorrect = true;
                break;
            }
        }

        double score = isCorrect ? question.getPoints() : 0.0;

        return GradeResult.builder()
                .score(score)
                .maxScore(question.getPoints())
                .correct(isCorrect)
                .feedback(isCorrect ? "Correct answer!" : "Incorrect answer.")
                .explanation(question.getExplanation())
                .build();
    }

    private String normalize(String input) {
        if (input == null) return "";
        return input.trim()
                    .toLowerCase()
                    .replaceAll("\\s+", " ");
    }
}
