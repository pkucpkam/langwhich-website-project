package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseSection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminExerciseSectionResponse {
    private Long id;
    private String title;
    private String instruction;
    private int sortOrder;
    private List<AdminQuestionResponse> questions;

    public static AdminExerciseSectionResponse fromEntity(ExerciseSection section) {
        if (section == null) return null;
        return AdminExerciseSectionResponse.builder()
            .id(section.getId())
            .title(section.getTitle())
            .instruction(section.getInstruction())
            .sortOrder(section.getSortOrder())
            .questions(section.getQuestions() != null ? 
                section.getQuestions().stream()
                    .map(AdminQuestionResponse::fromEntity)
                    .collect(Collectors.toList()) : null)
            .build();
    }
}
