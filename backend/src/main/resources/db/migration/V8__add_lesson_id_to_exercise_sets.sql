-- ==========================================
-- 🎯 FLYWAY DDL MIGRATION SCRIPT
-- Version: V8__add_lesson_id_to_exercise_sets.sql
-- Description: Add lesson_id to exercise_sets table
-- ==========================================

ALTER TABLE exercise_sets
ADD COLUMN lesson_id BIGINT REFERENCES theory_lessons(id) ON DELETE SET NULL;

CREATE INDEX idx_exercise_sets_lesson ON exercise_sets(lesson_id);
