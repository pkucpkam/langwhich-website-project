package com.langwhich.app.modules.exercise.service;

import com.langwhich.app.common.exception.ConflictException;
import com.langwhich.app.common.exception.ForbiddenException;
import com.langwhich.app.common.exception.ResourceNotFoundException;
import com.langwhich.app.modules.exercise.strategy.GradingStrategy;
import com.langwhich.app.modules.exercise.strategy.GradeResult;
import com.langwhich.app.modules.theory.entity.Difficulty;
import com.langwhich.app.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.langwhich.app.modules.exercise.entity.ExerciseSet;
import com.langwhich.app.modules.exercise.entity.ExerciseSection;
import com.langwhich.app.modules.exercise.dto.response.ExerciseSetResponse;
import com.langwhich.app.modules.exercise.dto.response.SubmitAttemptResponse;
import com.langwhich.app.modules.exercise.dto.response.ExerciseSetDetailResponse;
import com.langwhich.app.modules.exercise.repository.ExerciseAttemptRepository;
import com.langwhich.app.modules.exercise.entity.ExerciseAttempt;
import com.langwhich.app.modules.exercise.dto.request.SaveAnswerRequest;
import com.langwhich.app.modules.exercise.dto.response.SavedAnswerResponseDto;
import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import com.langwhich.app.modules.exercise.entity.UserQuestionAttempt;
import com.langwhich.app.modules.exercise.repository.ExerciseQuestionRepository;
import com.langwhich.app.modules.exercise.repository.UserQuestionAttemptRepository;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import com.langwhich.app.modules.exercise.repository.ExerciseSetRepository;
import com.langwhich.app.modules.exercise.entity.AttemptStatus;
import com.langwhich.app.modules.exercise.dto.response.StartAttemptResponse;
import com.langwhich.app.modules.exercise.dto.response.ActiveAttemptResponse;
import com.langwhich.app.modules.exercise.dto.response.SaveAnswerResponse;
import com.langwhich.app.modules.exercise.dto.response.AttemptReviewResponse;
import com.langwhich.app.modules.exercise.repository.ExerciseAttemptAnswerRepository;
import com.langwhich.app.modules.exercise.entity.ExerciseQuestion;

@Service
@Transactional
public class ExerciseService {

    private final ExerciseSetRepository exerciseSetRepository;
    private final ExerciseQuestionRepository exerciseQuestionRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final ExerciseAttemptAnswerRepository exerciseAttemptAnswerRepository;
    private final UserQuestionAttemptRepository userQuestionAttemptRepository;
    private final List<GradingStrategy> gradingStrategies;

    public ExerciseService(
            ExerciseSetRepository exerciseSetRepository,
            ExerciseQuestionRepository exerciseQuestionRepository,
            ExerciseAttemptRepository exerciseAttemptRepository,
            ExerciseAttemptAnswerRepository exerciseAttemptAnswerRepository,
            UserQuestionAttemptRepository userQuestionAttemptRepository,
            List<GradingStrategy> gradingStrategies) {
        this.exerciseSetRepository = exerciseSetRepository;
        this.exerciseQuestionRepository = exerciseQuestionRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.exerciseAttemptAnswerRepository = exerciseAttemptAnswerRepository;
        this.userQuestionAttemptRepository = userQuestionAttemptRepository;
        this.gradingStrategies = gradingStrategies;
    }

    @Transactional(readOnly = true)
    public Page<ExerciseSetResponse> getExerciseSets(String topicSlug, Long lessonId, Difficulty difficulty, String search, Pageable pageable) {
        Specification<ExerciseSet> spec = Specification.where(
                (root, query, cb) -> cb.equal(root.get("isPublished"), true)
        );

        if (topicSlug != null && !topicSlug.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("topic").get("slug"), topicSlug));
        }

        if (lessonId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("lesson").get("id"), lessonId));
        }

        if (difficulty != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("difficulty"), difficulty));
        }

        if (search != null && !search.trim().isEmpty()) {
            String searchLower = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), searchLower),
                    cb.like(cb.lower(root.get("description")), searchLower)
            ));
        }

        return exerciseSetRepository.findAll(spec, pageable)
                .map(ExerciseSetResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ExerciseSetDetailResponse getExerciseSetDetail(Long id) {
        ExerciseSet set = exerciseSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + id));
        if (!set.isPublished()) {
            throw new ResourceNotFoundException("Exercise Set is not published");
        }
        return ExerciseSetDetailResponse.fromEntity(set);
    }

    public StartAttemptResponse startAttempt(Long setId, User user) {
        ExerciseSet set = exerciseSetRepository.findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Set not found with id: " + setId));
        
        if (!set.isPublished()) {
            throw new ConflictException("Cannot practice an unpublished exercise set");
        }

        Optional<ExerciseAttempt> activeAttempt = exerciseAttemptRepository
                .findFirstByUserIdAndExerciseSetIdOrderByStartedAtDesc(user.getId(), setId);
        
        if (activeAttempt.isPresent() && activeAttempt.get().getStatus() == AttemptStatus.IN_PROGRESS) {
            return new StartAttemptResponse(activeAttempt.get().getId());
        }

        int totalQuestions = set.getSections().stream()
                .mapToInt(s -> s.getQuestions().size())
                .sum();

        ExerciseAttempt attempt = ExerciseAttempt.builder()
                .user(user)
                .exerciseSet(set)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .totalQuestions(totalQuestions)
                .score(0.0)
                .correctCount(0)
                .durationSeconds(0)
                .build();

        ExerciseAttempt saved = exerciseAttemptRepository.save(attempt);
        return new StartAttemptResponse(saved.getId());
    }

    public SaveAnswerResponse saveAnswer(Long attemptId, SaveAnswerRequest request, User user) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to edit this attempt");
        }

        if (attempt.getStatus() == AttemptStatus.COMPLETED) {
            throw new ConflictException("Cannot edit answers for a completed practice session");
        }

        ExerciseQuestion question = exerciseQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        if (!question.getExerciseSection().getExerciseSet().getId().equals(attempt.getExerciseSet().getId())) {
            throw new ConflictException("Question does not belong to this exercise set");
        }

        ExerciseAttemptAnswer attemptAnswer = exerciseAttemptAnswerRepository
                .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElseGet(() -> ExerciseAttemptAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        // Save generic payload in entity
        attemptAnswer.setPayload(request.getPayload());

        // Dynamically grade using registry strategies
        GradingStrategy strategy = gradingStrategies.stream()
                .filter(s -> s.supports(question.getType()))
                .findFirst()
                .orElseThrow(() -> new ConflictException("No grading strategy found for type: " + question.getType()));

        GradeResult gradeResult = strategy.grade(question, request.getPayload());

        // Update attempt answer metrics
        attemptAnswer.setCorrect(gradeResult.isCorrect());
        attemptAnswer.setPointsEarned((int) gradeResult.getScore());
        attemptAnswer.setFeedback(gradeResult.getFeedback());
        attemptAnswer.setExplanation(gradeResult.getExplanation());

        exerciseAttemptAnswerRepository.save(attemptAnswer);

        // Update/Create UserQuestionAttempt learning analytics
        UserQuestionAttempt uqa = userQuestionAttemptRepository
                .findByUserIdAndQuestionId(user.getId(), question.getId())
                .orElseGet(() -> UserQuestionAttempt.builder()
                        .user(user)
                        .question(question)
                        .firstAttemptCorrect(gradeResult.isCorrect())
                        .retryCount(0)
                        .build());

        uqa.setRetryCount(uqa.getRetryCount() + 1);
        uqa.setFinalScore(gradeResult.getScore());
        userQuestionAttemptRepository.save(uqa);

        return SaveAnswerResponse.builder()
                .success(true)
                .message("Answer saved successfully")
                .isCorrect(gradeResult.isCorrect())
                .score(gradeResult.getScore())
                .maxScore(gradeResult.getMaxScore())
                .feedback(gradeResult.getFeedback())
                .explanation(gradeResult.getExplanation())
                .build();
    }

    public SubmitAttemptResponse submitAttempt(Long attemptId, User user) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to submit this attempt");
        }

        if (attempt.getStatus() == AttemptStatus.COMPLETED) {
            return SubmitAttemptResponse.builder()
                    .attemptId(attempt.getId())
                    .score(attempt.getScore())
                    .correctCount(attempt.getCorrectCount())
                    .totalQuestions(attempt.getTotalQuestions())
                    .durationSeconds(attempt.getDurationSeconds())
                    .submittedAt(attempt.getSubmittedAt())
                    .build();
        }

        // Get all questions in the set across all sections
        List<ExerciseQuestion> questions = attempt.getExerciseSet().getSections().stream()
                .flatMap(s -> s.getQuestions().stream())
                .collect(Collectors.toList());

        List<ExerciseAttemptAnswer> answers = exerciseAttemptAnswerRepository
                .findAllByAttemptId(attemptId);

        int totalPossiblePoints = 0;
        int totalPointsEarned = 0;
        int correctCount = 0;

        for (ExerciseQuestion q : questions) {
            totalPossiblePoints += q.getPoints();
            
            Optional<ExerciseAttemptAnswer> answeredOpt = answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(q.getId()))
                    .findFirst();

            if (answeredOpt.isPresent()) {
                ExerciseAttemptAnswer ans = answeredOpt.get();
                if (ans.isCorrect()) {
                    correctCount++;
                    totalPointsEarned += ans.getPointsEarned();
                }
            } else {
                ExerciseAttemptAnswer emptyAns = ExerciseAttemptAnswer.builder()
                        .attempt(attempt)
                        .question(q)
                        .isCorrect(false)
                        .pointsEarned(0)
                        .build();
                exerciseAttemptAnswerRepository.save(emptyAns);
            }
        }

        double score = totalPossiblePoints > 0 
                ? ((double) totalPointsEarned / totalPossiblePoints) * 100.0 
                : 0.0;

        LocalDateTime submittedAt = LocalDateTime.now();
        int durationSeconds = (int) Duration.between(attempt.getStartedAt(), submittedAt).toSeconds();

        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setSubmittedAt(submittedAt);
        attempt.setScore(score);
        attempt.setCorrectCount(correctCount);
        attempt.setTotalQuestions(questions.size());
        attempt.setDurationSeconds(durationSeconds);

        exerciseAttemptRepository.save(attempt);

        return SubmitAttemptResponse.builder()
                .attemptId(attempt.getId())
                .score(score)
                .correctCount(correctCount)
                .totalQuestions(questions.size())
                .durationSeconds(durationSeconds)
                .submittedAt(submittedAt)
                .build();
    }

    @Transactional(readOnly = true)
    public ActiveAttemptResponse getActiveAttempt(Long attemptId, User user) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to view this attempt");
        }

        List<ExerciseAttemptAnswer> answers = exerciseAttemptAnswerRepository.findAllByAttemptId(attemptId);
        List<SavedAnswerResponseDto> savedAnswers = answers.stream()
                .map(SavedAnswerResponseDto::fromEntity)
                .toList();

        return ActiveAttemptResponse.fromEntity(attempt, savedAnswers);
    }

    @Transactional(readOnly = true)
    public AttemptReviewResponse getAttemptReview(Long attemptId, User user) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to view this attempt");
        }

        if (attempt.getStatus() != AttemptStatus.COMPLETED) {
            throw new ConflictException("Practice session is not completed yet");
        }

        return AttemptReviewResponse.fromEntity(attempt);
    }
}
