package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseSection;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSectionResponse {
    private Long id;
    private String title;
    private String instruction;
    private int sortOrder;
    private List<QuestionResponse> questions;

    public static ExerciseSectionResponse fromEntity(ExerciseSection section) {
        if (section == null) return null;
        return ExerciseSectionResponse.builder()
            .id(section.getId())
            .title(section.getTitle())
            .instruction(section.getInstruction())
            .sortOrder(section.getSortOrder())
            .questions(section.getQuestions() != null ? 
                section.getQuestions().stream()
                    .map(QuestionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
