const router = require("express").Router();
const authController = require("./auth.api.controller");
const validate = require("../../common/middlewares/validate.middleware");
const { verifyToken } = require("../../common/middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("./auth.validation");

router.post("/login", validate(loginSchema), authController.login);
router.post("/register", validate(registerSchema), authController.register);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", validate(refreshTokenSchema), authController.logout);
router.post("/logout-all", verifyToken, authController.logoutAll);
router.get("/me", verifyToken, authController.me);

module.exports = router;
