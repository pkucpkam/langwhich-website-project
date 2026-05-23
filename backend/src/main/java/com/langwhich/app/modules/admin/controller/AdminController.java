package com.langwhich.app.modules.admin.controller;

import com.langwhich.app.modules.folder.service.FolderService;
import com.langwhich.app.modules.folder.dto.request.FolderRequest;
import com.langwhich.app.modules.folder.dto.response.FolderResponse;
import com.langwhich.app.modules.history.repository.StudySessionRepository;
import com.langwhich.app.modules.lesson.service.LessonService;
import com.langwhich.app.modules.lesson.dto.request.CreateLessonRequest;
import com.langwhich.app.modules.lesson.dto.response.LessonResponse;
import com.langwhich.app.modules.user.entity.User;
import com.langwhich.app.modules.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final LessonService lessonService;
    private final FolderService folderService;
    private final StudySessionRepository studySessionRepository;

    // ===== USERS =====

    @GetMapping("/users")
    public ResponseEntity<Page<UserSummary>> getUsers(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<UserSummary> users = userRepository.findAll(pageable)
            .map(u -> new UserSummary(u.getId(), u.getDisplayUsername(), u.getEmail(), u.getRole().name()));
        return ResponseEntity.ok(users);
    }

    // ===== LESSONS =====

    @GetMapping("/lessons")
    public ResponseEntity<Page<LessonResponse>> getAllLessons(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(lessonService.getAllLessons(pageable));
    }

    @PostMapping("/lessons")
    public ResponseEntity<LessonResponse> createOfficialLesson(
        @Valid @RequestBody CreateLessonRequest request,
        @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(lessonService.createOfficialLesson(request, admin));
    }

    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(
        @PathVariable Long id,
        @AuthenticationPrincipal User admin
    ) {
        lessonService.deleteLesson(id, admin);
        return ResponseEntity.noContent().build();
    }

    // ===== FOLDERS =====

    @GetMapping("/folders")
    public ResponseEntity<List<FolderResponse>> getAllFolders() {
        return ResponseEntity.ok(folderService.getOfficialFolders());
    }

    @PostMapping("/folders")
    public ResponseEntity<FolderResponse> createOfficialFolder(
        @Valid @RequestBody FolderRequest request,
        @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(folderService.createOfficialFolder(request, admin));
    }


    // ===== LEADERBOARD =====

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        List<Object[]> rows = studySessionRepository.getLeaderboard();
        List<Map<String, Object>> result = rows.stream()
            .map(row -> Map.<String, Object>of(
                "userId", row[0],
                "username", row[1],
                "totalTimeSpent", row[2]
            ))
            .toList();
        return ResponseEntity.ok(result);
    }

    public record UserSummary(Long id, String username, String email, String role) {}
}
