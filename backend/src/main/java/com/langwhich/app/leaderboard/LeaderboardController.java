package com.langwhich.app.leaderboard;

import com.langwhich.app.history.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final StudySessionRepository studySessionRepository;

    @GetMapping
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
}
