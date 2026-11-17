# QUIZ SOLVER EXTENSION

Extension đơn giản dùng để hiển thị đáp án của các câu hỏi trên [**quiz.com**](https://quiz.com) ngay trong Console của trình duyệt.

## Cài đặt

1. Clone repository:

   ```bash
   git clone https://github.com/vuhieu0808/QuizSolverExtension.git
   ```

2. Mở `chrome://extensions/` (hoặc trang quản lý extension của trình duyệt Chromium).

3. Bật **Developer mode** (Góc trên bên phải).

4. Chọn **Load unpacked** và chọn thư mục của project.

## Cách sử dụng

1. Truy cập [**https://quiz.com**](https://quiz.com).
2. Extension sẽ tự động chạy.
3. Nhấn **F12** → mở tab **Console**.
4. Mỗi khi xuất hiện câu hỏi mới, đáp án sẽ được in ra Console.

Thông tin hiển thị bao gồm:

- Loại câu hỏi
- Nội dung câu hỏi
- Đáp án đúng

Extension hỗ trợ các dạng câu hỏi phổ biến như:

- Classic
- TypeAnswer
- CheckBoxes
- Reorder
- Range

## Lưu ý

- Extension chỉ hoạt động trên [**quiz.com**](https://quiz.com).
- Không có giao diện người dùng, mọi kết quả đều được hiển thị trong **Console** của DevTools.