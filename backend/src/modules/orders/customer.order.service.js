/**
 * customer.order.service.js – Xử lý logic đặt hàng từ phía khách hàng.
 *
 * Khác biệt với admin.order.service.js:
 * - Không yêu cầu thiết kế phải APPROVED trước khi đặt hàng
 * - Tự động chuyển thiết kế sang PENDING_REVIEW để gửi cho admin duyệt
 * - Khách hàng có thể đặt hàng ngay sau khi lưu thiết kế (DRAFT)
 */

const db = require("../../database/mysql");
const { taoLinkThanhToanVnpay } = require("../payments/vnpay.service");
const { taoLinkThanhToanMomo } = require("../payments/momo.service");
const { uploadBase64Image } = require("../uploads/upload.service");
const { sendOrderConfirmationEmail } = require("../../common/services/emailService");
const { apDungMaGiamGia } = require("../promotions/promotion.service");

const DEPOSIT_PERCENT = 50;
const ONLINE_PAYMENT_METHODS = new Set(["VNPAY", "MOMO"]);
const PREPAID_PAYMENT_TYPES = new Set(["FULL", "FULL_PAYMENT", "DEPOSIT"]);
const ACTION_CUSTOMER_CREATED = "Khách hàng đặt đơn";

// Nhãn tiếng Việt cho từng trạng thái đơn hàng - dùng để hiển thị cho khách hàng
// trong trang "Đơn hàng của tôi". Giữ đúng ý nghĩa màu sắc/nội dung với
// MAP_TRANG_THAI_DB_SANG_FE bên admin.order.service.js để 2 phía nhất quán.
const NHAN_TRANG_THAI_DON_HANG = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý in",
  PRINTING: "Đang xử lý in",
  PRINTED: "Đã in xong",
  READY_TO_SHIP: "Chờ giao",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  PAID: "Đã thanh toán",
};

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

// LƯU Ý: hàm này phải gọi taoLinkThanhToanVnpay/taoLinkThanhToanMomo ĐÚNG tên
// tham số của 2 hàm đó (orderCode, amount, ipAddress, transactionRef) và trả
// THẲNG kết quả gateway trả về (không bọc thêm { paymentUrl: ... } lần nữa) -
// vì bản thân kết quả đó đã là object { paymentUrl, expiresAt, transactionRef, ... }
// rồi. Logic này phải giống hệt taoThongTinThanhToanOnline bên
// admin.order.service.js để tránh lệch nhau giữa 2 luồng tạo đơn (admin/khách).
//
// Không cần tự sinh transactionRef ở đây: nếu không truyền vào, cả
// taoLinkThanhToanVnpay lẫn taoLinkThanhToanMomo đều tự sinh mã giao dịch riêng
// dựa theo orderCode (xem phần fallback trong 2 hàm đó).
async function taoThongTinThanhToanOnline({
  paymentMethod,
  orderCode,
  amount,
  ipAddress,
}) {
  if (paymentMethod === "VNPAY") {
    return taoLinkThanhToanVnpay({
      orderCode,
      amount,
      ipAddress,
    });
  }

  if (paymentMethod === "MOMO") {
    return taoLinkThanhToanMomo({
      orderCode,
      amount,
    });
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
    result.codAmount = Math.max(0, totalAmount - result.depositAmount);
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
    "SELECT id, fullName, email FROM Account WHERE id = ? AND status = 'ACTIVE' LIMIT 1",
    [userId]
  );
  if (rowsUser.length === 0) {
    const err = new Error("Khách hàng không tồn tại hoặc đã bị vô hiệu hóa");
    err.statusCode = 400;
    throw err;
  }
  // Dùng email đã đăng ký trong Account để gửi mail xác nhận đơn (đáng tin cậy
  // hơn field "email" khách tự gõ ở form checkout, vì form đó cho sửa tự do).
  const emailKhachHang = rowsUser[0].email;

  // 1c. Validate từng item: variant tồn tại + đủ tồn kho
  const itemsEnriched = []; // sẽ chứa thông tin đầy đủ để tính giá
  const qtyByProductId = {};
  const variantDataMap = new Map();

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

    qtyByProductId[variant.productId] = (qtyByProductId[variant.productId] || 0) + item.quantity;
    variantDataMap.set(item, variant);
  }

  for (const item of items) {
    const variant = variantDataMap.get(item);

    // ── Tính đơn giá theo BulkPricing ──
    const totalProductQty = qtyByProductId[variant.productId];
    const [rowsBulk] = await db.pool.query(
      `SELECT discountPercent
       FROM BulkPricing
       WHERE productId = ? AND minQty <= ?
       ORDER BY minQty DESC
       LIMIT 1`,
      [variant.productId, totalProductQty]
    );

    const bulkDiscountPercent = rowsBulk.length > 0 ? Number(rowsBulk[0].discountPercent) : 0;
    const unitPrice = Number(variant.basePrice);

    itemsEnriched.push({
      variantId: item.variantId,
      productId: variant.productId,
      tenSanPham: variant.tenSanPham,
      color: variant.color,
      size: variant.size,
      quantity: item.quantity,
      unitPrice,
      bulkDiscountPercent,
      designId: item.designId || null,
      designFee: 0,
      printImageFront: item.printImageFront || null,
      printImageBack: item.printImageBack || null,
    });
  }

  // 1d. Validate designId (nếu có) và lấy designFee
  // designIdsDaUploadAnh: theo dõi designId đã upload ảnh in trong đơn này - một
  // thiết kế có thể bị tách thành nhiều OrderItem nếu khách chọn nhiều size cùng
  // lúc (xem AddToCartModal), các item đó mang chung 1 base64 giống hệt nhau nên
  // chỉ cần upload 1 lần, tránh sinh file trùng lặp trên Cloudinary.
  const designIdsDaUploadAnh = new Set();
  const uniqueDesignIdsFee = new Set();
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

    if (!uniqueDesignIdsFee.has(enriched.designId)) {
      enriched.designFee = Number(design.designFee);
      uniqueDesignIdsFee.add(enriched.designId);
    } else {
      enriched.designFee = 0;
    }

    // Upload ảnh in print-ready lên Cloudinary - tối đa 2 ảnh (mặt trước/sau),
    // mỗi mặt upload + lưu độc lập nên lỗi ở mặt này không ảnh hưởng mặt kia.
    // Bỏ qua nếu designId này đã upload rồi (item khác size, cùng thiết kế).
    if (!designIdsDaUploadAnh.has(enriched.designId)) {
      designIdsDaUploadAnh.add(enriched.designId);

      if (enriched.printImageFront && enriched.printImageFront.startsWith("data:image")) {
        try {
          const printFileUrlFront = await uploadBase64Image(enriched.printImageFront, "print-files");
          await db.pool.query(
            "UPDATE CustomDesign SET printFileUrlFront = ? WHERE id = ?",
            [printFileUrlFront, enriched.designId]
          );
        } catch (uploadErr) {
          console.error(
            `[createOrderAsCustomer] Upload printFileUrlFront cho design ${enriched.designId} thất bại:`,
            uploadErr
          );
        }
      }
      if (enriched.printImageBack && enriched.printImageBack.startsWith("data:image")) {
        try {
          const printFileUrlBack = await uploadBase64Image(enriched.printImageBack, "print-files");
          await db.pool.query(
            "UPDATE CustomDesign SET printFileUrlBack = ? WHERE id = ?",
            [printFileUrlBack, enriched.designId]
          );
        } catch (uploadErr) {
          console.error(
            `[createOrderAsCustomer] Upload printFileUrlBack cho design ${enriched.designId} thất bại:`,
            uploadErr
          );
        }
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
    (tong, item) => tong + item.designFee * item.quantity,
    0
  );

  let bulkDiscountTotal = 0;
  for (const item of itemsEnriched) {
    const baseItemPrice = item.unitPrice + item.designFee;
    if (item.bulkDiscountPercent > 0) {
      const discountedPrice = Math.round(baseItemPrice * (1 - item.bulkDiscountPercent / 100));
      bulkDiscountTotal += (baseItemPrice - discountedPrice) * item.quantity;
    }
  }

  let shippingFee = Math.max(0, Number(shippingFeeInput) || 0);

  // Tính discount từ promotion (nếu có)
  let discountAmount = bulkDiscountTotal;
  let promotionData = null;

  if (promotionId) {
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
    const orderBaseAmount = subtotal + tongDesignFee - bulkDiscountTotal;

    // Dùng chung apDungMaGiamGia với customer.promotion.service.js (validate lúc
    // checkout) để 2 nơi không bao giờ lệch luật hay lệch cách tính.
    const ketQuaApDung = await apDungMaGiamGia(promo, { userId, orderBaseAmount });
    discountAmount = ketQuaApDung.discountAmount + bulkDiscountTotal;
    if (ketQuaApDung.mienPhiVanChuyen) shippingFee = 0;

    promotionData = promo;
  }

  // Lấy thuế VAT hiện tại
  const [pricingConfigRows] = await db.pool.query(
    `SELECT vatPercent FROM PricingConfiguration LIMIT 1`
  );
  const vatPercent = pricingConfigRows.length > 0 ? Number(pricingConfigRows[0].vatPercent) : 0;

  const amountBeforeVat = Math.max(
    0,
    Math.round((subtotal + tongDesignFee + shippingFee - discountAmount) * 100) / 100
  );
  
  const vatAmount = Math.round((amountBeforeVat * vatPercent) / 100);
  const totalAmount = amountBeforeVat + vatAmount;
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

  // ─────────────────────────────────────────────
  // Idempotency guard: nếu khách vừa gửi 1 đơn giống hệt (cùng tổng tiền,
  // phương thức thanh toán) trong ít giây gần đây và đơn đó còn PENDING, coi
  // đây là request bị gửi trùng (double-click, form bị submit 2 lần...) và trả
  // về đơn đã tạo thay vì tạo thêm 1 CustomerOrder mới.
  // ─────────────────────────────────────────────
  const [rowsDonTrungLap] = await db.pool.query(
    `SELECT co.id, co.orderCode, p.gatewayResponse
       FROM CustomerOrder co
       JOIN Payment p ON p.orderId = co.id
      WHERE co.userId = ?
        AND co.status = 'PENDING'
        AND co.totalAmount = ?
        AND p.paymentMethod = ?
        AND co.createdAt >= (NOW() - INTERVAL 20 SECOND)
      ORDER BY co.id DESC
      LIMIT 1`,
    [userId, totalAmount, paymentMethod]
  );

  if (rowsDonTrungLap.length > 0) {
    const donTrungLap = rowsDonTrungLap[0];
    let onlinePaymentTrungLap = null;
    try {
      onlinePaymentTrungLap = donTrungLap.gatewayResponse
        ? JSON.parse(donTrungLap.gatewayResponse)
        : null;
    } catch {
      onlinePaymentTrungLap = null;
    }

    return {
      id: donTrungLap.id,
      orderCode: donTrungLap.orderCode,
      totalAmount,
      depositPercent,
      depositAmount,
      codAmount,
      paymentAmount,
      paymentMethod,
      paymentUrl: onlinePaymentTrungLap?.paymentUrl || null,
      qrCodeValue: onlinePaymentTrungLap?.qrCodeValue || onlinePaymentTrungLap?.paymentUrl || null,
      paymentUrlExpiresAt: onlinePaymentTrungLap?.expiresAt || null,
    };
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

    let addressId;
    const [existingAddrs] = await conn.query(
      `SELECT id FROM UserAddress 
       WHERE userId = ? 
         AND recipientName = ? 
         AND phone = ? 
         AND addressLine = ? 
         AND city = ? 
         AND ward = ?
       LIMIT 1`,
      [userId, recipientName, phone, addressLine, city, ward]
    );

    if (existingAddrs.length > 0) {
      addressId = existingAddrs[0].id;
    } else {
      const [resultAddress] = await conn.query(
        `INSERT INTO UserAddress (userId, recipientName, phone, addressLine, city, district, ward)
         VALUES (?, ?, ?, ?, ?, '', ?)`,
        [userId, recipientName, phone, addressLine, city, ward]
      );
      addressId = resultAddress.insertId;
    }

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
        paymentMethod === 'COD' ? codAmount : paymentAmount,
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

    // Gửi email xác nhận đơn hàng - CHỦ ĐỘNG không để lỗi gửi mail làm fail cả
    // request đặt hàng, vì tới đây đơn đã tạo thành công trong DB rồi. Chỉ log
    // lỗi lại để dễ dò khi cần (vd tài khoản Gmail gửi mail hết hạn mật khẩu).
    if (emailKhachHang) {
      try {
        await sendOrderConfirmationEmail({
          to: emailKhachHang,
          recipientName,
          orderCode,
          items: itemsEnriched,
          subtotal,
          shippingFee,
          discountAmount,
          totalAmount,
          paymentMethod,
          diaChiGiaoHang: { diaChiChiTiet: addressLine, ward, city },
        });
      } catch (error) {
        console.error(
          `Không gửi được email xác nhận đơn hàng ${orderCode}:`,
          error.message
        );
      }
    }

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

// =====================================================================
// layDanhSachDonHangCuaKhach – Lấy danh sách đơn hàng của 1 khách hàng.
//
// Dùng cho trang "Đơn hàng của tôi" (GET /api/orders).
// Chỉ trả về đơn thuộc đúng userId đang đăng nhập – điều kiện lọc userId nằm
// ngay trong câu WHERE nên khách A không thể xem được đơn của khách B.
// =====================================================================
async function layDanhSachDonHangCuaKhach(userId, { page = 1, limit = 10 } = {}) {
  // Chuẩn hoá tham số phân trang, tránh giá trị âm hoặc quá lớn từ query string
  const soTrangHienTai = Math.max(1, Number(page) || 1);
  const soDongMoiTrang = Math.min(50, Math.max(1, Number(limit) || 10));
  const viTriBatDau = (soTrangHienTai - 1) * soDongMoiTrang;

  // Đếm tổng số đơn của khách để frontend tính được tổng số trang
  const [rowsDemTong] = await db.pool.query(
    "SELECT COUNT(*) AS tongSoDon FROM CustomerOrder WHERE userId = ?",
    [userId]
  );
  const tongSoDon = rowsDemTong[0].tongSoDon;

  // Lấy danh sách đơn của trang hiện tại, đơn mới đặt hiển thị lên đầu
  const [rowsDonHang] = await db.pool.query(
    `SELECT id, orderCode, status, paymentStatus, paymentType,
            totalAmount, depositAmount, codAmount, createdAt
     FROM CustomerOrder
     WHERE userId = ?
     ORDER BY createdAt DESC
     LIMIT ? OFFSET ?`,
    [userId, soDongMoiTrang, viTriBatDau]
  );

  const tongSoTrang = Math.max(1, Math.ceil(tongSoDon / soDongMoiTrang));

  // Không có đơn nào trong trang này thì trả sớm, khỏi query thêm items làm gì
  if (rowsDonHang.length === 0) {
    return {
      items: [],
      page: soTrangHienTai,
      limit: soDongMoiTrang,
      total: tongSoDon,
      totalPages: tongSoTrang,
    };
  }

  // Lấy toàn bộ sản phẩm của các đơn trong trang này CHỈ BẰNG 1 câu query
  // (tránh vòng lặp query từng đơn một - N+1 query rất chậm khi số đơn nhiều).
  const danhSachOrderId = rowsDonHang.map((donHang) => donHang.id);
  const [rowsItem] = await db.pool.query(
    `SELECT oi.orderId, oi.quantity, oi.designId,
            pr.name AS tenSanPham,
            piImg.imageUrl AS anhSanPham,
            cd.previewUrl AS anhXemTruocThietKe
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product pr ON pr.id = pv.productId
     LEFT JOIN ProductImage piImg ON piImg.productId = pr.id AND piImg.isPrimary = 1
     LEFT JOIN CustomDesign cd ON cd.id = oi.designId
     WHERE oi.orderId IN (?)
     ORDER BY oi.id ASC`,
    [danhSachOrderId]
  );

  // Gom các sản phẩm về đúng đơn hàng của nó theo orderId, để bước sau ghép vào
  const itemTheoOrderId = new Map();
  for (const item of rowsItem) {
    if (!itemTheoOrderId.has(item.orderId)) {
      itemTheoOrderId.set(item.orderId, []);
    }
    itemTheoOrderId.get(item.orderId).push(item);
  }

  const items = rowsDonHang.map((donHang) => {
    const danhSachItemCuaDon = itemTheoOrderId.get(donHang.id) || [];
    const itemDauTien = danhSachItemCuaDon[0];

    return {
      id: donHang.id,
      orderCode: donHang.orderCode,
      status: donHang.status,
      statusLabel: NHAN_TRANG_THAI_DON_HANG[donHang.status] || donHang.status,
      paymentStatus: donHang.paymentStatus,
      paymentType: donHang.paymentType,
      totalAmount: Number(donHang.totalAmount),
      depositAmount: Number(donHang.depositAmount || 0),
      codAmount: Number(donHang.codAmount || 0),
      createdAt: donHang.createdAt,
      // Ảnh đại diện cho cả đơn: ưu tiên ảnh xem trước thiết kế riêng (nếu có),
      // không thì lấy ảnh sản phẩm gốc của item đầu tiên trong đơn
      anhDaiDien: itemDauTien
        ? itemDauTien.anhXemTruocThietKe || itemDauTien.anhSanPham || null
        : null,
      tenSanPhamDauTien: itemDauTien ? itemDauTien.tenSanPham : "",
      soLuongMatHang: danhSachItemCuaDon.length,
      tongSoLuongSanPham: danhSachItemCuaDon.reduce(
        (tong, item) => tong + Number(item.quantity || 0),
        0
      ),
    };
  });

  return {
    items,
    page: soTrangHienTai,
    limit: soDongMoiTrang,
    total: tongSoDon,
    totalPages: tongSoTrang,
  };
}

// =====================================================================
// layChiTietDonHangCuaKhach – Lấy chi tiết đầy đủ 1 đơn hàng của khách.
//
// Dùng cho trang chi tiết đơn (GET /api/orders/:id).
// QUAN TRỌNG: điều kiện WHERE luôn kiểm tra CẢ id lẫn userId cùng lúc, để
// khách hàng không thể xem đơn của người khác chỉ bằng cách đổi số ID trên
// URL (đây gọi là lỗ hổng IDOR - Insecure Direct Object Reference).
// =====================================================================
async function layChiTietDonHangCuaKhach(orderId, userId) {
  const [rowsDonHang] = await db.pool.query(
    `SELECT co.*,
            ua.recipientName, ua.phone AS sdtNguoiNhan,
            ua.addressLine, ua.ward, ua.district, ua.city
     FROM CustomerOrder co
     LEFT JOIN UserAddress ua ON ua.id = co.addressId
     WHERE co.id = ? AND co.userId = ?
     LIMIT 1`,
    [orderId, userId]
  );

  // Không tìm thấy đơn (hoặc đơn đó không phải của khách này) → coi như 404,
  // không tiết lộ cho khách biết đơn đó có tồn tại hay không (an toàn hơn).
  if (rowsDonHang.length === 0) {
    const err = new Error("Không tìm thấy đơn hàng");
    err.statusCode = 404;
    throw err;
  }
  const donHang = rowsDonHang[0];

  // Lấy danh sách sản phẩm trong đơn kèm thông tin biến thể + thiết kế (nếu có)
  const [rowsItem] = await db.pool.query(
    `SELECT oi.id, oi.quantity, oi.unitPrice, oi.designFee, oi.lineTotal,
            oi.productionStatus, oi.designId,
            pv.color, pv.size, pv.sku,
            pr.name AS tenSanPham,
            piImg.imageUrl AS anhSanPham,
            cd.previewUrl AS anhXemTruocThietKe
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product pr ON pr.id = pv.productId
     LEFT JOIN ProductImage piImg ON piImg.productId = pr.id AND piImg.isPrimary = 1
     LEFT JOIN CustomDesign cd ON cd.id = oi.designId
     WHERE oi.orderId = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );

  const items = rowsItem.map((item) => ({
    id: item.id,
    tenSanPham: item.tenSanPham,
    mauSac: item.color,
    kichCo: item.size,
    sku: item.sku,
    soLuong: Number(item.quantity),
    donGiaVnd: Number(item.unitPrice),
    phiThietKeVnd: Number(item.designFee || 0),
    thanhTienVnd: Number(item.lineTotal),
    trangThaiSanXuat: item.productionStatus,
    coThietKeRieng: Boolean(item.designId),
    // Sản phẩm có thiết kế riêng thì ưu tiên hiển thị ảnh xem trước thiết kế
    // (đúng với những gì khách đã tự vẽ), không thì dùng ảnh sản phẩm gốc
    anhSanPham: item.anhXemTruocThietKe || item.anhSanPham || null,
  }));

  // Lấy lịch sử thay đổi trạng thái, theo đúng thứ tự thời gian để dựng timeline
  const [rowsLichSu] = await db.pool.query(
    `SELECT toStatus, action, note, createdAt
     FROM OrderHistory
     WHERE orderId = ?
     ORDER BY createdAt ASC, id ASC`,
    [orderId]
  );
  const lichSuTrangThai = rowsLichSu.map((row) => ({
    trangThai: row.toStatus,
    trangThaiLabel: NHAN_TRANG_THAI_DON_HANG[row.toStatus] || row.toStatus,
    ghiChu: row.note,
    thoiGian: row.createdAt,
  }));

  // Lấy toàn bộ lượt thanh toán của đơn (có thể nhiều hơn 1 nếu đơn trả cọc
  // trước rồi trả COD phần còn lại khi nhận hàng)
  const [rowsThanhToan] = await db.pool.query(
    `SELECT paymentMethod, paymentType, amount, status, paidAt, createdAt
     FROM Payment
     WHERE orderId = ?
     ORDER BY createdAt ASC`,
    [orderId]
  );
  const thanhToan = rowsThanhToan.map((row) => ({
    phuongThuc: row.paymentMethod,
    loai: row.paymentType,
    soTienVnd: Number(row.amount),
    trangThai: row.status,
    thoiGianThanhToan: row.paidAt,
  }));

  return {
    id: donHang.id,
    orderCode: donHang.orderCode,
    status: donHang.status,
    statusLabel: NHAN_TRANG_THAI_DON_HANG[donHang.status] || donHang.status,
    createdAt: donHang.createdAt,
    // Thông tin tiền bạc của đơn
    subtotal: Number(donHang.subtotal),
    discountAmount: Number(donHang.discountAmount || 0),
    shippingFee: Number(donHang.shippingFee || 0),
    totalAmount: Number(donHang.totalAmount),
    depositAmount: Number(donHang.depositAmount || 0),
    codAmount: Number(donHang.codAmount || 0),
    paymentType: donHang.paymentType,
    paymentStatus: donHang.paymentStatus,
    // Thông tin giao hàng
    diaChiGiaoHang: {
      tenNguoiNhan: donHang.recipientName,
      soDienThoai: donHang.sdtNguoiNhan,
      diaChiChiTiet: donHang.addressLine,
      phuongXa: donHang.ward,
      quanHuyen: donHang.district,
      tinhThanh: donHang.city,
    },
    donViVanChuyen: donHang.shippingCarrier,
    maVanDon: donHang.trackingCode,
    lyDoHuy: donHang.cancelReason,
    // Danh sách sản phẩm, lịch sử trạng thái và các lượt thanh toán
    items,
    lichSuTrangThai,
    thanhToan,
  };
}

module.exports = {
  createOrderAsCustomer,
  layDanhSachDonHangCuaKhach,
  layChiTietDonHangCuaKhach,
};
