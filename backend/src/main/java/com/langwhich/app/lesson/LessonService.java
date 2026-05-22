package com.langwhich.app.lesson;

import com.langwhich.app.exception.ForbiddenException;
import com.langwhich.app.exception.ResourceNotFoundException;
import com.langwhich.app.folder.Folder;
import com.langwhich.app.folder.FolderRepository;
import com.langwhich.app.lesson.dto.CreateLessonRequest;
import com.langwhich.app.lesson.dto.LessonResponse;
import com.langwhich.app.user.User;
import com.langwhich.app.vocabulary.VocabularyItem;
import com.langwhich.app.vocabulary.dto.VocabularyItemRequest;
import com.langwhich.app.vocabulary.dto.VocabularyItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LessonService {

    private final LessonRepository lessonRepository;
    private final FolderRepository folderRepository;

    // ===== PUBLIC =====

    public Page<LessonResponse> getPublicLessons(String query, Pageable pageable) {
        Page<Lesson> lessons;
        if (StringUtils.hasText(query)) {
            lessons = lessonRepository.searchPublicLessons(query.trim(), pageable);
        } else {
            lessons = lessonRepository.findByIsPrivateFalse(pageable);
        }
        return lessons.map(l -> toLessonResponse(l, false));
    }

    public LessonResponse getLessonById(Long id, User currentUser) {
        Lesson lesson = lessonRepository.findByIdWithItems(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        // Private lessons only accessible by owner or admin
        if (lesson.isPrivate()) {
            if (currentUser == null || (!lesson.getCreator().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN"))) {
                throw new ForbiddenException("Access denied");
            }
        }

        return toLessonResponse(lesson, true);
    }

    // ===== AUTHENTICATED =====

    @Transactional
    public LessonResponse createLesson(CreateLessonRequest request, User creator) {
        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        }

        Lesson lesson = Lesson.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .isPrivate(request.isPrivate())
            .isOfficial(false)
            .creator(creator)
            .folder(folder)
            .build();

        if (request.getVocabularyItems() != null) {
            IntStream.range(0, request.getVocabularyItems().size()).forEach(i -> {
                VocabularyItemRequest req = request.getVocabularyItems().get(i);
                VocabularyItem item = VocabularyItem.builder()
                    .word(req.getWord())
                    .definition(req.getDefinition())
                    .ipa(req.getIpa())
                    .wordType(req.getWordType())
                    .exampleEn(req.getExampleEn())
                    .exampleVi(req.getExampleVi())
                    .orderIndex(i)
                    .build();
                lesson.addVocabularyItem(item);
            });
            lesson.setWordCount(request.getVocabularyItems().size());
        }

        return toLessonResponse(lessonRepository.save(lesson), true);
    }

    @Transactional
    public LessonResponse updateLesson(Long id, CreateLessonRequest request, User currentUser) {
        Lesson lesson = lessonRepository.findByIdWithItems(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        assertOwnerOrAdmin(lesson, currentUser);

        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        }

        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setPrivate(request.isPrivate());
        lesson.setFolder(folder);

        // Replace vocab items
        lesson.clearVocabularyItems();
        if (request.getVocabularyItems() != null) {
            IntStream.range(0, request.getVocabularyItems().size()).forEach(i -> {
                VocabularyItemRequest req = request.getVocabularyItems().get(i);
                VocabularyItem item = VocabularyItem.builder()
                    .word(req.getWord())
                    .definition(req.getDefinition())
                    .ipa(req.getIpa())
                    .wordType(req.getWordType())
                    .exampleEn(req.getExampleEn())
                    .exampleVi(req.getExampleVi())
                    .orderIndex(i)
                    .build();
                lesson.addVocabularyItem(item);
            });
            lesson.setWordCount(request.getVocabularyItems().size());
        }

        return toLessonResponse(lessonRepository.save(lesson), true);
    }

    @Transactional
    public void deleteLesson(Long id, User currentUser) {
        Lesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        assertOwnerOrAdmin(lesson, currentUser);
        lessonRepository.delete(lesson);
    }

    public List<LessonResponse> getMyLessons(User user) {
        return lessonRepository.findByCreatorId(user.getId())
            .stream()
            .map(l -> toLessonResponse(l, false))
            .toList();
    }

    @Transactional
    public LessonResponse togglePrivacy(Long id, User currentUser) {
        Lesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        assertOwnerOrAdmin(lesson, currentUser);
        lesson.setPrivate(!lesson.isPrivate());
        return toLessonResponse(lessonRepository.save(lesson), false);
    }

    @Transactional
    public LessonResponse moveToFolder(Long id, Long folderId, User currentUser) {
        Lesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        assertOwnerOrAdmin(lesson, currentUser);

        if (folderId == null) {
            lesson.setFolder(null);
        } else {
            Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
            lesson.setFolder(folder);
        }

        return toLessonResponse(lessonRepository.save(lesson), false);
    }

    // ===== ADMIN =====

    @Transactional
    public LessonResponse createOfficialLesson(CreateLessonRequest request, User admin) {
        request.setPrivate(false);
        Lesson lesson = buildLessonFromRequest(request, admin, true);
        return toLessonResponse(lessonRepository.save(lesson), true);
    }

    public Page<LessonResponse> getAllLessons(Pageable pageable) {
        return lessonRepository.findAll(pageable).map(l -> toLessonResponse(l, false));
    }

    // ===== HELPERS =====

    private Lesson buildLessonFromRequest(CreateLessonRequest request, User creator, boolean isOfficial) {
        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId()).orElse(null);
        }

        Lesson lesson = Lesson.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .isPrivate(request.isPrivate())
            .isOfficial(isOfficial)
            .creator(creator)
            .folder(folder)
            .build();

        if (request.getVocabularyItems() != null) {
            IntStream.range(0, request.getVocabularyItems().size()).forEach(i -> {
                VocabularyItemRequest req = request.getVocabularyItems().get(i);
                VocabularyItem item = VocabularyItem.builder()
                    .word(req.getWord())
                    .definition(req.getDefinition())
                    .ipa(req.getIpa())
                    .wordType(req.getWordType())
                    .exampleEn(req.getExampleEn())
                    .exampleVi(req.getExampleVi())
                    .orderIndex(i)
                    .build();
                lesson.addVocabularyItem(item);
            });
            lesson.setWordCount(request.getVocabularyItems().size());
        }
        return lesson;
    }

    private void assertOwnerOrAdmin(Lesson lesson, User user) {
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = lesson.getCreator().getId().equals(user.getId());
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You don't have permission to modify this lesson");
        }
    }

    public static LessonResponse toLessonResponse(Lesson lesson, boolean includeItems) {
        LessonResponse.LessonResponseBuilder builder = LessonResponse.builder()
            .id(lesson.getId())
            .title(lesson.getTitle())
            .description(lesson.getDescription())
            .wordCount(lesson.getWordCount())
            .isPrivate(lesson.isPrivate())
            .isOfficial(lesson.isOfficial())
            .creatorId(lesson.getCreator().getId())
            .creatorUsername(lesson.getCreator().getDisplayUsername())
            .folderId(lesson.getFolder() != null ? lesson.getFolder().getId() : null)
            .folderName(lesson.getFolder() != null ? lesson.getFolder().getName() : null)
            .createdAt(lesson.getCreatedAt());

        if (includeItems && lesson.getVocabularyItems() != null) {
            builder.vocabularyItems(lesson.getVocabularyItems().stream()
                .map(item -> VocabularyItemResponse.builder()
                    .id(item.getId())
                    .word(item.getWord())
                    .definition(item.getDefinition())
                    .ipa(item.getIpa())
                    .wordType(item.getWordType())
                    .exampleEn(item.getExampleEn())
                    .exampleVi(item.getExampleVi())
                    .orderIndex(item.getOrderIndex())
                    .build())
                .toList());
        }

        return builder.build();
    }
}
