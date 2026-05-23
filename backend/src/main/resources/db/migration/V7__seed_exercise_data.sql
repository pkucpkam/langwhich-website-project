-- ==========================================
-- 🎯 FLYWAY DML MIGRATION SCRIPT
-- Version: V7__seed_exercise_data.sql
-- Description: Seed initial exercise topics, sets, and questions for testing.
-- ==========================================

-- 1. Insert a default Theory Topic if not exists
INSERT INTO theory_topics (name, slug, description, icon, order_index, is_published, created_at)
SELECT 'Grammar Basics', 'grammar-basics', 'Master the fundamentals of English grammar.', '📘', 1, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM theory_topics WHERE slug = 'grammar-basics');

-- 2. Insert Exercise Sets
INSERT INTO exercise_sets (title, description, topic_id, difficulty, estimated_minutes, thumbnail_url, is_published, created_by, created_at)
VALUES (
    'Verb Tenses Practice',
    'Test your knowledge on English verb tenses including Present Simple, Past Simple, Present Perfect, and Past Continuous.',
    (SELECT id FROM theory_topics WHERE slug = 'grammar-basics' LIMIT 1),
    'INTERMEDIATE',
    10,
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
    true,
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    CURRENT_TIMESTAMP
);

-- Get the ID of the inserted exercise set
-- (Using subqueries for downstream inserts to be database independent)

-- Question 1: Multiple Choice (Present Simple)
INSERT INTO exercise_questions (exercise_set_id, type, question_text, explanation, difficulty, points, sort_order, created_at)
VALUES (
    (SELECT id FROM exercise_sets WHERE title = 'Verb Tenses Practice' LIMIT 1),
    'MULTIPLE_CHOICE',
    'She ___ to school every day.',
    'For third-person singular subjects (he, she, it) in the Simple Present tense, we add -s or -es to the base form of the verb.',
    'BEGINNER',
    1,
    0,
    CURRENT_TIMESTAMP
);

INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
VALUES 
    ((SELECT id FROM exercise_questions WHERE question_text = 'She ___ to school every day.' LIMIT 1), 'go', false, 0),
    ((SELECT id FROM exercise_questions WHERE question_text = 'She ___ to school every day.' LIMIT 1), 'goes', true, 1),
    ((SELECT id FROM exercise_questions WHERE question_text = 'She ___ to school every day.' LIMIT 1), 'went', false, 2),
    ((SELECT id FROM exercise_questions WHERE question_text = 'She ___ to school every day.' LIMIT 1), 'going', false, 3);

-- Question 2: Fill in the Blank (Past Simple)
INSERT INTO exercise_questions (exercise_set_id, type, question_text, explanation, difficulty, points, sort_order, created_at)
VALUES (
    (SELECT id FROM exercise_sets WHERE title = 'Verb Tenses Practice' LIMIT 1),
    'FILL_IN_BLANK',
    'Yesterday, he ___ (go) to school.',
    '"Yesterday" indicates that the action happened in the past, so we use the Simple Past tense. The past form of the irregular verb "go" is "went".',
    'BEGINNER',
    1,
    1,
    CURRENT_TIMESTAMP
);

INSERT INTO question_answers (question_id, correct_answer, is_case_sensitive)
VALUES 
    ((SELECT id FROM exercise_questions WHERE question_text = 'Yesterday, he ___ (go) to school.' LIMIT 1), 'went', false);

-- Question 3: Multiple Choice (Past Continuous)
INSERT INTO exercise_questions (exercise_set_id, type, question_text, explanation, difficulty, points, sort_order, created_at)
VALUES (
    (SELECT id FROM exercise_sets WHERE title = 'Verb Tenses Practice' LIMIT 1),
    'MULTIPLE_CHOICE',
    'They ___ soccer when it started to rain.',
    'We use the Past Continuous tense (was/were + V-ing) to describe an ongoing past action that was interrupted by another action (expressed in the Simple Past).',
    'INTERMEDIATE',
    1,
    2,
    CURRENT_TIMESTAMP
);

INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
VALUES 
    ((SELECT id FROM exercise_questions WHERE question_text = 'They ___ soccer when it started to rain.' LIMIT 1), 'were playing', true, 0),
    ((SELECT id FROM exercise_questions WHERE question_text = 'They ___ soccer when it started to rain.' LIMIT 1), 'are playing', false, 1),
    ((SELECT id FROM exercise_questions WHERE question_text = 'They ___ soccer when it started to rain.' LIMIT 1), 'played', false, 2),
    ((SELECT id FROM exercise_questions WHERE question_text = 'They ___ soccer when it started to rain.' LIMIT 1), 'have played', false, 3);

-- Question 4: Fill in the Blank (Present Perfect)
INSERT INTO exercise_questions (exercise_set_id, type, question_text, explanation, difficulty, points, sort_order, created_at)
VALUES (
    (SELECT id FROM exercise_sets WHERE title = 'Verb Tenses Practice' LIMIT 1),
    'FILL_IN_BLANK',
    'I ___ (study) English since 2020.',
    'The word "since" indicates an action that started in the past and continues to the present. We use the Present Perfect tense (have/has + past participle) or Present Perfect Continuous (have/has been + V-ing).',
    'INTERMEDIATE',
    1,
    3,
    CURRENT_TIMESTAMP
);

INSERT INTO question_answers (question_id, correct_answer, is_case_sensitive)
VALUES 
    ((SELECT id FROM exercise_questions WHERE question_text = 'I ___ (study) English since 2020.' LIMIT 1), 'have studied', false),
    ((SELECT id FROM exercise_questions WHERE question_text = 'I ___ (study) English since 2020.' LIMIT 1), 'have been studying', false);
