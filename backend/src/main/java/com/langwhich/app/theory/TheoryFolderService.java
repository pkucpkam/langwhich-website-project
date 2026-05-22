package com.langwhich.app.theory;

import com.langwhich.app.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TheoryFolderService {

    private final TheoryFolderRepository theoryFolderRepository;

    public List<TheoryFolder> getAllFolders() {
        return theoryFolderRepository.findAll();
    }

    public TheoryFolder getFolderById(Long id) {
        return theoryFolderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Theory folder not found with id: " + id));
    }

    @Transactional
    public TheoryFolder createFolder(TheoryFolder folder) {
        return theoryFolderRepository.save(folder);
    }

    @Transactional
    public TheoryFolder updateFolder(Long id, TheoryFolder request) {
        TheoryFolder folder = getFolderById(id);
        folder.setName(request.getName());
        folder.setDescription(request.getDescription());
        folder.setColor(request.getColor());
        folder.setIcon(request.getIcon());
        return theoryFolderRepository.save(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        if (!theoryFolderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Theory folder not found with id: " + id);
        }
        theoryFolderRepository.deleteById(id);
    }
}
