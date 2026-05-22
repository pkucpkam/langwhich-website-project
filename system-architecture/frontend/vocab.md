# 📚 Kiến trúc Module Học Từ Vựng (Vocabulary Client Architecture)

Tài liệu này chi tiết hóa luồng xử lý giao diện, quản lý state và tích hợp API cho các chế độ học từ vựng phía Client (Next.js) bao gồm: **Flashcard (Thẻ ghi nhớ)**, **Review (Trắc nghiệm)**, **Test (Điền từ)**, và **SRS Review (Ôn tập ngắt quãng)**.

---

## 1. Màn hình Học Flashcard (`/study/[lessonId]`)

Chế độ học Flashcard cho phép người dùng học từ vựng bằng thẻ 3D lật tương tác, tự phân loại từ đã thuộc hoặc cần học lại.

### Sơ đồ Logic Quản lý State:

```mermaid
graph TD
    INIT[1. Fetch Lesson & Vocab] --> LOAD[2. Khởi tạo State]
    LOAD -->|List từ vựng gốc| CURR[3. Hiển thị Card tại index]
    
    CURR -->|Nhấn phím cách / Click| FLIP[Lật Card: Xem Nghĩa / IPA / Ví dụ]
    CURR -->|Chọn Chưa thuộc| STILL[Thêm vào Still Learning Set]
    CURR -->|Chọn Đã thuộc| KNOWN[Thêm vào Known Set]
    
    STILL --> NEXT[Tăng index lên 1]
    KNOWN --> NEXT
    
    NEXT --> CHECK{Đã duyệt hết list?}
    CHECK -->|Chưa| CURR
    CHECK -->|Rồi & Still Learning còn từ| REPLAY[Lọc lại list chỉ giữ từ Chưa thuộc]
    REPLAY --> CURR
    CHECK -->|Rồi & Still Learning rỗng| COMP[4. Hiển thị Hoàn thành & Gửi API]
```

### Triển khai State tại Component:
Màn hình Flashcard không dùng global store mà quản lý bằng local state phối hợp để đạt hiệu năng tối ưu (tránh re-render không đáng có):
* `words`: Danh sách từ vựng hiện đang học trong vòng lặp này.
* `currentIndex`: Vị trí thẻ hiện tại.
* `isFlipped`: Trạng thái lật của thẻ hiện tại.
* `knownIds` & `learningIds`: Danh sách phân loại từ để tính toán % tiến trình học.
* **Text-to-Speech Hook (`useSpeechSynthesis`)**: Cho phép click vào icon loa để phát âm chuẩn từ vựng bằng Web Speech API.

### Tích hợp Backend APIs:
Khi hoàn thành (tất cả từ đều nằm trong `Known Set`):
1. **Lưu lịch sử**: Gửi request `POST /api/v1/history/sessions` thông qua `historyApi.saveStudySession` với `studyMode: 'flashcard'`.
2. **Khởi tạo SRS**: Gửi request `POST /api/v1/srs/lessons/{lessonId}/init` để tự động tạo thẻ Spaced Repetition (SRS) trên server cho bộ từ này.

---

## 2. Màn hình Trắc nghiệm (`/review/[lessonId]`)

Chế độ ôn tập trắc nghiệm tự động sinh ra 4 đáp án lựa chọn cho từng từ vựng dựa trên danh sách từ hiện tại của bài học.

### Logic Sinh Đáp Án Nhiễu (Distractors Generator):
Để đảm bảo trải nghiệm học tốt, 3 lựa chọn sai (nhiễu) được tạo ra động:
1. Lấy tất cả từ trong bài học loại trừ từ hiện tại.
2. Xáo trộn ngẫu nhiên danh sách.
3. Chọn ra 3 định nghĩa đầu tiên.
4. Trộn 3 định nghĩa này với định nghĩa đúng của từ hiện tại thành danh sách 4 phần tử xáo trộn.

### Luồng lưu trữ tiến trình:
* Khi hoàn thành toàn bộ bài trắc nghiệm, client tính toán `correctCount` và `totalCount`.
* Thực hiện gọi `historyApi.saveStudySession` với `studyMode: 'review'` kèm thông tin thời gian làm bài (`timeSpent`).

---

## 3. Màn hình Kiểm tra Điền Từ (`/test/[lessonId]`)

Chế độ kiểm tra viết giúp tăng khả năng ghi nhớ chính tả của từ vựng một cách tối đa.

### Logic hiển thị trợ giúp trực quan (Input Guide Lines):
* Với từ cần điền (Ví dụ: `apple`), client hiển thị gợi ý độ dài dưới dạng các gạch dưới phân tách: `_ _ _ _ _`.
* Khi người dùng gõ vào ô input:
  * Client tự động so khớp từng ký tự (case-insensitive).
  * Ký tự gõ đúng sẽ hiển thị đè lên gạch dưới (`a p _ _ _`).
  * Ký tự sai sẽ giữ nguyên ký tự gạch dưới để gợi ý cho người dùng.
* Hỗ trợ phím tắt `Enter` để Submit nhanh và `Ctrl + Space` để Skip (Bỏ qua từ).

---

## 4. Màn hình Ôn tập SRS Thông Minh (`/srs-review`)

Trang ôn tập ngắt quãng cá nhân hóa hàng ngày, tự động tải các từ đã đến hạn kiểm tra (due) của người dùng dựa theo thuật toán SM-2.

### Luồng State & Giao tiếp API:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Page as SRS Review Page
    participant API as srsApi
    
    User->>Page: Truy cập trang /srs-review
    Page->>API: GET /api/v1/srs/cards/due (Lấy thẻ đến hạn)
    alt Không có thẻ nào đến hạn
        API-->>Page: Trả về mảng rỗng
        Page-->>User: Hiện thông báo hoàn thành xuất sắc
    else Có thẻ đến hạn
        API-->>Page: Trả về danh sách thẻ SRS
        Note over Page: Khởi tạo Review Session trên UI
        
        loop Mỗi thẻ từ vựng
            Page->>User: Hiển thị Từ tiếng Anh (Ẩn Nghĩa)
            User->>Page: Nhấn "Hiện đáp án" (Show definition)
            Page->>User: Hiển thị Định nghĩa, IPA, Ví dụ + 4 nút Rating (Again, Hard, Good, Easy)
            User->>Page: Chọn 1 mức đánh giá (ví dụ: Good)
            Page->>API: POST /api/v1/srs/cards/{id}/review { rating: 4 }
            API-->>Page: Trả về kết quả cập nhật (nextReview, easeFactor)
            Note over Page: Chuyển sang thẻ tiếp theo
        end
        
        Page->>API: POST /api/v1/history/sessions (Lưu lịch sử ôn tập srs_review)
        Page-->>User: Hiển thị màn hình tổng kết phiên ôn tập
    end
```
**Chi tiết API tương tác:**
* `srsApi.getDueCards()`: Fetch danh sách thẻ SRS đến hạn.
* `srsApi.reviewCard(cardId, rating)`: Gửi đánh giá độ khó lên server ngay lập tức cho từng thẻ để server tính toán khoảng cách ôn tập tiếp theo (SM-2 Algorithm).
