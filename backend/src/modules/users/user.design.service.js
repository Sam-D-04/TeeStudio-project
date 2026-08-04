const db = require("../../database/mysql");
const { calculateBoundingBoxAreaFee } = require("../pricing/admin.pricing.service");
const { chuanHoaCanvasData } = require("../../common/utils/canvas.util");
const { sendDesignSubmittedToAdminEmail } = require("../../common/services/emailService");
const { dongBoViTriInTheoCanvas } = require("../designs/admin.design.service");

/**
 * Maps frontend shirtType to a database product ID.
 * Since we don't have a rigid slug mapping locally for tshirt/polo/hoodie to product ids,
 * we can do a quick name mapping or fallback to 1.
 */
async function mapShirtTypeToProductId(shirtType) {
  let nameLike = 'Áo Thun%';
  if (shirtType === 'polo') nameLike = 'Áo Polo%';
  if (shirtType === 'hoodie') nameLike = 'Áo Hoodie%';

  const [rows] = await db.pool.query(
    "SELECT id FROM Product WHERE name LIKE ? LIMIT 1",
    [nameLike]
  );
  if (rows.length > 0) return rows[0].id;
  
  // Fallback to the first product if not found
  const [fbRows] = await db.pool.query("SELECT id FROM Product LIMIT 1");
  return fbRows.length > 0 ? fbRows[0].id : 1;
}

/**
 * Get all saved designs for a user (mọi trạng thái: DRAFT/PENDING_REVIEW/NEEDS_REVISION/APPROVED)
 * để khách hàng thấy được thiết kế của mình kể cả sau khi đã gửi duyệt hoặc bị yêu cầu chỉnh sửa.
 */
async function getMyDesigns(userId) {
  const [rows] = await db.pool.query(
    `SELECT id, name, productId, baseColor, canvasData, previewUrl,
            printFileUrlFront, printFileUrlBack, status, adminNote, updatedAt
     FROM CustomDesign
     WHERE userId = ? AND status IN ('DRAFT', 'PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED')
     ORDER BY updatedAt DESC`,
    [userId]
  );
  
  // Parse JSON data before returning
  return rows.map(row => {
    try {
      if (typeof row.canvasData === 'string') {
        row.canvasData = JSON.parse(row.canvasData);
      }
    } catch (e) {
      // ignore parse error, return raw string or empty
    }
    return row;
  });
}

/**
 * Create a new DRAFT custom design.
 */
async function saveNewDesign(userId, payload) {
  const { name, shirtType, shirtColor, previewUrl } = payload;
  
  // Chuẩn hoá và validate dữ liệu từ client
  const canvasData = chuanHoaCanvasData(payload.canvasData, shirtType);

  const productId = await mapShirtTypeToProductId(shirtType);
  const dataStr = JSON.stringify(canvasData);

  // Tự động tính designFee từ canvasData – Backend không tin tưởng giá trị FE gửi lên
  const designFee = calculateBoundingBoxAreaFee(canvasData);

  const conn = await db.pool.getConnection();
  let insertId;
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO CustomDesign (userId, name, productId, baseColor, canvasData, previewUrl, status, designFee) 
       VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
      [userId, name || 'Thiết kế chưa đặt tên', productId, shirtColor, dataStr, previewUrl, designFee]
    );
    insertId = result.insertId;

    await dongBoViTriInTheoCanvas(conn, insertId, canvasData);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return { id: insertId, designFee };
}

/**
 * Update an existing design — chỉ cho phép khi DRAFT (đang soạn) hoặc NEEDS_REVISION
 * (admin yêu cầu sửa). PENDING_REVIEW/APPROVED bị khoá để tránh sửa giữa lúc admin
 * đang xét duyệt hoặc thiết kế đã lên production.
 */
async function updateDesign(userId, designId, payload) {
  const { name, shirtType, shirtColor, previewUrl } = payload;

  // Chuẩn hoá và validate dữ liệu từ client
  const canvasData = chuanHoaCanvasData(payload.canvasData, shirtType);

  // Verify ownership and status
  const [check] = await db.pool.query(
    "SELECT id FROM CustomDesign WHERE id = ? AND userId = ? AND status IN ('DRAFT', 'NEEDS_REVISION')",
    [designId, userId]
  );

  if (check.length === 0) {
    const error = new Error("Design not found or cannot be edited");
    error.status = 404;
    throw error;
  }

  const productId = await mapShirtTypeToProductId(shirtType);
  const dataStr = JSON.stringify(canvasData);

  // Tự động tính lại designFee mỗi lần user lưu (dữ liệu thay đổi thì phí cũng thay đổi)
  const designFee = calculateBoundingBoxAreaFee(canvasData);

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE CustomDesign 
       SET name = COALESCE(?, name), productId = ?, baseColor = ?, canvasData = ?, previewUrl = ?, designFee = ?
       WHERE id = ?`,
      [name || null, productId, shirtColor, dataStr, previewUrl, designFee, designId]
    );

    await dongBoViTriInTheoCanvas(conn, designId, canvasData);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return { id: designId, designFee };
}

/**
 * Gán variantId (biến thể sản phẩm thật, có color/size/stock) cho thiết kế — gọi khi
 * khách thêm thiết kế vào giỏ hàng và chọn 1 size cụ thể. Bắt buộc phải có bước này vì
 * Design Studio chỉ lưu baseColor dạng mã hex tự chọn từ palette dựng sẵn (không gắn với
 * ProductVariant thật), nên nếu không gán variantId thì lúc tạo đơn không có cách nào so
 * khớp màu chính xác giữa thiết kế và biến thể khách chọn.
 * Không giới hạn theo status (khác updateDesign) vì gán variant không làm thay đổi nội
 * dung thiết kế, và khách có thể thêm vào giỏ ở bất kỳ trạng thái nào (kể cả PENDING_REVIEW/APPROVED).
 */
async function attachVariant(userId, designId, variantId) {
  const [rowsDesign] = await db.pool.query(
    "SELECT id, productId FROM CustomDesign WHERE id = ? AND userId = ?",
    [designId, userId]
  );
  if (rowsDesign.length === 0) {
    const error = new Error("Không tìm thấy thiết kế");
    error.status = 404;
    throw error;
  }

  const [rowsVariant] = await db.pool.query(
    "SELECT id, productId FROM ProductVariant WHERE id = ?",
    [variantId]
  );
  if (rowsVariant.length === 0 || rowsVariant[0].productId !== rowsDesign[0].productId) {
    const error = new Error("Biến thể sản phẩm không khớp với sản phẩm của thiết kế");
    error.status = 400;
    throw error;
  }

  await db.pool.query("UPDATE CustomDesign SET variantId = ? WHERE id = ?", [variantId, designId]);
  return { id: designId, variantId };
}

/**
 * Delete a DRAFT design.
 */
async function deleteDesign(userId, designId) {
  const [result] = await db.pool.query(
    "DELETE FROM CustomDesign WHERE id = ? AND userId = ? AND status = 'DRAFT'",
    [designId, userId]
  );
  if (result.affectedRows === 0) {
    const error = new Error("Design not found or cannot be deleted");
    error.status = 404;
    throw error;
  }
  return { success: true };
}

/**
 * Gửi thiết kế cho admin duyệt: DRAFT hoặc NEEDS_REVISION → PENDING_REVIEW.
 * Sau khi cập nhật DB thành công → gửi email thông báo cho Admin (fire-and-forget).
 * Không xoá adminNote cũ — giữ làm ngữ cảnh cho tới khi admin duyệt hoặc ghi chú mới đè lên.
 */
async function submitForReview(userId, designId) {
  // Lấy thông tin thiết kế + khách hàng trước khi update
  const [rows] = await db.pool.query(
    `SELECT cd.id, a.fullName, a.email
     FROM CustomDesign cd
     LEFT JOIN Account a ON a.id = cd.userId
     WHERE cd.id = ? AND cd.userId = ? AND cd.status IN ('DRAFT', 'NEEDS_REVISION')`,
    [designId, userId]
  );
  if (rows.length === 0) {
    const error = new Error("Không tìm thấy thiết kế hoặc thiết kế không ở trạng thái có thể gửi duyệt");
    error.status = 404;
    throw error;
  }

  const [result] = await db.pool.query(
    "UPDATE CustomDesign SET status = 'PENDING_REVIEW' WHERE id = ? AND userId = ? AND status IN ('DRAFT', 'NEEDS_REVISION')",
    [designId, userId]
  );
  if (result.affectedRows === 0) {
    const error = new Error("Không thể cập nhật trạng thái thiết kế");
    error.status = 409;
    throw error;
  }

  // Gửi email thông báo cho Admin (fire-and-forget, lỗi mail không block response khách)
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (adminEmail) {
    const maThietKe = `TK-${String(designId).padStart(4, "0")}`;
    sendDesignSubmittedToAdminEmail({
      adminEmail,
      customerName: rows[0].fullName || "Khách hàng",
      maThietKe,
      designId,
    }).catch((err) =>
      console.error("Lỗi gửi email thông báo admin (thiết kế nộp lại):", err?.message)
    );
  }

  return { id: designId, status: "PENDING_REVIEW" };
}

module.exports = {
  getMyDesigns,
  saveNewDesign,
  updateDesign,
  attachVariant,
  deleteDesign,
  submitForReview,
};
