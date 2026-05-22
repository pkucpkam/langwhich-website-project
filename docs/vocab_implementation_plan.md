# 📚 Vocab Feature — Implementation Plan

> Migrate Vocabulary/Lessons feature từ React+Firebase sang **Next.js + Spring Boot + PostgreSQL**

---

## Tổng quan scope

Implement **toàn bộ Vocabulary module** gồm:

| Scope | Components |
|---|---|
| **Backend (Spring Boot)** | Entities, Repositories, Services, Controllers |
| **Frontend (Next.js)** | Pages, Components, API layer, Types |
| **Database** | PostgreSQL schema migration |

---

## Phase 1 — Backend: Database Entities & Repositories

### 1.1 New JPA Entities

| File | Mô tả |
|---|---|
| `Lesson.java` | Bảng `lessons` — title, description, isPrivate, isOfficial, folder, creator |
| `VocabularyItem.java` | Bảng `vocabulary_items` — word, definition, ipa, wordType, examples |
| `Folder.java` | Bảng `folders` — name, color, icon, isOfficial |
| `SrsCard.java` | Bảng `srs_cards` — SM-2 fields per user per word |
| `StudySession.java` | Bảng `study_sessions` — history tracking |

### 1.2 Repositories

- `LessonRepository.java`
- `VocabularyItemRepository.java`
- `FolderRepository.java`
- `SrsCardRepository.java`
- `StudySessionRepository.java`

---

## Phase 2 — Backend: DTOs + Service + Controller

### 2.1 Lesson Module (`/api/lessons`)

| Endpoint | Method | Auth |
|---|---|---|
| `GET /api/lessons` | Public lessons list (paginated) | Optional |
| `GET /api/lessons/{id}` | Lesson detail + vocab | Optional |
| `POST /api/lessons` | Create lesson | USER |
| `PUT /api/lessons/{id}` | Update lesson | Owner |
| `DELETE /api/lessons/{id}` | Delete lesson | Owner/ADMIN |
| `GET /api/lessons/my` | My lessons | USER |
| `PATCH /api/lessons/{id}/privacy` | Toggle private | Owner |
| `PATCH /api/lessons/{id}/folder` | Move to folder | Owner |

### 2.2 Folder Module (`/api/folders`)

| Endpoint | Method | Auth |
|---|---|---|
| `GET /api/folders/official` | Official folders | Optional |
| `GET /api/folders/my` | My folders | USER |
| `POST /api/folders` | Create folder | USER |
| `PUT /api/folders/{id}` | Update folder | Owner/ADMIN |
| `DELETE /api/folders/{id}` | Delete folder | Owner/ADMIN |
| `GET /api/folders/{id}/lessons` | Lessons in folder | Optional |

### 2.3 SRS Module (`/api/srs`)

| Endpoint | Method | Auth |
|---|---|---|
| `GET /api/srs/cards/due` | Due cards | USER |
| `POST /api/srs/lessons/{id}/init` | Init SRS cards | USER |
| `POST /api/srs/cards/{id}/review` | Review card (SM-2) | USER |

### 2.4 History Module (`/api/history`)

| Endpoint | Method | Auth |
|---|---|---|
| `POST /api/history/sessions` | Save study session | USER |
| `GET /api/history/sessions` | My study history | USER |
| `GET /api/history/daily` | Daily activity (heatmap) | USER |

### 2.5 Admin Module (`/api/admin`)

| Endpoint | Method | Auth |
|---|---|---|
| `GET /api/admin/users` | All users paginated | ADMIN |
| `GET /api/admin/lessons` | All lessons | ADMIN |
| `GET /api/admin/folders` | All folders | ADMIN |
| `POST /api/admin/folders` | Create official folder | ADMIN |

### 2.6 Leaderboard

`GET /api/leaderboard` — JOIN study_sessions GROUP BY user SUM(time_spent)

### 2.7 SRS Algorithm Utility

`SrsAlgorithm.java` — Port SM-2 từ TypeScript:
```
Rating: again(0) | hard(3) | good(4) | easy(5)
easeFactor = max(1.3, EF + 0.1 - (5-q)(0.08 + (5-q)×0.02))
```

---

## Phase 3 — Frontend: Types & API Layer

### 3.1 TypeScript Types

`types/vocab.ts`:
- `Lesson`, `VocabularyItem`, `Folder`, `SrsCard`, `StudySession`
- `PaginatedResponse<T>`, `StudyMode`

### 3.2 API Functions

`api/lessons.ts`, `api/folders.ts`, `api/srs.ts`, `api/history.ts`

---

## Phase 4 — Frontend: Pages

### Pages to implement

| Route | File | Priority |
|---|---|---|
| `/` (Home) | `app/(protected)/page.tsx` | HIGH |
| `/lessons/[id]` | `app/(protected)/lessons/[id]/page.tsx` | HIGH |
| `/study/[id]` | `app/(protected)/study/[id]/page.tsx` | HIGH |
| `/create-lesson` | `app/(protected)/create-lesson/page.tsx` | HIGH |
| `/my-lessons` | `app/(protected)/my-lessons/page.tsx` | MEDIUM |
| `/folder/[id]` | `app/(protected)/folder/[id]/page.tsx` | MEDIUM |
| `/edit/[id]` | `app/(protected)/edit/[id]/page.tsx` | MEDIUM |
| `/review/[id]` | `app/(protected)/review/[id]/page.tsx` | MEDIUM |
| `/test/[id]` | `app/(protected)/test/[id]/page.tsx` | MEDIUM |
| `/srs-review` | `app/(protected)/srs-review/page.tsx` | MEDIUM |
| `/study-history` | `app/(protected)/study-history/page.tsx` | LOW |
| `/leaderboard` | `app/(protected)/leaderboard/page.tsx` | LOW |
| `/admin` | `app/(admin)/admin/page.tsx` | LOW |

### Reusable Components

| Component | Location |
|---|---|
| `Flashcard` | `components/features/study/Flashcard.tsx` |
| `ActivityHeatmap` | `components/features/home/ActivityHeatmap.tsx` |
| `LessonTable` | `components/features/lessons/LessonTable.tsx` |
| `FolderCard` | `components/features/folders/FolderCard.tsx` |
| `SrsReviewCard` | `components/features/srs/SrsReviewCard.tsx` |
| `VocabForm` | `components/features/lessons/VocabForm.tsx` |
| `ExerciseModal` | `components/features/lessons/ExerciseModal.tsx` |
| `Pagination` | `components/ui/Pagination.tsx` |
| `ConfirmModal` | `components/ui/ConfirmModal.tsx` |

---

## Implementation Order (Sprint)

```
Sprint 1 (Backend Core):
  ✅ Entities + Repositories
  ✅ Lesson CRUD + Folder CRUD
  ✅ Security config update

Sprint 2 (Backend Advanced):
  ✅ SRS Algorithm + SRS endpoints
  ✅ History + Leaderboard
  ✅ Admin endpoints

Sprint 3 (Frontend Core):
  ✅ Types + API layer
  ✅ Home page (lesson list)
  ✅ Lesson detail + Create lesson

Sprint 4 (Frontend Study Modes):
  ✅ Flashcard study page
  ✅ Review (quiz) page
  ✅ Test (fill-in) page
  ✅ SRS Review page

Sprint 5 (Frontend Management):
  ✅ My Lessons + Folders
  ✅ Edit lesson
  ✅ Study History + Leaderboard
  ✅ Admin Dashboard
```
