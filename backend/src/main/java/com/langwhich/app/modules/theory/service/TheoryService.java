package com.langwhich.app.modules.theory.service;

import com.langwhich.app.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import com.langwhich.app.modules.theory.dto.response.TheoryTopicResponse;
import com.langwhich.app.modules.theory.repository.TheoryLessonRepository;
import com.langwhich.app.modules.theory.entity.TheoryLesson;
import com.langwhich.app.modules.theory.dto.response.TheoryLessonResponse;
import com.langwhich.app.modules.theory.entity.TheoryTopic;
import com.langwhich.app.modules.theory.dto.request.TheoryLessonRequest;
import com.langwhich.app.modules.theory.entity.Difficulty;
import com.langwhich.app.modules.theory.dto.request.TheoryTopicRequest;
import com.langwhich.app.modules.theory.repository.TheoryTopicRepository;

@Service
@RequiredArgsConstructor
public class TheoryService {

    private final TheoryTopicRepository topicRepository;
    private final TheoryLessonRepository lessonRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    // ===== SLUG GENERATOR =====
    public String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "slug";
        }
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String alphabetOnly = NONLATIN.matcher(normalized).replaceAll("");
        return alphabetOnly.toLowerCase(Locale.ENGLISH);
    }

    // ===== TOPICS =====

    @Transactional
    public TheoryTopicResponse createTopic(TheoryTopicRequest request) {
        String slug = toSlug(request.getName());
        int count = 1;
        while (topicRepository.existsBySlug(slug)) {
            slug = toSlug(request.getName()) + "-" + count++;
        }

        TheoryTopic topic = TheoryTopic.builder()
            .name(request.getName())
            .slug(slug)
            .description(request.getDescription())
            .icon(request.getIcon() != null ? request.getIcon() : "📘")
            .orderIndex(request.getOrderIndex())
            .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
            .build();

        return TheoryTopicResponse.fromEntity(topicRepository.save(topic));
    }

    public List<TheoryTopicResponse> getAllTopicsAdmin() {
        return topicRepository.findAllByOrderByOrderIndexAsc().stream()
            .map(TheoryTopicResponse::fromEntity)
            .toList();
    }

    public List<TheoryTopicResponse> getPublishedTopics() {
        return topicRepository.findAllByIsPublishedTrueOrderByOrderIndexAsc().stream()
            .map(TheoryTopicResponse::fromEntity)
            .toList();
    }

    public TheoryTopicResponse getTopicBySlug(String slug) {
        TheoryTopic topic = topicRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found with slug: " + slug));
        return TheoryTopicResponse.fromEntity(topic);
    }

    @Transactional
    public TheoryTopicResponse updateTopic(Long id, TheoryTopicRequest request) {
        TheoryTopic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));

        // If the name changed, regenerate the slug
        if (!topic.getName().equalsIgnoreCase(request.getName())) {
            String slug = toSlug(request.getName());
            int count = 1;
            while (topicRepository.existsBySlug(slug) && !slug.equals(topic.getSlug())) {
                slug = toSlug(request.getName()) + "-" + count++;
            }
            topic.setSlug(slug);
        }

        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        if (request.getIcon() != null) {
            topic.setIcon(request.getIcon());
        }
        topic.setOrderIndex(request.getOrderIndex());
        if (request.getIsPublished() != null) {
            topic.setPublished(request.getIsPublished());
        }

        return TheoryTopicResponse.fromEntity(topicRepository.save(topic));
    }

    @Transactional
    public void deleteTopic(Long id) {
        TheoryTopic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
        topicRepository.delete(topic);
    }

    // ===== LESSONS =====

    @Transactional
    public TheoryLessonResponse createLesson(TheoryLessonRequest request) {
        TheoryTopic topic = topicRepository.findById(request.getTopicId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + request.getTopicId()));

        String slug = toSlug(request.getTitle());
        int count = 1;
        while (lessonRepository.existsBySlug(slug)) {
            slug = toSlug(request.getTitle()) + "-" + count++;
        }

        TheoryLesson lesson = TheoryLesson.builder()
            .topic(topic)
            .title(request.getTitle())
            .slug(slug)
            .summary(request.getSummary())
            .thumbnail(request.getThumbnail())
            .content(request.getContent())
            .difficulty(request.getDifficulty())
            .estimatedMinutes(request.getEstimatedMinutes() > 0 ? request.getEstimatedMinutes() : 5)
            .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
            .build();

        return TheoryLessonResponse.fromEntity(lessonRepository.save(lesson));
    }

    public Page<TheoryLessonResponse> getAllLessonsAdmin(String search, Difficulty difficulty, Pageable pageable) {
        Specification<TheoryLesson> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("summary")), "%" + search.toLowerCase() + "%")
            ));
        }

        if (difficulty != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("difficulty"), difficulty));
        }

        return lessonRepository.findAll(spec, pageable).map(TheoryLessonResponse::fromEntity);
    }

    public Page<TheoryLessonResponse> getPublishedLessons(String search, Difficulty difficulty, Pageable pageable) {
        Specification<TheoryLesson> spec = Specification.where((root, query, cb) -> cb.equal(root.get("isPublished"), true));

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("summary")), "%" + search.toLowerCase() + "%")
            ));
        }

        if (difficulty != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("difficulty"), difficulty));
        }

        return lessonRepository.findAll(spec, pageable).map(TheoryLessonResponse::fromEntity);
    }

    public Page<TheoryLessonResponse> getLessonsByTopicSlug(String topicSlug, String search, Difficulty difficulty, Pageable pageable) {
        // First ensure topic exists and is published
        TheoryTopic topic = topicRepository.findBySlug(topicSlug)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found with slug: " + topicSlug));

        Specification<TheoryLesson> spec = Specification.where((root, query, cb) -> cb.and(
            cb.equal(root.get("isPublished"), true),
            cb.equal(root.get("topic").get("id"), topic.getId())
        ));

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("summary")), "%" + search.toLowerCase() + "%")
            ));
        }

        if (difficulty != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("difficulty"), difficulty));
        }

        return lessonRepository.findAll(spec, pageable).map(TheoryLessonResponse::fromEntity);
    }

    @Transactional
    public TheoryLessonResponse getLessonBySlug(String slug, boolean incrementView) {
        TheoryLesson lesson = lessonRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with slug: " + slug));

        if (incrementView) {
            lesson.setViewCount(lesson.getViewCount() + 1);
            lessonRepository.save(lesson);
        }

        return TheoryLessonResponse.fromEntity(lesson);
    }

    public TheoryLessonResponse getLessonById(Long id) {
        TheoryLesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        return TheoryLessonResponse.fromEntity(lesson);
    }

    @Transactional
    public TheoryLessonResponse updateLesson(Long id, TheoryLessonRequest request) {
        TheoryLesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        TheoryTopic topic = topicRepository.findById(request.getTopicId())
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + request.getTopicId()));

        if (!lesson.getTitle().equalsIgnoreCase(request.getTitle())) {
            String slug = toSlug(request.getTitle());
            int count = 1;
            while (lessonRepository.existsBySlug(slug) && !slug.equals(lesson.getSlug())) {
                slug = toSlug(request.getTitle()) + "-" + count++;
            }
            lesson.setSlug(slug);
        }

        lesson.setTopic(topic);
        lesson.setTitle(request.getTitle());
        lesson.setSummary(request.getSummary());
        lesson.setThumbnail(request.getThumbnail());
        lesson.setContent(request.getContent());
        lesson.setDifficulty(request.getDifficulty());
        lesson.setEstimatedMinutes(request.getEstimatedMinutes() > 0 ? request.getEstimatedMinutes() : 5);
        if (request.getIsPublished() != null) {
            lesson.setPublished(request.getIsPublished());
        }

        return TheoryLessonResponse.fromEntity(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long id) {
        TheoryLesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        lessonRepository.delete(lesson);
    }

    // ===== RELATED & PREVIOUS / NEXT LESSONS =====

    public List<TheoryLessonResponse> getPopularLessons() {
        return lessonRepository.findTop5ByIsPublishedTrueOrderByViewCountDesc().stream()
            .map(TheoryLessonResponse::fromEntity)
            .toList();
    }

    public List<TheoryLessonResponse> getLatestLessons() {
        return lessonRepository.findTop5ByIsPublishedTrueOrderByCreatedAtDesc().stream()
            .map(TheoryLessonResponse::fromEntity)
            .toList();
    }

    public List<TheoryLessonResponse> getRelatedLessons(Long topicId, Long excludeId) {
        Pageable limit = PageRequest.of(0, 3);
        return lessonRepository.findRelatedLessons(topicId, excludeId, limit).stream()
            .map(TheoryLessonResponse::fromEntity)
            .toList();
    }

    public TheoryLessonResponse getPreviousLesson(Long topicId, java.time.LocalDateTime createdAt) {
        Pageable limit = PageRequest.of(0, 1);
        List<TheoryLesson> results = lessonRepository.findPreviousLesson(topicId, createdAt, limit);
        if (results.isEmpty()) return null;
        return TheoryLessonResponse.fromEntity(results.get(0));
    }

    public TheoryLessonResponse getNextLesson(Long topicId, java.time.LocalDateTime createdAt) {
        Pageable limit = PageRequest.of(0, 1);
        List<TheoryLesson> results = lessonRepository.findNextLesson(topicId, createdAt, limit);
        if (results.isEmpty()) return null;
        return TheoryLessonResponse.fromEntity(results.get(0));
    }
}
