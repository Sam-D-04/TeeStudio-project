/**
 * customer.order.service.js – Xử lý logic đặt hàng từ phía khách hàng.
 *
 * Khác biệt với admin.order.service.js:
 * - Không yêu cầu thiết kế phải APPROVED trước khi đặt hàng
 * - Tự động chuyển thiết kế sang PENDING_REVIEW để gửi cho admin duyệt
 * - Khách hàng có thể đặt hàng ngay sau khi lưu thiết kế (DRAFT)
 */

const db = require("../../database/mysql");
const {
  taoLinkThanhToanVnpay,
  taoMaGiaoDichVnpayMoi,
} = require("../payments/vnpay.service");
const {
  taoLinkThanhToanMomo,
  taoMaGiaoDichMomoMoi,
  layThoiDiemHetHanMomo,
} = require("../payments/momo.service");
const { uploadBase64Image } = require("../uploads/upload.service");

const DEPOSIT_PERCENT = 50;
const ONLINE_PAYMENT_METHODS = new Set(["VNPAY", "MOMO"]);
const PREPAID_PAYMENT_TYPES = new Set(["FULL", "FULL_PAYMENT", "DEPOSIT"]);
const ACTION_CUSTOMER_CREATED = "Khách hàng đặt đơn";

function taoMaDonHangMoi() {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TS-${dateStr}-${randomPart}`;
}

async function taoThongTinThanhToanOnline({
  paymentMethod,
  orderCode,
  amount,
  ipAddress,
}) {
  if (paymentMethod === "VNPAY") {
    const maGiaoDich = taoMaGiaoDichVnpayMoi();
    const vnpayUrl = taoLinkThanhToanVnpay({
      transactionId: maGiaoDich,
      amount: Math.round(amount),
      orderInfo: `Thanh toán đơn hàng ${orderCode}`,
      ipAddress,
    });
    return {
      paymentUrl: vnpayUrl,
      transactionRef: maGiaoDich,
    };
  } else if (paymentMethod === "MOMO") {
    const maGiaoDich = taoMaGiaoDichMomoMoi();
    const momoLink = taoLinkThanhToanMomo({
      transactionId: maGiaoDich,
      amount: Math.round(amount),
      orderInfo: `Thanh toán đơn hàng ${orderCode}`,
    });
    const expiresAt = layThoiDiemHetHanMomo();
    return {
      paymentUrl: momoLink,
      qrCodeValue: momoLink,
      transactionRef: maGiaoDich,
      expiresAt,
    };
  }
  return null;
}

function tinhThongTinThanhToan(
  totalAmount,
  paymentMethod,
  paymentType = "FULL"
) {
  const result = {
    depositPercent: 0,
    depositAmount: 0,
    codAmount: 0,
    paymentAmount: totalAmount,
  };

  if (paymentMethod !== "COD" && paymentType === "DEPOSIT") {
    result.depositPercent = DEPOSIT_PERCENT;
    result.depositAmount = Math.round(
      (totalAmount * DEPOSIT_PERCENT) / 100 * 100
    ) / 100;
    result.paymentAmount = result.depositAmount;
  } else if (paymentMethod === "COD") {
    result.codAmount = totalAmount;
    result.paymentAmount = 0;
  }

  return result;
}

function chuanHoaGiaTriSoSanh(value) {
  if (!value) return "";
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function taoLichSuTaoDon() {
  return {
    action: "CREATED",
    note: ACTION_CUSTOMER_CREATED,
  };
}

async function ghiOrderHistory(conn, {
  orderId,
  fromStatus,
  toStatus,
  action,
  actor,
  note,
}) {
  await conn.query(
    `INSERT INTO OrderHistory (orderId, fromStatus, toStatus, action, actorId, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      fromStatus,
      toStatus,
      action,
      actor?.id || null,
      note || "",
    ]
  );
}

/**
 * createOrderAsCustomer – Tạo đơn hàng từ phía khách hàng.
 *
 * Khác với admin:
 * - Không yêu cầu thiết kế APPROVED — cho phép DRAFT hoặc bất kỳ trạng thái nào
 * - Tự động chuyển thiết kế sang PENDING_REVIEW để gửi admin duyệt
 * - Actor sẽ là `req.user` (khách hàng đang đặt hàng)
 */
async function createOrderAsCustomer(data, actor, ipAddress) {
  const {
    userId,
    recipientName,
    phone,
    addressLine,
    city = "",
    ward = "",
    items,
    paymentMethod,
    paymentType = "FULL",
    shippingFee: shippingFeeInput = 0,
    promotionId = null,
  } = data;

  // ─────────────────────────────────────────────
  // BƯỚC 1: Validate business logic (ngoài transaction)
  // ─────────────────────────────────────────────

  // 1a. Kiểm tra userId tồn tại và còn ACTIVE
  const [rowsUser] = await db.pool.query(
    "SELECT id, fullName FROM Account WHERE id = ? AND status = 'ACTIVE' LIMIT 1",
    [userId]
  );
  if (rowsUser.length === 0) {
    const err = new Error("Khách hàng không tồn tại hoặc đã bị vô hiệu hóa");
    err.statusCode = 400;
    throw err;
  }

  // 1c. Validate từng item: variant tồn tại + đủ tồn kho
  const itemsEnriched = []; // sẽ chứa thông tin đầy đủ để tính giá

  for (const item of items) {
    const [rowsVariant] = await db.pool.query(
      `SELECT pv.id AS variantId, pv.productId, pv.color, pv.size, pv.stockQty,
              p.name AS tenSanPham, p.basePrice
       FROM ProductVariant pv
       JOIN Product p ON p.id = pv.productId
       WHERE pv.id = ?
         AND p.status = 'ACTIVE'
         AND (pv.status IS NULL OR pv.status = 'ACTIVE')
       LIMIT 1`,
      [item.variantId]
    );
    if (rowsVariant.length === 0) {
      const err = new Error(`Biến thể sản phẩm ID=${item.variantId} không tồn tại`);
      err.statusCode = 400;
      throw err;
    }

    const variant = rowsVariant[0];

    // Kiểm tra tồn kho trước khi tạo đơn.
    if (variant.stockQty < item.quantity) {
      const err = new Error(
        `Sản phẩm "${variant.tenSanPham}" (${variant.color}/${variant.size}) chỉ còn ${variant.stockQty} trong kho, không đủ ${item.quantity} sản phẩm`
      );
      err.statusCode = 400;
      throw err;
    }

    // ── Tính đơn giá theo BulkPricing ──
    const [rowsBulk] = await db.pool.query(
      `SELECT discountPercent
       FROM BulkPricing
       WHERE productId = ? AND minQty <= ?
       ORDER BY minQty DESC
       LIMIT 1`,
      [variant.productId, item.quantity]
    );

    let unitPrice;
    if (rowsBulk.length > 0) {
      unitPrice = Number(variant.basePrice) * (1 - Number(rowsBulk[0].discountPercent) / 100);
    } else {
      unitPrice = Number(variant.basePrice);
    }

    unitPrice = Math.round(unitPrice * 100) / 100;

    itemsEnriched.push({
      variantId: item.variantId,
      productId: variant.productId,
      tenSanPham: variant.tenSanPham,
      color: variant.color,
      size: variant.size,
      quantity: item.quantity,
      unitPrice,
      designId: item.designId || null,
      designFee: 0,
      printImage: item.printImage || null,
    });
  }

  // 1d. Validate designId (nếu có) và lấy designFee
  for (const enriched of itemsEnriched) {
    if (!enriched.designId) continue;

    const [rowsDesign] = await db.pool.query(
      `SELECT cd.id, cd.userId AS designUserId, cd.productId, cd.variantId,
              cd.baseColor, cd.designFee, cd.status,
              pv.color AS designColor
       FROM CustomDesign cd
       LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
       WHERE cd.id = ? LIMIT 1`,
      [enriched.designId]
    );

    if (rowsDesign.length === 0) {
      const err = new Error(`Thiết kế ID=${enriched.designId} không tồn tại`);
      err.statusCode = 400;
      throw err;
    }

    const design = rowsDesign[0];

    // Thiết kế phải thuộc đúng khách hàng đang đặt đơn
    if (design.designUserId !== userId) {
      const err = new Error(`Thiết kế ID=${enriched.designId} không thuộc khách hàng này`);
      err.statusCode = 400;
      throw err;
    }

    // KHÁC biệt so với admin:
    // Không kiểm tra "status === APPROVED" — khách được đặt hàng với bất kỳ status nào (DRAFT, PENDING_REVIEW, etc.)
    // Thay vào đó, tự động chuyển thiết kế sang PENDING_REVIEW để gửi admin duyệt
    await db.pool.query(
      "UPDATE CustomDesign SET status = 'PENDING_REVIEW' WHERE id = ?",
      [enriched.designId]
    );

    // Phôi áo và màu của item phải khớp với thiết kế
    if (design.productId !== enriched.productId) {
      const err = new Error(
        `Thiết kế ID=${enriched.designId} thuộc sản phẩm khác, không thể gán vào "${enriched.tenSanPham}"`
      );
      err.statusCode = 400;
      throw err;
    }

    const designColor = design.designColor || design.baseColor;
    if (
      designColor &&
      chuanHoaGiaTriSoSanh(designColor) !== chuanHoaGiaTriSoSanh(enriched.color)
    ) {
      const err = new Error(
        `Thiết kế ID=${enriched.designId} chỉ được đặt với màu "${designColor}", không thể chọn màu "${enriched.color}"`
      );
      err.statusCode = 400;
      throw err;
    }

    enriched.designFee = Number(design.designFee);

    // Upload ảnh in print-ready lên Cloudinary
    if (enriched.printImage && enriched.printImage.startsWith("data:image")) {
      try {
        const printFileUrl = await uploadBase64Image(enriched.printImage, "print-files");
        await db.pool.query(
          "UPDATE CustomDesign SET printFileUrl = ? WHERE id = ?",
          [printFileUrl, enriched.designId]
        );
      } catch (uploadErr) {
        console.error(
          `[createOrderAsCustomer] Upload printFileUrl cho design ${enriched.designId} thất bại:`,
          uploadErr
        );
      }
    }
  }

  const hasCustomDesign = itemsEnriched.some((item) => Boolean(item.designId));
  if (hasCustomDesign && paymentMethod === "COD") {
    const err = new Error(
      "Đơn có sản phẩm Áo in POD / Thiết kế POD chỉ được thanh toán online bằng VNPAY hoặc MoMo"
    );
    err.statusCode = 400;
    throw err;
  }

  if (!hasCustomDesign && paymentType === "DEPOSIT") {
    const err = new Error("Chỉ đơn hàng POD mới được chọn hình thức đặt cọc");
    err.statusCode = 400;
    throw err;
  }

  // ─────────────────────────────────────────────
  // BƯỚC 2: Tính giá tổng đơn hàng
  // ─────────────────────────────────────────────

  const subtotal = itemsEnriched.reduce(
    (tong, item) => tong + item.unitPrice * item.quantity,
    0
  );

  const tongDesignFee = itemsEnriched.reduce(
    (tong, item) => tong + item.designFee,
    0
  );

  let shippingFee = Math.max(0, Number(shippingFeeInput) || 0);

  // Tính discount từ promotion (nếu có)
  let discountAmount = 0;
  let promotionData = null;

  if (promotionId) {
    const now = new Date();
    const [rowsPromo] = await db.pool.query(
      `SELECT id, code, discountType, discountValue, minOrderAmount,
              usageLimit, usedCount, startDate, endDate, status, isNewCustomerOnly
       FROM Promotion
       WHERE id = ? LIMIT 1`,
      [promotionId]
    );

    if (rowsPromo.length === 0) {
      const err = new Error("Mã khuyến mãi không tồn tại");
      err.statusCode = 400;
      throw err;
    }

    const promo = rowsPromo[0];

    if (promo.status !== "ACTIVE") {
      const err = new Error("Mã khuyến mãi không còn hiệu lực");
      err.statusCode = 400;
      throw err;
    }

    if (
      new Date(promo.startDate) > now ||
      (promo.endDate && new Date(promo.endDate) < now)
    ) {
      const err = new Error("Mã khuyến mãi đã hết hạn hoặc chưa đến ngày áp dụng");
      err.statusCode = 400;
      throw err;
    }

    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      const err = new Error("Mã khuyến mãi đã hết lượt sử dụng");
      err.statusCode = 400;
      throw err;
    }

    if (promo.isNewCustomerOnly) {
      const [rowsExistingOrders] = await db.pool.query(
        "SELECT id FROM CustomerOrder WHERE userId = ? LIMIT 1",
        [userId]
      );
      if (rowsExistingOrders.length > 0) {
        const err = new Error("Mã khuyến mãi này chỉ dành cho khách hàng chưa từng đặt hàng");
        err.statusCode = 400;
        throw err;
      }
    }

    const orderBaseAmount = subtotal + tongDesignFee;
    if (orderBaseAmount < Number(promo.minOrderAmount)) {
      const err = new Error(
        `Đơn hàng cần tối thiểu ${Number(promo.minOrderAmount).toLocaleString("vi-VN")}₫ để áp dụng mã khuyến mãi này`
      );
      err.statusCode = 400;
      throw err;
    }

    const [rowsUsed] = await db.pool.query(
      "SELECT id FROM PromotionUsage WHERE promotionId = ? AND userId = ? LIMIT 1",
      [promotionId, userId]
    );
    if (rowsUsed.length > 0) {
      const err = new Error(
        `Khách hàng này đã sử dụng mã khuyến mãi "${promo.code}" trước đó. Mỗi khách chỉ được dùng mỗi mã 1 lần`
      );
      err.statusCode = 400;
      throw err;
    }

    if (promo.discountType === "PERCENT") {
      discountAmount = orderBaseAmount * (Number(promo.discountValue) / 100);
    } else if (promo.discountType === "FIXED") {
      discountAmount = Number(promo.discountValue);
    } else if (promo.discountType === "FREE_SHIPPING") {
      shippingFee = 0;
    }
    discountAmount = Math.min(discountAmount, orderBaseAmount);
    discountAmount = Math.round(discountAmount * 100) / 100;

    promotionData = promo;
  }

  const totalAmount = Math.max(
    0,
    Math.round((subtotal + tongDesignFee + shippingFee - discountAmount) * 100) / 100
  );
  const {
    depositPercent,
    depositAmount,
    codAmount,
    paymentAmount,
  } = tinhThongTinThanhToan(totalAmount, paymentMethod, paymentType);

  if (ONLINE_PAYMENT_METHODS.has(paymentMethod) && paymentAmount <= 0) {
    const err = new Error(`Số tiền thanh toán ${paymentMethod} phải lớn hơn 0`);
    err.statusCode = 400;
    throw err;
  }

  const orderCode = taoMaDonHangMoi();
  const onlinePayment = await taoThongTinThanhToanOnline({
    paymentMethod,
    orderCode,
    amount: paymentAmount,
    ipAddress,
  });

  // ─────────────────────────────────────────────
  // BƯỚC 3-9: Thực hiện trong MySQL Transaction
  // ─────────────────────────────────────────────

  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    const [resultAddress] = await conn.query(
      `INSERT INTO UserAddress (userId, recipientName, phone, addressLine, city, district, ward)
       VALUES (?, ?, ?, ?, ?, '', ?)`,
      [userId, recipientName, phone, addressLine, city, ward]
    );
    const addressId = resultAddress.insertId;

    const [resultOrder] = await conn.query(
      `INSERT INTO CustomerOrder
         (orderCode, userId, promotionId, addressId,
          subtotal, discountAmount, shippingFee,
          totalAmount, depositAmount, codAmount, paymentType, paymentStatus, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING')`,
      [
        orderCode,
        userId,
        promotionId || null,
        addressId,
        Math.round(subtotal * 100) / 100,
        discountAmount,
        shippingFee,
        totalAmount,
        depositAmount,
        codAmount,
        paymentType,
      ]
    );
    const orderId = resultOrder.insertId;
    const creationHistory = taoLichSuTaoDon();

    await ghiOrderHistory(conn, {
      orderId,
      fromStatus: null,
      toStatus: "PENDING",
      action: creationHistory.action,
      actor,
      note: creationHistory.note,
    });

    // ── Bước 3.3: INSERT OrderItem, OrderProduction ──
    for (const item of itemsEnriched) {
      const lineTotal = Math.round(
        (item.unitPrice * item.quantity + item.designFee) * 100
      ) / 100;

      const [resultItem] = await conn.query(
        `INSERT INTO OrderItem
           (orderId, variantId, designId, quantity,
            unitPrice, designFee, lineTotal, productionStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.variantId,
          item.designId,
          item.quantity,
          item.unitPrice,
          item.designFee,
          lineTotal,
          item.designId ? "READY_TO_PRINT" : "WAITING_DESIGN_APPROVAL",
        ]
      );
      const orderItemId = resultItem.insertId;

      // KHÁC biệt: OrderProduction.status = 'READY_TO_PRINT' (không phải 'APPROVED')
      // vì thiết kế sẽ chờ admin duyệt, không phải đã duyệt
      if (item.designId) {
        await conn.query(
          `INSERT INTO OrderProduction (orderItemId, designId, status)
           VALUES (?, ?, 'READY_TO_PRINT')`,
          [orderItemId, item.designId]
        );
      }

      const [stockResult] = await conn.query(
        `UPDATE ProductVariant
         SET stockQty = stockQty - ?
         WHERE id = ? AND stockQty >= ?`,
        [item.quantity, item.variantId, item.quantity]
      );

      if (stockResult.affectedRows === 0) {
        const err = new Error(
          `Sản phẩm "${item.tenSanPham}" (${item.color}/${item.size}) không còn đủ tồn kho để tạo đơn`
        );
        err.statusCode = 400;
        throw err;
      }

      await conn.query(
        `INSERT INTO InventoryTransaction
           (variantId, orderId, supplierId, quantityChanged, transactionType, reason)
         VALUES (?, ?, NULL, ?, 'EXPORT', ?)`,
        [
          item.variantId,
          orderId,
          -item.quantity,
          `Tạo đơn hàng ${orderCode} - giữ tồn kho ngay khi tạo đơn`,
        ]
      );
    }

    // ── Bước 3.4: INSERT Payment ──
    const paymentTypeDb =
      paymentMethod === "COD"
        ? "COD_FINAL"
        : paymentType === "DEPOSIT"
          ? "DEPOSIT"
          : "FULL_PAYMENT";
    await conn.query(
      `INSERT INTO Payment
         (orderId, amount, paymentMethod, paymentType, status, transactionId, gatewayResponse)
       VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`,
      [
        orderId,
        paymentAmount,
        paymentMethod,
        paymentTypeDb,
        onlinePayment?.transactionRef || null,
        onlinePayment ? JSON.stringify(onlinePayment) : null,
      ]
    );

    // ── Bước 3.5: Ghi nhận PromotionUsage ──
    if (promotionId && promotionData) {
      await conn.query(
        `INSERT INTO PromotionUsage (promotionId, userId, orderId)
         VALUES (?, ?, ?)`,
        [promotionId, userId, orderId]
      );

      await conn.query(
        "UPDATE Promotion SET usedCount = usedCount + 1 WHERE id = ?",
        [promotionId]
      );
    }

    // ── COMMIT ──
    await conn.commit();

    return {
      id: orderId,
      orderCode,
      totalAmount,
      depositPercent,
      depositAmount,
      codAmount,
      paymentAmount,
      paymentMethod,
      paymentUrl: onlinePayment?.paymentUrl || null,
      qrCodeValue: onlinePayment?.qrCodeValue || onlinePayment?.paymentUrl || null,
      paymentUrlExpiresAt: onlinePayment?.expiresAt || null,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  createOrderAsCustomer,
};
