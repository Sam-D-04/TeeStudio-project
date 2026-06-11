/**
 * PromotionUsageBar – Số lượt dùng mã khuyến mãi.
 *
 * Hiển thị:
 *  - Có giới hạn: "850/1.000"
 *  - Không giới hạn: "850"
 */

type PromotionUsageBarProps = {
  daSuDung: number;          // Số lượt đã dùng
  gioiHan: number | null;    // Giới hạn tổng lượt (null = không giới hạn)
};

export default function PromotionUsageBar({
  daSuDung,
  gioiHan,
}: PromotionUsageBarProps) {
  const noiDung =
    gioiHan === null
      ? daSuDung.toLocaleString("vi-VN")
      : `${daSuDung.toLocaleString("vi-VN")}/${gioiHan.toLocaleString("vi-VN")}`;

  return (
    <span style={{ fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>
      {noiDung}
    </span>
  );
}
