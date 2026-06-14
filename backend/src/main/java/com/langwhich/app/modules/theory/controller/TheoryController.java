package com.langwhich.app.modules.theory.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.langwhich.app.modules.theory.dto.response.TheoryLessonResponse;
import com.langwhich.app.modules.theory.entity.Difficulty;
import com.langwhich.app.modules.theory.service.TheoryService;
import com.langwhich.app.modules.theory.dto.response.TheoryTopicResponse;

@RestController
@RequestMapping("/api/theory")
@RequiredArgsConstructor
public class TheoryController {

    private final TheoryService theoryService;

    // ===== TOPICS =====

    @GetMapping("/topics")
    public ResponseEntity<List<TheoryTopicResponse>> getPublishedTopics() {
        return ResponseEntity.ok(theoryService.getPublishedTopics());
    }

    @GetMapping("/topics/{slug}")
    public ResponseEntity<TheoryTopicResponse> getTopicBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(theoryService.getTopicBySlug(slug));
    }

    // ===== LESSONS =====

    @GetMapping("/lessons")
    public ResponseEntity<Page<TheoryLessonResponse>> getPublishedLessons(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Difficulty difficulty,
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(theoryService.getPublishedLessons(search, difficulty, pageable));
    }

    @GetMapping("/lessons/{slug}")
    public ResponseEntity<TheoryLessonResponse> getLessonBySlug(
        @PathVariable String slug,
        @RequestParam(required = false, defaultValue = "true") boolean incrementView
    ) {
        return ResponseEntity.ok(theoryService.getLessonBySlug(slug, incrementView));
    }

    @GetMapping("/topics/{slug}/lessons")
    public ResponseEntity<Page<TheoryLessonResponse>> getLessonsByTopicSlug(
        @PathVariable String slug,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Difficulty difficulty,
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(theoryService.getLessonsByTopicSlug(slug, search, difficulty, pageable));
    }

    @GetMapping("/lessons/popular")
    public ResponseEntity<List<TheoryLessonResponse>> getPopularLessons() {
        return ResponseEntity.ok(theoryService.getPopularLessons());
    }

    @GetMapping("/lessons/latest")
    public ResponseEntity<List<TheoryLessonResponse>> getLatestLessons() {
        return ResponseEntity.ok(theoryService.getLatestLessons());
    }

    @GetMapping("/lessons/{id}/related")
    public ResponseEntity<List<TheoryLessonResponse>> getRelatedLessons(
        @PathVariable Long id,
        @RequestParam(required = false) Long topicId
    ) {
        return ResponseEntity.ok(theoryService.getRelatedLessons(topicId, id));
    }

    @GetMapping("/lessons/{id}/navigation")
    public ResponseEntity<Map<String, Object>> getLessonNavigation(
        @PathVariable Long id,
        @RequestParam(required = false) Long topicId
    ) {
        TheoryLessonResponse current = theoryService.getLessonById(id);
        TheoryLessonResponse previous = theoryService.getPreviousLesson(topicId, current.getCreatedAt());
        TheoryLessonResponse next = theoryService.getNextLesson(topicId, current.getCreatedAt());

        Map<String, Object> response = new HashMap<>();
        response.put("previous", previous);
        response.put("next", next);

        return ResponseEntity.ok(response);
    }
}
