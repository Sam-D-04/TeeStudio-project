# Huongdan_BE - Tích hợp Backend cho Admin TeeStudio

---

## 12. Trang Quản lý đơn hàng – `/admin/don-hang`

> **File Frontend chính:** `frontend/src/components/admin/orders/OrdersPage.tsx`
> **Route Next.js:** `frontend/src/app/admin/don-hang/page.tsx`

### 12.1. Các component và vai trò của từng component

| Component | File | Vai trò |
|---|---|---|
| `OrdersClient` | `orders/OrdersClient.tsx` | Bao ngoài layout (Sidebar + Topbar), quản lý state màn hình |
| `OrdersPage` | `orders/OrdersPage.tsx` | Trang chính, chứa dữ liệu mẫu, điều phối các component con |
| `OrderStatCard` | `orders/OrderStatCard.tsx` | 4 thẻ KPI đầu trang (đơn mới, sản xuất, chờ thanh toán, hoàn tất) |
| `OrderFilterBar` | `orders/OrderFilterBar.tsx` | Thanh lọc (pill tab trạng thái + select box nâng cao) |
| `OrderTable` | `orders/OrderTable.tsx` | Bảng danh sách đơn hàng |
| `OrderStatusBadge` | `orders/OrderStatusBadge.tsx` | Nhãn màu hiển thị trạng thái đơn |
| `OrderDetailDrawer` | `orders/OrderDetailDrawer.tsx` | Ngăn kéo chi tiết đơn hàng (mở khi bấm vào hàng) |
| `OrderPagination` | `orders/OrderPagination.tsx` | Phân trang cuối bảng |

---

### 12.2. Danh sách trạng thái đơn hàng (OrderStatus)

Frontend dùng các giá trị sau (kiểu TypeScript `OrderStatus`). **Backend phải trả về đúng các giá trị này:**

| Giá trị (Backend trả về) | Hiển thị trên giao diện | Màu badge |
|---|---|---|
| `cho_xac_nhan` | Chờ xác nhận | Xám nhạt |
| `da_xac_nhan` | Đã xác nhận | Xanh dương nhạt |
| `dang_san_xuat` | Đang sản xuất | Xanh sky nhạt |
| `dang_in` | Đang in | Tím nhạt |
| `cho_giao` | Chờ giao hàng | Vàng nhạt |
| `dang_giao` | Đang giao hàng | Cam nhạt |
| `hoan_tat` | Hoàn tất | Xanh lá nhạt |
| `da_huy` | Đã hủy | Đỏ nhạt |

---

### 12.3. API thống kê KPI đầu trang

#### `GET /api/admin/orders/stats`

Trả về 4 con số hiển thị trong thẻ KPI đầu trang.

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "newOrders": 24,
    "inProduction": 18,
    "pendingPayment": 7,
    "completedToday": 31
  }
}
```

**Frontend dùng ở đâu:** Mảng `STAT_CARDS` trong `OrdersPage.tsx` – thay giá trị `value` bằng dữ liệu từ `data.*`.

---

### 12.4. API danh sách đơn hàng (bảng chính)

#### `GET /api/admin/orders`

Trả về danh sách đơn hàng để hiển thị trong bảng. Hỗ trợ lọc và phân trang qua query string.

**Query string (tham số lọc):**

| Tham số | Kiểu | Ý nghĩa |
|---|---|---|
| `q` | string | Tìm kiếm theo mã đơn hoặc tên khách hàng |
| `status` | string | Lọc trạng thái: `tat_ca`, `cho_xac_nhan`, `da_xac_nhan`, `dang_san_xuat`, `dang_in`, `cho_giao`, `dang_giao`, `hoan_tat` |
| `payment` | string | Lọc thanh toán: `tat_ca`, `da_thanh_toan`, `cho_thanh_toan` |
| `time` | string | Lọc thời gian: `tat_ca`, `hom_nay`, `tuan_nay`, `thang_nay` |
| `type` | string | Lọc loại đơn: `tat_ca`, `custom_design`, `ao_mau` |
| `page` | number | Trang hiện tại (bắt đầu từ 1) |
| `limit` | number | Số đơn mỗi trang (mặc định 10) |

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "orderCode": "#TS-2026-00128",
        "createdAt": "10:24, 24/10/2023",
        "customerName": "Nguyễn Minh Anh",
        "customerPhone": "0901234567",
        "product": {
          "name": "Áo thun oversize trắng",
          "type": "custom_design",
          "sizes": "Cỡ L, XL",
          "imageUrl": "https://res.cloudinary.com/demo/image/upload/ao-001.jpg"
        },
        "totalAmountVnd": 429000,
        "payment": {
          "method": "VNPAY",
          "isPaid": true
        },
        "status": "dang_san_xuat",
        "hasPrintSpec": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 13,
      "totalItems": 128,
      "itemsPerPage": 10
    }
  }
}
```

**Giải thích trường `product.type`:**
- `custom_design`: Đơn thiết kế tùy chỉnh – hiện nhãn "Tùy chỉnh" màu xanh, hiện nút "Xuất thông số in"
- `ao_mau`: Đơn áo mẫu – hiện nhãn "Áo mẫu" màu xám, không hiện nút xuất thông số

**Frontend dùng ở đâu:** Mảng `MOCK_ORDERS` trong `OrdersPage.tsx` → thay bằng `data.items`. Phân trang: `TOTAL_ITEMS` thay bằng `data.pagination.totalItems`.

---

### 12.5. API chi tiết một đơn hàng (cho ngăn kéo)

#### `GET /api/admin/orders/:id`

Gọi khi admin bấm vào một hàng trong bảng để mở ngăn kéo `OrderDetailDrawer`.

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderCode": "#TS-2026-00128",
    "createdAt": "10:24, 24/10/2023",
    "customerName": "Nguyễn Minh Anh",
    "customerPhone": "0901234567",
    "customerEmail": "minhanh@email.com",
    "shippingAddress": "123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
    "shippingCarrier": "GHTK – Tiêu chuẩn",
    "product": {
      "name": "Áo thun oversize trắng",
      "type": "custom_design",
      "sizes": "Cỡ L, XL",
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/ao-001.jpg"
    },
    "totalAmountVnd": 429000,
    "subTotalVnd": 250000,
    "designFeeVnd": 150000,
    "shippingFeeVnd": 29000,
    "payment": { "method": "VNPAY", "isPaid": true },
    "status": "dang_san_xuat",
    "hasPrintSpec": true,
    "printPosition": "Mặt trước (Ngực giữa)",
    "printSizeCm": "20×28 cm",
    "printFileUrl": "https://res.cloudinary.com/demo/raw/upload/print-001.pdf",
    "timeline": [
      {
        "description": "Đang sản xuất – Đã xuất thông số",
        "time": "14:30, 24/10/2023",
        "actor": "Admin",
        "isActive": true
      },
      {
        "description": "Đã xác nhận thanh toán",
        "time": "10:35, 24/10/2023",
        "actor": "Hệ thống",
        "isActive": false
      },
      {
        "description": "Tạo đơn hàng mới",
        "time": "10:24, 24/10/2023",
        "actor": "Khách hàng",
        "isActive": false
      }
    ]
  }
}
```

**Lưu ý:**
- `subTotalVnd`: Giá áo (chưa tính phí thiết kế và vận chuyển)
- `designFeeVnd`: Phí thiết kế tùy chỉnh (= 0 nếu đơn áo mẫu)
- `shippingFeeVnd`: Phí vận chuyển
- `totalAmountVnd` = `subTotalVnd` + `designFeeVnd` + `shippingFeeVnd`
- `timeline`: Mảng lịch sử xử lý, sắp xếp mới nhất lên trước. Chỉ một bước có `isActive: true`
- `printPosition`, `printSizeCm`, `printFileUrl`: Chỉ cần trả về khi `product.type === "custom_design"`

**Frontend dùng ở đâu:** Hàm `handleRowClick` trong `OrdersPage.tsx` → thay `MOCK_ORDER_DETAIL` bằng kết quả API.

---

### 12.6. API cập nhật trạng thái đơn hàng

#### `PATCH /api/admin/orders/:id/status`

Gọi khi admin bấm nút **"Cập nhật trạng thái"** trong ngăn kéo chi tiết.

**Request body:**
```json
{
  "status": "cho_giao",
  "note": "Đã đóng gói xong, chuyển GHTK"
}
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cho_giao",
    "updatedAt": "2026-06-01T15:00:00.000Z"
  }
}
```

**Lưu ý:** Mỗi lần cập nhật trạng thái, Backend cần tạo thêm một bản ghi mới trong bảng lịch sử xử lý (timeline).

---

### 12.7. API hủy đơn hàng

#### `PATCH /api/admin/orders/:id/cancel`

Gọi khi admin bấm nút **"Hủy đơn"** trong ngăn kéo chi tiết.

**Request body:**
```json
{
  "reason": "Khách hàng yêu cầu hủy"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": 1, "status": "da_huy" }
}
```

---

### 12.8. API xuất thông số in

#### `POST /api/admin/orders/:id/export-print-spec`

Gọi khi admin bấm nút **in hình** (icon máy in) trên hàng bảng hoặc nút **"Tải file in"** trong ngăn kéo.

**Response:**
```json
{
  "success": true,
  "data": {
    "printSpecUrl": "https://res.cloudinary.com/demo/raw/upload/print-spec-001.pdf"
  }
}
```

**Lưu ý:** Sau khi xuất thành công, Backend cập nhật `hasPrintSpec = true` cho đơn đó.

---

### 12.9. Cách Frontend sẽ kết nối API (hướng dẫn cho nhóm FE)

Khi Backend hoàn thành, nhóm Frontend cần:

1. **Tạo file** `frontend/src/services/ordersApi.ts` chứa các hàm gọi API bằng Axios.
2. **Tạo file** `frontend/src/hooks/admin/useOrders.ts` chứa React Query hooks.
3. **Trong `OrdersPage.tsx`**: Xóa mảng `MOCK_ORDERS`, `MOCK_ORDER_DETAIL`, `STAT_CARDS` (phần giá trị `value`) và thay bằng dữ liệu từ hooks.

**Ví dụ thay thế trong `OrdersPage.tsx`:**
```tsx
// Trước (dữ liệu mẫu):
const MOCK_ORDERS: Order[] = [ ... ];

// Sau (dùng API):
const { data, isLoading } = useOrders({ status: activeTab, page: currentPage });
const orders = data?.items ?? [];
const totalItems = data?.pagination.totalItems ?? 0;
```

---

### 12.10. Database – bảng liên quan

Backend cần đảm bảo các bảng sau có đủ trường:

```sql
-- Bảng đơn hàng
orders:
  id, order_code, customer_id, status (ENUM), total_amount_vnd,
  sub_total_vnd, design_fee_vnd, shipping_fee_vnd,
  has_print_spec (BOOLEAN), created_at, updated_at

-- Bảng lịch sử trạng thái đơn
order_status_history:
  id, order_id, status, description, actor, created_at

-- Bảng sản phẩm trong đơn
order_items:
  id, order_id, product_name, product_type (ENUM: custom_design/ao_mau),
  sizes, image_url, print_position, print_size_cm, print_file_url

-- Bảng thanh toán
payments:
  id, order_id, method (VNPAY/COD/Chuyen_khoan), is_paid (BOOLEAN),
  transaction_ref, amount_vnd, created_at

-- Bảng thông tin giao hàng
shipments:
  id, order_id, carrier_name, address, created_at
```

---

# Huongdan_BE - Tich hop Backend cho Admin Dashboard TeeStudio

Tai lieu nay mo ta phan du lieu Backend can cung cap cho giao dien Admin tai route `/admin`.
Frontend hien dang dung du lieu mau trong `frontend/src/components/admin/AdminDashboard.tsx`.
Khi Backend hoan thanh API, nhom Frontend chi can thay cac mang du lieu mau bang API call.

## 1. Route Frontend

- Trang khach hang: `http://localhost:3000`
- Trang quan tri: `http://localhost:3000/admin`
- Hai route nay tach rieng trong Next.js App Router nen khong conflict layout.

## 2. Cac component Admin dang su dung

- `AdminSidebar`: menu trai cua admin.
- `AdminTopbar`: thanh tim kiem, thong bao, nut tao nhanh, avatar admin.
- `AdminButton`: component nut dung chung cho admin.
- `AdminSearchInput`: component input tim kiem dung chung.
- `MetricCard`: card KPI dau trang.
- `WorkflowPipeline`: quy trinh van hanh don hang.
- `DesignReviewTable`: bang thiet ke can xu ly.
- `StatusBadge`: hien thi trang thai thiet ke.
- `DesignPreviewCard`: thong tin preview ban ve.
- `InventoryWarningCard`: canh bao ton kho.
- `PricingSurchargeCard`: danh sach phu phi bao gia dong.

## 3. Quy uoc chung cho API

- Tien te: Backend tra so nguyen VND, vi du `18450000`. Frontend se format thanh `18.450.000đ`.
- Ngay gio: tra ISO string, vi du `2026-05-22T09:30:00.000Z`.
- Auth: cac API admin can JWT Bearer token va role `ADMIN`.
- Response thanh cong nen co dang:

```json
{
  "success": true,
  "data": {}
}
```

- Response loi nen co dang:

```json
{
  "success": false,
  "message": "Noi dung loi de hien thi cho admin",
  "code": "ADMIN_ERROR_CODE"
}
```

## 4. API tong quan dashboard

### GET `/api/admin/dashboard/overview`

Dung de lay 6 KPI o dau trang va trang thai workflow trong ngay.

Response:

```json
{
  "success": true,
  "data": {
    "summary": {
      "revenueTodayVnd": 18450000,
      "newOrders": 42,
      "pendingDesigns": 9,
      "inProduction": 17,
      "stockAlerts": 23,
      "paymentNeedReview": 6
    },
    "workflow": [
      { "key": "confirming", "label": "Chờ xác nhận", "count": 12, "state": "done" },
      { "key": "design_review", "label": "Chờ duyệt thiết kế", "count": 9, "state": "active" },
      { "key": "export_print_specs", "label": "Xuất thông số in", "count": 4, "state": "idle" },
      { "key": "production", "label": "Đang sản xuất", "count": 17, "state": "idle" },
      { "key": "packing", "label": "Đóng gói", "count": 5, "state": "idle" },
      { "key": "shipping", "label": "Giao hàng", "count": 8, "state": "idle" },
      { "key": "completed", "label": "Hoàn tất", "count": 31, "state": "idle" }
    ]
  }
}
```

Gia tri `state` chi nhan: `done`, `active`, `idle`.

## 5. API bang thiet ke can xu ly

### GET `/api/admin/design-orders`

Query de tim kiem va loc:

- `q`: ma don hoac ten khach hang.
- `status`: `all`, `pending`, `revision`, `ready`, `urgent`.
- `page`: so trang, bat dau tu 1.
- `limit`: so dong moi trang.

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "orderCode": "DH-20260522-001",
        "customerName": "Nguyễn Văn A",
        "previewImageUrl": "https://res.cloudinary.com/demo/image/upload/design-001.png",
        "printTechnique": "In PET",
        "status": "pending",
        "isUrgent": false,
        "designCode": "TK-1028",
        "createdAt": "2026-05-22T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 42,
      "totalPages": 5
    }
  }
}
```

Enum `status`:

- `pending`: Chờ duyệt
- `revision`: Cần sửa
- `ready`: Sẵn sàng in
- `urgent`: Gấp

### PATCH `/api/admin/design-orders/:id/status`

Dung khi admin cap nhat trang thai thiet ke.

Body:

```json
{
  "status": "ready",
  "note": "File đạt 300 DPI, có thể chuyển sản xuất"
}
```

## 6. API preview thiet ke

### GET `/api/admin/design-orders/:id/preview`

Dung cho card `Preview TK-1028`.

Response:

```json
{
  "success": true,
  "data": {
    "designCode": "TK-1028",
    "previewImageUrl": "https://res.cloudinary.com/demo/image/upload/design-001.png",
    "layersCount": 3,
    "printWidthCm": 8.5,
    "printHeightCm": 6.2,
    "dpi": 300,
    "sourceFileUrl": "https://res.cloudinary.com/demo/raw/upload/design-001.json"
  }
}
```

### POST `/api/admin/design-orders/:id/export-print-spec`

Dung cho nut `Xuất thông số`. Backend can tao file thong so in tu du lieu thiet ke canvas.

Response:

```json
{
  "success": true,
  "data": {
    "printSpecUrl": "https://res.cloudinary.com/demo/raw/upload/print-spec-001.pdf"
  }
}
```

## 7. API canh bao ton kho

### GET `/api/admin/inventory-alerts`

Response:

```json
{
  "success": true,
  "data": [
    {
      "variantId": 101,
      "productName": "Áo thun Cotton 100%",
      "color": "Đen",
      "size": "M",
      "quantity": 12,
      "minQuantity": 20
    },
    {
      "variantId": 102,
      "productName": "Polo Classic",
      "color": "Trắng",
      "size": "L",
      "quantity": 8,
      "minQuantity": 20
    }
  ]
}
```

Frontend hien thi `Màu: Đen | Size: M` va badge `Còn 12`.

### POST `/api/admin/inventory/receipts`

Dung cho nut `Nhập kho`.

Body:

```json
{
  "items": [
    {
      "variantId": 101,
      "quantity": 50,
      "note": "Nhập kho bổ sung tháng 05/2026"
    }
  ]
}
```

## 8. API phu phi bao gia dong

### GET `/api/admin/pricing-surcharges`

Response:

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "In PET", "amountVnd": 25000, "isActive": true },
    { "id": 2, "name": "In lụa", "amountVnd": 18000, "isActive": true },
    { "id": 3, "name": "Logo vừa", "amountVnd": 10000, "isActive": true }
  ]
}
```

### POST `/api/admin/pricing-surcharges`

Body:

```json
{
  "name": "Logo lớn",
  "amountVnd": 15000,
  "isActive": true
}
```

### PATCH `/api/admin/pricing-surcharges/:id`

Body:

```json
{
  "name": "In PET",
  "amountVnd": 25000,
  "isActive": true
}
```

## 9. API nut thao tac nhanh

### POST `/api/admin/products`

Dung cho nut `Tạo sản phẩm`.

Body de xuat:

```json
{
  "name": "Áo thun Cotton 100%",
  "basePriceVnd": 145000,
  "description": "Áo thun cotton dùng cho thiết kế cá nhân và đồng phục",
  "variants": [
    { "color": "Đen", "size": "M", "stockQuantity": 100 },
    { "color": "Trắng", "size": "L", "stockQuantity": 80 }
  ]
}
```

### GET `/api/admin/payments/reconciliation`

Dung cho KPI `Thanh toán cần đối soát`.

Response:

```json
{
  "success": true,
  "data": {
    "totalNeedReview": 6,
    "items": [
      {
        "paymentId": 501,
        "orderCode": "DH-20260522-001",
        "gateway": "VNPAY",
        "amountVnd": 350000,
        "status": "need_review",
        "transactionRef": "VNPAY-20260522-001"
      }
    ]
  }
}
```

## 10. Luu y Database

- Bang `orders` nen co `order_code`, `customer_id`, `status`, `total_amount_vnd`.
- Bang `designs` nen co `design_code`, `order_id`, `preview_image_url`, `canvas_json`, `layers_count`, `dpi`, `print_width_cm`, `print_height_cm`, `status`.
- Bang `product_variants` nen co `product_id`, `color`, `size`, `stock_quantity`, `min_stock_quantity`.
- Bang `pricing_surcharges` nen co `name`, `amount_vnd`, `is_active`.
- Bang `payments` nen co `order_id`, `gateway`, `transaction_ref`, `amount_vnd`, `status`.

## 11. Cach noi API vao Frontend sau nay

Nen tao file rieng:

- `frontend/src/services/adminApi.ts`: chua cac ham goi API bang Axios.
- `frontend/src/hooks/admin`: chua React Query hooks nhu `useAdminOverview`, `useDesignOrders`.

Khi thay du lieu mau:

- KPI thay tu `dashboard/overview.summary`.
- Bang thiet ke thay tu `design-orders.items`.
- Preview thay tu `design-orders/:id/preview`.
- Ton kho thay tu `inventory-alerts`.
- Phu phi thay tu `pricing-surcharges`.

