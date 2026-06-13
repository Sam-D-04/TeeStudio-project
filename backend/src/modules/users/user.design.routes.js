const router = require("express").Router();
const userDesignController = require("./user.design.controller");

router.get("/", userDesignController.getMyDesigns);
router.post("/", userDesignController.createDesign);
router.put("/:id", userDesignController.updateDesign);
router.delete("/:id", userDesignController.deleteDesign);

module.exports = router;
