-- ==========================================
-- 🎯 FLYWAY DDL MIGRATION SCRIPT
-- Version: V6__create_exercise_tables.sql
-- Description: Create tables for exercise sets, questions, options, answers, attempts, and attempt answers.
-- ==========================================

-- 1. Create EXERCISE_SETS Table
CREATE TABLE exercise_sets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    topic_id BIGINT REFERENCES theory_topics(id) ON DELETE SET NULL,
    difficulty VARCHAR(50) NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 10,
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. Create EXERCISE_QUESTIONS Table
CREATE TABLE exercise_questions (
    id BIGSERIAL PRIMARY KEY,
    exercise_set_id BIGINT NOT NULL REFERENCES exercise_sets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g. MULTIPLE_CHOICE, FILL_IN_BLANK
    question_text TEXT NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(50),
    points INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 3. Create QUESTION_OPTIONS Table
CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES exercise_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 4. Create QUESTION_ANSWERS Table
CREATE TABLE question_answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES exercise_questions(id) ON DELETE CASCADE,
    correct_answer VARCHAR(500) NOT NULL,
    is_case_sensitive BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Create EXERCISE_ATTEMPTS Table
CREATE TABLE exercise_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_set_id BIGINT NOT NULL REFERENCES exercise_sets(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS'
);

-- 6. Create EXERCISE_ATTEMPT_ANSWERS Table
CREATE TABLE exercise_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES exercise_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES exercise_questions(id) ON DELETE CASCADE,
    selected_option_id BIGINT REFERENCES question_options(id) ON DELETE SET NULL,
    text_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned INTEGER NOT NULL DEFAULT 0,
    answered_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- ==========================================
-- 🚀 INDICES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX idx_exercise_sets_topic ON exercise_sets(topic_id);
CREATE INDEX idx_exercise_questions_set ON exercise_questions(exercise_set_id);
CREATE INDEX idx_question_options_question ON question_options(question_id);
CREATE INDEX idx_question_answers_question ON question_answers(question_id);
CREATE INDEX idx_exercise_attempts_user ON exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_set ON exercise_attempts(exercise_set_id);
CREATE INDEX idx_attempt_answers_attempt ON exercise_attempt_answers(attempt_id);
