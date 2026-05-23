-- ==========================================
-- 🎯 FLYWAY DDL MIGRATION SCRIPT
-- Version: V5__recreate_theory_with_topics_and_lessons.sql
-- Description: Unify and migrate to theory_topics and theory_lessons tables, dropping deprecated ones.
-- ==========================================

DROP TABLE IF EXISTS theory_articles CASCADE;
DROP TABLE IF EXISTS theory_folders CASCADE;

CREATE TABLE theory_topics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT '📘',
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE theory_lessons (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES theory_topics(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    summary TEXT,
    thumbnail VARCHAR(500),
    content TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',
    estimated_minutes INT NOT NULL DEFAULT 5,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_theory_lesson_slug ON theory_lessons(slug);
CREATE INDEX idx_theory_lesson_topic_id ON theory_lessons(topic_id);
CREATE INDEX idx_theory_topic_slug ON theory_topics(slug);
