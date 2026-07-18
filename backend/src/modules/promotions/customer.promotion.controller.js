/**
 * customer.promotion.controller.js – Nhận request HTTP, gọi service, trả response.
 */

const customerPromotionService = require("./customer.promotion.service");

/**
 * POST /api/promotions/validate
 * Body: { code: string, orderAmount: number }
 */
const validate = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const data = await customerPromotionService.validateMaGiamGia({
      code,
      orderAmount,
      userId: req.user.id,
    });
    res.json({ success: true, data });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = { validate };
