const db = require("../../database/mysql");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeText = (value) => String(value).trim().replace(/\s+/g, " ");

const serializeAddress = (row) => ({
  id: row.id,
  recipientName: row.recipientName,
  phone: row.phone,
  addressLine: row.addressLine,
  city: row.city,
  district: row.district,
  ward: row.ward,
  isDefault: Boolean(row.isDefault),
  createdAt: row.createdAt,
});

const findOwnedAddress = async (userId, addressId, connection = db.pool) => {
  const [rows] = await connection.query(
    `SELECT id, userId, recipientName, phone, addressLine, city, district, ward, isDefault, createdAt
     FROM UserAddress
     WHERE id = ? AND userId = ?
     LIMIT 1`,
    [addressId, userId]
  );

  return rows[0] || null;
};

const getMyAddresses = async (userId) => {
  const [rows] = await db.pool.query(
    `SELECT id, userId, recipientName, phone, addressLine, city, district, ward, isDefault, createdAt
     FROM UserAddress
     WHERE userId = ?
     ORDER BY isDefault DESC, id DESC`,
    [userId]
  );

  return rows.map(serializeAddress);
};

// Bỏ cờ mặc định ở các địa chỉ khác trước khi gán địa chỉ mới làm mặc định,
// đảm bảo mỗi user luôn có tối đa 1 địa chỉ mặc định tại một thời điểm.
const clearOtherDefaults = async (connection, userId, exceptAddressId) => {
  await connection.query(
    `UPDATE UserAddress SET isDefault = 0 WHERE userId = ? AND id != ?`,
    [userId, exceptAddressId || 0]
  );
};

const createAddress = async (userId, data) => {
  const [countRows] = await db.pool.query(
    `SELECT COUNT(*) AS total FROM UserAddress WHERE userId = ?`,
    [userId]
  );
  // Địa chỉ đầu tiên của user tự động là mặc định, dù khách có tick hay không.
  const shouldBeDefault = Boolean(data.isDefault) || countRows[0].total === 0;

  return db.transaction(async (connection) => {
    const [result] = await connection.query(
      `INSERT INTO UserAddress (userId, recipientName, phone, addressLine, city, district, ward, isDefault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        normalizeText(data.recipientName),
        normalizeText(data.phone),
        normalizeText(data.addressLine),
        normalizeText(data.city),
        normalizeText(data.district || ""),
        normalizeText(data.ward),
        shouldBeDefault ? 1 : 0,
      ]
    );
    const insertId = result.insertId;

    if (shouldBeDefault) {
      await clearOtherDefaults(connection, userId, insertId);
    }

    const address = await findOwnedAddress(userId, insertId, connection);
    return serializeAddress(address);
  });
};

const updateAddress = async (userId, addressId, data) => {
  const existing = await findOwnedAddress(userId, addressId);
  if (!existing) {
    throw createError("Không tìm thấy địa chỉ", 404);
  }

  const shouldBeDefault = Boolean(data.isDefault) || Boolean(existing.isDefault);

  return db.transaction(async (connection) => {
    await connection.query(
      `UPDATE UserAddress
       SET recipientName = ?, phone = ?, addressLine = ?, city = ?, district = ?, ward = ?, isDefault = ?
       WHERE id = ? AND userId = ?`,
      [
        normalizeText(data.recipientName),
        normalizeText(data.phone),
        normalizeText(data.addressLine),
        normalizeText(data.city),
        normalizeText(data.district || ""),
        normalizeText(data.ward),
        shouldBeDefault ? 1 : 0,
        addressId,
        userId,
      ]
    );

    if (shouldBeDefault) {
      await clearOtherDefaults(connection, userId, addressId);
    }

    const address = await findOwnedAddress(userId, addressId, connection);
    return serializeAddress(address);
  });
};

const deleteAddress = async (userId, addressId) => {
  const existing = await findOwnedAddress(userId, addressId);
  if (!existing) {
    throw createError("Không tìm thấy địa chỉ", 404);
  }

  try {
    await db.execute(`DELETE FROM UserAddress WHERE id = ? AND userId = ?`, [
      addressId,
      userId,
    ]);
  } catch (error) {
    // FK addressId trên CustomerOrder là ON DELETE RESTRICT — địa chỉ đã dùng
    // để đặt hàng thì không thể xoá, phải báo lỗi dễ hiểu cho khách thay vì lỗi DB thô.
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
      throw createError(
        "Không thể xoá địa chỉ đã được dùng để đặt hàng",
        409
      );
    }
    throw error;
  }
};

const setDefaultAddress = async (userId, addressId) => {
  const existing = await findOwnedAddress(userId, addressId);
  if (!existing) {
    throw createError("Không tìm thấy địa chỉ", 404);
  }

  return db.transaction(async (connection) => {
    await clearOtherDefaults(connection, userId, addressId);
    await connection.query(`UPDATE UserAddress SET isDefault = 1 WHERE id = ?`, [
      addressId,
    ]);

    const address = await findOwnedAddress(userId, addressId, connection);
    return serializeAddress(address);
  });
};

module.exports = {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
