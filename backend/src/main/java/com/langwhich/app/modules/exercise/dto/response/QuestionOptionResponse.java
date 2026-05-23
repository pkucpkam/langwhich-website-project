package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.QuestionOption;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionResponse {
    private Long id;
    private String optionText;
    private int sortOrder;

    public static QuestionOptionResponse fromEntity(QuestionOption option) {
        if (option == null) return null;
        return QuestionOptionResponse.builder()
            .id(option.getId())
            .optionText(option.getOptionText())
            .sortOrder(option.getSortOrder())
            .build();
    }
}
