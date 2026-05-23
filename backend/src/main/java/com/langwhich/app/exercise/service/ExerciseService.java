package com.langwhich.app.exercise.service;

import com.langwhich.app.exception.ConflictException;
import com.langwhich.app.exception.ForbiddenException;
import com.langwhich.app.exception.ResourceNotFoundException;
import com.langwhich.app.exercise.dto.*;
import com.langwhich.app.exercise.entity.*;
import com.langwhich.app.exercise.repository.*;
import com.langwhich.app.exercise.strategy.GradingStrategy;
import com.langwhich.app.theory.Difficulty;
import com.langwhich.app.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ExerciseService {

    private final ExerciseSetRepository exerciseSetRepository;
    private final ExerciseQuestionRepository exerciseQuestionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final ExerciseAttemptAnswerRepository exerciseAttemptAnswerRepository;
    private final List<GradingStrategy> gradingStrategies;

    // Explicit constructor injection
    public ExerciseService(
            ExerciseSetRepository exerciseSetRepository,
            ExerciseQuestionRepository exerciseQuestionRepository,
            QuestionOptionRepository questionOptionRepository,
            ExerciseAttemptRepository exerciseAttemptRepository,
            ExerciseAttemptAnswerRepository exerciseAttemptAnswerRepository,
            List<GradingStrategy> gradingStrategies) {
        this.exerciseSetRepository = exerciseSetRepository;
        this.exerciseQuestionRepository = exerciseQuestionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.exerciseAttemptAnswerRepository = exerciseAttemptAnswerRepository;
        this.gradingStrategies = gradingStrategies;
    }

    @Transactional(readOnly = true)
    public Page<ExerciseSetResponse> getExerciseSets(String topicSlug, Difficulty difficulty, String search, Pageable pageable) {
        return exerciseSetRepository.filterExercises(topicSlug, difficulty, search, pageable)
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

        // Prevent duplicate attempts and support session recovery:
        // If there is an active (IN_PROGRESS) attempt, return that attempt ID to let the user resume.
        Optional<ExerciseAttempt> activeAttempt = exerciseAttemptRepository
                .findFirstByUserIdAndExerciseSetIdOrderByStartedAtDesc(user.getId(), setId);
        
        if (activeAttempt.isPresent() && activeAttempt.get().getStatus() == AttemptStatus.IN_PROGRESS) {
            return new StartAttemptResponse(activeAttempt.get().getId());
        }

        ExerciseAttempt attempt = ExerciseAttempt.builder()
                .user(user)
                .exerciseSet(set)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .totalQuestions(set.getQuestions().size())
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

        // Prevent editing after submission
        if (attempt.getStatus() == AttemptStatus.COMPLETED) {
            throw new ConflictException("Cannot edit answers for a completed practice session");
        }

        ExerciseQuestion question = exerciseQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        if (!question.getExerciseSet().getId().equals(attempt.getExerciseSet().getId())) {
            throw new ConflictException("Question does not belong to this exercise set");
        }

        ExerciseAttemptAnswer attemptAnswer = exerciseAttemptAnswerRepository
                .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElseGet(() -> ExerciseAttemptAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        // Process answer based on question type
        if (question.getType() == ExerciseType.MULTIPLE_CHOICE) {
            if (request.getSelectedOptionId() == null) {
                attemptAnswer.setSelectedOption(null);
            } else {
                QuestionOption option = questionOptionRepository.findById(request.getSelectedOptionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Option not found with id: " + request.getSelectedOptionId()));
                if (!option.getQuestion().getId().equals(question.getId())) {
                    throw new ConflictException("Selected option does not belong to this question");
                }
                attemptAnswer.setSelectedOption(option);
            }
            attemptAnswer.setTextAnswer(null);
        } else if (question.getType() == ExerciseType.FILL_IN_BLANK) {
            attemptAnswer.setTextAnswer(request.getTextAnswer());
            attemptAnswer.setSelectedOption(null);
        }

        // Dynamically locate strategy and grade the response
        GradingStrategy strategy = gradingStrategies.stream()
                .filter(s -> s.supports(question.getType()))
                .findFirst()
                .orElseThrow(() -> new ConflictException("No grading strategy found for type: " + question.getType()));

        strategy.grade(question, attemptAnswer);
        exerciseAttemptAnswerRepository.save(attemptAnswer);

        return new SaveAnswerResponse(true, "Answer saved successfully");
    }

    public SubmitAttemptResponse submitAttempt(Long attemptId, User user) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to submit this attempt");
        }

        // Prevent duplicate submission
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

        List<ExerciseQuestion> questions = exerciseQuestionRepository
                .findAllByExerciseSetIdOrderBySortOrderAscIdAsc(attempt.getExerciseSet().getId());
        List<ExerciseAttemptAnswer> answers = exerciseAttemptAnswerRepository
                .findAllByAttemptId(attemptId);

        int totalPossiblePoints = 0;
        int totalPointsEarned = 0;
        int correctCount = 0;

        for (ExerciseQuestion q : questions) {
            totalPossiblePoints += q.getPoints();
            
            // Find if student answered this question
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
                // If question is not answered, create an empty, incorrect attempt answer
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
