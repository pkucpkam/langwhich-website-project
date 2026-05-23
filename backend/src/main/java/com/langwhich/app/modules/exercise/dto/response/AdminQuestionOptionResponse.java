package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.QuestionOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionOptionResponse {
    private Long id;
    private String optionText;
    private boolean isCorrect;
    private int sortOrder;

    public static AdminQuestionOptionResponse fromEntity(QuestionOption opt) {
        if (opt == null) return null;
        return AdminQuestionOptionResponse.builder()
            .id(opt.getId())
            .optionText(opt.getOptionText())
            .isCorrect(opt.isCorrect())
            .sortOrder(opt.getSortOrder())
            .build();
    }
}
