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
        Integer selectedOptionId = null;
        if (userPayload != null && userPayload.has("selectedOptionId") && !userPayload.get("selectedOptionId").isNull()) {
            selectedOptionId = userPayload.get("selectedOptionId").asInt();
        }
        
        String selectedOptionStr = null;
        if (userPayload != null && userPayload.has("selectedOption") && !userPayload.get("selectedOption").isNull()) {
            selectedOptionStr = userPayload.get("selectedOption").asText().trim();
        }

        if (selectedOptionId == null && selectedOptionStr == null) {
            return GradeResult.builder()
                    .score(0.0)
                    .maxScore(question.getPoints())
                    .correct(false)
                    .feedback("No option was selected.")
                    .explanation(question.getExplanation())
                    .build();
        }

        JsonNode metadata = question.getMetadata();
        boolean isCorrect = false;

        // Check using options array directly if present (e.g. metadata.options[i].isCorrect = true)
        if (metadata != null && metadata.has("options") && selectedOptionId != null) {
            JsonNode options = metadata.get("options");
            if (options.isArray() && selectedOptionId >= 0 && selectedOptionId < options.size()) {
                JsonNode option = options.get(selectedOptionId);
                if (option.has("isCorrect")) {
                    String isCorrectVal = option.get("isCorrect").asText();
                    if ("true".equalsIgnoreCase(isCorrectVal)) {
                        isCorrect = true;
                    }
                }
            }
        }

        // Check using correctAnswer key (e.g. "A", "B", "C")
        if (!isCorrect && metadata != null && metadata.has("correctAnswer")) {
            String correctAns = metadata.get("correctAnswer").asText().trim();
            if (selectedOptionStr != null) {
                isCorrect = selectedOptionStr.equalsIgnoreCase(correctAns);
            } else if (selectedOptionId != null && correctAns.length() == 1) {
                char expectedChar = Character.toUpperCase(correctAns.charAt(0));
                char actualChar = (char) ('A' + selectedOptionId);
                isCorrect = (expectedChar == actualChar);
            }
        }

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
