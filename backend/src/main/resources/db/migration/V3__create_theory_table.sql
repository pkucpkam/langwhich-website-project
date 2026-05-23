-- ==========================================
-- 🎯 FLYWAY DDL MIGRATION SCRIPT
-- Version: V3__create_theory_table.sql
-- Description: Create theory_articles table for Toeic Grammar, Vocab, and Tips posts.
-- ==========================================

CREATE TABLE theory_articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_theory_category ON theory_articles(category);
