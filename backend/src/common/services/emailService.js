const nodemailer = require("nodemailer");

let transporter;

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw createServiceError(
      "Dịch vụ email chưa được cấu hình. Tài khoản chưa được tạo.",
      503
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return { transporter, user };
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sendAccountCredentialsEmail = async ({
  to,
  fullName,
  temporaryPassword,
}) => {
  try {
    const { transporter: gmailTransporter, user } = getTransporter();
    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(to);
    const safePassword = escapeHtml(temporaryPassword);

    return await gmailTransporter.sendMail({
      from: { name: "TeeStudio", address: user },
      to,
      subject: "Thông tin đăng nhập tài khoản TeeStudio",
      text: [
        `Xin chào ${fullName},`,
        "",
        "Tài khoản TeeStudio của bạn vừa được quản trị viên tạo.",
        `Email đăng nhập: ${to}`,
        `Mật khẩu tạm thời: ${temporaryPassword}`,
        "",
        "Vui lòng giữ bí mật thông tin đăng nhập và đổi mật khẩu sau khi đăng nhập.",
        "",
        "Đây là email tự động, vui lòng không trả lời email này.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a;line-height:1.6">
          <h2 style="color:#0284c7">Chào mừng bạn đến với TeeStudio</h2>
          <p>Xin chào <strong>${safeName}</strong>,</p>
          <p>Tài khoản TeeStudio của bạn vừa được quản trị viên tạo.</p>
          <div style="padding:16px 20px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
            <p style="margin:0 0 8px"><strong>Email đăng nhập:</strong> ${safeEmail}</p>
            <p style="margin:0"><strong>Mật khẩu tạm thời:</strong> <code>${safePassword}</code></p>
          </div>
          <div style="margin-top:16px">
            Vui lòng giữ bí mật thông tin đăng nhập và đổi mật khẩu sau khi đăng nhập.<br><br>
            Đây là email tự động, vui lòng không trả lời email này.
          </div>
        </div>
      `,
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Không thể gửi email thông tin tài khoản:", error.message);
    throw createServiceError(
      "Không thể gửi email thông tin đăng nhập. Tài khoản chưa được tạo.",
      502
    );
  }
};

// Định dạng số tiền theo kiểu Việt Nam, vd 120000 -> "120.000₫"
const formatVND = (value) => `${Number(value || 0).toLocaleString("vi-VN")}₫`;

// Nhãn tiếng Việt cho phương thức thanh toán, dùng để nói cho khách biết bước
// tiếp theo cần làm gì (vd COD thì nhắc chuẩn bị tiền mặt khi nhận hàng).
const NHAN_PHUONG_THUC_THANH_TOAN = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "VNPAY",
  MOMO: "Ví MoMo",
};

/**
 * sendOrderConfirmationEmail - Gửi email xác nhận ngay sau khi khách đặt hàng
 * thành công.
 *
 * Hàm này CHỦ ĐỘNG throw lỗi khi gửi thất bại (giống sendAccountCredentialsEmail),
 * việc quyết định "lỗi gửi mail có làm fail cả luồng đặt hàng hay không" là
 * trách nhiệm của nơi gọi hàm này (customer.order.service.js) - nơi đó phải tự
 * bọc try/catch riêng và chỉ log lỗi, không throw tiếp, vì đơn hàng lúc gọi hàm
 * này đã được tạo thành công trong DB rồi, không nên vì gửi mail lỗi mà báo cho
 * khách là "đặt hàng thất bại".
 */
const sendOrderConfirmationEmail = async ({
  to,
  recipientName,
  orderCode,
  items,
  subtotal,
  shippingFee,
  discountAmount,
  totalAmount,
  paymentMethod,
  diaChiGiaoHang,
}) => {
  try {
    const { transporter: gmailTransporter, user } = getTransporter();
    const safeName = escapeHtml(recipientName);
    const safeOrderCode = escapeHtml(orderCode);
    const nhanPhuongThuc =
      NHAN_PHUONG_THUC_THANH_TOAN[paymentMethod] || paymentMethod;

    // Dòng chữ liệt kê từng sản phẩm cho bản text thuần (không có HTML)
    const dongSanPhamText = items
      .map(
        (item) =>
          `- ${item.tenSanPham} (${item.size}/${item.color}) x${item.quantity}: ${formatVND(
            item.unitPrice * item.quantity + item.designFee
          )}`
      )
      .join("\n");

    // Bảng sản phẩm cho bản HTML
    const dongSanPhamHtml = items
      .map((item) => {
        const thanhTien = item.unitPrice * item.quantity + item.designFee;
        return `
          <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9">
              ${escapeHtml(item.tenSanPham)}<br>
              <span style="color:#94a3b8;font-size:12px">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</span>
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center">${item.quantity}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right">${formatVND(thanhTien)}</td>
          </tr>
        `;
      })
      .join("");

    const diaChiText = [
      diaChiGiaoHang.diaChiChiTiet,
      diaChiGiaoHang.ward,
      diaChiGiaoHang.city,
    ]
      .filter(Boolean)
      .join(", ");

    return await gmailTransporter.sendMail({
      from: { name: "TeeStudio", address: user },
      to,
      subject: `TeeStudio - Xác nhận đơn hàng ${orderCode}`,
      text: [
        `Xin chào ${recipientName},`,
        "",
        `Cảm ơn bạn đã đặt hàng tại TeeStudio. Đơn hàng ${orderCode} của bạn đã được ghi nhận.`,
        "",
        "Sản phẩm:",
        dongSanPhamText,
        "",
        `Tạm tính: ${formatVND(subtotal)}`,
        `Phí vận chuyển: ${formatVND(shippingFee)}`,
        ...(discountAmount > 0 ? [`Giảm giá: -${formatVND(discountAmount)}`] : []),
        `Tổng cộng: ${formatVND(totalAmount)}`,
        "",
        `Phương thức thanh toán: ${nhanPhuongThuc}`,
        `Địa chỉ giao hàng: ${diaChiText}`,
        "",
        "Bạn có thể xem trạng thái đơn hàng trong mục \"Đơn hàng của tôi\" trên website.",
        "",
        "Đây là email tự động, vui lòng không trả lời email này.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a;line-height:1.6">
          <h2 style="color:#0284c7">Cảm ơn bạn đã đặt hàng tại TeeStudio!</h2>
          <p>Xin chào <strong>${safeName}</strong>,</p>
          <p>Đơn hàng <strong>${safeOrderCode}</strong> của bạn đã được ghi nhận và đang chờ xử lý.</p>

          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <thead>
              <tr style="background:#f0f9ff">
                <th style="padding:10px 8px;text-align:left;font-size:13px">Sản phẩm</th>
                <th style="padding:10px 8px;text-align:center;font-size:13px">SL</th>
                <th style="padding:10px 8px;text-align:right;font-size:13px">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${dongSanPhamHtml}
            </tbody>
          </table>

          <div style="margin-top:12px;padding:16px 20px;background:#f8fafc;border-radius:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span>Tạm tính</span><span>${formatVND(subtotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span>Phí vận chuyển</span><span>${formatVND(shippingFee)}</span>
            </div>
            ${
              discountAmount > 0
                ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#16a34a">
                     <span>Giảm giá</span><span>-${formatVND(discountAmount)}</span>
                   </div>`
                : ""
            }
            <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;font-weight:bold">
              <span>Tổng cộng</span><span style="color:#0ea5e9">${formatVND(totalAmount)}</span>
            </div>
          </div>

          <p style="margin-top:16px"><strong>Phương thức thanh toán:</strong> ${escapeHtml(nhanPhuongThuc)}</p>
          <p><strong>Địa chỉ giao hàng:</strong> ${escapeHtml(diaChiText)}</p>

          <div style="margin-top:16px">
            Bạn có thể xem trạng thái đơn hàng trong mục "Đơn hàng của tôi" trên website.<br><br>
            Đây là email tự động, vui lòng không trả lời email này.
          </div>
        </div>
      `,
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Không thể gửi email xác nhận đơn hàng:", error.message);
    throw createServiceError("Không thể gửi email xác nhận đơn hàng.", 502);
  }
};

/**
 * sendDesignRevisionEmail – Gửi email thông báo yêu cầu khách chỉnh sửa thiết kế.
 *
 * Hàm này KHÔNG throw lỗi ra ngoài khi gửi thất bại (chỉ log console.error).
 * Lý do: trạng thái thiết kế đã được cập nhật trong DB trước khi hàm này được gọi;
 * không nên vì lỗi gửi mail mà báo lỗi ngược lại cho admin.
 */
const sendDesignRevisionEmail = async ({
  to,        // email khách hàng
  fullName,  // tên khách hàng
  maThietKe, // ví dụ: "TK-0042"
  ghiChu,    // nội dung ghi chú admin nhập
}) => {
  try {
    const { transporter: gmailTransporter, user } = getTransporter();
    const safeName = escapeHtml(fullName);
    const safeMa = escapeHtml(maThietKe);
    const safeGhiChu = escapeHtml(ghiChu || "");

    return await gmailTransporter.sendMail({
      from: { name: "TeeStudio", address: user },
      to,
      subject: `TeeStudio – Yêu cầu chỉnh sửa thiết kế ${maThietKe}`,
      text: [
        `Xin chào ${fullName},`,
        "",
        `Thiết kế ${maThietKe} của bạn cần được chỉnh sửa trước khi tiếp tục xử lý đơn hàng.`,
        "",
        "Lý do / Ghi chú từ TeeStudio:",
        `"${ghiChu || ""}"`,
        "",
        "Vui lòng đăng nhập vào tài khoản TeeStudio để xem và chỉnh sửa thiết kế của bạn.",
        "",
        "Đây là email tự động, vui lòng không trả lời email này.",
        "Trân trọng,",
        "Đội ngũ TeeStudio",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a;line-height:1.6">
          <h2 style="color:#ea580c">Yêu cầu chỉnh sửa thiết kế</h2>
          <p>Xin chào <strong>${safeName}</strong>,</p>
          <p>
            Thiết kế <strong>${safeMa}</strong> của bạn cần được chỉnh sửa
            trước khi tiếp tục xử lý đơn hàng.
          </p>
          <div style="padding:16px 20px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin:16px 0">
            <p style="margin:0 0 8px;font-weight:bold;color:#9a3412">Lý do / Ghi chú từ TeeStudio:</p>
            <p style="margin:0;white-space:pre-wrap">${safeGhiChu}</p>
          </div>
          <p>Vui lòng đăng nhập vào tài khoản TeeStudio để xem và chỉnh sửa thiết kế của bạn.</p>
          <div style="margin-top:16px;color:#64748b;font-size:13px">
            Đây là email tự động, vui lòng không trả lời email này.<br>
            Trân trọng,<br>
            Đội ngũ TeeStudio
          </div>
        </div>
      `,
    });
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Không thể gửi email yêu cầu chỉnh sửa thiết kế:", error.message);
    // KHÔNG throw tiếp – lỗi gửi mail không được làm hỏng luồng nghiệp vụ đã hoàn thành
  }
};

module.exports = {
  sendAccountCredentialsEmail,
  sendOrderConfirmationEmail,
  sendDesignRevisionEmail,
};
