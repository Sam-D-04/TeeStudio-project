# Note thiết kế FE trang chủ TeeStudio

Tài liệu này mô tả phong cách giao diện hiện có trong thư mục `frontend/`, để thành viên code trang chủ phân hệ admin có thể bám theo và giữ tính đồng nhất với trang chủ khách hàng.

## 1. Tổng quan phong cách

Frontend hiện tại theo phong cách **light minimalist**, sạch, sáng, hiện đại, thiên về thương mại điện tử/SaaS nhẹ. Giao diện không dùng nền tối, không dùng hiệu ứng phức tạp, không dùng màu quá gắt. Cảm giác chính là: trắng, thoáng, bo góc vừa đủ, viền mảnh, shadow nhẹ, điểm nhấn xanh dương.

Admin home nên giữ cùng tinh thần này: dashboard sáng, dễ quét thông tin, nhiều khoảng trắng hợp lý, card trắng trên nền xám xanh rất nhạt, các trạng thái active dùng xanh sky blue.

Nguồn tham chiếu chính:

- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/layout/AppHeader.tsx`
- `frontend/src/components/home/ProductCategories.tsx`
- `frontend/src/components/home/SimpleWorkflow.tsx`
- `frontend/src/components/home/ProductShowcase.tsx`
- `frontend/src/components/layout/AppFooter.tsx`

## 2. Công nghệ và hệ design đang dùng

Frontend dùng:

- Next.js App Router, React, TypeScript.
- Ant Design cho component như `Button`, `Input`, `Badge`, `Drawer`, `Divider`.
- Tailwind CSS v4, nhưng giao diện hiện tại chủ yếu dùng CSS variable và inline style.
- Font chính là **Inter**, có hỗ trợ tiếng Việt.
- Ant Design theme được custom trong `layout.tsx`.

Khi code admin, nên tiếp tục dùng Ant Design để đồng bộ form, button, input, table, drawer, modal. Các token màu nên lấy lại từ `globals.css`, hạn chế tự nghĩ màu mới.

## 3. Bảng màu chủ đạo

Màu chủ đạo của hệ thống là **Sky Blue**.

| Vai trò | Mã màu | Cách dùng |
|---|---:|---|
| Primary | `#0ea5e9` | Nút chính, link chính, trạng thái active, logo, giá tiền, CTA |
| Primary dark | `#0284c7` | Text active đậm hơn, hover hoặc trạng thái nhấn |
| Primary light | `#e0f2fe` | Nền active nhẹ, menu đang chọn, pill đang chọn |
| Primary mid | `#bae6fd` | Viền hover, nền minh hoạ nhẹ |
| Accent indigo | `#6366f1` | Điểm nhấn phụ, icon/step phụ, gradient chữ |
| Accent light | `#ede9fe` | Nền tím nhạt cho card/step phụ |
| Background | `#f1f5f9` | Nền trang tổng thể |
| Surface | `#ffffff` | Header, card, footer, vùng nội dung chính |
| Surface 2 | `#f8fafc` | Nền input, strip workflow, section phụ |
| Border | `#e2e8f0` | Viền card, input, header, button phụ |
| Border light | `#f1f5f9` | Divider nhẹ |
| Text primary | `#0f172a` | Tiêu đề, nội dung quan trọng |
| Text secondary | `#475569` hoặc `#64748b` | Menu, mô tả, text thường |
| Text muted | `#94a3b8` | Mô tả phụ, placeholder, copyright |
| Success | `#10b981` | Trạng thái thành công, bước hoàn tất |
| Warning | `#f59e0b` | Trạng thái cảnh báo nhẹ |

Lưu ý: xanh `#0ea5e9` là màu nhận diện chính. Tím `#6366f1` chỉ là accent phụ, không nên biến admin thành giao diện tím.

## 4. Typography

Font chính: `Inter`, fallback `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif`.

Quy ước chữ đang dùng:

- Logo text: 17-18px, font-weight 800, màu `#0f172a`, letter-spacing âm nhẹ.
- H1 trang/section lớn: khoảng 28px, font-weight 800, màu `#0f172a`.
- H2 section: khoảng 22px, font-weight 800.
- H3/card title: 15-18px, font-weight 700.
- Body/mô tả: 13-14px, màu `#64748b` hoặc `#94a3b8`, line-height 1.5-1.75.
- Label nhỏ/badge: 10-12px, font-weight 700, thường dùng uppercase hoặc pill.

Admin nên dùng kích thước chữ gọn hơn trang khách, vì dashboard cần quét dữ liệu nhanh. Tuy nhiên vẫn giữ font-weight rõ ràng: tiêu đề đậm, mô tả nhạt.

## 5. Layout tổng thể

Trang chủ khách hiện có cấu trúc:

1. Header cố định cao `64px`, nền trắng.
2. Nội dung chính có `paddingTop: 64px` để tránh bị header che.
3. Section đầu nền trắng, hiển thị danh mục sản phẩm dạng grid 3 cột.
4. Workflow strip nền `#f8fafc`, nằm trong section trắng.
5. Showcase mẫu thiết kế nền `#f8fafc`, grid 4 cột.
6. Footer nền trắng, grid 4 cột.

Container chính:

- Class: `.container-main`
- `max-width: 1200px`
- `margin: 0 auto`
- `padding: 0 24px`

Spacing chính:

- Section padding chuẩn: `64px 0`.
- Section nhỏ: khoảng `48px 0`.
- Gap card/grid: 16px, 20px, 24px.
- Padding trong card: 14-22px.
- Padding block lớn: 40-56px.

Gợi ý cho admin home:

- Dùng nền trang `#f1f5f9`.
- Nội dung admin nên có container/padding `24px`.
- Card thống kê, bảng gần đây, quick action nên đặt trên surface trắng.
- Không nên làm dashboard quá tối hoặc quá nhiều gradient.

## 6. Header và menu

Header khách:

- `position: fixed`, top 0, left 0, right 0.
- Chiều cao 64px.
- Nền trắng `#ffffff`.
- Khi scroll có border bottom `#e2e8f0` và shadow `0 2px 12px rgba(0,0,0,0.06)`.
- Logo gồm icon vuông xanh bo góc 8px và chữ TeeStudio đậm.
- Desktop nav là các button text, không có khung cứng.
- Active nav: text xanh `#0ea5e9`, font-weight 700, có gạch nhỏ 16x2px bên dưới.
- Hover nav: nền `#f1f5f9`, text đậm `#0f172a`.
- Mobile dùng Ant Design `Drawer` bên phải.

Gợi ý cho admin:

- Nếu có topbar admin, giữ height 64px, nền trắng, border bottom mảnh.
- Nếu có sidebar admin, nên mượn style active của mobile drawer:
  - Active background: `#e0f2fe`
  - Active text: `#0ea5e9`
  - Border left: `3px solid #0ea5e9`
  - Inactive text: `#334155` hoặc `#475569`
  - Item padding: khoảng `12px 16px`
  - Font size: 14-15px
  - Font weight active: 700, inactive: 500
- Icon menu nên là line icon, stroke mảnh, màu `#475569`; active đổi sang primary.

## 7. Button

Nút chính dùng Ant Design `Button type="primary"` nhưng style lại theo token:

- Background: `#0ea5e9`
- Border: none
- Text trắng
- Font-weight: 600
- Height thường: 40px
- Border radius: 8px
- Padding: `0 20px` với nút thường, `0 12px` với nút nhỏ

Nút phụ:

- Background: `#f1f5f9`
- Border: `1px solid #e2e8f0`
- Text: `#475569`
- Height: 40px
- Radius: 8px
- Font-weight: 500

Nút text/link:

- Type text hoặc button không nền.
- Màu `#0ea5e9`
- Font-weight 600
- Padding nhỏ, ví dụ `0 4px`.

Icon button:

- Kích thước 34-40px vuông.
- Radius 8px.
- Nền `#f1f5f9` hoặc `#f8fafc`.
- Viền `#e2e8f0`.
- Icon stroke `#475569` hoặc `#64748b`.

Admin nên dùng:

- Primary cho hành động chính như "Tạo sản phẩm", "Thêm mẫu", "Duyệt đơn".
- Secondary cho lọc, xuất file, đăng xuất, quay lại.
- Icon button cho thao tác nhanh như xem, sửa, xoá, thông báo.

## 8. Input, search và filter

Search trên header:

- Height 40px.
- Background `#f8fafc`.
- Border `1px solid #e2e8f0`.
- Border radius 10px.
- Font size 14px.
- Icon search nhỏ 13-14px, stroke `#94a3b8`.

Filter tabs trong showcase:

- Dạng pill.
- Padding `6px 16px`.
- Border radius 20px.
- Inactive: nền trắng, border `#e2e8f0`, text `#64748b`, font-weight 500.
- Active: nền `#e0f2fe`, border `#0ea5e9`, text `#0284c7`, font-weight 700.

Admin có thể dùng pill filter cho: trạng thái đơn hàng, khoảng thời gian, loại sản phẩm, trạng thái mẫu thiết kế.

## 9. Card và surface

Card là thành phần rất quan trọng trong frontend hiện tại.

Card danh mục sản phẩm:

- Nền trắng.
- Border `1px solid #e2e8f0`.
- Border radius 20px.
- Shadow nhẹ `var(--shadow-sm)`.
- Overflow hidden.
- Hover: `translateY(-6px)`, shadow mạnh hơn, border đổi sang màu accent nhạt.
- Có phần visual phía trên dùng gradient pastel.
- Phần info bên dưới padding khoảng `20px 22px 22px`.

Card mẫu thiết kế:

- Nền trắng.
- Border `1px solid #e2e8f0`.
- Border radius 16px.
- Shadow rất nhẹ `0 1px 4px rgba(0,0,0,0.05)`.
- Hover: `translateY(-4px)`, shadow `0 12px 32px rgba(0,0,0,0.09)`, border `#bae6fd`.

Workflow strip:

- Nền `#f8fafc`.
- Border `1px solid #e2e8f0`.
- Radius 20px.
- Padding `40px 48px`.

Gợi ý cho admin home:

- Stat card: radius 16px, nền trắng, border `#e2e8f0`, shadow nhẹ.
- Chart/table panel: radius 16px hoặc 20px, nền trắng, border mảnh.
- Quick action card: có icon trong ô/circle nền primary light, title đậm, mô tả nhạt.
- Hover card chỉ nên nâng nhẹ `translateY(-2px đến -4px)`.

## 10. Badge, tag và trạng thái

Badge hiện tại thường có dạng pill:

- Border radius 20px.
- Font size 10-11px.
- Font weight 700.
- Padding `2px 8px` hoặc `3px 10px`.

Một số cặp màu đang dùng:

- Bán chạy/success: nền `#dcfce7`, text `#16a34a`.
- Đồng phục/primary: nền `#e0f2fe`, text `#0284c7`.
- Mới/cảnh báo: nền `#fef9c3`, text `#ca8a04`.
- Hot: nền `#fff7ed`, text `#ea580c`.

Admin có thể dùng các tag này cho trạng thái đơn:

- Hoàn tất: xanh lá.
- Đang xử lý: xanh primary.
- Chờ duyệt: vàng.
- Cần chú ý: cam.

## 11. Icon, minh hoạ và hình ảnh

Frontend hiện tại dùng SVG vector đơn giản:

- Nét line, stroke khoảng 1.5-2px.
- Stroke linecap round, linejoin round.
- Màu pastel, ít chi tiết.
- Icon nằm trong nền tròn hoặc vùng gradient nhạt.
- Không dùng ảnh chụp thật trong trang hiện tại.

Admin nên dùng icon line đồng bộ, ưu tiên icon từ Ant Design hoặc cùng phong cách stroke mảnh. Không nên trộn icon quá nhiều style.

## 12. Hiệu ứng và chuyển động

Hiệu ứng đang dùng rất nhẹ:

- Transition `0.15s` cho hover menu/button.
- Transition `0.22s - 0.25s ease` cho card hover.
- Card hover nâng lên bằng `translateY`.
- Animation `float` cho SVG áo: nổi lên xuống 8px trong 3.5s.
- Animation `fadeInUp` 0.5s.

Admin nên dùng hiệu ứng tinh tế:

- Hover card nâng nhẹ.
- Button/menu đổi nền và màu nhanh.
- Không dùng animation liên tục cho dashboard dữ liệu, trừ icon minh hoạ nhỏ.

## 13. Responsive

Các breakpoint hiện có:

- Header desktop nav/search ẩn ở mobile qua class Tailwind `hidden md:flex`, `hidden md:block`, `flex md:hidden`.
- Category grid: desktop 3 cột, tablet 2 cột, mobile 1 cột.
- Template grid: desktop 4 cột, dưới 1024px còn 3 cột, dưới 640px còn 2 cột.
- Workflow strip: desktop 3 bước ngang, mobile xếp 1 cột.
- Footer: desktop 4 cột, dưới 768px còn 2 cột, dưới 480px còn 1 cột.

Admin home nên:

- Desktop: dùng grid 4 cột cho stat card nếu đủ rộng.
- Tablet: 2 cột.
- Mobile: 1 cột với nội dung xếp dọc.
- Sidebar có thể chuyển thành drawer trên mobile.

## 14. Gợi ý layout trang chủ admin

Một trang chủ admin đồng bộ với frontend khách có thể bố trí như sau:

1. Topbar 64px nền trắng, logo TeeStudio, ô search, nút thông báo, avatar/admin menu.
2. Sidebar hoặc menu trái nền trắng, item active xanh như drawer hiện tại.
3. Main background `#f1f5f9`, padding 24px.
4. Hàng đầu:
   - Tiêu đề "Tổng quan" font 28px/800.
   - Mô tả nhỏ màu `#94a3b8`.
   - Nút primary "Tạo sản phẩm" hoặc "Thêm mẫu".
5. Grid stat cards:
   - Doanh thu hôm nay.
   - Đơn hàng mới.
   - Mẫu thiết kế đang chờ duyệt.
   - Sản phẩm sắp hết hàng.
6. Section nội dung:
   - Panel "Đơn hàng gần đây" dạng table Ant Design.
   - Panel "Mẫu thiết kế nổi bật" hoặc "Sản phẩm bán chạy" dạng card nhỏ.
7. Quick actions dạng card/icon button:
   - Thêm sản phẩm.
   - Duyệt thiết kế.
   - Quản lý đơn hàng.
   - Cập nhật banner.

## 15. Ví dụ token nên tái sử dụng

```css
:root {
  --color-primary: #0ea5e9;
  --color-primary-dark: #0284c7;
  --color-primary-light: #e0f2fe;
  --color-bg: #f1f5f9;
  --color-surface: #ffffff;
  --color-surface-2: #f8fafc;
  --color-border: #e2e8f0;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
}
```

Ví dụ stat card cho admin:

```tsx
<div
  style={{
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    padding: 20,
  }}
>
  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
    Đơn hàng mới
  </p>
  <h3 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "6px 0" }}>
    128
  </h3>
  <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
    +12% so với hôm qua
  </span>
</div>
```

Ví dụ menu item admin active:

```tsx
<button
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "12px 16px",
    background: "#e0f2fe",
    border: "none",
    borderLeft: "3px solid #0ea5e9",
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
  }}
>
  Tổng quan
</button>
```

## 16. Những điều nên tránh

- Không dùng dark theme cho admin nếu muốn đồng bộ với frontend hiện tại.
- Không dùng quá nhiều tím hoặc gradient đậm; tím chỉ là accent phụ.
- Không dùng card shadow quá nặng.
- Không bo góc quá tròn cho tất cả thành phần; control chính nên radius 8px, card 16-20px.
- Không dùng quá nhiều màu mới ngoài palette hiện có.
- Không dùng layout landing page cho admin; admin nên là dashboard thực dụng, nhưng vẫn giữ màu, radius, border, typography của TeeStudio.

## 17. Checklist nhanh cho người code admin

- Nền trang là `#f1f5f9`, panel/card là `#ffffff`.
- Primary action dùng `#0ea5e9`.
- Text chính `#0f172a`, mô tả `#64748b` hoặc `#94a3b8`.
- Button cao khoảng 40px, radius 8px.
- Input/search nền `#f8fafc`, border `#e2e8f0`, radius 8-10px.
- Card radius 16-20px, border mảnh, shadow nhẹ.
- Menu active dùng nền `#e0f2fe`, text `#0ea5e9`.
- Filter dùng pill radius 20px.
- Grid responsive, desktop nhiều cột, mobile xếp dọc.
- Hiệu ứng hover nhẹ, transition ngắn.
