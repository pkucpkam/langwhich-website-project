package com.langwhich.app.theory;

import com.langwhich.app.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TheoryArticleService {

    private final TheoryArticleRepository theoryArticleRepository;
    private final TheoryFolderRepository theoryFolderRepository;

    public Page<TheoryArticle> getArticles(String q, Long folderId, Pageable pageable) {
        if (q != null && !q.trim().isEmpty()) {
            return theoryArticleRepository.searchArticles(q.trim(), pageable);
        }
        if (folderId != null) {
            return theoryArticleRepository.findByFolderId(folderId, pageable);
        }
        return theoryArticleRepository.findAll(pageable);
    }

    public TheoryArticle getArticleById(Long id) {
        return theoryArticleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Theory article not found with id: " + id));
    }

    @Transactional
    public TheoryArticle createArticle(TheoryArticle request, Long folderId) {
        if (folderId != null) {
            TheoryFolder folder = theoryFolderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Theory folder not found with id: " + folderId));
            request.setFolder(folder);
            request.setCategory(folder.getName());
        }
        return theoryArticleRepository.save(request);
    }

    @Transactional
    public TheoryArticle updateArticle(Long id, TheoryArticle request, Long folderId) {
        TheoryArticle article = getArticleById(id);
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        
        if (folderId != null) {
            TheoryFolder folder = theoryFolderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Theory folder not found with id: " + folderId));
            article.setFolder(folder);
            article.setCategory(folder.getName());
        } else {
            article.setFolder(null);
            article.setCategory(request.getCategory());
        }
        
        return theoryArticleRepository.save(article);
    }

    @Transactional
    public void deleteArticle(Long id) {
        if (!theoryArticleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Theory article not found with id: " + id);
        }
        theoryArticleRepository.deleteById(id);
    }
}
