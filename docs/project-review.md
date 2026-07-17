# TeeStudio — Đánh giá phản biện (bỏ qua Admin Dashboard)

> Góc nhìn: hội đồng phản biện đồ án tốt nghiệp. Phạm vi: toàn bộ phần khách hàng
> (storefront + API liên quan). Không đánh giá các trang `/admin/*` (nghiệp vụ vận
> hành nội bộ) trừ khi một tính năng admin có ảnh hưởng trực tiếp tới trải nghiệm khách.
>
> Cập nhật lần cuối: 2026-07-17. File này dùng cho cả người đọc và agent AI tiếp
> tục công việc — mỗi mục có bằng chứng cụ thể (file:line) để không cần điều tra lại.

---

## 1. Điểm mạnh

- **Design Studio** là phần đầu tư nghiêm túc nhất: canvas editor, layers panel,
  font selector, AI assistant (Gemini), floating toolbar — ~4.900 dòng code trải
  trên 16 component (`frontend/src/components/design-studio/`). Vượt mặt bằng
  chung một đồ án.
- Luồng thanh toán có **VNPAY + MoMo thật** (không giả lập), có promotion/pricing
  engine ở backend, có inventory transaction log.
- UI polish tốt, đồng bộ style; đã tối ưu UX ở cart/checkout/product detail
  (size-grid nhiều size, zoom ảnh kiểu kính lúp, xoay ảnh theo màu ở trang chủ).
- **BulkPricing áp dụng tự động khi tạo đơn** (xem mục 4.2) — logic backend đúng,
  chỉ thiếu phần hiển thị.

---

## 2. Đã xử lý trong phiên làm việc này

- ✅ Gỡ bỏ hoàn toàn "Bán hàng cùng TeeStudio": xoá `frontend/src/app/creator/`,
  xoá mục nav "Bán hàng" trong `AppHeader.tsx`, xoá nút "Đặt số lượng lớn" (từng
  trỏ sai tới `/creator`) khỏi `ProductDetailClient.tsx`.
- ✅ Combobox tỉnh/thành – phường/xã ở checkout (thay ô nhập địa chỉ tự do), có
  tìm kiếm không dấu, dữ liệu từ `frontend/public/data/vn-address.json`.
- ✅ Vá lỗi backend đang âm thầm bỏ trống `city`/`ward` khi lưu `UserAddress`
  (`customer.order.service.js`).
- ✅ Zoom ảnh kiểu kính lúp ở trang chi tiết sản phẩm; ảnh to hơn + xoay theo màu
  khi hover ở trang chủ.
- ✅ Task 5 (vá bảo mật): `.gitignore` cho `.env*.local` (root + frontend), untrack
  `frontend/.env.local` khỏi git, thêm `helmet`, giới hạn `cors()` theo
  `FRONTEND_URL`, thêm rate-limit 10 lần/15 phút cho `/auth/login` và
  `/auth/register`. Chi tiết: `docs/tasks.md` Task 5.

---

## 3. Sai sót / lỗi kỹ thuật

### 3.1 Quản lý secret chưa chuẩn
- `frontend/.env.local` **bị commit vào git** (`git ls-files` xác nhận). Nội dung
  hiện tại chỉ có `NEXT_PUBLIC_API_URL` (không nhạy cảm), nhưng nguyên nhân là
  `frontend/.gitignore` chỉ chặn `.env`, thiếu pattern chuẩn `.env*.local` của
  Next.js. Rủi ro: lần tới nếu ai đó thêm secret thật vào `.env.local` sẽ bị lộ
  ngay vì thói quen hiện tại là commit được.
- **Không có root `.gitignore`** ở `e:\DO_AN\TeeStudio\`.
- `backend/.env` (chứa secret thật: DB, JWT, Cloudinary, Gemini API key...) hiện
  **không** bị tracked — đúng, nhưng chỉ nhờ `backend/.gitignore` có dòng `.env`
  riêng, không phải do có ý thức đồng bộ giữa 2 phía.

**Việc cần làm:** thêm `.env*.local` vào `frontend/.gitignore`, thêm 1 root
`.gitignore` tối thiểu, và `git rm --cached frontend/.env.local` (giữ file local,
chỉ bỏ khỏi git).

### 3.2 Bảo mật API
- `backend/src/app.js:13` — `app.use(cors())` không tham số → chấp nhận **mọi
  origin**. Nên giới hạn về đúng domain frontend khi deploy.
- Không có `helmet` (thiếu security headers: X-Frame-Options, CSP,
  X-Content-Type-Options...).
- Không có rate-limit trên `/auth/login`, `/auth/register` → không có phòng thủ
  brute-force cơ bản. Không có package `express-rate-limit` hay `helmet` trong
  `backend/package.json`.

### 3.3 Không có test tự động
- Không có file `*.test.*`/`*.spec.*` nào trong repo, không có script `test`
  trong `package.json` của cả backend lẫn frontend. Hội đồng gần như chắc chắn
  sẽ hỏi về coverage — hiện tại câu trả lời là 0%.

---

## 4. Tính năng admin đã xây nhưng **không liên kết** tới storefront

Đây là phần bạn yêu cầu kiểm tra lại — đã xác minh cụ thể bằng cách đọc code, không
chỉ đoán.

### 4.1 Mã giảm giá (Promotion) — có backend, **thiếu UI khách hàng**
- Bảng `Promotion`, `PromotionUsage` tồn tại đầy đủ; admin có trang quản lý
  (`/admin/khuyen-mai-bao-gia`); payload tạo đơn (`customer.order.routes.js`)
  đã nhận sẵn field `promotionId`.
- Nhưng: `frontend/src/app/cart/page.tsx` và `frontend/src/app/checkout/page.tsx`
  **không có bất kỳ ô nhập mã giảm giá nào**. Khách không có cách nào áp dụng
  promotion dù backend đã sẵn sàng nhận.
- **Việc cần làm:** thêm ô "Nhập mã giảm giá" ở cart hoặc checkout, gọi API xác
  thực mã (cần kiểm tra xem đã có endpoint public xác thực mã theo `code` chưa —
  hiện các route promotion đều nằm dưới `admin.promotion.routes.js`, nên nhiều
  khả năng **cần thêm 1 endpoint public** `POST /public/promotions/validate`
  hoặc tương tự trước khi làm UI).

### 4.2 Đặt số lượng lớn (Bulk Pricing) — **hoạt động ngầm, khách không biết**
- `BulkPricing` (mốc số lượng → % giảm giá theo sản phẩm) **đã được áp dụng tự
  động** khi tạo đơn, xem `customer.order.service.js:204-219`: mỗi dòng sản phẩm
  trong đơn được tra `BulkPricing` theo `productId` + `quantity`, tự động giảm
  giá nếu đạt mốc — logic đúng, đã chạy thật.
- Nhưng: **không có UI nào cho khách biết** mua nhiều sẽ được giảm giá — không
  có bảng "mua 10 áo giảm X%, mua 50 áo giảm Y%" ở trang sản phẩm, không có gợi
  ý nào trong giỏ hàng ("mua thêm N cái để được giảm giá"). Đây là một tính năng
  marketing/conversion bị lãng phí hoàn toàn vì vô hình với khách.
- Nút "Đặt số lượng lớn" từng có ở trang sản phẩm **trỏ nhầm sang `/creator`**
  (trang "trở thành nhà sáng tạo", không liên quan) — đã bị xoá cùng với việc gỡ
  `/creator` (xem mục 2). Hiện tại **không còn entry point nào** cho luồng mua số
  lượng lớn.
- **Việc cần làm:** (a) thêm bảng "Ưu đãi số lượng" hiển thị ở trang chi tiết sản
  phẩm, đọc trực tiếp từ `BulkPricing` (đã có sẵn API admin đọc bảng này, cần
  route public tương ứng); (b) cân nhắc thêm form liên hệ "Đặt số lượng lớn /
  đồng phục" riêng nếu muốn giữ luồng sale thủ công cho đơn rất lớn.

### 4.3 Kiểu in (Print Method) — **cấu hình admin hoàn toàn mồ côi**
- Bảng `PrintMethod` (DTG / Silk Screen / Thêu...) có `extraCost` (phụ phí theo
  kiểu in), quản lý qua admin (`admin.promotion.service.js:446-470`, nằm chung
  trang "khuyến mãi & báo giá"). Bảng `DesignPrintMethod` là bảng nối
  design ↔ kiểu in đã chọn.
- Đã grep toàn bộ backend: **không có bất kỳ câu `INSERT INTO DesignPrintMethod`
  nào** — bảng nối này không bao giờ được ghi dữ liệu ở đâu cả.
- Phí thiết kế (`designFee`) chỉ được tính từ diện tích vùng in
  (`calculateBoundingBoxAreaFee`, xem `user.design.service.js:61,96`) — **hoàn
  toàn không đọc `PrintMethod.extraCost`**. Nghĩa là dù admin cấu hình phụ phí
  cho từng kiểu in, phí đó **không bao giờ được cộng vào đơn hàng thực tế**.
- Trang chi tiết sản phẩm hiển thị "DTG / Silk Screen" như **text tĩnh** hard-code
  (`ProductDetailClient.tsx`, mục "In ấn"), không phải lựa chọn thật.
- **Việc cần làm:** hoặc (a) thêm bước chọn kiểu in trong Design Studio (ảnh hưởng
  giá + lưu vào `DesignPrintMethod`), hoặc (b) nếu quyết định không cần khách tự
  chọn kiểu in (vd. luôn dùng DTG mặc định), thì nên **dọn bảng/API mồ côi này**
  để đồ án gọn và nhất quán hơn khi bị hỏi "bảng này dùng để làm gì".

### 4.4 Sticker (họa tiết trong Design Studio) — ✅ đã xác minh, hoạt động đúng
- Đã test thật: `GET /api/stickers` trả 200, `Sidebar.tsx` (tab "Họa tiết") fetch
  và render đúng, click sticker thêm được vào canvas
  (`onAddImageToCanvas(sticker.urlAnh)`). **Không phải khoảng trống** — mục này ở
  bản trước ghi "nghi vấn chưa xác minh", nay xác nhận: ổn, không cần làm gì thêm.
- Ghi chú kỹ thuật phụ (không ảnh hưởng người dùng): route thật được định nghĩa
  trực tiếp trong `backend/src/routes/index.js:48` (dùng lại
  `designController.getDanhSachSticker`), **không** đi qua module
  `backend/src/modules/stickers/` — 3 trong 4 file của module này
  (`sticker.routes.js`, `sticker.controller.js`) đang **hoàn toàn rỗng** (0 dòng).
  Đây là code mồ côi/duplicate, nên dọn hoặc xoá để tránh gây hiểu nhầm khi đọc
  code (hội đồng đọc source có thể tưởng đây là chỗ xử lý sticker thật).

### 4.5 Quản lý danh mục (Category) — **hoàn toàn chưa xây**, không phải chỉ thiếu liên kết
- Module `backend/src/modules/categories/` tồn tại nhưng **rỗng hoàn toàn**:
  `category.routes.js`, `category.controller.js`, `category.service.js` đều 0
  dòng, chỉ `category.validation.js` có nội dung (25 dòng, không dùng tới vì
  không có route nào gọi).
- Xác nhận qua `grep`: **không có route nào** đăng ký `/categories` trong
  `backend/src/routes/index.js`, và **không có câu lệnh `INSERT/UPDATE/DELETE
  Category`** ở bất kỳ đâu trong backend. 3 category hiện có (`Áo thun`, `Áo
  polo`, `Áo hoodie`) là dữ liệu nhập tay thẳng vào DB, không qua app.
- Trang admin sản phẩm (`admin/san-pham-phoi-ao`) cũng không có ô chọn/tạo
  category nào khi thêm sản phẩm mới.
- **Đây không phải "làm sẵn ở dashboard nhưng chưa nối ra ngoài"** như 3 ví dụ
  kia — mà là **chưa từng xây cả 2 phía**. Nếu hội đồng hỏi "quản lý danh mục ở
  đâu", hiện tại không có câu trả lời. Nên hoàn thiện CRUD category ở admin trước,
  rồi mới tính tới hiển thị lọc theo category ở storefront.

### 4.6 Slug sản phẩm (URL thân thiện SEO) — có sẵn, chưa dùng để routing
- Cột `Product.slug` có comment trong schema: `[FROM ADMIN] Slug dùng cho URL
  thân thiện SEO`. Admin **có tạo và hiển thị** slug (tự sinh từ tên khi thêm
  sản phẩm — `EditProductPage.tsx`, hiển thị ở `ProductTable.tsx`).
- Nhưng route trang chi tiết sản phẩm là `frontend/src/app/product/[id]/page.tsx`
  — dùng **ID số** (`/product/4`), slug chưa từng được dùng để điều hướng.
  Nghĩa là công sức sinh slug ở admin hiện **không mang lại lợi ích SEO nào** cho
  storefront.
- **Việc cần làm (không gấp):** đổi route thành `/product/[slug]` (hoặc
  `/product/[id]-[slug]` để vẫn tra được theo ID cho chắc), backend thêm
  tra cứu theo `slug` ở `public.service.js`.

### 4.7 Thanh toán đặt cọc (Deposit Payment) — backend hỗ trợ, checkout khách không có lựa chọn
- Backend có đầy đủ khái niệm trả **đặt cọc** (`paymentType: "DEPOSIT"` vs
  `"FULL"`, tách `depositAmount`/`codAmount` trong kết quả tạo đơn — xem
  `customer.order.service.js` và `order.validation.js` `createOrderSchema`).
  Admin tạo đơn hộ khách có thể chọn `paymentType`.
- Nhưng `CreateOrderPayload` ở `frontend/src/services/orderService.ts` **không
  có field `paymentType`** — checkout khách hàng luôn ngầm định `FULL`, không có
  lựa chọn "đặt cọc trước, thanh toán phần còn lại khi nhận hàng" dù backend đã
  làm sẵn phần tính toán tách khoản này.
- **Việc cần làm (tuỳ chọn):** nếu muốn tận dụng, thêm radio "Thanh toán toàn bộ
  / Đặt cọc trước" ở checkout, chỉ nên bật cho đơn giá trị lớn hoặc đơn có thiết
  kế riêng (thường đi kèm rủi ro sản xuất cao hơn nên hay cần đặt cọc trong thực
  tế ngành in ấn).

### 4.8 Dọn code mồ côi khác (mức độ nhẹ, không ảnh hưởng người dùng)
- `design.validation.js` — `updateDesignStatusSchema` khai báo enum
  `["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]`, nhưng luồng thật đang dùng
  `["DRAFT", "PENDING_REVIEW", "NEEDS_REVISION", "APPROVED"]` (xem
  `admin.design.service.js`). Schema cũ **không được route nào import** — dead
  code từ một phiên bản trạng thái thiết kế trước đó, nên xoá để tránh nhầm lẫn.
- Luồng phản hồi "cần chỉnh sửa" (`adminNote`) đã kiểm tra: **hoạt động đúng và
  đầy đủ** — admin ghi lý do, khách thấy ngay trong `MyDesignsModal.tsx` và
  `MyDesignsTab.tsx`. Không phải khoảng trống, nêu ở đây chỉ để xác nhận đã rà.

---

## 5. Khoảng trống chức năng (không phải lỗi liên kết — thiếu hẳn từ đầu)

1. **Không có trang "Đơn hàng của tôi".** Khách đặt xong không có nơi nào xem lại
   lịch sử/trạng thái đơn. `customer.order.routes.js` chỉ có `POST /`, **không
   có `GET`** để khách tự tra cứu. → **Đây là lỗ hổng nghiêm trọng nhất của toàn
   hệ thống**, nên ưu tiên xử lý trước.
2. **Không có quên mật khẩu / đặt lại mật khẩu.** `auth.routes.js` chỉ có
   login/register/refresh/logout/me.
3. **Hạ tầng email có sẵn nhưng không dùng cho khách hàng.**
   `backend/src/common/services/emailService.js` (nodemailer) hiện **chỉ** được
   gọi từ `admin.user.service.js` (gửi tài khoản mới do admin tạo) — không gửi
   email xác nhận đơn hàng, không gửi email reset password.
4. **Không có review/rating sản phẩm, không có wishlist.** Xác nhận qua
   `Database_main.sql`: schema có đủ 24 bảng, không có `Review`, `Rating`,
   `Wishlist`, `Notification`.
5. **Không có guest checkout** — bắt buộc role `CUSTOMER` mới đặt được hàng
   (`requireRoles(ROLES.CUSTOMER)` trong `customer.order.routes.js`).
6. **Catalog rất mỏng:** chỉ 4 sản phẩm trong DB (3 active), 3 category,
   24 variant. `/explore` có search theo từ khoá nhưng **không có filter** giá/
   màu/size, không phân trang, không sort.

---

## 6. Đề xuất ưu tiên (để "trông ấn tượng hơn" khi bảo vệ)

### Ưu tiên cao — vá lỗ hổng + nối lại phần đã xây dở
1. Trang **"Đơn hàng của tôi"** + chi tiết đơn (timeline trạng thái) — mục 5.1.
2. **Email xác nhận đơn hàng** tự động — hạ tầng đã có, chỉ cần nối vào
   `createOrderAsCustomer` (mục 5.3).
3. **Bảng ưu đãi số lượng** ở trang sản phẩm, đọc từ `BulkPricing` đã hoạt động
   ngầm (mục 4.2) — effort thấp vì logic tính giá đã đúng sẵn, chỉ cần UI + 1
   API public đọc mốc giá.
4. **Ô nhập mã giảm giá** ở checkout (mục 4.1).
5. Vá bảo mật: `.gitignore` cho `.env*.local`, thêm `helmet` + rate-limit cho
   `/auth/*` (mục 3.1, 3.2) — chi phí thấp, hội đồng hỏi bảo mật là có câu trả lời.

### Ưu tiên trung bình
6. Quyết định số phận "kiểu in" (mục 4.3): xây thật hoặc dọn bảng mồ côi.
7. **Xây quản lý danh mục (Category) thật** — cả admin CRUD lẫn filter ở
   storefront (mục 4.5) — hiện là khoảng trống hoàn toàn, không chỉ thiếu liên kết.
8. Review/rating sản phẩm đơn giản (1–5 sao + comment).
9. Wishlist — pattern giống `useCartStore`, effort thấp.
10. Bộ lọc + sort + phân trang ở `/explore`.
11. Quên mật khẩu qua email.

### Nếu còn thời gian
12. Viết ít nhất 1 bộ test cơ bản (vd. Jest cho hàm tính giá / BulkPricing) —
    không cần coverage cao, chỉ cần chứng minh có tư duy kiểm thử.
13. Tăng dữ liệu mẫu (thêm sản phẩm/category) để catalog trông đầy đủ khi demo.
14. Route sản phẩm theo `slug` thay vì ID (mục 4.6) — điểm cộng SEO, không cấp bách.
15. Tuỳ chọn thanh toán đặt cọc ở checkout (mục 4.7) — chỉ làm nếu còn dư thời gian.
16. Dọn code mồ côi: xoá `backend/src/modules/stickers/{routes,controller}.js`
    (rỗng, không dùng), xoá `updateDesignStatusSchema` lỗi thời trong
    `design.validation.js` (mục 4.4, 4.8) — mất ~10 phút, giúp source sạch hơn
    khi hội đồng đọc code.

---

## 7. Ghi chú cho agent tiếp tục việc này

- Trước khi code bất kỳ mục nào ở phần 6, **đọc lại mục tương ứng ở phần 3/4/5**
  để có đầy đủ context (file:line) — tránh điều tra lại từ đầu.
- Khi thêm route public mới (vd. đọc `BulkPricing`, validate mã giảm giá), đặt
  trong `backend/src/modules/public/` theo pattern đã có (`public.service.js`,
  `public.controller.js`) thay vì tạo module mới, để nhất quán với các endpoint
  public hiện tại.
- Mục 4.3 (kiểu in) là **quyết định sản phẩm**, không phải chỉ kỹ thuật — nên hỏi
  người dùng có muốn xây thật hay xoá trước khi động vào.
- File JSON tỉnh/thành dùng cho checkout đã đặt ở
  `frontend/public/data/vn-address.json` — không cần import lại.
