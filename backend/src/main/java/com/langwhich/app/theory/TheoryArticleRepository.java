package com.langwhich.app.theory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TheoryArticleRepository extends JpaRepository<TheoryArticle, Long> {

    Page<TheoryArticle> findByCategory(String category, Pageable pageable);

    Page<TheoryArticle> findByFolderId(Long folderId, Pageable pageable);

    @Query("SELECT t FROM TheoryArticle t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.summary) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<TheoryArticle> searchArticles(@Param("query") String query, Pageable pageable);
}
