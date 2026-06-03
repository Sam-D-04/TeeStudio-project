/**
 * DesignPreview – Ô thumbnail hiển thị bản xem trước thiết kế.
 *
 * Trong giai đoạn phát triển (khi chưa có ảnh thật từ Cloudinary),
 * component tự vẽ mockup đơn giản dựa theo màu áo và mã thiết kế.
 *
 * Khi backend tích hợp Cloudinary, chỉ cần truyền prop `urlAnh` là đủ.
 *
 * Cách dùng:
 *   <DesignPreview mauAo="#000000" maThietKe="TK-2024" urlAnh={undefined} />
 *   <DesignPreview urlAnh="https://res.cloudinary.com/..." />
 */

type DesignPreviewProps = {
  urlAnh?: string;      // URL ảnh thật từ Cloudinary (tùy chọn)
  mauAo?: string;       // Màu hex của áo (dùng khi chưa có ảnh, ví dụ "#000000")
  maThietKe?: string;   // Mã thiết kế ngắn (2 ký tự đầu, ví dụ "TK")
};

export default function DesignPreview({
  urlAnh,
  mauAo = "#e2e8f0",
  maThietKe = "TK",
}: DesignPreviewProps) {
  // Lấy 2 ký tự đầu của mã để hiển thị trong ô mockup
  const kyTuDau = maThietKe.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "TK";

  // Xác định màu chữ dựa theo độ sáng của màu áo
  // Quy tắc đơn giản: nếu màu tối thì chữ trắng, màu sáng thì chữ tối
  function layMauChu(hexMau: string): string {
    // Chuyển hex → RGB rồi tính độ sáng (luminance)
    const hex = hexMau.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Công thức tính độ sáng theo tiêu chuẩn W3C
    const doSang = (r * 299 + g * 587 + b * 114) / 1000;
    return doSang > 128 ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";
  }

  // Nếu có URL ảnh thật → hiển thị ảnh
  if (urlAnh) {
    return (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={urlAnh}
          alt="Bản xem trước thiết kế"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  // Nếu chưa có ảnh → vẽ mockup bằng màu áo + chữ viết tắt
  const mauChu = layMauChu(mauAo);

  return (
    <div
      title={`Mockup thiết kế: ${maThietKe}`}
      style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        flexShrink: 0,
        backgroundColor: mauAo,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Chữ viết tắt ở giữa */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: mauChu,
          letterSpacing: "0.05em",
          userSelect: "none",
        }}
      >
        {kyTuDau}
      </span>

      {/* Chấm nhỏ góc trên trái - giả lập logo/hình in */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: mauChu,
          opacity: 0.4,
        }}
      />
    </div>
  );
}
