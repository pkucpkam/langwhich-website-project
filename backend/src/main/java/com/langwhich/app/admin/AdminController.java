package com.langwhich.app.admin;

import com.langwhich.app.folder.FolderService;
import com.langwhich.app.folder.dto.FolderRequest;
import com.langwhich.app.folder.dto.FolderResponse;
import com.langwhich.app.history.StudySessionRepository;
import com.langwhich.app.lesson.LessonService;
import com.langwhich.app.lesson.dto.CreateLessonRequest;
import com.langwhich.app.lesson.dto.LessonResponse;
import com.langwhich.app.theory.TheoryArticle;
import com.langwhich.app.theory.TheoryArticleService;
import com.langwhich.app.theory.TheoryFolder;
import com.langwhich.app.theory.TheoryFolderService;
import com.langwhich.app.user.User;
import com.langwhich.app.user.UserRepository;
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
    private final TheoryArticleService theoryArticleService;
    private final TheoryFolderService theoryFolderService;

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

    // ===== THEORY ARTICLES =====

    @PostMapping("/theory")
    public ResponseEntity<TheoryArticle> createTheoryArticle(
        @Valid @RequestBody TheoryArticle request,
        @RequestParam(required = false) Long folderId
    ) {
        return ResponseEntity.ok(theoryArticleService.createArticle(request, folderId));
    }

    @PutMapping("/theory/{id}")
    public ResponseEntity<TheoryArticle> updateTheoryArticle(
        @PathVariable Long id,
        @Valid @RequestBody TheoryArticle request,
        @RequestParam(required = false) Long folderId
    ) {
        return ResponseEntity.ok(theoryArticleService.updateArticle(id, request, folderId));
    }

    @DeleteMapping("/theory/{id}")
    public ResponseEntity<Void> deleteTheoryArticle(
        @PathVariable Long id
    ) {
        theoryArticleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    // ===== THEORY FOLDERS =====

    @PostMapping("/theory/folders")
    public ResponseEntity<TheoryFolder> createTheoryFolder(
        @Valid @RequestBody TheoryFolder request
    ) {
        return ResponseEntity.ok(theoryFolderService.createFolder(request));
    }

    @PutMapping("/theory/folders/{id}")
    public ResponseEntity<TheoryFolder> updateTheoryFolder(
        @PathVariable Long id,
        @Valid @RequestBody TheoryFolder request
    ) {
        return ResponseEntity.ok(theoryFolderService.updateFolder(id, request));
    }

    @DeleteMapping("/theory/folders/{id}")
    public ResponseEntity<Void> deleteTheoryFolder(
        @PathVariable Long id
    ) {
        theoryFolderService.deleteFolder(id);
        return ResponseEntity.noContent().build();
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
