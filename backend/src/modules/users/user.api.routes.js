const router = require("express").Router();
const userController = require("./user.controller");
const validate = require("../../common/middlewares/validate.middleware");
const {
  verifyToken,
  requireAdmin,
} = require("../../common/middlewares/auth.middleware");
const {
  updateProfileSchema,
  createStaffSchema,
  updateStaffSchema,
} = require("./user.validation");

router.get("/me", verifyToken, userController.getProfile);
router.patch("/me", verifyToken, validate(updateProfileSchema), userController.updateProfile);

router.get("/staff", verifyToken, requireAdmin, userController.listStaff);
router.post(
  "/staff",
  verifyToken,
  requireAdmin,
  validate(createStaffSchema),
  userController.createStaff
);
router.patch(
  "/staff/:id",
  verifyToken,
  requireAdmin,
  validate(updateStaffSchema),
  userController.updateStaff
);

module.exports = router;
