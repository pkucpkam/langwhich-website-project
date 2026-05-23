package com.langwhich.app.modules.lesson.controller;

import com.langwhich.app.modules.lesson.dto.request.CreateLessonRequest;
import com.langwhich.app.modules.lesson.dto.response.LessonResponse;
import com.langwhich.app.modules.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import com.langwhich.app.modules.lesson.service.LessonService;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<Page<LessonResponse>> getPublicLessons(
        @RequestParam(required = false) String q,
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(lessonService.getPublicLessons(q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLessonById(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(lessonService.getLessonById(id, currentUser));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LessonResponse>> getMyLessons(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(lessonService.getMyLessons(user));
    }

    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(
        @Valid @RequestBody CreateLessonRequest request,
        @AuthenticationPrincipal User user
    ) {
        LessonResponse lesson = lessonService.createLesson(request, user);
        return ResponseEntity.created(URI.create("/api/lessons/" + lesson.getId())).body(lesson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> updateLesson(
        @PathVariable Long id,
        @Valid @RequestBody CreateLessonRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        lessonService.deleteLesson(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/privacy")
    public ResponseEntity<LessonResponse> togglePrivacy(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(lessonService.togglePrivacy(id, user));
    }

    @PatchMapping("/{id}/folder")
    public ResponseEntity<LessonResponse> moveToFolder(
        @PathVariable Long id,
        @RequestBody Map<String, Long> body,
        @AuthenticationPrincipal User user
    ) {
        Long folderId = body.get("folderId");
        return ResponseEntity.ok(lessonService.moveToFolder(id, folderId, user));
    }
}
