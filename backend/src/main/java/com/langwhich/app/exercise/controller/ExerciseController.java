package com.langwhich.app.exercise.controller;

import com.langwhich.app.exercise.dto.*;
import com.langwhich.app.exercise.service.ExerciseService;
import com.langwhich.app.theory.Difficulty;
import com.langwhich.app.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    // Explicit constructor injection
    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<Page<ExerciseSetResponse>> getExerciseSets(
            @RequestParam(required = false) String topicSlug,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(exerciseService.getExerciseSets(topicSlug, difficulty, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseSetDetailResponse> getExerciseSetDetail(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getExerciseSetDetail(id));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<StartAttemptResponse> startAttempt(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(exerciseService.startAttempt(id, user));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ActiveAttemptResponse> getActiveAttempt(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(exerciseService.getActiveAttempt(attemptId, user));
    }

    @PostMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<SaveAnswerResponse> saveAnswer(
            @PathVariable Long attemptId,
            @Valid @RequestBody SaveAnswerRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(exerciseService.saveAnswer(attemptId, request, user));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<SubmitAttemptResponse> submitAttempt(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(exerciseService.submitAttempt(attemptId, user));
    }

    @GetMapping("/attempts/{attemptId}/review")
    public ResponseEntity<AttemptReviewResponse> getAttemptReview(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(exerciseService.getAttemptReview(attemptId, user));
    }
}
