package com.langwhich.app.folder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FolderRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    @Size(max = 20)
    private String color = "#2563EB";

    @Size(max = 10)
    private String icon = "📁";

    private boolean isOfficial = false;
}
