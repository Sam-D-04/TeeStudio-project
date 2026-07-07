const router = require("express").Router();
const userDesignController = require("./user.design.controller");
const { verifyToken } = require("../../common/middlewares/auth.middleware");

router.get("/",     verifyToken, userDesignController.getMyDesigns);
router.post("/",    verifyToken, userDesignController.createDesign);
router.put("/:id",  verifyToken, userDesignController.updateDesign);
router.delete("/:id", verifyToken, userDesignController.deleteDesign);

module.exports = router;
