package com.langwhich.app.exercise.controller;

import com.langwhich.app.exercise.dto.*;
import com.langwhich.app.exercise.service.AdminExerciseService;
import com.langwhich.app.theory.Difficulty;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminExerciseController {

    private final AdminExerciseService adminExerciseService;

    // Explicit constructor injection
    public AdminExerciseController(AdminExerciseService adminExerciseService) {
        this.adminExerciseService = adminExerciseService;
    }

    // ===== EXERCISE SETS =====

    @GetMapping("/exercise-sets")
    public ResponseEntity<Page<ExerciseSetResponse>> getExerciseSets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Boolean isPublished,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(adminExerciseService.getExerciseSetsAdmin(search, difficulty, isPublished, pageable));
    }

    @GetMapping("/exercise-sets/{id}")
    public ResponseEntity<AdminExerciseSetDetailResponse> getExerciseSetDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminExerciseService.getExerciseSetDetailAdmin(id));
    }

    @PostMapping("/exercise-sets")
    public ResponseEntity<ExerciseSetResponse> createExerciseSet(@Valid @RequestBody AdminExerciseSetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminExerciseService.createExerciseSet(request));
    }

    @PutMapping("/exercise-sets/{id}")
    public ResponseEntity<ExerciseSetResponse> updateExerciseSet(
            @PathVariable Long id,
            @Valid @RequestBody AdminExerciseSetRequest request
    ) {
        return ResponseEntity.ok(adminExerciseService.updateExerciseSet(id, request));
    }

    @DeleteMapping("/exercise-sets/{id}")
    public ResponseEntity<Void> deleteExerciseSet(@PathVariable Long id) {
        adminExerciseService.deleteExerciseSet(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/exercise-sets/{id}/publish")
    public ResponseEntity<ExerciseSetResponse> publishExerciseSet(
            @PathVariable Long id,
            @RequestParam boolean publish
    ) {
        return ResponseEntity.ok(adminExerciseService.publishExerciseSet(id, publish));
    }

    // ===== QUESTIONS =====

    @PostMapping("/exercise-sets/{id}/questions")
    public ResponseEntity<AdminQuestionResponse> createQuestion(
            @PathVariable Long id,
            @Valid @RequestBody AdminQuestionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminExerciseService.createQuestion(id, request));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<AdminQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody AdminQuestionRequest request
    ) {
        return ResponseEntity.ok(adminExerciseService.updateQuestion(id, request));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        adminExerciseService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/questions/reorder")
    public ResponseEntity<Void> reorderQuestions(@Valid @RequestBody AdminQuestionReorderRequest request) {
        adminExerciseService.reorderQuestions(request);
        return ResponseEntity.ok().build();
    }
}
