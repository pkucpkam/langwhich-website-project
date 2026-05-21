# 🎯 TOEIC Learning Platform

A structured TOEIC learning system focused on helping users master **grammar, vocabulary, and practice exercises** from basic to advanced levels.

This project is built with a **MVP-first approach**, starting from core learning features and gradually expanding into a full TOEIC exam preparation ecosystem.

---

## 🚀 Project Goals

The platform aims to help learners:

- Master TOEIC grammar fundamentals
- Build strong vocabulary foundations
- Practice TOEIC-style exercises
- Track learning progress over time
- Prepare for full TOEIC exams (future phase)

---

## 📚 Core Features (MVP)

### 📖 Grammar Learning System
- Structured grammar lessons
- Explanations + rules + examples
- Practice questions per lesson:
  - Multiple choice
  - Fill in the blank
  - Sentence correction (basic)
- Flexible content structure (JSONB-based design)

---

### 📘 Vocabulary Learning System
- TOEIC-oriented vocabulary sets
- Flashcard learning mode
- Quiz system (MCQ / meaning matching)
- Topic-based grouping (business, daily life, etc.)

---

### 🧠 Practice Engine
- Question generation system by topic
- Auto scoring system
- Answer review & explanation
- Basic difficulty classification

---

### 👤 User System
- Register / Login (JWT authentication)
- User profile management
- Learning progress tracking:
  - Grammar completion
  - Vocabulary mastery
  - Quiz accuracy

---

## 🏗️ Tech Stack

### Frontend
- ReactJS
- Material UI
- Axios

### Backend
- Java Spring Boot
- Spring Security (JWT)
- RESTful APIs

### Database
- PostgreSQL (primary relational database)
- JSONB for flexible grammar & question content

---

## 🧠 Architecture Overview
Frontend (React)
↓
Spring Boot API
↓
PostgreSQL
├── Users
├── Vocabulary
├── Progress
├── Quiz Results
└── Grammar (JSONB)


---

## 📌 Design Philosophy

> "Start simple, build deep, scale gradually."

This project focuses on:
- Clean architecture over complexity
- Real learning value over feature overload
- Incremental development
- Strong backend fundamentals

---

## 📈 Future Roadmap

- 🎧 Listening practice module
- 📖 Reading comprehension system
- ✍️ Writing correction feature
- 🗣️ Speaking practice (AI scoring)
- 🧪 Full TOEIC mock tests (Part 1–7)
- 🏆 Contest & ranking system
- 🛒 Marketplace for learning materials (advanced phase)

---

## 📂 Project Status

🚧 Active development (MVP phase)

Current focus:
- Vocabulary system migration
- Grammar module design
- Practice engine implementation
- User progress tracking system

---

## 👨‍💻 Author

Built as a personal project to combine:
- Backend Java development (Spring Boot)
- System design learning
- TOEIC exam preparation

---