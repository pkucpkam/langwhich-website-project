package com.langwhich.app.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Activity per day: date string -> count
    @Query("SELECT DATE(s.createdAt) as date, COUNT(s) as count " +
           "FROM StudySession s WHERE s.user.id = :userId AND s.createdAt >= :since " +
           "GROUP BY DATE(s.createdAt) ORDER BY date ASC")
    List<Object[]> findDailyActivity(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // Total time spent
    @Query("SELECT COALESCE(SUM(s.timeSpent), 0) FROM StudySession s WHERE s.user.id = :userId")
    Long getTotalTimeSpent(@Param("userId") Long userId);

    // Leaderboard: group by user, sum time
    @Query("SELECT s.user.id, s.user.username, COALESCE(SUM(s.timeSpent), 0) as total " +
           "FROM StudySession s GROUP BY s.user.id, s.user.username ORDER BY total DESC")
    List<Object[]> getLeaderboard();
}
