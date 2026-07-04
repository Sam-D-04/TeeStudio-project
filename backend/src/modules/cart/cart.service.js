const db = require("../../database/mysql");

async function layOrTaoCart(userId) {
  const [carts] = await db.pool.query(
    "SELECT id FROM Cart WHERE userId = ?",
    [userId]
  );
  if (carts.length > 0) return carts[0].id;

  const [result] = await db.pool.query(
    "INSERT INTO Cart (userId) VALUES (?)",
    [userId]
  );
  return result.insertId;
}

async function layGioHang(userId) {
  const [carts] = await db.pool.query(
    "SELECT id FROM Cart WHERE userId = ?",
    [userId]
  );
  if (carts.length === 0) return [];

  const cartId = carts[0].id;
  const [items] = await db.pool.query(
    `SELECT
       ci.id          AS id,
       ci.variantId,
       ci.designId,
       ci.quantity,
       pv.color,
       pv.size,
       pv.productId,
       p.name         AS productName,
       p.basePrice    AS price,
       (SELECT pi.imageUrl FROM ProductImage pi
        WHERE pi.productId = p.id AND pi.isPrimary = 1
        LIMIT 1)      AS image
     FROM CartItem ci
     JOIN ProductVariant pv ON ci.variantId = pv.id
     JOIN Product p ON pv.productId = p.id
     WHERE ci.cartId = ?
     ORDER BY ci.id ASC`,
    [cartId]
  );
  return items;
}

async function themVaoGioHang(userId, { variantId, quantity, designId }) {
  const cartId = await layOrTaoCart(userId);

  const [existing] = await db.pool.query(
    "SELECT id, quantity FROM CartItem WHERE cartId = ? AND variantId = ? AND designId <=> ?",
    [cartId, variantId, designId ?? null]
  );

  if (existing.length > 0) {
    const newQty = existing[0].quantity + quantity;
    await db.pool.query(
      "UPDATE CartItem SET quantity = ? WHERE id = ?",
      [newQty, existing[0].id]
    );
    return { id: existing[0].id, quantity: newQty };
  }

  const [result] = await db.pool.query(
    "INSERT INTO CartItem (cartId, variantId, designId, quantity) VALUES (?, ?, ?, ?)",
    [cartId, variantId, designId ?? null, quantity]
  );
  return { id: result.insertId, quantity };
}

async function capNhatSoLuong(userId, cartItemId, quantity) {
  const [rows] = await db.pool.query(
    `SELECT ci.id FROM CartItem ci
     JOIN Cart c ON ci.cartId = c.id
     WHERE ci.id = ? AND c.userId = ?`,
    [cartItemId, userId]
  );
  if (rows.length === 0) {
    const err = new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    err.statusCode = 404;
    throw err;
  }
  await db.pool.query("UPDATE CartItem SET quantity = ? WHERE id = ?", [quantity, cartItemId]);
}

async function xoaKhoiGioHang(userId, cartItemId) {
  const [rows] = await db.pool.query(
    `SELECT ci.id FROM CartItem ci
     JOIN Cart c ON ci.cartId = c.id
     WHERE ci.id = ? AND c.userId = ?`,
    [cartItemId, userId]
  );
  if (rows.length === 0) {
    const err = new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    err.statusCode = 404;
    throw err;
  }
  await db.pool.query("DELETE FROM CartItem WHERE id = ?", [cartItemId]);
}

async function xoaToanBoGioHang(userId) {
  const [carts] = await db.pool.query("SELECT id FROM Cart WHERE userId = ?", [userId]);
  if (carts.length === 0) return;
  await db.pool.query("DELETE FROM CartItem WHERE cartId = ?", [carts[0].id]);
}

async function dongBoGioHang(userId, items) {
  const cartId = await layOrTaoCart(userId);

  await db.pool.query("DELETE FROM CartItem WHERE cartId = ?", [cartId]);

  if (!items || items.length === 0) return [];

  const values = items.map((i) => [cartId, i.variantId, i.designId ?? null, i.quantity]);
  await db.pool.query(
    "INSERT INTO CartItem (cartId, variantId, designId, quantity) VALUES ?",
    [values]
  );

  return layGioHang(userId);
}

module.exports = {
  layGioHang,
  themVaoGioHang,
  capNhatSoLuong,
  xoaKhoiGioHang,
  xoaToanBoGioHang,
  dongBoGioHang,
};
