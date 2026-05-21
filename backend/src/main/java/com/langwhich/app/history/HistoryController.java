package com.langwhich.app.history;

import com.langwhich.app.history.dto.StudySessionRequest;
import com.langwhich.app.history.dto.StudySessionResponse;
import com.langwhich.app.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
