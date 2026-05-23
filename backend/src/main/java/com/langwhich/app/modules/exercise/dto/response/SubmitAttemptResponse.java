package com.langwhich.app.modules.exercise.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAttemptResponse {
    private Long attemptId;
    private double score;
    private int correctCount;
    private int totalQuestions;
    private int durationSeconds;
    private LocalDateTime submittedAt;
}
