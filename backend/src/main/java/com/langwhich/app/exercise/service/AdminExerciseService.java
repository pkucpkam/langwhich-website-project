package com.langwhich.app.exercise.service;

import com.langwhich.app.exception.ResourceNotFoundException;
import com.langwhich.app.exercise.dto.*;
import com.langwhich.app.exercise.entity.*;
import com.langwhich.app.exercise.repository.*;
import com.langwhich.app.theory.Difficulty;
import com.langwhich.app.theory.TheoryTopic;
import com.langwhich.app.theory.TheoryTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;


import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminExerciseService {

    private final ExerciseSetRepository exerciseSetRepository;
    private final ExerciseQuestionRepository exerciseQuestionRepository;
    private final TheoryTopicRepository theoryTopicRepository;

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

        ExerciseSet set = ExerciseSet.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .topic(topic)
                .difficulty(diff)
                .estimatedMinutes(request.getEstimatedMinutes())
                .thumbnailUrl(request.getThumbnailUrl())
                .isPublished(request.isPublished())
                .questions(new ArrayList<>())
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

        set.setTitle(request.getTitle());
        set.setDescription(request.getDescription());
        set.setTopic(topic);
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

    @Transactional
    public AdminQuestionResponse createQuestion(Long setId, AdminQuestionRequest request) {
        ExerciseSet set = exerciseSetRepository.findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + setId));

        ExerciseType type;
        try {
            type = ExerciseType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid question type: " + request.getType());
        }

        ExerciseQuestion question = ExerciseQuestion.builder()
                .exerciseSet(set)
                .type(type)
                .questionText(request.getQuestionText())
                .explanation(request.getExplanation())
                .points(request.getPoints())
                .sortOrder(request.getSortOrder())
                .options(new ArrayList<>())
                .answers(new ArrayList<>())
                .build();

        // Type specific validation & binding
        if (type == ExerciseType.MULTIPLE_CHOICE) {
            if (request.getOptions() == null || request.getOptions().isEmpty()) {
                throw new IllegalArgumentException("Multiple choice question requires options.");
            }
            boolean hasCorrect = false;
            for (AdminQuestionOptionRequest optReq : request.getOptions()) {
                QuestionOption opt = QuestionOption.builder()
                        .question(question)
                        .optionText(optReq.getOptionText())
                        .isCorrect(optReq.isCorrect())
                        .sortOrder(optReq.getSortOrder())
                        .build();
                question.getOptions().add(opt);
                if (optReq.isCorrect()) {
                    hasCorrect = true;
                }
            }
            if (!hasCorrect) {
                throw new IllegalArgumentException("Multiple choice question requires at least one correct option.");
            }
        } else if (type == ExerciseType.FILL_IN_BLANK) {
            if (request.getCorrectAnswers() == null || request.getCorrectAnswers().isEmpty()) {
                throw new IllegalArgumentException("Fill in blank question requires correct answers.");
            }
            for (String ansText : request.getCorrectAnswers()) {
                if (ansText == null || ansText.trim().isEmpty()) {
                    continue;
                }
                QuestionAnswer ans = QuestionAnswer.builder()
                        .question(question)
                        .correctAnswer(ansText.trim())
                        .isCaseSensitive(false)
                        .build();
                question.getAnswers().add(ans);
            }
            if (question.getAnswers().isEmpty()) {
                throw new IllegalArgumentException("Fill in blank question requires at least one non-empty accepted answer.");
            }
        }

        ExerciseQuestion saved = exerciseQuestionRepository.save(question);
        return AdminQuestionResponse.fromEntity(saved);
    }

    @Transactional
    public AdminQuestionResponse updateQuestion(Long questionId, AdminQuestionRequest request) {
        ExerciseQuestion question = exerciseQuestionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        ExerciseType type;
        try {
            type = ExerciseType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid question type: " + request.getType());
        }

        question.setType(type);
        question.setQuestionText(request.getQuestionText());
        question.setExplanation(request.getExplanation());
        question.setPoints(request.getPoints());
        question.setSortOrder(request.getSortOrder());

        // Clear children
        question.getOptions().clear();
        question.getAnswers().clear();

        if (type == ExerciseType.MULTIPLE_CHOICE) {
            if (request.getOptions() == null || request.getOptions().isEmpty()) {
                throw new IllegalArgumentException("Multiple choice question requires options.");
            }
            boolean hasCorrect = false;
            for (AdminQuestionOptionRequest optReq : request.getOptions()) {
                QuestionOption opt = QuestionOption.builder()
                        .question(question)
                        .optionText(optReq.getOptionText())
                        .isCorrect(optReq.isCorrect())
                        .sortOrder(optReq.getSortOrder())
                        .build();
                question.getOptions().add(opt);
                if (optReq.isCorrect()) {
                    hasCorrect = true;
                }
            }
            if (!hasCorrect) {
                throw new IllegalArgumentException("Multiple choice question requires at least one correct option.");
            }
        } else if (type == ExerciseType.FILL_IN_BLANK) {
            if (request.getCorrectAnswers() == null || request.getCorrectAnswers().isEmpty()) {
                throw new IllegalArgumentException("Fill in blank question requires correct answers.");
            }
            for (String ansText : request.getCorrectAnswers()) {
                if (ansText == null || ansText.trim().isEmpty()) {
                    continue;
                }
                QuestionAnswer ans = QuestionAnswer.builder()
                        .question(question)
                        .correctAnswer(ansText.trim())
                        .isCaseSensitive(false)
                        .build();
                question.getAnswers().add(ans);
            }
            if (question.getAnswers().isEmpty()) {
                throw new IllegalArgumentException("Fill in blank question requires at least one non-empty accepted answer.");
            }
        }

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
