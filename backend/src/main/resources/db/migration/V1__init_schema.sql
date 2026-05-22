-- ==========================================
-- 🎯 FLYWAY INITIAL DDL MIGRATION SCRIPT
-- Project: LangWhich (TOEIC Learning Platform)
-- Version: V1__init_schema.sql
-- Description: Create core tables for users, lessons, vocabulary, SRS, and study sessions.
-- ==========================================

-- 1. Create USERS Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. Create FOLDERS Table
CREATE TABLE folders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id BIGINT NOT NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    icon VARCHAR(10) DEFAULT '📁',
    is_official BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_folders_creator FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Create LESSONS Table
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    word_count INTEGER NOT NULL DEFAULT 0,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    is_official BOOLEAN NOT NULL DEFAULT FALSE,
    creator_id BIGINT NOT NULL,
    folder_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_lessons_creator FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_lessons_folder FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
);

-- 4. Create VOCABULARY_ITEMS Table
CREATE TABLE vocabulary_items (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    word VARCHAR(300) NOT NULL,
    definition TEXT NOT NULL,
    ipa VARCHAR(200),
    word_type VARCHAR(50),
    example_en TEXT,
    example_vi TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_vocab_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
);

-- 5. Create SRS_CARDS Table
CREATE TABLE srs_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    vocabulary_item_id BIGINT NOT NULL,
    ease_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    last_review TIMESTAMP WITHOUT TIME ZONE,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_srs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_srs_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    CONSTRAINT fk_srs_vocab FOREIGN KEY (vocabulary_item_id) REFERENCES vocabulary_items (id) ON DELETE CASCADE,
    CONSTRAINT uq_user_vocab UNIQUE (user_id, vocabulary_item_id)
);

-- 6. Create STUDY_SESSIONS Table
CREATE TABLE study_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT,
    lesson_title VARCHAR(200),
    study_mode VARCHAR(20) NOT NULL,
    time_spent INTEGER NOT NULL DEFAULT 0,
    know_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_session_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE SET NULL
);

-- ==========================================
-- 🚀 INDICES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX idx_folders_creator ON folders(creator_id);
CREATE INDEX idx_lessons_creator ON lessons(creator_id);
CREATE INDEX idx_lessons_folder ON lessons(folder_id);
CREATE INDEX idx_vocab_lesson ON vocabulary_items(lesson_id);
CREATE INDEX idx_srs_user_review ON srs_cards(user_id, next_review);
CREATE INDEX idx_srs_vocab ON srs_cards(vocabulary_item_id);
CREATE INDEX idx_sessions_user ON study_sessions(user_id);
