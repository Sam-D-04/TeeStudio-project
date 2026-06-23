const db = require("../../database/mysql");
const { calculateBoundingBoxAreaFee } = require("../pricing/pricing.service");

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
 * Get all saved DRAFT designs for a user.
 */
async function getMyDesigns(userId) {
  const [rows] = await db.pool.query(
    `SELECT id, name, productId, baseColor, canvasData, previewUrl, status, updatedAt 
     FROM CustomDesign 
     WHERE userId = ? AND status = 'DRAFT'
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
  const { name, shirtType, shirtColor, canvasData, previewUrl } = payload;
  
  const productId = await mapShirtTypeToProductId(shirtType);
  const dataStr = typeof canvasData === 'object' ? JSON.stringify(canvasData) : canvasData;

  // Tự động tính designFee từ canvasData – Backend không tin tưởng giá trị FE gửi lên
  const designFee = calculateBoundingBoxAreaFee(canvasData);

  const [result] = await db.pool.query(
    `INSERT INTO CustomDesign (userId, name, productId, baseColor, canvasData, previewUrl, status, designFee) 
     VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
    [userId, name || 'Thiết kế chưa đặt tên', productId, shirtColor, dataStr, previewUrl, designFee]
  );

  return { id: result.insertId, designFee };
}

/**
 * Update an existing DRAFT design.
 */
async function updateDesign(userId, designId, payload) {
  const { name, shirtType, shirtColor, canvasData, previewUrl } = payload;
  
  // Verify ownership and status
  const [check] = await db.pool.query(
    "SELECT id FROM CustomDesign WHERE id = ? AND userId = ? AND status = 'DRAFT'",
    [designId, userId]
  );
  
  if (check.length === 0) {
    const error = new Error("Design not found or cannot be edited");
    error.status = 404;
    throw error;
  }

  const productId = await mapShirtTypeToProductId(shirtType);
  const dataStr = typeof canvasData === 'object' ? JSON.stringify(canvasData) : canvasData;

  // Tự động tính lại designFee mỗi lần user lưu (dữ liệu thay đổi thì phí cũng thay đổi)
  const designFee = calculateBoundingBoxAreaFee(canvasData);

  await db.pool.query(
    `UPDATE CustomDesign 
     SET name = COALESCE(?, name), productId = ?, baseColor = ?, canvasData = ?, previewUrl = ?, designFee = ?
     WHERE id = ?`,
    [name || null, productId, shirtColor, dataStr, previewUrl, designFee, designId]
  );

  return { id: designId, designFee };
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

module.exports = {
  getMyDesigns,
  saveNewDesign,
  updateDesign,
  deleteDesign,
};
