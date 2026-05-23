package com.langwhich.app.modules.folder.controller;

import com.langwhich.app.modules.folder.dto.request.FolderRequest;
import com.langwhich.app.modules.folder.dto.response.FolderResponse;
import com.langwhich.app.modules.lesson.dto.response.LessonResponse;
import com.langwhich.app.modules.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import com.langwhich.app.modules.folder.service.FolderService;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @GetMapping("/official")
    public ResponseEntity<List<FolderResponse>> getOfficialFolders() {
        return ResponseEntity.ok(folderService.getOfficialFolders());
    }

    @GetMapping("/my")
    public ResponseEntity<List<FolderResponse>> getMyFolders(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(folderService.getMyFolders(user));
    }

    @GetMapping("/{id}/lessons")
    public ResponseEntity<List<LessonResponse>> getLessonsInFolder(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(folderService.getLessonsInFolder(id, user));
    }

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
        @Valid @RequestBody FolderRequest request,
        @AuthenticationPrincipal User user
    ) {
        FolderResponse folder = folderService.createFolder(request, user);
        return ResponseEntity.created(URI.create("/api/folders/" + folder.getId())).body(folder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderResponse> updateFolder(
        @PathVariable Long id,
        @Valid @RequestBody FolderRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(folderService.updateFolder(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        folderService.deleteFolder(id, user);
        return ResponseEntity.noContent().build();
    }
}
