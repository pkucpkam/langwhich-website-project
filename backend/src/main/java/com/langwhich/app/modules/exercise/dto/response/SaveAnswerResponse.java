package com.langwhich.app.modules.exercise.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerResponse {
    private boolean success;
    private String message;
    private Boolean isCorrect;
    private String explanation;
    private Long correctOptionId;
    private List<String> correctAnswers;
}
