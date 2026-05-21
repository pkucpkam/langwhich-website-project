package com.langwhich.app.folder;

import com.langwhich.app.exception.ForbiddenException;
import com.langwhich.app.exception.ResourceNotFoundException;
import com.langwhich.app.folder.dto.FolderRequest;
import com.langwhich.app.folder.dto.FolderResponse;
import com.langwhich.app.lesson.Lesson;
import com.langwhich.app.lesson.LessonRepository;
import com.langwhich.app.lesson.LessonService;
import com.langwhich.app.lesson.dto.LessonResponse;
import com.langwhich.app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FolderService {

    private final FolderRepository folderRepository;
    private final LessonRepository lessonRepository;

    public List<FolderResponse> getOfficialFolders() {
        return folderRepository.findByIsOfficialTrue()
            .stream()
            .map(f -> toResponse(f, countLessons(f.getId())))
            .toList();
    }

    public List<FolderResponse> getMyFolders(User user) {
        return folderRepository.findByCreatorId(user.getId())
            .stream()
            .map(f -> toResponse(f, countLessons(f.getId())))
            .toList();
    }

    public List<LessonResponse> getLessonsInFolder(Long folderId, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        List<Lesson> lessons;
        if (currentUser != null && (folder.getCreator().getId().equals(currentUser.getId())
            || currentUser.getRole().name().equals("ADMIN"))) {
            // Owner/Admin sees all lessons
            lessons = lessonRepository.findByFolderId(folderId);
        } else {
            // Others see only public lessons
            lessons = lessonRepository.findByFolderIdAndIsPrivateFalse(folderId);
        }

        return lessons.stream()
            .map(l -> LessonService.toLessonResponse(l, false))
            .toList();
    }

    @Transactional
    public FolderResponse createFolder(FolderRequest request, User creator) {
        Folder folder = Folder.builder()
            .name(request.getName())
            .description(request.getDescription())
            .color(request.getColor())
            .icon(request.getIcon())
            .isOfficial(false)
            .creator(creator)
            .build();
        return toResponse(folderRepository.save(folder), 0);
    }

    @Transactional
    public FolderResponse createOfficialFolder(FolderRequest request, User admin) {
        Folder folder = Folder.builder()
            .name(request.getName())
            .description(request.getDescription())
            .color(request.getColor())
            .icon(request.getIcon())
            .isOfficial(true)
            .creator(admin)
            .build();
        return toResponse(folderRepository.save(folder), 0);
    }

    @Transactional
    public FolderResponse updateFolder(Long id, FolderRequest request, User currentUser) {
        Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        assertOwnerOrAdmin(folder, currentUser);

        folder.setName(request.getName());
        folder.setDescription(request.getDescription());
        folder.setColor(request.getColor());
        folder.setIcon(request.getIcon());

        return toResponse(folderRepository.save(folder), countLessons(id));
    }

    @Transactional
    public void deleteFolder(Long id, User currentUser) {
        Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        assertOwnerOrAdmin(folder, currentUser);
        folderRepository.delete(folder);
    }

    // ===== HELPERS =====

    private int countLessons(Long folderId) {
        return lessonRepository.findByFolderId(folderId).size();
    }

    private void assertOwnerOrAdmin(Folder folder, User user) {
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = folder.getCreator().getId().equals(user.getId());
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You don't have permission to modify this folder");
        }
    }

    private FolderResponse toResponse(Folder folder, int lessonCount) {
        return FolderResponse.builder()
            .id(folder.getId())
            .name(folder.getName())
            .description(folder.getDescription())
            .color(folder.getColor())
            .icon(folder.getIcon())
            .isOfficial(folder.isOfficial())
            .creatorId(folder.getCreator().getId())
            .creatorUsername(folder.getCreator().getDisplayUsername())
            .lessonCount(lessonCount)
            .createdAt(folder.getCreatedAt())
            .build();
    }
}
