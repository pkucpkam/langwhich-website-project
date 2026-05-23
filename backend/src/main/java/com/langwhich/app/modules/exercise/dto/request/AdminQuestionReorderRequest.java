package com.langwhich.app.modules.exercise.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionReorderRequest {

    @NotEmpty(message = "Question IDs list cannot be empty")
    private List<Long> questionIds;
}
