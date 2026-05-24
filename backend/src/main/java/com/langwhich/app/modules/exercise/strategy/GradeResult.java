package com.langwhich.app.modules.exercise.strategy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResult {
    private double score;
    private double maxScore;
    private boolean correct;
    private String feedback;
    private String explanation;
}
