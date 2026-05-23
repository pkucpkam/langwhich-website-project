package com.langwhich.app.modules.srs.controller;

import com.langwhich.app.modules.srs.dto.request.ReviewCardRequest;
import com.langwhich.app.modules.srs.dto.response.SrsCardResponse;
import com.langwhich.app.modules.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.langwhich.app.modules.srs.service.SrsService;

@RestController
@RequestMapping("/api/srs")
@RequiredArgsConstructor
public class SrsController {

    private final SrsService srsService;

    @GetMapping("/cards/due")
    public ResponseEntity<List<SrsCardResponse>> getDueCards(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(srsService.getDueCards(user));
    }

    @GetMapping("/lessons/{lessonId}/cards")
    public ResponseEntity<List<SrsCardResponse>> getCardsForLesson(
        @PathVariable Long lessonId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(srsService.getCardsForLesson(lessonId, user));
    }

    @PostMapping("/lessons/{lessonId}/init")
    public ResponseEntity<Map<String, Integer>> initializeCards(
        @PathVariable Long lessonId,
        @AuthenticationPrincipal User user
    ) {
        int created = srsService.initializeCardsForLesson(lessonId, user);
        return ResponseEntity.ok(Map.of("created", created));
    }

    @PostMapping("/cards/{cardId}/review")
    public ResponseEntity<SrsCardResponse> reviewCard(
        @PathVariable Long cardId,
        @Valid @RequestBody ReviewCardRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(srsService.reviewCard(cardId, request, user));
    }
}
