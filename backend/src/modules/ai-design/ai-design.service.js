/**
 * ai-design.service.js — Gọi Google Gemini để (1) sinh câu chữ + bố cục thiết kế
 * mới, hoặc (2) tự sắp xếp lại các phần tử chữ đang có trên canvas.
 *
 * Đây là AI thật (LLM suy luận nội dung/bố cục), khác với bộ heuristic
 * (công thức toán cố định) đã có trước đó trong frontend.
 *
 * KHÔNG fallback khi lỗi — theo yêu cầu, nếu AI không gọi được thì báo lỗi rõ
 * ràng cho người dùng thay vì âm thầm trả kết quả giả/hardcode.
 */
const { GoogleGenAI, Type } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Danh sách font được phép dùng — PHẢI khớp với frontend/src/constants/fonts.ts
 * (đây là các font duy nhất được nạp qua Google Fonts trong app; AI chọn font
 * ngoài danh sách này sẽ không hiển thị được).
 */
const ALLOWED_FONTS = [
  "Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Oswald", "Lato", "Quicksand",
  "Playfair Display", "Merriweather", "Lora", "PT Serif", "Noto Serif", "Cinzel",
  "Bebas Neue", "Righteous", "Lobster", "Abril Fatface", "Concert One", "Fredoka One", "Alfa Slab One", "Russo One",
  "Dancing Script", "Pacifico", "Caveat", "Satisfy", "Great Vibes", "Amatic SC",
  "Space Mono", "Roboto Mono", "Fira Code", "VT323",
];

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "Chưa cấu hình GEMINI_API_KEY trên server. Vui lòng liên hệ quản trị viên để bật AI Trợ lý."
    );
    err.statusCode = 503;
    throw err;
  }
  return new GoogleGenAI({ apiKey });
}

/** Schema JSON cho 1 phần tử chữ — dùng structured output để Gemini luôn trả đúng cấu trúc. */
const elementSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "Nội dung chữ hiển thị trên áo." },
    x: { type: Type.NUMBER, description: "Toạ độ X góc trên-trái, đơn vị logic (0..500)." },
    y: { type: Type.NUMBER, description: "Toạ độ Y góc trên-trái, đơn vị logic (0..600)." },
    width: { type: Type.NUMBER, description: "Bề rộng khung chữ." },
    height: { type: Type.NUMBER, description: "Chiều cao khung chữ." },
    rotation: { type: Type.NUMBER, description: "Góc xoay độ (thường 0)." },
    fontFamily: { type: Type.STRING, enum: ALLOWED_FONTS },
    fontSize: { type: Type.NUMBER, description: "Cỡ chữ (px, đơn vị logic)." },
    fill: { type: Type.STRING, description: "Mã màu hex, ví dụ #111827. Phải tương phản tốt với màu áo." },
    fontStyle: { type: Type.STRING, enum: ["normal", "bold", "italic", "bold italic"] },
    textTransform: { type: Type.STRING, enum: ["uppercase", "none"] },
    align: { type: Type.STRING, enum: ["left", "center", "right"] },
    letterSpacing: { type: Type.NUMBER },
  },
  required: ["text", "x", "y", "width", "height", "rotation", "fontFamily", "fontSize", "fill", "align"],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    elements: { type: Type.ARRAY, items: elementSchema },
  },
  required: ["elements"],
};

const SHIRT_LABEL = { tshirt: "áo thun", polo: "áo polo", hoodie: "áo hoodie" };

function buildContextBlock({ shirtType, shirtView, shirtColor, printArea }) {
  return [
    `Loại áo: ${SHIRT_LABEL[shirtType] || shirtType}, mặt ${shirtView === "back" ? "sau" : "trước"}.`,
    `Màu áo (hex): ${shirtColor}.`,
    `Vùng in cho phép (đơn vị logic, canvas tổng 500x600): left=${printArea.left.toFixed(1)}, top=${printArea.top.toFixed(1)}, width=${printArea.width.toFixed(1)}, height=${printArea.height.toFixed(1)}.`,
    `Mọi phần tử PHẢI nằm trong vùng in này (x >= left, y >= top, x+width <= left+width, y+height <= top+height).`,
    `Chỉ được dùng font trong danh sách cho phép. Màu chữ (fill) phải tương phản rõ với màu áo để dễ đọc.`,
  ].join("\n");
}

async function callGemini(systemInstruction, userPrompt) {
  const ai = getClient();
  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9, // tăng tính sáng tạo/đa dạng giữa các lần sinh
      },
    });
  } catch (err) {
    console.error("[ai-design] Gemini API lỗi:", err);
    const e = new Error("Không gọi được AI (Gemini). Vui lòng thử lại sau.");
    e.statusCode = 502;
    throw e;
  }

  const raw = response.text;
  if (!raw) {
    const e = new Error("AI không trả về nội dung. Vui lòng thử lại.");
    e.statusCode = 502;
    throw e;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[ai-design] Không parse được JSON từ Gemini:", raw);
    const e = new Error("AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.");
    e.statusCode = 502;
    throw e;
  }

  if (!Array.isArray(parsed.elements)) {
    const e = new Error("AI trả về dữ liệu không đúng định dạng. Vui lòng thử lại.");
    e.statusCode = 502;
    throw e;
  }
  return parsed.elements;
}

/**
 * Sinh một thiết kế MỚI (câu chữ + bố cục) từ mô tả của người dùng (có thể để trống).
 */
async function generateDesign({ shirtType, shirtView, shirtColor, printArea, prompt }) {
  const systemInstruction =
    "Bạn là một nhà thiết kế áo thun chuyên nghiệp. Nhiệm vụ: sinh ra 1-3 phần tử CHỮ " +
    "(không sinh hình ảnh) để in lên áo, bố cục đẹp, cân đối, dễ đọc, phù hợp thẩm mỹ thời trang đường phố/Việt Nam hiện đại.\n" +
    buildContextBlock({ shirtType, shirtView, shirtColor, printArea }) +
    "\nTrả về JSON đúng schema đã cho, không thêm giải thích.";

  const userPrompt = prompt && prompt.trim()
    ? `Yêu cầu của khách hàng: "${prompt.trim()}"`
    : "Khách hàng chưa mô tả gì cụ thể — hãy tự sáng tạo một thiết kế slogan/chữ ấn tượng, ngẫu nhiên, khác biệt mỗi lần được gọi.";

  return callGemini(systemInstruction, userPrompt);
}

/**
 * Sắp xếp lại các phần tử chữ ĐANG CÓ trên canvas: giữ nguyên nội dung chữ,
 * AI quyết định lại vị trí/kích thước/màu/font cho hài hoà và dễ đọc hơn.
 */
async function arrangeDesign({ shirtType, shirtView, shirtColor, printArea, elements }) {
  const systemInstruction =
    "Bạn là một nhà thiết kế áo thun chuyên nghiệp. Nhiệm vụ: SẮP XẾP LẠI bố cục của các phần tử chữ " +
    "đã cho — cải thiện vị trí, kích thước, khoảng cách, màu sắc và font cho cân đối, hài hoà, dễ đọc. " +
    "GIỮ NGUYÊN nội dung chữ (trường text) của từng phần tử, không được đổi chữ, không thêm/bớt phần tử.\n" +
    buildContextBlock({ shirtType, shirtView, shirtColor, printArea }) +
    "\nTrả về JSON đúng schema đã cho, không thêm giải thích. Trả đúng số lượng phần tử như đầu vào, theo đúng thứ tự.";

  const userPrompt = `Các phần tử hiện tại (JSON):\n${JSON.stringify(
    elements.map((e) => ({
      text: e.text, x: e.x, y: e.y, width: e.width, height: e.height,
      rotation: e.rotation, fontFamily: e.fontFamily, fontSize: e.fontSize,
      fill: e.fill, fontStyle: e.fontStyle, align: e.align,
    }))
  )}`;

  const result = await callGemini(systemInstruction, userPrompt);

  // An toàn: nếu AI trả sai số lượng phần tử thì coi là lỗi (không tự bịa/cắt bớt).
  if (result.length !== elements.length) {
    const e = new Error("AI trả về không đúng số lượng phần tử. Vui lòng thử lại.");
    e.statusCode = 502;
    throw e;
  }
  return result;
}

module.exports = { generateDesign, arrangeDesign, ALLOWED_FONTS };
