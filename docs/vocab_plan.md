# 📚 Simple Quizlet — Tài liệu Kỹ thuật

> Tài liệu này mô tả toàn bộ website Simple Quizlet hiện tại (React + Vite + Firebase) để làm cơ sở chuyển đổi sang **Next.js** (frontend) + **Spring Boot** (backend).

---

## 1. Tổng quan hệ thống

**Simple Quizlet** là ứng dụng học từ vựng tiếng Anh theo mô hình Quizlet. Người dùng có thể tạo bài học, học bằng flashcard, ôn tập theo nhiều chế độ, và theo dõi tiến trình học tập thông qua SRS (Spaced Repetition System).

### Tech Stack hiện tại

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| Routing | React Router DOM v7 |
| Backend / DB | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication (Email/Password) |
| File Storage | Cloudinary (upload avatar) |
| Hosting | Vercel |
| Notifications | react-hot-toast |
| Excel Import | xlsx |

---

## 2. Kiến trúc tổng thể

```
src/
├── App.tsx              # Route definitions
├── pages/               # Các trang
│   ├── admin/           # Trang dành cho Admin
│   └── users/           # Trang dành cho User đã đăng nhập
├── components/          # UI components tái sử dụng
│   ├── common/          # Header, PrivateRoute, AdminRoute, Pagination...
│   ├── review/          # Components ôn tập
│   ├── srs/             # Components SRS review
│   └── modal/           # Các modal dialog
├── service/             # Tầng gọi Firebase (tương đương Repository/Service)
├── hooks/               # Custom React hooks (useAuth, useSpeechSynthesis)
├── types/               # TypeScript interfaces / data models
└── utils/               # srsAlgorithm.ts (thuật toán SM-2)
```

---

## 3. Data Models (Firestore Collections → SQL Tables)

### 3.1 `users` collection

```typescript
{
  uid: string;          // Document ID = Firebase UID
  username: string;
  email: string;
  photoURL?: string;    // URL Cloudinary
  role: 'USER' | 'ADMIN';
  createdAt: Timestamp;
}
```

### 3.2 `lessons` collection

```typescript
{
  id: string;           // Document ID
  title: string;
  creator: string;      // username (không phải UID)
  vocabId: string;      // FK → vocabularies collection
  description: string;
  wordCount: number;
  isPrivate: boolean;   // false = công khai, true = riêng tư
  isOfficial: boolean;  // true = do Admin tạo
  folderId: string | null; // FK → folders
  createdAt: Timestamp;
}
```

### 3.3 `vocabularies` collection

```typescript
{
  id: string;           // Document ID = vocabId
  words: VocabItem[];
  createdAt: Timestamp;
}

// VocabItem
{
  word: string;
  definition: string;
  ipa?: string;         // Phiên âm IPA
  wordType?: string;    // noun, verb, adj...
  exampleEn?: string;   // Câu ví dụ tiếng Anh
  exampleVi?: string;   // Câu ví dụ tiếng Việt
}
```

> **Lưu ý khi chuyển sang SQL:** `lessons` và `vocabularies` nên merge thành 1 bảng `lessons` + bảng con `vocabulary_items` (1:N), hoặc lưu JSON trong cột `words`.

### 3.4 `folders` collection

```typescript
{
  id: string;
  name: string;
  description: string;
  creator: string;      // username
  color: string;        // hex color
  icon: string;         // emoji
  lessonCount: number;  // denormalized count
  isOfficial: boolean;  // true = thư mục hệ thống của Admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 3.5 `srsCards` collection (Spaced Repetition)

```typescript
{
  id: string;
  wordId: string;         // "{lessonId}_{word}"
  word: string;
  definition: string;
  userId: string;         // username
  lessonId: string;
  // SM-2 Algorithm fields
  easeFactor: number;     // 1.3–2.5, default 2.5
  interval: number;       // số ngày đến lần ôn tiếp theo
  repetitions: number;    // số lần ôn thành công
  nextReview: Timestamp;
  lastReview?: Timestamp;
  // Stats
  totalReviews: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.6 `history/{userId}/sessions` subcollection

```typescript
{
  id: string;
  userId: string;
  setId: string;          // vocabId
  setName: string;
  lessonId: string;
  lessonTitle: string;
  studyMode: 'flashcard' | 'review' | 'test' | 'srs_review';
  timeSpent: number;      // giây
  knowCount: number;
  totalCount: number;
  studyTime: Timestamp;
}
```

### 3.7 `history/{userId}/aggregate/dailyLog` document

```typescript
{
  "2025-05-21": 3,    // ngày: số phiên học
  "2025-05-20": 1,
  ...
}
```
> Dùng để vẽ **Activity Heatmap** (GitHub-style).

### 3.8 `reviewSessions` collection

```typescript
{
  id: string;
  userId: string;
  lessonId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  cardsReviewed: number;
  correctCount: number;
  incorrectCount: number;
  totalTime: number;    // giây
  averageTime: number;
}
```

---

## 4. Phân quyền & Authentication

### Roles

| Role | Quyền truy cập |
|---|---|
| **Guest** | `/login`, `/register`, `/verify-email` |
| **USER** | Tất cả các trang protected (Home, Study, My Lessons...) |
| **ADMIN** | Tất cả trang USER + `/admin`, `/admin/create-lesson` |

### Luồng Auth

```
1. User đăng ký → Firebase tạo account → gửi email xác thực
2. User xác thực email → có thể đăng nhập
3. Login → Firebase trả token → getUserInfo() từ Firestore
4. User data lưu vào sessionStorage (key: "user")
5. onAuthStateChanged() listener luôn chạy nền để sync state
6. PrivateRoute: check user session → redirect /login nếu chưa đăng nhập
7. AdminRoute: check role === 'ADMIN' → redirect / nếu không phải admin
```

### `useAuth` hook

- Kết hợp `sessionStorage` (instant response) + Firebase listener (ground truth)
- Trả về `{ user: AuthUser | null, loading: boolean }`
- `AuthUser = { uid, username, email, role, isLoggedIn }`

---

## 5. Danh sách Routes & Pages

### Public Routes

| URL | Component | Mô tả |
|---|---|---|
| `/login` | `Login.tsx` | Form đăng nhập email/password |
| `/register` | `Register.tsx` | Form đăng ký (email, username, password) |
| `/verify-email` | `VerifyEmail.tsx` | Thông báo kiểm tra email xác thực |

### Protected Routes (USER)

| URL | Component | Mô tả |
|---|---|---|
| `/` | `Home.tsx` | Trang chủ: heatmap + thư mục hệ thống + danh sách bài học công khai |
| `/profile` | `Profile.tsx` | Xem & cập nhật avatar người dùng |
| `/leaderboard` | `Leaderboard.tsx` | Bảng xếp hạng theo tổng thời gian học |
| `/create-lesson` | `CreateLesson.tsx` | Tạo bài học mới + import Excel |
| `/my-lessons` | `MyLessons.tsx` | Quản lý bài học + thư mục cá nhân |
| `/folder/:folderId` | `FolderView.tsx` | Xem bài học trong thư mục hệ thống |
| `/edit/:lessonId` | `EditLesson.tsx` | Chỉnh sửa bài học |
| `/lesson/:lessonId` | `LessonView.tsx` | Xem chi tiết từ vựng của bài học |
| `/study/:lessonId` | `Study.tsx` | Học bằng Flashcard |
| `/study-history` | `StudyHistory.tsx` | Lịch sử học tập |
| `/srs-review` | `SRSReviewPage.tsx` | Ôn tập SRS thông minh hàng ngày |
| `/review-page` | `ReviewLessonPage.tsx` | Chọn bài để ôn tập (Quiz) |
| `/review/:lessonId` | `ReviewPage.tsx` | Ôn tập Quiz (multiple choice) |
| `/test-page` | `TestLessonPage.tsx` | Chọn bài để kiểm tra |
| `/test/:lessonId` | `TestPage.tsx` | Kiểm tra bằng điền từ |

### Admin Routes

| URL | Component | Mô tả |
|---|---|---|
| `/admin` | `AdminDashboard.tsx` | Quản lý users, lessons, folders |
| `/admin/create-lesson` | `AdminCreateLesson.tsx` | Tạo bài học hệ thống (isOfficial=true) |

---

## 6. Các Tính năng Chi tiết

### 6.1 Trang Chủ (`/`)

**Hiển thị:**
- **Activity Heatmap**: GitHub-style, lấy dữ liệu từ `history/{uid}/aggregate/dailyLog`
- **Thư mục Hệ thống**: Grid các Official Folders (Admin tạo) → click vào xem bài học bên trong
- **Danh sách bài học công khai**: Table với sort + search + pagination

**Tính năng:**
- Tìm kiếm debounce 500ms (client-side filter)
- Phân trang cursor-based (Firestore cursor pagination)
- Sort theo: title, creator, wordCount, createdAt
- Mỗi bài học có 3 action: **Học ngay** → `/study/:id`, **Ôn tập** → modal chọn chế độ, **Kiểm tra** → `/test/:id`
- Owner của bài học thấy thêm menu: Chỉnh sửa, Chuyển public/private, Xóa

### 6.2 Flashcard Study (`/study/:lessonId`)

**Luồng:**
1. Load bài học → lấy vocabulary list từ Firestore
2. Hiển thị từng thẻ flashcard (có flip animation: mặt trước = từ tiếng Anh, mặt sau = định nghĩa)
3. User đánh dấu **"Đã thuộc" (Know)** hoặc **"Chưa thuộc" (Still Learning)**
4. Thuật toán: bỏ qua các từ đã thuộc, lặp lại từ chưa thuộc
5. Kết thúc khi tất cả từ đều được đánh dấu "Know"
6. **Sau khi hoàn thành:**
   - Lưu `StudySession` vào `history/{uid}/sessions` (studyMode = "flashcard")
   - Khởi tạo `SRSCard` cho mỗi từ nếu chưa tồn tại
   - Hiện `CompletionScreen` với stats + nút Ôn tập lại / Kiểm tra

**Flashcard component:** hỗ trợ IPA, wordType, exampleEn, exampleVi, text-to-speech (useSpeechSynthesis hook).

### 6.3 Test Mode (`/test/:lessonId`)

**Luồng:**
1. Load vocabulary → xáo trộn ngẫu nhiên
2. Hiện định nghĩa tiếng Việt, user điền từ tiếng Anh vào ô input
3. Gợi ý trực quan: hiển thị `_ _ _ _` (dấu gạch dưới theo từng ký tự)
4. Khi user gõ → ký tự đúng hiện ra, sai thì giữ `_`
5. So sánh case-insensitive
6. Có nút **Bỏ qua** (skip) → đánh dấu sai
7. Kết thúc → hiện kết quả: % đúng, danh sách từ sai với đáp án đúng
8. Lưu session vào history (studyMode = "test")

### 6.4 Review/Quiz Mode (`/review/:lessonId`)

Multiple choice quiz: hiện từ → chọn 1 trong 4 định nghĩa đúng/sai. Lưu session (studyMode = "review").

### 6.5 SRS Review (`/srs-review`)

**Spaced Repetition System dùng thuật toán SM-2:**

```
Rating: again (0) | hard (3) | good (4) | easy (5)

Nếu rating < 3 (again):
  → reset: interval = 1 day, repetitions = 0

Nếu rating >= 3 (hard/good/easy):
  → repetitions += 1
  → rep 1: interval = 1 day
  → rep 2: interval = 6 days  
  → rep N: interval = round(prev_interval × easeFactor)
  → hard modifier: interval × 0.8
  → easy modifier: interval × 1.3

easeFactor = max(1.3, EF + 0.1 - (5-q)(0.08 + (5-q)×0.02))
```

**Luồng:**
1. Load tất cả SRS cards của user có `nextReview <= now`
2. Hiển thị từng card (mặt trước = từ) → user nhấn "Hiện đáp án"
3. User chọn rating: Again / Hard / Good / Easy
4. Gọi `srsService.reviewCard()` → cập nhật interval, easeFactor, nextReview vào Firestore
5. Kết thúc → lưu session history + hiện tổng kết

### 6.6 My Lessons (`/my-lessons`)

**Quản lý bài học cá nhân:**
- Xem tất cả bài học của mình (filter theo thư mục)
- Quản lý Folder: tạo / xóa / đổi màu / đổi icon / đặt tên
- Di chuyển bài học vào/ra thư mục
- Chuyển đổi public/private
- Xóa bài học

### 6.7 Create Lesson (`/create-lesson`)

**Tạo bài học mới:**
- Nhập title, description, chọn thư mục
- Thêm từng từ vựng (word + definition + IPA + wordType + exampleEn + exampleVi)
- Import từ file Excel (.xlsx):
  - Cột A: Word, Cột B: Definition, (optional) C: IPA, D: WordType, E: ExampleEn, F: ExampleVi
  - Dùng thư viện `xlsx` parse file
- Submit → tạo document trong `vocabularies` → tạo document trong `lessons`

### 6.8 Leaderboard (`/leaderboard`)

- Fetch tất cả users → với mỗi user, lấy study history → tính tổng `timeSpent`
- Sắp xếp giảm dần theo `totalTimeSpent`
- Podium hiển thị Top 3 (huy chương vàng/bạc/đồng)
- Table hiển thị từ hạng 4 trở xuống với breakdown: thẻ ghi nhớ / ôn tập / kiểm tra
- Highlight vị trí của current user

### 6.9 Study History (`/study-history`)

- List tất cả phiên học của user (timeSpent, mode, lessonTitle, date)
- Stats tổng hợp: tổng thời gian, mode phổ biến, số bộ đã học

### 6.10 Admin Dashboard (`/admin`)

Tab quản lý 3 loại:

| Tab | Nội dung |
|---|---|
| **Người dùng** | List users (username, email, role, uid), phân trang |
| **Bài học** | List tất cả lessons (kể cả private), badge Official/User, xóa |
| **Thư mục** | List + tạo mới Official Folders, xóa |

Tạo Official Folder: nhập tên + chọn icon emoji → `isOfficial = true` → hiện ở trang chủ.

### 6.11 Profile (`/profile`)

- Xem: username, email, ngày tham gia
- Cập nhật avatar: upload ảnh → Cloudinary → lưu URL vào Firestore + Firebase Auth

---

## 7. Service Layer (→ Spring Boot APIs)

### lessonService

| Method | Firestore Operation | → REST API |
|---|---|---|
| `createLesson()` | addDoc vocabularies + addDoc lessons | `POST /api/lessons` |
| `getLessonsPaginated()` | query + cursor | `GET /api/lessons?page=&size=` |
| `searchLessons()` | fetch all + client filter | `GET /api/lessons/search?q=` |
| `getLesson(id)` | getDoc lesson + getDoc vocab | `GET /api/lessons/{id}` |
| `updateLesson()` | updateDoc vocab + lesson | `PUT /api/lessons/{id}` |
| `deleteLessonById()` | deleteDoc lesson + vocab | `DELETE /api/lessons/{id}` |
| `getMyLessons()` | query by creator | `GET /api/lessons/my` |
| `getOfficialLessons()` | query isOfficial=true | `GET /api/lessons/official` |
| `togglePrivacyLesson()` | updateDoc isPrivate | `PATCH /api/lessons/{id}/privacy` |
| `moveLessonToFolder()` | updateDoc folderId | `PATCH /api/lessons/{id}/folder` |

### folderService

| Method | → REST API |
|---|---|
| `createFolder()` | `POST /api/folders` |
| `getMyFolders()` | `GET /api/folders/my` |
| `getOfficialFolders()` | `GET /api/folders/official` |
| `updateFolder()` | `PUT /api/folders/{id}` |
| `deleteFolder()` | `DELETE /api/folders/{id}` |
| `getLessonsInFolder()` | `GET /api/folders/{id}/lessons` |
| `getAllFoldersPaginated()` | `GET /api/admin/folders?page=&size=` |

### srsService

| Method | → REST API |
|---|---|
| `initializeCardsForLesson()` | `POST /api/srs/lessons/{lessonId}/init` |
| `getUserCards()` | `GET /api/srs/cards` |
| `getDueCardsForUser()` | `GET /api/srs/cards/due` |
| `getCardsForLesson()` | `GET /api/srs/lessons/{lessonId}/cards` |
| `reviewCard()` | `POST /api/srs/cards/{cardId}/review` body: `{ rating }` |
| `startReviewSession()` | `POST /api/srs/sessions` |
| `endReviewSession()` | `PUT /api/srs/sessions/{id}` |

### historyService

| Method | → REST API |
|---|---|
| `saveStudySession()` | `POST /api/history/sessions` |
| `getUserStudyHistory()` | `GET /api/history/sessions` |
| `getUserDailyActivity()` | `GET /api/history/daily` |
| `getStudyStats()` | `GET /api/history/stats` (compute server-side) |

### userService / Auth

| Method | → REST API |
|---|---|
| `registerUser()` | `POST /api/auth/register` |
| `loginUser()` | `POST /api/auth/login` → trả JWT |
| `getUserInfo()` | `GET /api/users/me` |
| `updateUserAvatar()` | `POST /api/users/me/avatar` (multipart) |
| `getPaginatedUsers()` | `GET /api/admin/users?page=&size=` |
| `leaderboardService.getLeaderboard()` | `GET /api/leaderboard` |

---

## 8. Giao diện (UI/UX)

### Layout chung

- **Header** (sticky top): Logo, navigation links, avatar dropdown
  - Logo + tên app
  - Links: Trang chủ, Bài học của tôi, Ôn tập SRS, Lịch sử, Bảng xếp hạng
  - User dropdown: Profile, Đăng xuất
  - Admin badge nếu role = ADMIN
- **Main content**: `max-w-7xl mx-auto p-4 md:p-8`
- **Background**: `bg-gradient-to-br from-cyan-100 to-blue-200` (toàn trang)

### Color scheme

| Màu | Hex | Dùng cho |
|---|---|---|
| Primary Blue | `#2563EB` | Buttons chính, header table, links |
| Emerald | `#10B981` | Nút "Ôn tập" |
| Amber | `#F59E0B` | Nút "Kiểm tra" |
| Purple | `#7C3AED` | TestPage, SRS |
| Teal | `#0D9488` | Profile page |
| Red | `#EF4444` | Delete, wrong answers |

### Component chính

| Component | Mô tả |
|---|---|
| `ActivityHeatmap` | Calendar heatmap 1 năm, màu theo số phiên học |
| `Flashcard` | Card flip 3D, hiển thị word/definition/IPA/example, TTS button |
| `Pagination` | Previous/Next + page numbers, cursor-based |
| `ConfirmModal` | Dialog xác nhận xóa |
| `ExerciseSelectionModal` | Chọn chế độ học từ danh sách bài |
| `ReviewCard` | Card trong SRS, hiện từ → hiện nghĩa → 4 rating buttons |
| `LessonCard` | Card hiển thị bài học trong grid |
| `FolderCard` | Card thư mục với icon + màu |
| `LoadingScreen` | Full-screen spinner |

---

## 9. Lưu ý khi chuyển sang Next.js + Spring Boot

### Backend (Spring Boot)

1. **Auth**: Thay Firebase Auth bằng JWT (Spring Security + JWT). Cần lưu `refreshToken` để auto-renew.
2. **Email verification**: Implement `sendVerificationEmail()` + endpoint `POST /auth/verify-email?token=`.
3. **Database schema:**
   - `users` table: id (UUID), username, email, password_hash, photo_url, role, created_at, email_verified
   - `lessons` table: id, title, creator_id, description, word_count, is_private, is_official, folder_id, created_at
   - `vocabulary_items` table: id, lesson_id, word, definition, ipa, word_type, example_en, example_vi, order_index
   - `folders` table: id, name, description, creator_id, color, icon, lesson_count, is_official, created_at
   - `srs_cards` table: id, word_id, word, definition, user_id, lesson_id, ease_factor, interval, repetitions, next_review, last_review, total_reviews, correct_count, incorrect_count, streak, created_at, updated_at
   - `study_sessions` table: id, user_id, lesson_id, lesson_title, study_mode, time_spent, know_count, total_count, created_at
   - `review_sessions` table: id, user_id, lesson_id, start_time, end_time, cards_reviewed, correct_count, total_time

4. **Leaderboard**: JOIN study_sessions GROUP BY user_id SUM(time_spent) — rất đơn giản với SQL.
5. **SRS Algorithm**: Port hàm `calculateNextReview()` từ TypeScript sang Java (utils/SRSAlgorithm.java).
6. **File upload**: Giữ Cloudinary hoặc chuyển sang AWS S3 + Spring Cloud AWS.
7. **Search**: Dùng `ILIKE` PostgreSQL hoặc tích hợp Elasticsearch cho production.
8. **Pagination**: Dùng Spring Data `Pageable` thay cursor-based.

### Frontend (Next.js)

1. **Routing**: Map 1:1 với React Router routes → Next.js App Router
   - `/app/(public)/login/page.tsx`
   - `/app/(protected)/page.tsx` (Home)
   - `/app/(protected)/study/[lessonId]/page.tsx`
   - `/app/(admin)/admin/page.tsx`
2. **Auth**: Thay `useAuth` hook bằng NextAuth.js hoặc tự implement JWT với `httpOnly cookie`
3. **State**: Thay `sessionStorage` bằng Zustand hoặc React Context + cookie
4. **API calls**: Dùng Axios với interceptors (auto-attach JWT Bearer token)
5. **SRS Algorithm**: Chuyển sang server-side (Spring Boot tính toán, FE chỉ hiện kết quả)

---

## 10. Sơ đồ luồng chính

### Luồng học Flashcard

```
User vào /study/:lessonId
  → Fetch lesson + vocabulary từ API
  → Hiển thị flashcard đầu tiên
  → User flip card (xem nghĩa)
  → User nhấn "Đã thuộc" / "Chưa thuộc"
  → Lặp lại bỏ qua từ "Đã thuộc"
  → Khi hết → POST /api/history/sessions (mode: flashcard)
  → POST /api/srs/lessons/{id}/init (tạo SRS cards nếu chưa có)
  → Hiện CompletionScreen
```

### Luồng SRS Review

```
User vào /srs-review
  → GET /api/srs/cards/due (lấy cards có nextReview <= now)
  → Nếu không có → redirect về trang chủ
  → POST /api/srs/sessions (tạo review session)
  → Lặp từng card:
      → Hiện từ (ẩn nghĩa)
      → User nhấn "Hiện đáp án"
      → User chọn rating (Again/Hard/Good/Easy)
      → POST /api/srs/cards/{id}/review { rating }
          → Server tính SM-2 → update nextReview, interval, easeFactor
  → Kết thúc → PUT /api/srs/sessions/{id} (stats)
  → POST /api/history/sessions (mode: srs_review)
```

### Luồng Admin tạo bài học hệ thống

```
Admin vào /admin/create-lesson
  → Điền title, description, vocabulary list (hoặc import Excel)
  → Submit → POST /api/lessons { isOfficial: true, folderId: "..." }
  → Server tạo lesson + vocabulary_items
  → Redirect về /admin
  → Bài học xuất hiện ở trang chủ trong thư mục tương ứng
```
