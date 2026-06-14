package com.langwhich.app.modules.exercise.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerResponse {
    private boolean success;
    private String message;
    private Boolean isCorrect;
    private Double score;
    private Double maxScore;
    private String feedback;
    private String explanation;
}
