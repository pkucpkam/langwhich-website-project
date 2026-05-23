package com.langwhich.app.exercise.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerResponse {
    private boolean success;
    private String message;
}
