const router = require("express").Router();
const userController = require("./admin.user.controller");
const validate = require("../../common/middlewares/validate.middleware");
const {
  verifyToken,
  requireAdmin,
} = require("../../common/middlewares/auth.middleware");
const {
  updateProfileSchema,
  createStaffSchema,
  updateStaffSchema,
  createCustomerSchema,
  updateCustomerSchema,
  softDeleteCustomerSchema,
} = require("./user.validation");

// ── Profile (authenticated user) ──────────────────────────────────────────────
router.get("/me", verifyToken, userController.getProfile);
router.patch("/me", verifyToken, validate(updateProfileSchema), userController.updateProfile);

// ── Staff management (Admin only) ─────────────────────────────────────────────
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
router.get("/admin/staff", verifyToken, requireAdmin, userController.listStaff);
router.post(
  "/admin/staff",
  verifyToken,
  requireAdmin,
  validate(createStaffSchema),
  userController.createStaff
);
router.patch(
  "/admin/staff/:id",
  verifyToken,
  requireAdmin,
  validate(updateStaffSchema),
  userController.updateStaff
);

// ── Customer management (Admin only) ──────────────────────────────────────────
router.get("/admin/customers", verifyToken, requireAdmin, userController.listCustomers);
router.post(
  "/admin/customers",
  verifyToken,
  requireAdmin,
  validate(createCustomerSchema),
  userController.createCustomer
);
router.patch(
  "/admin/customers/:id",
  verifyToken,
  requireAdmin,
  validate(updateCustomerSchema),
  userController.updateCustomer
);
router.patch(
  "/admin/customers/:id/deactivate",
  verifyToken,
  requireAdmin,
  validate(softDeleteCustomerSchema),
  userController.softDeleteCustomer
);

module.exports = router;

