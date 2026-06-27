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

module.exports = {
  sendAccountCredentialsEmail,
};
