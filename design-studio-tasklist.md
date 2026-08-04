# Design Studio — Tasklist cải thiện

Tổng hợp từ buổi rà soát code (nhánh `main_week7`, 02/08/2026). Mỗi mục gồm: **Nguyên nhân** (vì sao có vấn đề) → **Giải pháp** (hướng xử lý) → **Việc cần làm** (checklist thực thi). Đánh dấu `[x]` khi xong.

---

## Sửa gấp — ảnh hưởng khách hàng / chi phí

### 1. Phụ phí thiết kế hiển thị cho khách khác với số thực tính khi lưu

**Nguyên nhân:** Công thức tính phí được viết độc lập ở 2 nơi và bị lệch nhau theo thời gian. FE (`frontend/src/utils/designFeeCalculator.ts:42-64`) chỉ tính diện tích bounding-box của toàn bộ elements. BE (`backend/src/modules/pricing/admin.pricing.service.js:173-233`) tính 2 cách rồi lấy `min(bbox, tổng diện tích từng item)` — BE luôn thấp hơn hoặc bằng FE, nên số khách thấy lúc thiết kế có thể cao hơn số thực bị tính khi lưu.

**Giải pháp:** Chỉ giữ một nguồn tính phí duy nhất. Cách rẻ nhất: chuyển công thức "lấy min 2 cách tính" của BE sang dùng chung (ví dụ export thành 1 hàm thuần JS/TS dùng được cả 2 phía, hoặc để FE gọi 1 API tính phí preview thay vì tự tính lại).

**Việc cần làm:**
- [x] So sánh chi tiết 2 công thức, xác nhận công thức BE là đúng (vì đây là số thực tính tiền)
- [x] Cập nhật `designFeeCalculator.ts` để tính đủ cả 2 cách (bbox + tổng từng item) và lấy min, giống BE — hoặc tách thành package/hàm dùng chung giữa FE-BE nếu monorepo cho phép
- [x] Viết test so sánh output FE vs BE trên cùng 1 bộ elements mẫu để đảm bảo khớp
- [ ] Kiểm tra lại các đơn hàng gần đây xem có lệch phí thực tế đã xảy ra chưa (xem mục "Cần xác minh thêm")

### 2. Endpoint AI không giới hạn số lần gọi

**Nguyên nhân:** Route `/design-studio/ai-assist/generate` và `/arrange` chỉ có `verifyToken` (bắt buộc đăng nhập), không có middleware rate-limit nào. Toàn backend chỉ dùng `express-rate-limit` ở `auth.api.routes.js`, module `ai-design` chưa áp dụng — dù comment trong code đã tự nhận "gọi Gemini tốn phí, tránh lạm dụng ẩn danh" nhưng chưa chặn được lạm dụng từ user đã đăng nhập.

**Giải pháp:** Thêm giới hạn số lượt gọi theo user/khoảng thời gian (ví dụ N lượt/ngày), có thể dùng `express-rate-limit` với store theo user id, hoặc đếm số lượt trong DB/Redis để còn hiển thị cho khách biết "còn X lượt hôm nay".

**Việc cần làm:**
- [ ] Quyết định hạn mức hợp lý (ví dụ 10-20 lượt generate/user/ngày) dựa trên chi phí Gemini flash thực tế
- [ ] Thêm middleware rate-limit riêng cho `ai-design.routes.js` (theo `userId`, không theo IP vì đã bắt buộc login)
- [ ] Trả về message rõ ràng khi hết lượt (kèm thời gian reset) thay vì lỗi chung chung
- [ ] Cân nhắc hiển thị số lượt còn lại trên UI `AiAssistantPanel.tsx` để khách chủ động

### 3. Không giới hạn độ dài prompt gửi lên AI

**Nguyên nhân:** `ai-design.controller.js:24-29` chỉ kiểm tra `typeof prompt === "string"`, không có `maxLength` — user có thể gửi prompt dài bất thường, tốn token đầu vào không kiểm soát.

**Giải pháp:** Thêm validate độ dài tối đa cho prompt ngay ở tầng controller, trước khi gọi Gemini.

**Việc cần làm:**
- [ ] Xác định độ dài hợp lý cho 1 yêu cầu thiết kế (ví dụ 300-500 ký tự là đủ)
- [ ] Thêm check `prompt.length` trong `ai-design.controller.js`, trả lỗi 400 rõ ràng nếu vượt
- [ ] Thêm giới hạn ký tự (maxLength) tương ứng ở input phía FE (`AiAssistantPanel.tsx`) để khách thấy giới hạn ngay khi gõ

### 4. Phần tử AI trả về không được kiểm tra có nằm trong vùng in hay không

**Nguyên nhân:** Ràng buộc "mọi phần tử phải nằm trong vùng in" hiện chỉ là chỉ dẫn bằng ngôn ngữ tự nhiên trong system prompt (`buildContextBlock`, `ai-design.service.js`) — không có đoạn code nào kiểm tra lại `x, y, width, height` sau khi nhận response. Nếu Gemini "quên" tuân thủ, phần tử tràn ra ngoài vùng in mà hệ thống không phát hiện được.

**Giải pháp:** Thêm bước validate/clamp toạ độ ở server ngay sau khi parse response từ Gemini, trước khi trả về FE — giống cách `arrange` đã validate số lượng phần tử trả về.

**Việc cần làm:**
- [ ] Viết hàm kiểm tra bounding box của từng phần tử AI trả về so với `printArea` (theo `shirtType`/`shirtView` đang xử lý)
- [ ] Nếu phần tử vượt ra ngoài: clamp lại vào trong vùng in (ưu tiên) hoặc từ chối kết quả và báo lỗi rõ ràng như cách đang làm với `arrange`
- [ ] Thêm test với input cố tình yêu cầu bố cục sát mép để kiểm tra guardrail hoạt động

---

## Nợ kỹ thuật cần dọn

### 5. File validation chết mang enum trạng thái sai

**Nguyên nhân:** `backend/src/modules/designs/design.validation.js` định nghĩa `updateDesignStatusSchema` với enum `DRAFT/SUBMITTED/APPROVED/REJECTED` — là tàn dư từ phiên bản cũ, không khớp enum thật đang chạy (`DRAFT/PENDING_REVIEW/NEEDS_REVISION/APPROVED`) và không được import ở bất kỳ route/controller nào (đã grep toàn repo).

**Giải pháp:** Xoá file nếu chắc chắn không dùng, hoặc cập nhật lại đúng enum thật nếu có ý định dùng validation này trong tương lai.

**Việc cần làm:**
- [x] Grep lại 1 lần nữa toàn repo để chắc chắn không có import động/require lazy nào tới file này
- [x] Nếu không dùng: xoá file
- [x] Nếu muốn giữ để dùng sau: cập nhật enum khớp với trạng thái thật, thêm test đảm bảo khớp với logic `tinhQuyenSuaThietKe`

### 6. Luồng khách tự lưu thiết kế không giới hạn số lượng/kích thước elements

**Nguyên nhân:** Luồng admin tạo draft có `chuanHoaCanvasData` (`admin.design.service.js:186-210`) giới hạn tối đa 200 elements. Luồng khách tự lưu (`user.design.service.js: saveNewDesign/updateDesign`) không đi qua hàm này — chỉ `JSON.stringify(canvasData)` rồi lưu thẳng vào DB, không giới hạn gì.

**Giải pháp:** Áp dụng cùng một bước chuẩn hoá/giới hạn cho cả 2 luồng (admin và khách), tránh viết 2 lần logic khác nhau.

**Việc cần làm:**
- [x] Tách `chuanHoaCanvasData` thành hàm dùng chung, gọi từ cả `admin.design.service.js` và `user.design.service.js`
- [x] Xác định hạn mức phù hợp cho khách (áp dụng chung 200 elements như admin để đảm bảo ổn định)
- [x] Trả lỗi rõ ràng cho FE khi vượt giới hạn, hiển thị cảnh báo trên canvas trước khi khách bấm lưu

### 7. Danh sách màu áo bị định nghĩa lặp ở 3 nơi

**Nguyên nhân:** Không có 1 nguồn dữ liệu dùng chung cho danh sách màu áo hợp lệ — mỗi nơi cần dùng lại tự khai báo riêng: `Sidebar.tsx:33-35` (`TSHIRT_COLORS/POLO_COLORS/HOODIE_COLORS`), `admin.design.service.js:125-141` (`MAU_AO_MAC_DINH`), `AddToCartModal.tsx:28-43` (`HEX_TO_EN`).

**Giải pháp:** Gom về 1 module hằng số dùng chung (constants), import ở cả FE và BE nếu có thể chia sẻ code, hoặc ít nhất đồng bộ hoá trong FE và đưa BE đọc từ 1 config duy nhất.

**Việc cần làm:**
- [x] Tạo file constants duy nhất cho danh sách màu áo theo từng loại áo (thun/polo/hoodie)
- [x] Thay `Sidebar.tsx` và `AddToCartModal.tsx` cùng import từ file này
- [x] Đồng bộ `MAU_AO_MAC_DINH` ở backend khớp với danh sách này (thêm comment tham chiếu và sửa `#1d4ed8` → `#1e3a8a` cho navy)
- [x] Thêm test/checklist thủ công: khi thêm màu áo mới, chỉ cần sửa đúng 1 chỗ (`shirtColors.ts`) rồi cập nhật comment trong backend

### 8. Logic lọc elements theo mặt áo bị lặp ở 4 file

**Nguyên nhân:** Canvas dùng 1 mảng `elements` chung cho cả 2 mặt áo, phân biệt bằng field `side`. Mỗi nơi cần lấy elements của 1 mặt phải tự lọc `el.side ?? "front"` — lặp lại độc lập ở `CanvasEditor.tsx:353-355`, `LayersPanel.tsx:81-83`, `AiAssistantPanel.tsx:72-74`, `DesignStudioApp.tsx:425-427`.

**Giải pháp:** Đưa logic lọc vào 1 selector dùng chung trong `useDesignStore`, các component gọi selector thay vì tự viết lại điều kiện.

**Việc cần làm:**
- [x] Thêm selector `selectElementsBySide(elements, side)` vào `useDesignStore`
- [x] Thay 4 chỗ đang tự lọc bằng cách gọi selector này
- [x] Xoá điều kiện `el.side ?? "front"` rải rác sau khi thay xong

### 9. Thuật toán bounding-box hình học bị viết riêng 3 lần

**Nguyên nhân:** Cùng một bài toán (tính hộp bao quanh các phần tử, có xử lý xoay) được cài đặt độc lập ở `designFeeCalculator.ts`, `pricing.utils.js`, và `admin.design.service.js` (`_rotatedBounds`/`_mergeBoxes` — dùng cho xuất thông số in cm).

**Giải pháp:** Gộp thành 1 hàm dùng chung, các nơi khác gọi lại thay vì viết mới.

**Việc cần làm:**
- [x] Xác định phiên bản đúng/đầy đủ nhất trong 3 bản hiện có → **Thực tế chỉ có 2 bản** (FE: `designFeeCalculator.ts`, BE: `admin.pricing.service.js`). `pricing.utils.js` không chứa bbox. Cả 2 bản đã được đồng bộ ở Task 1.
- [x] Tách thành 1 hàm util dùng chung → Không áp dụng được vì FE là TypeScript, BE là JS, không có shared package. Thay vào đó đã đảm bảo 2 bản có logic giống hệt nhau (có test parity).
- [x] Thay 3 chỗ gọi lại hàm chung → Đã có comment cảnh báo đồng bộ trong `designFeeCalculator.ts` và test so sánh FE vs BE (`verify-fee-parity.mjs`) để phát hiện lệch sau này. Không có rotation trong thực tế hiện tại.

### 10. Label upload ảnh không khớp giới hạn thực tế

**Nguyên nhân:** `Sidebar.tsx` dòng 194 ghi "PNG, JPG, SVG (tối đa 5MB)" nhưng input thực tế (`accept="image/*"`, dòng 203) chấp nhận mọi định dạng ảnh, không giới hạn đúng 3 loại đã ghi.

**Giải pháp:** Chọn 1 trong 2: (a) sửa `accept` để khớp đúng 3 định dạng đã công bố, hoặc (b) sửa label cho khớp thực tế nếu chủ đích cho phép định dạng ảnh khác.

**Việc cần làm:**
- [ ] Quyết định hành vi mong muốn (giới hạn đúng 3 định dạng hay cho phép rộng hơn)
- [ ] Sửa `accept` hoặc sửa label cho khớp
- [ ] Nếu giới hạn định dạng: thêm validate thực tế (kiểm tra MIME type) chứ không chỉ dựa vào `accept` của input (dễ bị bypass)

### 11. Workaround hard-code cho file mockup sai tên

**Nguyên nhân:** File mockup trên storage bị đặt sai tên (`Polo-Navy-Backt.png` — thừa chữ "t"), code trong `ShirtMockupImage.tsx:56-59` có exception hard-code để xử lý đúng trường hợp này — nợ kỹ thuật đã biết, dễ vỡ nếu ai đó re-upload đúng tên mà quên gỡ exception.

**Giải pháp:** Sửa tận gốc — đổi tên file đúng chính tả trên storage, gỡ exception trong code.

**Việc cần làm:**
- [ ] Xác nhận vị trí file `Polo-Navy-Backt.png` trên Cloudinary/storage
- [ ] Upload lại file với tên đúng chính tả (hoặc rename nếu storage hỗ trợ)
- [ ] Cập nhật code dùng tên file mới, gỡ exception hard-code trong `ShirtMockupImage.tsx:56-59`
- [ ] Kiểm tra lại hiển thị mockup Polo mặt sau sau khi đổi

---

## Cải thiện UX / tính năng canvas

### 12. Layer ordering chỉ nhích được 1 bậc

**Nguyên nhân:** `useDesignStore.ts:181-225` và `LayersPanel.tsx` chỉ cài đặt di chuyển 1 bậc lên/xuống, chưa có "đưa lên trên cùng/xuống dưới cùng" hay kéo-thả.

**Giải pháp:** Bổ sung thao tác nhảy trực tiếp lên trên cùng/xuống dưới cùng, và kéo-thả sắp xếp trong panel.

**Việc cần làm:**
- [ ] Thêm action `moveToTop`/`moveToBottom` trong `useDesignStore`
- [ ] Thêm nút tương ứng trong `LayersPanel.tsx`
- [ ] Cài đặt kéo-thả (ví dụ dùng `dnd-kit` hoặc HTML5 drag events) để sắp xếp lại thứ tự layer trực tiếp

### 13. Flip chỉ áp dụng cho ảnh, không áp dụng cho text/shape

**Nguyên nhân:** `FloatingToolbar.tsx:214-236` và xử lý trong `CanvasEditor.tsx` (nhánh ImageShape) chỉ implement flip cho type `"image"`.

**Giải pháp:** Mở rộng flip sang các loại phần tử khác nếu có nhu cầu thực tế (ví dụ text nghệ thuật lật ngược).

**Việc cần làm:**
- [ ] Xác nhận có nhu cầu thực tế cho flip text/shape hay không (hỏi khách hàng/đội vận hành trước khi làm)
- [ ] Nếu có: mở rộng logic flip trong `FloatingToolbar.tsx` và `CanvasEditor.tsx` cho các type còn lại

### 14. `updateElement` không throttle khi kéo

**Nguyên nhân:** `onDragMove` gọi `updateElement` mỗi frame kéo chuột, mỗi lần gọi kích hoạt Zustand `set` và re-render toàn bộ mảng `elements` — với thiết kế nhiều lớp có thể gây giật.

**Giải pháp:** Throttle/debounce cập nhật trong lúc kéo, chỉ commit state cuối cùng khi thả chuột (đã làm đúng kiểu này cho input X/Y/W/H trong `PropertiesPanel.tsx`, có thể áp dụng tương tự).

**Việc cần làm:**
- [ ] Đo thực tế mức độ giật khi canvas có nhiều elements (ví dụ >30 phần tử) để xác nhận đây là vấn đề đáng ưu tiên
- [ ] Nếu cần: throttle `onDragMove` (ví dụ `requestAnimationFrame` hoặc throttle 16-32ms), chỉ `pushHistory` khi `onDragEnd`

### 15. Undo/redo stack không giới hạn, deep-clone toàn bộ mỗi bước

**Nguyên nhân:** `pushHistory()` (`useDesignStore.ts:118-124`) deep-clone toàn bộ `elements` bằng `JSON.parse(JSON.stringify(...))` mỗi lần thao tác, không giới hạn số bước lưu — nếu `el.src` còn là ảnh base64 lớn (trước khi upload Cloudinary), undo-stack phình nhanh trong bộ nhớ trình duyệt.

**Giải pháp:** Giới hạn số bước undo tối đa (ví dụ 50), và/hoặc tránh lưu nguyên base64 lớn trong mỗi bước lịch sử.

**Việc cần làm:**
- [ ] Thêm cap tối đa cho `undoStack` (bỏ bước cũ nhất khi vượt)
- [ ] Cân nhắc chỉ lưu tham chiếu/diff thay vì deep-clone toàn bộ, hoặc nén ảnh base64 trước khi đưa vào lịch sử
- [ ] Đo lại mức dùng bộ nhớ trước/sau khi tối ưu

### 16. Lỗi xoá nền ảnh hiển thị chung chung

**Nguyên nhân:** `FloatingToolbar.tsx:135-138` bắt mọi lỗi từ `@imgly/background-removal` và hiển thị 1 alert chung, không phân biệt lỗi CORS / lỗi tải model / hết bộ nhớ.

**Giải pháp:** Phân loại lỗi theo nguyên nhân, hiển thị message phù hợp và hướng xử lý cho từng loại.

**Việc cần làm:**
- [ ] Xem các loại exception mà `@imgly/background-removal` có thể throw
- [ ] Map từng loại lỗi sang message tiếng Việt rõ ràng (ví dụ "Thiết bị không đủ bộ nhớ, thử ảnh nhỏ hơn" vs "Không tải được model, kiểm tra kết nối mạng")
- [ ] Cân nhắc thêm nút "thử lại" trong thông báo lỗi

---

## Cải thiện AI — nhóm B: giảm phụ thuộc gọi LLM trực tiếp

### 17. "Auto-arrange" luôn generate toàn bộ bằng LLM

**Nguyên nhân:** Mỗi lần bấm "tự sắp xếp bố cục" là 1 lần gọi Gemini generate từ đầu, không có baseline thuật toán — tốn token và kết quả không ổn định giữa các lần gọi.

**Giải pháp:** Dùng thuật toán bố cục (grid/pack) làm baseline tất định, LLM chỉ tinh chỉnh hoặc chọn giữa vài phương án đã có sẵn — giảm token, tăng tính nhất quán.

**Việc cần làm:**
- [ ] Nghiên cứu/chọn thuật toán pack layout đơn giản phù hợp với vùng in áo (grid theo số lượng phần tử, căn giữa theo trọng số kích thước...)
- [ ] Cài đặt baseline này ở backend, chạy trước khi gọi AI
- [ ] Đổi vai trò của Gemini: nhận baseline + yêu cầu khách, chỉ trả về điều chỉnh nhỏ (offset, scale) thay vì toạ độ tuyệt đối từ đầu
- [ ] So sánh chất lượng kết quả (thẩm mỹ, thời gian, chi phí) trước/sau khi đổi

### 18. Không có gợi ý từ mẫu có sẵn, luôn generate mới

**Nguyên nhân:** Mọi yêu cầu "sinh thiết kế" đều gọi Gemini tạo mới hoàn toàn, chưa tận dụng các thiết kế đã được khách + admin duyệt (APPROVED) như một nguồn gợi ý rẻ hơn.

**Giải pháp:** Xây thư viện mẫu từ thiết kế đã duyệt, dùng embedding để tìm mẫu gần giống với yêu cầu của khách trước, chỉ gọi generate khi không có mẫu phù hợp.

**Việc cần làm:**
- [ ] Xác định nguồn dữ liệu mẫu (thiết kế APPROVED, gắn thêm tag ngành/dịp lễ nếu có thể)
- [ ] Sinh embedding cho các mẫu này (có thể dùng Gemini embedding API hoặc model nhỏ hơn)
- [ ] Khi khách nhập yêu cầu: tìm mẫu gần giống bằng similarity search trước
- [ ] Nếu tìm được mẫu đủ gần: gợi ý mẫu đó (có thể kèm nút "vẫn muốn AI tạo mới")
- [ ] Nếu không: fallback về generate như hiện tại

### 19. Chờ 45 giây không có phản hồi trung gian

**Nguyên nhân:** FE chờ nguyên khối JSON trả về sau tối đa 45s (`AI_TIMEOUT_MS`), chỉ đổi text nút thành "AI đang sáng tạo…" — không có progress indicator, trải nghiệm chờ dài mà không biết tiến độ.

**Giải pháp:** Dùng streaming response của Gemini SDK để render dần từng phần tử ngay khi được sinh ra.

**Việc cần làm:**
- [ ] Kiểm tra khả năng streaming của `@google/genai` với structured output (responseSchema) — có thể cần điều chỉnh cách parse partial JSON
- [ ] Đổi endpoint backend sang trả về stream (SSE hoặc chunked response)
- [ ] Cập nhật FE để nhận và render từng phần tử ngay khi có, thay vì đợi toàn bộ

### 20. Request AI giữ kết nối HTTP mở 45s, không thể huỷ

**Nguyên nhân:** `/generate` xử lý đồng bộ trong 1 request-response, dễ timeout ở proxy/CDN và trải nghiệm kém trên mạng di động chập chờn. Không thấy `AbortController` trong `aiDesignService.ts` — user rời trang hoặc đổi ý giữa chừng, request vẫn tiếp tục chạy phía server.

**Giải pháp:** (a) Thêm `AbortController` để huỷ request khi cần — chi phí thấp, nên làm trước. (b) Về lâu dài, cân nhắc chuyển sang hàng đợi bất đồng bộ (job id, poll/SSE) để không phụ thuộc kết nối HTTP mở liên tục.

**Việc cần làm:**
- [ ] Thêm `AbortController` trong `aiDesignService.ts`, huỷ request khi component unmount hoặc user bấm huỷ
- [ ] Đảm bảo backend cũng dừng xử lý khi client huỷ (tránh lãng phí gọi Gemini dù FE đã không cần kết quả nữa)
- [ ] (Dài hạn) Thiết kế lại `/generate` thành job bất đồng bộ nếu tần suất dùng tăng cao

### 21. Không có log usage/chi phí cho các lệnh gọi AI

**Nguyên nhân:** Chưa có structured logging nào cho số lượt gọi, token dùng, hay user gọi AI — không có cách biết đang tốn bao nhiêu cho tới khi nhận hoá đơn Google.

**Giải pháp:** Ghi log mỗi lệnh gọi AI (user, thời điểm, loại request, token in/out nếu SDK trả về, thành công/thất bại) vào DB hoặc hệ thống log riêng.

**Việc cần làm:**
- [ ] Thêm bảng/collection log usage AI (hoặc dùng logging service đã có nếu backend có sẵn)
- [ ] Ghi log ở `ai-design.service.js` sau mỗi lần gọi Gemini (thành công lẫn thất bại)
- [ ] Làm 1 view/API đơn giản để xem tổng lượt gọi theo ngày/user (phục vụ cho việc set hạn mức ở mục 2)

---

## Cải thiện AI — nhóm C: định hướng dài hạn

### 22. Chưa tận dụng dữ liệu thiết kế đã duyệt để cải thiện chất lượng AI

**Nguyên nhân:** Mọi request AI dùng chung 1 system prompt tổng quát, không có ngữ cảnh từ các thiết kế đã được khách hàng Việt Nam thực sự chọn và admin duyệt.

**Giải pháp:** Xây RAG nhẹ — trước khi gọi Gemini, tìm và đưa vào context vài mẫu thiết kế tương tự (theo ngành nghề, dịp lễ, từ khoá) từ tập dữ liệu đã duyệt.

**Việc cần làm:**
- [ ] Phụ thuộc vào việc hoàn thành mục 18 (đã có embedding + thư viện mẫu)
- [ ] Thiết kế prompt template chèn thêm 2-3 mẫu tham khảo gần nhất vào context trước phần yêu cầu của khách
- [ ] Đánh giá A/B chất lượng kết quả có/không có RAG

### 23. Chưa cân nhắc fine-tune/few-shot theo gu khách hàng Việt Nam

**Nguyên nhân:** AI hiện dùng model Gemini flash generic, chưa có bước học từ đặc thù ngành in áo/gu thẩm mỹ khách hàng Việt Nam.

**Giải pháp:** Sau khi tích luỹ đủ dữ liệu thiết kế đã duyệt (từ mục 22), đánh giá few-shot prompting (đơn giản hơn) trước, chỉ cân nhắc fine-tune thật khi few-shot không đủ.

**Việc cần làm:**
- [ ] Chờ tích luỹ đủ dữ liệu mẫu chất lượng (mục 18, 22)
- [ ] Thử few-shot: chèn 3-5 ví dụ chất lượng cao trực tiếp vào prompt, đo cải thiện
- [ ] Chỉ nếu few-shot không đủ: đánh giá chi phí/lợi ích của fine-tune thật

### 24. Khách khó phân biệt "AI thật" và "công cụ heuristic miễn phí"

**Nguyên nhân:** `designAssistant.ts` (sửa tương phản, gợi ý palette, ghép font — thuần toán WCAG/HSL, không gọi mạng) được đặt chung UI với "Trợ lý AI" thật (gọi Gemini, tốn phí/thời gian) dưới cùng 1 nhãn "Trợ lý thiết kế" (`AiAssistantPanel.tsx:130`).

**Giải pháp:** Tách nhãn/icon rõ ràng cho 2 nhóm tính năng, giúp khách hiểu cái nào tức thời-miễn phí, cái nào cần chờ-có giới hạn lượt dùng (hỗ trợ trực tiếp việc kiểm soát chi phí ở mục 2).

**Việc cần làm:**
- [ ] Thiết kế lại UI `AiAssistantPanel.tsx`: tách 2 khu vực rõ ràng (ví dụ "Công cụ nhanh" vs "AI tạo thiết kế")
- [ ] Thêm icon/badge phân biệt (ví dụ badge "AI" cho phần gọi Gemini)
- [ ] Cập nhật copy hướng dẫn để khách hiểu sự khác biệt

---

## Cần xác minh thêm trước khi sửa

- [ ] Kiểm tra mức độ ảnh hưởng thực tế của sai lệch phí thiết kế FE/BE trên đơn hàng gần đây (có khách từng phàn nàn giá lệch không) — liên quan mục 1
- [ ] Đo thời gian tải model xoá nền (`@imgly/background-removal`) trên thiết bị di động thật, xem có cần loading indicator rõ hơn không — liên quan mục 16
- [ ] Rà lại toàn bộ nơi dùng `design.validation.js` một lần nữa trước khi xoá hẳn — liên quan mục 5
- [ ] Xác nhận chi phí Gemini flash thực tế theo lượt gọi để chọn hạn mức rate-limit hợp lý — liên quan mục 2
