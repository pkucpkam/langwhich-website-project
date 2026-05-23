package com.langwhich.app.modules.folder.service;

import com.langwhich.app.common.exception.ForbiddenException;
import com.langwhich.app.common.exception.ResourceNotFoundException;
import com.langwhich.app.modules.folder.dto.request.FolderRequest;
import com.langwhich.app.modules.folder.dto.response.FolderResponse;
import com.langwhich.app.modules.lesson.entity.Lesson;
import com.langwhich.app.modules.lesson.repository.LessonRepository;
import com.langwhich.app.modules.lesson.service.LessonService;
import com.langwhich.app.modules.lesson.dto.response.LessonResponse;
import com.langwhich.app.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.langwhich.app.modules.folder.repository.FolderRepository;
import com.langwhich.app.modules.folder.entity.Folder;
import com.langwhich.app.modules.folder.mapper.FolderMapper;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FolderService {

    private final FolderRepository folderRepository;
    private final LessonRepository lessonRepository;
    private final FolderMapper folderMapper;

    public List<FolderResponse> getOfficialFolders() {
        return folderRepository.findByIsOfficialTrue()
            .stream()
            .map(f -> folderMapper.toResponse(f, countLessons(f.getId())))
            .toList();
    }

    public List<FolderResponse> getMyFolders(User user) {
        return folderRepository.findByCreatorId(user.getId())
            .stream()
            .map(f -> folderMapper.toResponse(f, countLessons(f.getId())))
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
        Folder folder = folderMapper.toEntity(request, creator);
        return folderMapper.toResponse(folderRepository.save(folder), 0);
    }

    @Transactional
    public FolderResponse createOfficialFolder(FolderRequest request, User admin) {
        Folder folder = folderMapper.toOfficialEntity(request, admin);
        return folderMapper.toResponse(folderRepository.save(folder), 0);
    }

    @Transactional
    public FolderResponse updateFolder(Long id, FolderRequest request, User currentUser) {
        Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        assertOwnerOrAdmin(folder, currentUser);

        folderMapper.updateEntity(request, folder);

        return folderMapper.toResponse(folderRepository.save(folder), countLessons(id));
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
}
