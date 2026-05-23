-- ==========================================
-- 🎯 FLYWAY DDL MIGRATION SCRIPT
-- Version: V4__create_theory_folders.sql
-- Description: Create theory_folders table and link theory_articles to it.
-- ==========================================

CREATE TABLE theory_folders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#2563EB',
    icon VARCHAR(10) DEFAULT '📚',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

ALTER TABLE theory_articles ADD COLUMN folder_id BIGINT;
ALTER TABLE theory_articles ADD CONSTRAINT fk_theory_articles_folder FOREIGN KEY (folder_id) REFERENCES theory_folders (id) ON DELETE SET NULL;
