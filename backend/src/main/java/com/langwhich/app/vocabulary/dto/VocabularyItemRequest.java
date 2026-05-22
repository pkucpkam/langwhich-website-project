package com.langwhich.app.vocabulary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VocabularyItemRequest {

    @NotBlank(message = "Word is required")
    @Size(max = 300)
    private String word;

    @NotBlank(message = "Definition is required")
    private String definition;

    @Size(max = 200)
    private String ipa;

    @Size(max = 50)
    private String wordType;

    private String exampleEn;

    private String exampleVi;
}
