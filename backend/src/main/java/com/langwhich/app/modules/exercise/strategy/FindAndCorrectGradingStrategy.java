package com.langwhich.app.modules.exercise.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class FindAndCorrectGradingStrategy implements GradingStrategy {

    @Override
    public boolean supports(ExerciseType type) {
        return type == ExerciseType.FIND_AND_CORRECT;
    }

    @Override
    public GradeResult grade(ExerciseQuestion question, JsonNode userPayload) {
        double maxScore = question.getPoints();
        if (userPayload == null || !userPayload.has("mistake") || !userPayload.has("correction")) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(maxScore)
                    .correct(false)
                    .feedback("Please identify the mistake and suggest a correction.")
                    .explanation(question.getExplanation())
                    .build();
        }

        String userMistake = userPayload.get("mistake").asText().trim();
        String userCorrection = userPayload.get("correction").asText().trim();

        JsonNode metadata = question.getMetadata();
        String correctMistake = "";
        List<String> acceptedCorrections = new ArrayList<>();

        if (metadata != null) {
            if (metadata.has("mistakeText")) {
                correctMistake = metadata.get("mistakeText").asText().trim();
            }
            if (metadata.has("acceptedAnswers")) {
                JsonNode arrayNode = metadata.get("acceptedAnswers");
                if (arrayNode.isArray()) {
                    for (JsonNode node : arrayNode) {
                        acceptedCorrections.add(node.asText().trim());
                    }
                }
            }
        }

        boolean mistakeMatched = normalize(userMistake).equals(normalize(correctMistake));
        boolean correctionMatched = false;

        for (String candidate : acceptedCorrections) {
            if (normalize(userCorrection).equals(normalize(candidate))) {
                correctionMatched = true;
                break;
            }
        }

        double score = 0.0;
        boolean correct = false;
        String feedback = "";

        if (mistakeMatched && correctionMatched) {
            score = maxScore;
            correct = true;
            feedback = "Brilliant! You found the mistake and corrected it successfully.";
        } else if (mistakeMatched) {
            // Partial score: 50% for identifying mistake
            score = maxScore * 0.5;
            correct = false;
            feedback = "You correctly identified the mistake, but the correction was incorrect.";
        } else {
            score = 0.0;
            correct = false;
            feedback = "Incorrect. Try looking closely at the sentence structure.";
        }

        return GradeResult.builder()
                .score(score)
                .maxScore(maxScore)
                .correct(correct)
                .feedback(feedback)
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
