package com.langwhich.app.theory;

import com.langwhich.app.theory.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/theory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTheoryController {

    private final TheoryService theoryService;

    // ===== TOPICS =====

    @PostMapping("/topics")
    public ResponseEntity<TheoryTopicResponse> createTopic(@Valid @RequestBody TheoryTopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(theoryService.createTopic(request));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TheoryTopicResponse>> getAllTopics() {
        return ResponseEntity.ok(theoryService.getAllTopicsAdmin());
    }

    @PatchMapping("/topics/{id}")
    public ResponseEntity<TheoryTopicResponse> updateTopic(
        @PathVariable Long id,
        @Valid @RequestBody TheoryTopicRequest request
    ) {
        return ResponseEntity.ok(theoryService.updateTopic(id, request));
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        theoryService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    // ===== LESSONS =====

    @PostMapping("/lessons")
    public ResponseEntity<TheoryLessonResponse> createLesson(@Valid @RequestBody TheoryLessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(theoryService.createLesson(request));
    }

    @GetMapping("/lessons")
    public ResponseEntity<Page<TheoryLessonResponse>> getAllLessons(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Difficulty difficulty,
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(theoryService.getAllLessonsAdmin(search, difficulty, pageable));
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<TheoryLessonResponse> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(theoryService.getLessonById(id));
    }

    @PatchMapping("/lessons/{id}")
    public ResponseEntity<TheoryLessonResponse> updateLesson(
        @PathVariable Long id,
        @Valid @RequestBody TheoryLessonRequest request
    ) {
        return ResponseEntity.ok(theoryService.updateLesson(id, request));
    }

    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        theoryService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
