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

