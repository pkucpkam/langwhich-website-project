package com.langwhich.app.modules.history.controller;

import com.langwhich.app.modules.history.dto.request.StudySessionRequest;
import com.langwhich.app.modules.history.dto.response.StudySessionResponse;
import com.langwhich.app.modules.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.langwhich.app.modules.history.service.HistoryService;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @PostMapping("/sessions")
    public ResponseEntity<StudySessionResponse> saveSession(
        @Valid @RequestBody StudySessionRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(historyService.saveSession(request, user));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<StudySessionResponse>> getMyHistory(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(historyService.getMyHistory(user));
    }

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Long>> getDailyActivity(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(historyService.getDailyActivity(user));
    }
}
