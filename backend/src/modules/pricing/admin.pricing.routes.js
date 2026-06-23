const router = require("express").Router();

const validate = require("../../common/middlewares/validate.middleware");
const pricingController = require("./admin.pricing.controller");
const { calculateQuoteSchema } = require("./pricing.validation");

router.post(
  "/quote",
  validate(calculateQuoteSchema),
  pricingController.calculateQuote
);

module.exports = router;
