package com.langwhich.app.modules.exercise.service;

import com.langwhich.app.common.exception.ConflictException;
import com.langwhich.app.common.exception.ResourceNotFoundException;
import com.langwhich.app.modules.theory.entity.Difficulty;
import com.langwhich.app.modules.theory.entity.TheoryTopic;
import com.langwhich.app.modules.theory.entity.TheoryLesson;
import com.langwhich.app.modules.theory.repository.TheoryLessonRepository;
import com.langwhich.app.modules.theory.repository.TheoryTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import com.langwhich.app.modules.exercise.entity.ExerciseSet;
import com.langwhich.app.modules.exercise.entity.ExerciseSection;
import com.langwhich.app.modules.exercise.dto.response.ExerciseSetResponse;
import com.langwhich.app.modules.exercise.repository.ExerciseSetRepository;
import com.langwhich.app.modules.exercise.repository.ExerciseSectionRepository;
import com.langwhich.app.modules.exercise.dto.request.AdminQuestionRequest;
import com.langwhich.app.modules.exercise.dto.response.AdminExerciseSetDetailResponse;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import com.langwhich.app.modules.exercise.repository.ExerciseQuestionRepository;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;
import com.langwhich.app.modules.exercise.dto.request.AdminExerciseSetRequest;
import com.langwhich.app.modules.exercise.dto.request.AdminQuestionReorderRequest;
import com.langwhich.app.modules.exercise.dto.response.AdminQuestionResponse;
import com.langwhich.app.modules.exercise.dto.request.AdminExerciseSectionRequest;
import com.langwhich.app.modules.exercise.dto.response.AdminExerciseSectionResponse;

@Service
@RequiredArgsConstructor
public class AdminExerciseService {

    private final ExerciseSetRepository exerciseSetRepository;
    private final ExerciseQuestionRepository exerciseQuestionRepository;
    private final ExerciseSectionRepository exerciseSectionRepository;
    private final TheoryTopicRepository theoryTopicRepository;
    private final TheoryLessonRepository theoryLessonRepository;

    @Transactional(readOnly = true)
    public Page<ExerciseSetResponse> getExerciseSetsAdmin(
            String search,
            Difficulty difficulty,
            Boolean isPublished,
            Pageable pageable
    ) {
        Specification<ExerciseSet> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            String searchLower = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), searchLower),
                    cb.like(cb.lower(root.get("description")), searchLower)
            ));
        }

        if (difficulty != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("difficulty"), difficulty));
        }

        if (isPublished != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isPublished"), isPublished));
        }

        Page<ExerciseSet> sets = exerciseSetRepository.findAll(spec, pageable);
        return sets.map(ExerciseSetResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public AdminExerciseSetDetailResponse getExerciseSetDetailAdmin(Long id) {
        ExerciseSet set = exerciseSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + id));
        return AdminExerciseSetDetailResponse.fromEntity(set);
    }

    @Transactional
    public ExerciseSetResponse createExerciseSet(AdminExerciseSetRequest request) {
        Difficulty diff;
        try {
            diff = Difficulty.valueOf(request.getDifficulty().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty value: " + request.getDifficulty());
        }

        TheoryTopic topic = null;
        if (request.getTopicId() != null) {
            topic = theoryTopicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theory Topic not found with id: " + request.getTopicId()));
        }

        TheoryLesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = theoryLessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theory Lesson not found with id: " + request.getLessonId()));
        }

        ExerciseSet set = ExerciseSet.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .topic(topic)
                .lesson(lesson)
                .difficulty(diff)
                .estimatedMinutes(request.getEstimatedMinutes())
                .thumbnailUrl(request.getThumbnailUrl())
                .isPublished(request.isPublished())
                .sections(new ArrayList<>())
                .build();

        ExerciseSet saved = exerciseSetRepository.save(set);
        return ExerciseSetResponse.fromEntity(saved);
    }

    @Transactional
    public ExerciseSetResponse updateExerciseSet(Long id, AdminExerciseSetRequest request) {
        ExerciseSet set = exerciseSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + id));

        Difficulty diff;
        try {
            diff = Difficulty.valueOf(request.getDifficulty().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty value: " + request.getDifficulty());
        }

        TheoryTopic topic = null;
        if (request.getTopicId() != null) {
            topic = theoryTopicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theory Topic not found with id: " + request.getTopicId()));
        }

        TheoryLesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = theoryLessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theory Lesson not found with id: " + request.getLessonId()));
        }

        set.setTitle(request.getTitle());
        set.setDescription(request.getDescription());
        set.setTopic(topic);
        set.setLesson(lesson);
        set.setDifficulty(diff);
        set.setEstimatedMinutes(request.getEstimatedMinutes());
        set.setThumbnailUrl(request.getThumbnailUrl());
        set.setPublished(request.isPublished());

        ExerciseSet saved = exerciseSetRepository.save(set);
        return ExerciseSetResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteExerciseSet(Long id) {
        ExerciseSet set = exerciseSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + id));
        exerciseSetRepository.delete(set);
    }

    @Transactional
    public ExerciseSetResponse publishExerciseSet(Long id, boolean publish) {
        ExerciseSet set = exerciseSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + id));
        set.setPublished(publish);
        ExerciseSet saved = exerciseSetRepository.save(set);
        return ExerciseSetResponse.fromEntity(saved);
    }

    // ==========================================
    // 🗂️ SECTION CRUD OPERATIONS
    // ==========================================

    @Transactional
    public AdminExerciseSectionResponse createSection(Long setId, AdminExerciseSectionRequest request) {
        ExerciseSet set = exerciseSetRepository.findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + setId));

        ExerciseSection section = ExerciseSection.builder()
                .exerciseSet(set)
                .title(request.getTitle())
                .instruction(request.getInstruction())
                .sortOrder(request.getSortOrder())
                .questions(new ArrayList<>())
                .build();

        ExerciseSection saved = exerciseSectionRepository.save(section);
        return AdminExerciseSectionResponse.fromEntity(saved);
    }

    @Transactional
    public AdminExerciseSectionResponse updateSection(Long sectionId, AdminExerciseSectionRequest request) {
        ExerciseSection section = exerciseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Section not found with id: " + sectionId));

        section.setTitle(request.getTitle());
        section.setInstruction(request.getInstruction());
        section.setSortOrder(request.getSortOrder());

        ExerciseSection saved = exerciseSectionRepository.save(section);
        return AdminExerciseSectionResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteSection(Long sectionId) {
        ExerciseSection section = exerciseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Section not found with id: " + sectionId));
        exerciseSectionRepository.delete(section);
    }

    // ==========================================
    // ❓ QUESTION CRUD OPERATIONS
    // ==========================================

    @Transactional
    public AdminQuestionResponse createQuestion(Long setId, AdminQuestionRequest request) {
        ExerciseSection section;
        if (request.getExerciseSectionId() != null) {
            section = exerciseSectionRepository.findById(request.getExerciseSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exercise Section not found with id: " + request.getExerciseSectionId()));

            if (!section.getExerciseSet().getId().equals(setId)) {
                throw new ConflictException("Section does not belong to this exercise set");
            }
        } else {
            ExerciseSet set = exerciseSetRepository.findById(setId)
                    .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + setId));
            if (set.getSections() == null || set.getSections().isEmpty()) {
                section = ExerciseSection.builder()
                        .exerciseSet(set)
                        .title("Default Section")
                        .sortOrder(0)
                        .questions(new ArrayList<>())
                        .build();
                section = exerciseSectionRepository.save(section);
            } else {
                section = set.getSections().get(0);
            }
        }

        ExerciseType type;
        try {
            type = ExerciseType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid question type: " + request.getType());
        }

        ExerciseQuestion question = ExerciseQuestion.builder()
                .exerciseSection(section)
                .type(type)
                .questionText(request.getQuestionText())
                .explanation(request.getExplanation())
                .points(request.getPoints())
                .sortOrder(request.getSortOrder())
                .metadata(request.getMetadata())
                .grammarTags(request.getGrammarTags())
                .skillTags(request.getSkillTags())
                .build();

        ExerciseQuestion saved = exerciseQuestionRepository.save(question);
        return AdminQuestionResponse.fromEntity(saved);
    }

    @Transactional
    public AdminQuestionResponse updateQuestion(Long questionId, AdminQuestionRequest request) {
        ExerciseQuestion question = exerciseQuestionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        ExerciseSection section;
        if (request.getExerciseSectionId() != null) {
            section = exerciseSectionRepository.findById(request.getExerciseSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exercise Section not found with id: " + request.getExerciseSectionId()));
        } else {
            section = question.getExerciseSection();
        }

        ExerciseType type;
        try {
            type = ExerciseType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid question type: " + request.getType());
        }

        question.setExerciseSection(section);
        question.setType(type);
        question.setQuestionText(request.getQuestionText());
        question.setExplanation(request.getExplanation());
        question.setPoints(request.getPoints());
        question.setSortOrder(request.getSortOrder());
        question.setMetadata(request.getMetadata());
        question.setGrammarTags(request.getGrammarTags());
        question.setSkillTags(request.getSkillTags());

        ExerciseQuestion saved = exerciseQuestionRepository.save(question);
        return AdminQuestionResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        ExerciseQuestion question = exerciseQuestionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        exerciseQuestionRepository.delete(question);
    }

    @Transactional
    public void reorderQuestions(AdminQuestionReorderRequest request) {
        List<Long> ids = request.getQuestionIds();
        for (int i = 0; i < ids.size(); i++) {
            Long qId = ids.get(i);
            ExerciseQuestion q = exerciseQuestionRepository.findById(qId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + qId));
            q.setSortOrder(i);
            exerciseQuestionRepository.save(q);
        }
    }
}
