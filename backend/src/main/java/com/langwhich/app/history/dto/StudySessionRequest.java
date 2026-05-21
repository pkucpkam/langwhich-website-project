package com.langwhich.app.history.dto;

import com.langwhich.app.history.StudyMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudySessionRequest {

    @NotNull
    private Long lessonId;

    private String lessonTitle;

    @NotNull
    private StudyMode studyMode;

    @Min(0)
    private int timeSpent;

    @Min(0)
    private int knowCount;

    @Min(0)
    private int totalCount;
}
