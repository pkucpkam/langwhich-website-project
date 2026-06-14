package com.langwhich.app.modules.exercise.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class SentenceRewriteGradingStrategy implements GradingStrategy {

    @Override
    public boolean supports(ExerciseType type) {
        return type == ExerciseType.SENTENCE_REWRITE;
    }

    @Override
    public GradeResult grade(ExerciseQuestion question, JsonNode userPayload) {
        double maxScore = question.getPoints();
        if (userPayload == null || !userPayload.has("text")) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(maxScore)
                    .correct(false)
                    .feedback("Please write your rewritten sentence.")
                    .explanation(question.getExplanation())
                    .build();
        }

        String userAns = userPayload.get("text").asText().trim();
        if (userAns.isEmpty()) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(maxScore)
                    .correct(false)
                    .feedback("Answer cannot be blank.")
                    .explanation(question.getExplanation())
                    .build();
        }

        String normalizedUserAns = normalizeSentence(userAns);
        List<String> accepted = new ArrayList<>();
        JsonNode metadata = question.getMetadata();

        if (metadata != null && metadata.has("acceptedAnswers")) {
            JsonNode arrayNode = metadata.get("acceptedAnswers");
            if (arrayNode.isArray()) {
                for (JsonNode node : arrayNode) {
                    accepted.add(node.asText().trim());
                }
            }
        }

        boolean isCorrect = false;
        for (String candidate : accepted) {
            if (normalizedUserAns.equals(normalizeSentence(candidate))) {
                isCorrect = true;
                break;
            }
        }

        double score = isCorrect ? maxScore : 0.0;

        return GradeResult.builder()
                .score(score)
                .maxScore(maxScore)
                .correct(isCorrect)
                .feedback(isCorrect ? "Perfect! Well written." : "Incorrect rewrite. Pay attention to grammar rules and keywords.")
                .explanation(question.getExplanation())
                .build();
    }

    private String normalizeSentence(String input) {
        if (input == null) return "";
        return input.trim()
                    .toLowerCase()
                    .replaceAll("[.,?!]$", "") // remove punctuation from end of string
                    .replaceAll("\\s+", " ")
                    .trim();
    }
}
