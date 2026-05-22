package com.langwhich.app.vocabulary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VocabularyItemResponse {
    private Long id;
    private String word;
    private String definition;
    private String ipa;
    private String wordType;
    private String exampleEn;
    private String exampleVi;
    private int orderIndex;
}
