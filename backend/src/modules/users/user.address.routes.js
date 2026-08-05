const router = require("express").Router();
const userAddressController = require("./user.address.controller");
const { verifyToken } = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const {
  createAddressSchema,
  updateAddressSchema,
} = require("./user.address.validation");

router.get("/", verifyToken, userAddressController.getMyAddresses);
router.post(
  "/",
  verifyToken,
  validate(createAddressSchema),
  userAddressController.createAddress
);
router.put(
  "/:id",
  verifyToken,
  validate(updateAddressSchema),
  userAddressController.updateAddress
);
router.delete("/:id", verifyToken, userAddressController.deleteAddress);
router.put("/:id/default", verifyToken, userAddressController.setDefaultAddress);

module.exports = router;
