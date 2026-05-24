-- =========================================================================
-- 🎯 FLYWAY DDL MIGRATION SCRIPT
-- Version: V9__overhaul_exercise_engine.sql
-- Description: Overhaul Exercise Engine to support Sections, JSONB metadata, 
--              learning tracking, and flexible attempt answers.
-- =========================================================================

-- 1. Create exercise_sections table
CREATE TABLE exercise_sections (
    id BIGSERIAL PRIMARY KEY,
    exercise_set_id BIGINT NOT NULL REFERENCES exercise_sets(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    instruction TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. Insert a default section for every existing exercise set
INSERT INTO exercise_sections (exercise_set_id, title, instruction, sort_order, created_at, updated_at)
SELECT id, 'General Practice', 'Answer the following questions to test your skills.', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM exercise_sets;

-- 3. Add exercise_section_id to exercise_questions
ALTER TABLE exercise_questions ADD COLUMN exercise_section_id BIGINT REFERENCES exercise_sections(id) ON DELETE CASCADE;

-- 4. Map existing questions to their corresponding newly created default section
UPDATE exercise_questions q
SET exercise_section_id = s.id
FROM exercise_sections s
WHERE q.exercise_set_id = s.exercise_set_id;

-- Make exercise_section_id NOT NULL now that it is fully populated
ALTER TABLE exercise_questions ALTER COLUMN exercise_section_id SET NOT NULL;

-- 5. Add metadata and tag columns to exercise_questions
ALTER TABLE exercise_questions ADD COLUMN metadata JSONB;
ALTER TABLE exercise_questions ADD COLUMN grammar_tags JSONB;
ALTER TABLE exercise_questions ADD COLUMN skill_tags JSONB;

-- 6. Migrate Multiple Choice option data into the new metadata JSONB column
-- For multiple choice questions, build: {"options": [{"key": "A", "content": "..."}], "correctAnswer": "..."}
WITH mc_data AS (
    SELECT 
        qo.question_id,
        jsonb_agg(
            jsonb_build_object(
                'key', chr(65 + qo.sort_order), -- A, B, C, D...
                'content', qo.option_text
            ) ORDER BY qo.sort_order ASC
        ) AS options_array,
        MAX(CASE WHEN qo.is_correct THEN chr(65 + qo.sort_order) END) AS correct_ans
    FROM question_options qo
    GROUP BY qo.question_id
)
UPDATE exercise_questions q
SET metadata = jsonb_build_object('options', d.options_array, 'correctAnswer', d.correct_ans)
FROM mc_data d
WHERE q.id = d.question_id AND q.type = 'MULTIPLE_CHOICE';

-- 7. Migrate Fill In The Blank answer data into the new metadata JSONB column
-- For fill in the blank, build: {"acceptedAnswers": ["...", "..."]}
WITH fib_data AS (
    SELECT 
        qa.question_id,
        jsonb_agg(qa.correct_answer) AS answers_array
    FROM question_answers qa
    GROUP BY qa.question_id
)
UPDATE exercise_questions q
SET metadata = jsonb_build_object('acceptedAnswers', d.answers_array)
FROM fib_data d
WHERE q.id = d.question_id AND q.type = 'FILL_IN_BLANK';

-- 8. Drop old foreign keys and tables
ALTER TABLE exercise_questions DROP COLUMN exercise_set_id;

-- Drop old foreign key columns and dependent columns first to break constraint dependencies
ALTER TABLE exercise_attempt_answers DROP COLUMN IF EXISTS selected_option_id;
ALTER TABLE exercise_attempt_answers DROP COLUMN IF EXISTS text_answer;

DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS question_answers CASCADE;

-- 9. Overhaul exercise_attempt_answers payload
-- Add flexible payload column
ALTER TABLE exercise_attempt_answers ADD COLUMN payload JSONB;
-- Add attempt details columns
ALTER TABLE exercise_attempt_answers ADD COLUMN feedback TEXT;
ALTER TABLE exercise_attempt_answers ADD COLUMN explanation TEXT;

-- 10. Create user_question_attempts table for tracking
CREATE TABLE user_question_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES exercise_questions(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    retry_count INTEGER NOT NULL DEFAULT 0,
    first_attempt_correct BOOLEAN NOT NULL DEFAULT FALSE,
    final_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_exercise_sections_set ON exercise_sections(exercise_set_id);
CREATE INDEX idx_exercise_questions_section ON exercise_questions(exercise_section_id);
CREATE INDEX idx_user_question_attempts_user ON user_question_attempts(user_id);
CREATE INDEX idx_user_question_attempts_question ON user_question_attempts(question_id);
