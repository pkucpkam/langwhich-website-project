package com.langwhich.app.theory;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theory")
@RequiredArgsConstructor
public class TheoryController {

    private final TheoryArticleService theoryArticleService;
    private final TheoryFolderService theoryFolderService;

    @GetMapping
    public ResponseEntity<Page<TheoryArticle>> getArticles(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Long folderId,
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(theoryArticleService.getArticles(q, folderId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheoryArticle> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(theoryArticleService.getArticleById(id));
    }

    @GetMapping("/folders")
    public ResponseEntity<List<TheoryFolder>> getFolders() {
        return ResponseEntity.ok(theoryFolderService.getAllFolders());
    }
}
