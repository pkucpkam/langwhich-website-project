package com.langwhich.app.theory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TheoryTopicRepository extends JpaRepository<TheoryTopic, Long> {
    Optional<TheoryTopic> findBySlug(String slug);
    List<TheoryTopic> findAllByOrderByOrderIndexAsc();
    List<TheoryTopic> findAllByIsPublishedTrueOrderByOrderIndexAsc();
    boolean existsBySlug(String slug);
}
