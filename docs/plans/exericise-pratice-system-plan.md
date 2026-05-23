
# English Learning Platform - Exercise Module Plan

## Overview

This module handles the practice system for the English learning platform.

Initial supported exercise types:

- Multiple Choice
- Fill In The Blank (Verb Conjugation / Typing)

The system should be scalable for future exercise types such as:

- Listening
- Matching
- Drag & Drop
- Writing
- Speaking
- Full TOEIC Mock Test

---

# Goals

## Functional Goals

- Practice grammar and vocabulary
- Support real exam-like experiences
- Track user progress
- Auto grading
- Detailed review mode
- Responsive UI
- Scalable architecture

---

# System Architecture

```txt
Frontend (Next.js)
    ↓
REST API (Spring Boot)
    ↓
PostgreSQL
    ↓
Redis (optional cache/session/ranking)
````

---

# Core Domain Design

## Main Entities

ExerciseSet
ExerciseQuestion
QuestionOption
QuestionAnswer
ExerciseAttempt
ExerciseAttemptAnswer

---

# Exercise Types

MULTIPLE_CHOICE
FILL_IN_BLANK

Future:

LISTENING
MATCHING
WRITING
SPEAKING

---

# Database Design

# 1. exercise_sets

Stores practice collections.

## Fields

```
id
title
description
topic_id
difficulty
estimated_minutes
thumbnail_url
is_published
created_by
created_at
updated_at

```  
## Example

Verb Tenses Practice
TOEIC Part 5 Grammar
Passive Voice Exercises

---

# 2. exercise_questions

Stores all questions.

## Fields

```
id
exercise_set_id
type
question_text
explanation
difficulty
points
sort_order
created_at
updated_at
```

## Example

### Multiple Choice

```txt
She ___ to school every day.
```

### Fill In Blank

```txt
Yesterday, he ___ (go) to school.
```

---

# 3. question_options

Used for multiple choice questions.

## Fields

```sql
id
question_id
option_text
is_correct
sort_order
```

---

# 4. question_answers

Used for fill in blank questions.

## Fields

```sql
id
question_id
correct_answer
is_case_sensitive
```

## Example

```txt
went
```

Support multiple accepted answers:

```txt
learned
learnt
```

---

# 5. exercise_attempts

Stores practice sessions.

## Fields

```sql
id
user_id
exercise_set_id
started_at
submitted_at
score
correct_count
total_questions
duration_seconds
status
```

---

# 6. exercise_attempt_answers

Stores user answers.

## Fields

```sql
id
attempt_id
question_id
selected_option_id
text_answer
is_correct
points_earned
answered_at
```

---

# Backend Architecture

# Recommended Stack

* Java 21
* Spring Boot
* Spring Security + JWT
* PostgreSQL
* Redis
* Flyway
* Docker

---

# Package Structure

```txt
com.app.exercise
 ├── controller
 ├── service
 ├── repository
 ├── entity
 ├── dto
 ├── mapper
 ├── validator
 ├── strategy
 └── config
```

---

# Question Strategy Pattern

Highly recommended for scalability.

## Interface

```java
public interface QuestionHandler {

    boolean validateAnswer(...);

    QuestionResponse mapQuestion(...);

    AnswerResult grade(...);
}
```

## Implementations

```txt
MultipleChoiceHandler
FillBlankHandler
```

Future:

```txt
ListeningHandler
WritingHandler
```

---

# API Design

# 1. Get Exercise Sets

```http
GET /api/exercise-sets
```

## Filters

```txt
topic
difficulty
type
search
page
size
```

---

# 2. Get Exercise Set Detail

```http
GET /api/exercise-sets/{id}
```

---

# 3. Start Attempt

```http
POST /api/exercise-sets/{id}/start
```

## Response

```json
{
  "attemptId": 1
}
```

---

# 4. Save Answer

Autosave recommended.

```http
POST /api/attempts/{attemptId}/answers
```

## Multiple Choice

```json
{
  "questionId": 1,
  "selectedOptionId": 5
}
```

## Fill In Blank

```json
{
  "questionId": 2,
  "textAnswer": "went"
}
```

---

# 5. Submit Attempt

```http
POST /api/attempts/{attemptId}/submit
```

## Response

```json
{
  "score": 85,
  "correctCount": 17,
  "totalQuestions": 20
}
```

---

# Grading Logic

# Multiple Choice

```java
selectedOption.isCorrect()
```

---

# Fill In Blank

Normalize input:

```java
trim()
lowercase()
remove extra spaces
```

Compare:

```java
correctAnswers.contains(normalizedInput)
```

---

# Frontend Architecture

# Recommended Stack

* Next.js
* React
* Tailwind CSS
* shadcn/ui
* Zustand
* React Query

---

# Frontend Structure

```txt
/features/exercise
 ├── api
 ├── hooks
 ├── store
 ├── components
 ├── pages
 └── types
```

---

# Components

```txt
QuestionRenderer
MultipleChoiceQuestion
FillBlankQuestion
QuestionPalette
ExerciseTimer
ExerciseHeader
ExerciseNavigation
ExerciseResult
```

---

# Question Renderer Pattern

```tsx
switch(question.type) {
  case "MULTIPLE_CHOICE":
    return <MultipleChoiceQuestion />

  case "FILL_IN_BLANK":
    return <FillBlankQuestion />
}
```

---

# UI/UX Design

# Exercise List Page

## Layout

```txt
Sidebar Filters
Main Content
```

## Features

* Search
* Filter by topic
* Filter by difficulty
* Pagination
* Progress indicator

---

# Exercise Card

```txt
[Grammar]
Verb Tenses Practice

20 Questions
15 mins
Intermediate

[Start Practice]
```

---

# Practice Page Layout

```txt
-----------------------------------
Header
- timer
- progress
-----------------------------------

Question Area

Question 5/20

She ___ to school every day.

(o) go
(o) goes
(o) went
(o) going

-----------------------------------

Bottom Navigation
[Previous] [Next]
```

---

# Multiple Choice UX

## Features

* Highlight selected answer
* Keyboard shortcuts
* Question palette
* Auto next question (optional)
* Mobile responsive

---

# Fill In Blank UX

## Example

```txt
Yesterday, he ___ (go) to school.
```

## Input UI

```txt
Yesterday, he [ went ] to school.
```

---

# Validation Modes

## Practice Mode

* Instant feedback
* Show correct answer
* Show explanation

## Exam Mode

* No feedback until submit
* Real test simulation

---

# Review Mode

Very important feature.

## Layout

```txt
Question
Your Answer
Correct Answer
Explanation
```

## Example

```txt
Your answer: goed
Correct answer: went

"go" is an irregular verb.
```

---

# State Management

## Recommended

* Zustand
* LocalStorage persistence
* Debounced autosave

## Benefits

* Prevent losing progress
* Offline resilience
* Better UX

---

# Admin CMS

# Features

* Create/edit exercises
* WYSIWYG editor
* Preview questions
* Publish/unpublish
* Reorder questions

---

# Multiple Choice Editor

```txt
Question
Options
Correct Option
Explanation
Difficulty
```

---

# Fill Blank Editor

```txt
Sentence
Accepted Answers
Explanation
```

---

# Security

## Backend

* JWT Authentication
* Role-based authorization
* Rate limiting
* Input validation

---

# Performance Optimization

## Backend

* Pagination
* Redis caching
* Lazy loading
* Query optimization

## Frontend

* Code splitting
* Dynamic import
* Skeleton loading
* Optimistic UI

---

# Future Features

# AI Features

## AI Explanation

```txt
Why is "went" correct?
```

## AI Generated Exercises

Generate dynamic grammar questions.

---

# Gamification

* XP
* Streak
* Achievements
* Leaderboards

---

# Adaptive Learning

* Personalized recommendations
* Weakness analysis
* Smart repetition

---

# Deployment

# Frontend

* Vercel

# Backend

* AWS EC2

# Database

* AWS RDS PostgreSQL

# Storage

* AWS S3

---

# Development Phases

# Phase 1

Core Exercise Engine

* Multiple Choice
* Fill Blank
* Basic grading
* Result page

---

# Phase 2

Improved UX

* Autosave
* Timer
* Question palette
* Review mode

---

# Phase 3

Admin CMS

* Exercise management
* Rich editor
* Analytics

---

# Phase 4

Advanced Features

* AI
* Gamification
* Adaptive learning
* Full TOEIC simulation

---

# Final Notes

The most important architectural decision:

## Build a generic exercise engine.

Do NOT tightly couple logic to only TOEIC grammar.

If designed correctly, the same engine can later support:

* TOEIC
* IELTS
* Vocabulary
* Grammar
* Listening
* Speaking
* Mock tests

with minimal refactoring.

```
