package com.langwhich.app.srs.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ReviewCardRequest {
    // SM-2 ratings: 0 = again, 3 = hard, 4 = good, 5 = easy
    @Min(0)
    @Max(5)
    private int rating;
}
