package com.langwhich.app.modules.history.dto.response;

import com.langwhich.app.modules.history.entity.StudyMode;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StudySessionResponse {
    private Long id;
    private Long lessonId;
    private String lessonTitle;
    private StudyMode studyMode;
    private int timeSpent;
    private int knowCount;
    private int totalCount;
    private LocalDateTime createdAt;
}
