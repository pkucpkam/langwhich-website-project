package com.langwhich.app.modules.folder.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FolderResponse {
    private Long id;
    private String name;
    private String description;
    private String color;
    private String icon;
    private boolean isOfficial;
    private Long creatorId;
    private String creatorUsername;
    private int lessonCount;
    private LocalDateTime createdAt;
}
