const aiDesignService = require("./ai-design.service");

function validatePrintArea(printArea) {
  return (
    printArea &&
    typeof printArea.left === "number" &&
    typeof printArea.top === "number" &&
    typeof printArea.width === "number" &&
    typeof printArea.height === "number"
  );
}

const SHIRT_TYPES = new Set(["tshirt", "polo", "hoodie"]);
const SHIRT_VIEWS = new Set(["front", "back"]);

/**
 * POST /api/design-studio/ai-assist/generate
 * Sinh thiết kế mới (câu chữ + bố cục) bằng AI thật (Gemini), dựa trên mô tả tuỳ chọn của khách.
 */
const generate = async (req, res, next) => {
  try {
    const { shirtType, shirtView, shirtColor, printArea, prompt } = req.body;

    if (!SHIRT_TYPES.has(shirtType) || !SHIRT_VIEWS.has(shirtView) || typeof shirtColor !== "string" || !validatePrintArea(printArea)) {
      return res.status(400).json({ success: false, message: "Dữ liệu đầu vào không hợp lệ" });
    }
    if (prompt !== undefined && typeof prompt !== "string") {
      return res.status(400).json({ success: false, message: "prompt phải là chuỗi" });
    }

    const elements = await aiDesignService.generateDesign({ shirtType, shirtView, shirtColor, printArea, prompt });
    res.json({ success: true, data: { elements } });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/design-studio/ai-assist/arrange
 * Tự sắp xếp lại các phần tử chữ đang có bằng AI thật, giữ nguyên nội dung chữ.
 */
const arrange = async (req, res, next) => {
  try {
    const { shirtType, shirtView, shirtColor, printArea, elements } = req.body;

    if (!SHIRT_TYPES.has(shirtType) || !SHIRT_VIEWS.has(shirtView) || typeof shirtColor !== "string" || !validatePrintArea(printArea)) {
      return res.status(400).json({ success: false, message: "Dữ liệu đầu vào không hợp lệ" });
    }
    if (!Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ success: false, message: "Cần ít nhất 1 phần tử để sắp xếp" });
    }
    if (elements.some((e) => typeof e.text !== "string")) {
      return res.status(400).json({ success: false, message: "Mỗi phần tử cần có nội dung chữ (text)" });
    }

    const result = await aiDesignService.arrangeDesign({ shirtType, shirtView, shirtColor, printArea, elements });
    res.json({ success: true, data: { elements: result } });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { generate, arrange };
