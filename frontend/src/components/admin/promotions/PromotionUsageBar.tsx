/**
 * PromotionUsageBar – Thanh tiến độ lượt dùng mã khuyến mãi.
 *
 * Hiển thị:
 *  - Thanh progress (màu thay đổi theo % sử dụng)
 *  - Nhãn số: "850/1000" hoặc "Không giới hạn"
 *
 * Màu thanh:
 *  - < 50%  → Xanh sky blue (#0ea5e9)
 *  - 50-85% → Vàng cảnh báo (#f59e0b)
 *  - >= 85% → Xám (đã dùng gần hết/hết)
 */

type PromotionUsageBarProps = {
  daSDung: number;           // Số lượt đã dùng
  gioiHan: number | null;    // Giới hạn tổng lượt (null = không giới hạn)
};

export default function PromotionUsageBar({
  daSDung,
  gioiHan,
}: PromotionUsageBarProps) {
  // Nếu không giới hạn → chỉ hiển thị số đã dùng, không có thanh
  if (gioiHan === null) {
    return (
      <span style={{ fontSize: 12, color: "#94a3b8" }}>
        {daSDung.toLocaleString("vi-VN")} lượt
      </span>
    );
  }

  // Tính phần trăm đã dùng (không vượt quá 100%)
  const phanTram = Math.min((daSDung / gioiHan) * 100, 100);

  // Chọn màu thanh dựa theo % đã dùng
  let mauThanh = "#0ea5e9"; // Mặc định: xanh sky blue
  if (phanTram >= 85) {
    mauThanh = "#94a3b8";   // Xám: gần đầy hoặc đầy
  } else if (phanTram >= 50) {
    mauThanh = "#f59e0b";   // Vàng: đã dùng nhiều
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Thanh nền xám */}
      <div
        style={{
          flex: 1,
          height: 6,
          backgroundColor: "#eaeef2",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        {/* Phần đã điền theo % */}
        <div
          style={{
            height: "100%",
            width: `${phanTram}%`,
            backgroundColor: mauThanh,
            borderRadius: 9999,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Nhãn số */}
      <span style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
        {daSDung.toLocaleString("vi-VN")}/{gioiHan.toLocaleString("vi-VN")}
      </span>
    </div>
  );
}
