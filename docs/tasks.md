# TeeStudio — Task List hoàn thiện dự án

> Sinh ra từ [docs/project-review.md](./project-review.md) — mỗi task chính tham
> chiếu đúng mục tương ứng trong file đó (đọc lại mục đó để có bằng chứng/file:line
> trước khi code, tránh điều tra lại từ đầu).
>
> Định dạng: `- [ ]` = chưa làm, `- [x]` = đã xong. Cập nhật trực tiếp file này khi
> hoàn thành sub-task để theo dõi tiến độ.
>
> Cập nhật lần cuối: 2026-07-17.

---

## ƯU TIÊN CAO

### Task 1 — Trang "Đơn hàng của tôi" (project-review.md §5.1 — lỗ hổng nặng nhất)
- [x] Backend: thêm `GET /api/orders` (customer, `verifyToken`) — trả danh sách đơn
      của `req.user.id`, phân trang, sort theo `createdAt DESC`
      (`layDanhSachDonHangCuaKhach` trong `customer.order.service.js`)
- [x] Backend: thêm `GET /api/orders/:id` (customer) — chi tiết 1 đơn, **đã kiểm
      tra đơn thuộc về `req.user.id` ngay trong WHERE** trước khi trả (chặn IDOR —
      đã verify bằng request thật: xem đơn của user khác trả về 404, không lộ
      thông tin đơn có tồn tại hay không)
- [x] Backend: response chi tiết đơn gồm items (sản phẩm/màu/size/ảnh), địa chỉ
      giao hàng, lịch sử trạng thái (từ `OrderHistory`), danh sách các lượt
      thanh toán (từ `Payment`)
- [x] Frontend: trang danh sách đơn tại `/tai-khoan/don-hang`
      (`frontend/src/app/tai-khoan/don-hang/page.tsx`) — có phân trang, trạng thái
      rỗng khi chưa có đơn, badge trạng thái màu
- [x] Frontend: trang chi tiết đơn tại `/tai-khoan/don-hang/[id]`
      (`frontend/src/app/tai-khoan/don-hang/[id]/page.tsx`) — timeline trạng thái
      dạng chấm tròn nối dây, danh sách sản phẩm, tổng kết tiền (có nhánh riêng
      cho đơn đặt cọc), địa chỉ giao hàng, lịch sử thanh toán
- [x] Frontend: thêm link "Đơn hàng của tôi" — tên khách hàng ở góc phải header giờ
      bấm vào sẽ dẫn tới trang danh sách đơn (`HeaderAuthActions.tsx`)
- [x] Frontend: `orderService.ts` thêm `getMyOrders(page, limit)`,
      `getOrderById(orderId)` + đầy đủ type khớp với response backend
- [x] Component dùng chung: `CustomerOrderStatusBadge.tsx`
      (`frontend/src/components/orders/`) — bảng màu khớp với `OrderStatusBadge.tsx`
      bên admin để nhất quán 2 phía
- [x] Test thủ công qua API thật (2026-07-17): tạo tài khoản test, đặt 1 đơn mới
      qua `POST /api/orders`, gọi `GET /api/orders` thấy đúng đơn vừa đặt,
      `GET /api/orders/:id` trả đúng chi tiết, thử xem đơn của user khác bị chặn
      404, không token bị chặn 401. Cả 2 trang frontend type-check sạch và serve
      200 không lỗi Next.js overlay. **Không có browser tool trong môi trường để
      chụp demo trực quan** — nếu cần xác nhận UI bằng mắt, tự mở
      `/tai-khoan/don-hang` và đăng nhập bằng tài khoản test
      (`test.task1@teestudio.dev` / `Test1234`, đã có sẵn 1 đơn hàng thật để xem).

### Task 2 — Email xác nhận đơn hàng (project-review.md §5.3)
- [ ] Backend: viết `sendOrderConfirmationEmail()` trong `emailService.js` (tái sử
      dụng `getTransporter()` có sẵn)
- [ ] Backend: gọi hàm này trong `createOrderAsCustomer` (`customer.order.service.js`)
      ngay sau khi transaction tạo đơn thành công — **không để lỗi gửi mail làm
      fail cả đơn hàng** (bọc try/catch riêng, log lỗi thôi)
- [ ] Backend: template email gồm mã đơn, danh sách sản phẩm, tổng tiền, địa chỉ
      giao hàng
- [ ] Test: đặt thử 1 đơn bằng tài khoản có email thật, xác nhận nhận được mail

### Task 3 — Bảng ưu đãi số lượng ở trang sản phẩm (project-review.md §4.2)
- [ ] Backend: thêm endpoint public đọc `BulkPricing` theo `productId` (đặt trong
      `backend/src/modules/public/`, gộp vào `layChiTietSanPhamCongKhai` hoặc route
      riêng `GET /public/products/:id/bulk-pricing`)
- [ ] Frontend: `ProductDetailClient.tsx` hiển thị bảng "Mua nhiều giảm giá" (số
      lượng tối thiểu / % giảm), gần khu vực chọn size
- [ ] Tuỳ chọn: gợi ý trong giỏ hàng kiểu "mua thêm N cái để được giảm thêm X%"

### Task 4 — Ô nhập mã giảm giá ở checkout (project-review.md §4.1)
- [ ] Backend: thêm endpoint public validate mã giảm giá theo `code` (kiểm tra còn
      hiệu lực, điều kiện đơn tối thiểu, số lượt dùng còn lại) — trả về số tiền
      giảm hoặc lỗi lý do không áp dụng được
- [ ] Frontend: ô nhập mã ở `checkout/page.tsx`, gọi API validate, hiển thị số tiền
      giảm ngay trong phần tổng kết đơn
- [ ] Frontend: gửi `promotionId` hợp lệ trong payload `createOrder`
- [ ] Backend: xác nhận `customer.order.service.js` áp đúng `promotionId` vào
      `discountAmount` khi tạo đơn (đã có field, cần kiểm tra logic tính có chạy
      đúng chưa)

### Task 5 — Vá bảo mật (project-review.md §3.1, §3.2) — ✅ XONG (2026-07-17)
- [x] `frontend/.gitignore`: thêm dòng `.env*.local`
- [x] Tạo root `.gitignore` tối thiểu (`node_modules`, `.env`, `.env*.local`, `.next`)
- [x] `git rm --cached frontend/.env.local` (đã stage, **chưa commit** — file vẫn
      còn trên máy, bạn cần tự commit khi sẵn sàng)
- [x] Backend: cài `helmet`, thêm `app.use(helmet())` trong `app.js` — đã verify
      response có đủ header (`Content-Security-Policy`, `X-Frame-Options`,
      `Strict-Transport-Security`...)
- [x] Backend: cài `express-rate-limit`, áp dụng cho `/auth/login` và
      `/auth/register` (10 lần/15 phút/IP) — đã verify header
      `RateLimit-Remaining` giảm đúng sau mỗi request
- [x] Backend: giới hạn `cors()` theo `FRONTEND_URL` (mặc định
      `http://localhost:3000`, hỗ trợ nhiều origin phân tách bằng dấu phẩy) — đã
      verify origin lạ (`evil.com`) không nhận được header
      `Access-Control-Allow-Origin`, còn origin frontend thật vẫn hoạt động bình
      thường

**Lưu ý:** đã thêm biến `FRONTEND_URL` vào `backend/.env` và `.env.example`. Khi
deploy production, nhớ đổi `FRONTEND_URL` thành domain thật (có thể liệt kê nhiều
domain, phân tách bằng dấu phẩy).

---

## ƯU TIÊN TRUNG BÌNH

### Task 6 — Quyết định số phận "kiểu in" (project-review.md §4.3)
- [ ] **Quyết định trước khi code**: hỏi chủ dự án — xây thật hay xoá bảng mồ côi?
- Nếu xây thật:
  - [ ] Frontend: thêm bước chọn kiểu in (DTG/Silk Screen/Thêu) trong Design Studio
        (Sidebar hoặc Toolbar), có thể ảnh hưởng giá hiển thị ngay khi chọn
  - [ ] Backend: lưu lựa chọn vào `DesignPrintMethod` khi save design
        (`user.design.service.js`)
  - [ ] Backend: cộng `PrintMethod.extraCost` vào `designFee` khi tính phí
        (`calculateBoundingBoxAreaFee` hoặc hàm gọi nó)
  - [ ] Frontend: bỏ text tĩnh "DTG / Silk Screen" ở `ProductDetailClient.tsx`,
        thay bằng dữ liệu thật
- Nếu xoá:
  - [ ] Xoá UI admin quản lý `PrintMethod` (trong trang khuyến mãi & báo giá)
  - [ ] Cân nhắc xoá bảng `PrintMethod`/`DesignPrintMethod` khỏi schema (migration)
  - [ ] Xoá text tĩnh gây hiểu nhầm "DTG / Silk Screen" ở `ProductDetailClient.tsx`

### Task 7 — Xây quản lý danh mục (Category) thật (project-review.md §4.5)
- [ ] Backend: viết `category.service.js` (CRUD: list/create/update/delete)
- [ ] Backend: viết `category.controller.js`
- [ ] Backend: viết `category.routes.js`, đăng ký trong `routes/index.js`
      (nhóm admin + 1 route public `GET /public/categories`)
- [ ] Frontend admin: trang quản lý category (danh sách, thêm, sửa, xoá)
- [ ] Frontend admin: thêm dropdown chọn category khi tạo/sửa sản phẩm
      (`admin/san-pham-phoi-ao`)
- [ ] Frontend storefront: filter theo category ở `/explore` hoặc `/collections`

### Task 8 — Review/rating sản phẩm (project-review.md §5.4)
- [ ] Backend: migration thêm bảng `Review` (`productId`, `userId`, `rating`,
      `comment`, `createdAt`)
- [ ] Backend: `POST /api/products/:id/reviews` (customer — cân nhắc chỉ cho phép
      nếu đã mua sản phẩm, kiểm tra qua `OrderItem`)
- [ ] Backend: `GET /api/public/products/:id/reviews` + điểm trung bình
- [ ] Frontend: form đánh giá ở trang sản phẩm
- [ ] Frontend: hiển thị danh sách review + rating trung bình (có thể thêm badge
      sao ở product card trang chủ/explore)

### Task 9 — Wishlist (project-review.md §5.4)
- [ ] Backend: migration bảng `Wishlist` (`userId`, `productId`, unique constraint)
- [ ] Backend: `POST/DELETE/GET /api/wishlist`
- [ ] Frontend: `useWishlistStore` (theo pattern `useCartStore.ts`)
- [ ] Frontend: nút "yêu thích" (icon tim) ở product card + trang chi tiết sản phẩm
- [ ] Frontend: trang "Sản phẩm yêu thích"

### Task 10 — Bộ lọc + sort + phân trang ở `/explore` (project-review.md §5.6)
- [ ] Backend: `public.service.js` thêm params `minPrice`, `maxPrice`, `sort`,
      `page`, `limit` cho `layDanhSachSanPhamCongKhai`
- [ ] Frontend: UI filter (giá, loại áo/form) ở `/explore`
- [ ] Frontend: component phân trang

### Task 11 — Quên mật khẩu (project-review.md §5.2)
- [ ] Backend: `POST /auth/forgot-password` — sinh token reset, gửi email
- [ ] Backend: `POST /auth/reset-password` — xác thực token, đổi mật khẩu
- [ ] Backend: `emailService.js` thêm `sendPasswordResetEmail()`
- [ ] Frontend: trang "Quên mật khẩu" + trang "Đặt lại mật khẩu"

---

## NẾU CÒN THỜI GIAN

### Task 12 — Test tự động cơ bản (project-review.md §3.3)
- [ ] Backend: cài đặt Jest, cấu hình script `test` trong `package.json`
- [ ] Viết test cho `pricing.utils.js` / logic tính `BulkPricing`
- [ ] Viết test cho 1–2 hàm tính giá quan trọng khác (vd. `calculateBoundingBoxAreaFee`)

### Task 13 — Tăng dữ liệu mẫu (project-review.md §5.6)
- [ ] Thêm sản phẩm mẫu (ít nhất 8–10 sản phẩm, đa dạng category/form áo)
- [ ] Thêm category mẫu (sau khi Task 7 xong, để category quản lý được qua UI)

### Task 14 — Route sản phẩm theo `slug` (project-review.md §4.6)
- [ ] Backend: `public.service.js` thêm tra cứu theo `slug`
- [ ] Frontend: đổi route `/product/[id]` → `/product/[slug]`
- [ ] Đảm bảo link cũ theo ID cũ không vỡ (redirect hoặc chấp nhận cả 2 dạng)

### Task 15 — Thanh toán đặt cọc (project-review.md §4.7)
- [ ] Frontend: `orderService.ts` thêm `paymentType` vào `CreateOrderPayload`
- [ ] Frontend: checkout UI — radio "Thanh toán toàn bộ / Đặt cọc trước"
- [ ] Backend: xác nhận luồng `DEPOSIT` chạy đúng end-to-end khi gọi từ phía
      customer (trước giờ chỉ admin gọi được)

### Task 16 — Dọn code mồ côi (project-review.md §4.4, §4.8)
- [ ] Xoá `backend/src/modules/stickers/sticker.routes.js`,
      `sticker.controller.js` (rỗng, không dùng — sticker thật chạy qua
      `routes/index.js`)
- [ ] Xoá `updateDesignStatusSchema` lỗi thời trong `design.validation.js`
- [ ] Rà lại `backend/src/modules/categories/*.js` rỗng — giữ lại làm khung để
      viết Task 7, hoặc xoá và tạo mới tuỳ quyết định lúc làm Task 7

---

## Ghi chú khi thực thi

- Làm theo đúng thứ tự nhóm ưu tiên (Cao → Trung bình → Nếu còn thời gian) trừ khi
  có lý do cụ thể để đổi.
- Task 6 (kiểu in) và Task 16 (liên quan) cần **quyết định sản phẩm** trước — hỏi
  người dùng, đừng tự ý xoá bảng/API khi chưa xác nhận.
- Sau khi hoàn thành từng task chính, quay lại đánh dấu `[x]` ở cả file này lẫn
  mục "Đã xử lý" (§2) trong `project-review.md` để 2 file luôn khớp nhau.
