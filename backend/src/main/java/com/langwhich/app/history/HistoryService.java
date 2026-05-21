package com.langwhich.app.history;

import com.langwhich.app.history.dto.StudySessionRequest;
import com.langwhich.app.history.dto.StudySessionResponse;
import com.langwhich.app.lesson.Lesson;
import com.langwhich.app.lesson.LessonRepository;
import com.langwhich.app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HistoryService {

    private final StudySessionRepository studySessionRepository;
    private final LessonRepository lessonRepository;

    @Transactional
    public StudySessionResponse saveSession(StudySessionRequest request, User user) {
        Lesson lesson = lessonRepository.findById(request.getLessonId()).orElse(null);

        StudySession session = StudySession.builder()
            .user(user)
            .lesson(lesson)
            .lessonTitle(request.getLessonTitle() != null
                ? request.getLessonTitle()
                : (lesson != null ? lesson.getTitle() : "Unknown"))
            .studyMode(request.getStudyMode())
            .timeSpent(request.getTimeSpent())
            .knowCount(request.getKnowCount())
            .totalCount(request.getTotalCount())
            .build();

        return toResponse(studySessionRepository.save(session));
    }

    public List<StudySessionResponse> getMyHistory(User user) {
        return studySessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /**
     * Returns a map of "YYYY-MM-DD" -> sessionCount for the past 365 days
     * Used to render the activity heatmap
     */
    public Map<String, Long> getDailyActivity(User user) {
        LocalDateTime since = LocalDateTime.now().minusDays(365);
        List<Object[]> rows = studySessionRepository.findDailyActivity(user.getId(), since);

        Map<String, Long> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String date = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            result.put(date, count);
        }
        return result;
    }

    private StudySessionResponse toResponse(StudySession session) {
        return StudySessionResponse.builder()
            .id(session.getId())
            .lessonId(session.getLesson() != null ? session.getLesson().getId() : null)
            .lessonTitle(session.getLessonTitle())
            .studyMode(session.getStudyMode())
            .timeSpent(session.getTimeSpent())
            .knowCount(session.getKnowCount())
            .totalCount(session.getTotalCount())
            .createdAt(session.getCreatedAt())
            .build();
    }
}
