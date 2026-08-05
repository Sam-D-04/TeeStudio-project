/**
 * ai-design.service.js — Gọi Google Gemini để (1) sinh câu chữ/sticker + bố cục thiết kế
 * mới, hoặc (2) tự sắp xếp lại các phần tử đang có trên canvas.
 *
 * Đây là AI thật (LLM suy luận nội dung/bố cục).
 */
const { GoogleGenAI, Type } = require("@google/genai");
const cloudinary = require('cloudinary').v2;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ALLOWED_FONTS = [
  "Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Oswald", "Lato", "Quicksand",
  "Playfair Display", "Merriweather", "Lora", "PT Serif", "Noto Serif", "Cinzel",
  "Bebas Neue", "Righteous", "Lobster", "Abril Fatface", "Concert One", "Fredoka One", "Alfa Slab One", "Russo One",
  "Dancing Script", "Pacifico", "Caveat", "Satisfy", "Great Vibes", "Amatic SC",
  "Space Mono", "Roboto Mono", "Fira Code", "VT323",
];

// Biến lưu cache stickers để không phải gọi Cloudinary liên tục
let cachedStickers = null;

async function getAvailableStickers() {
  if (cachedStickers) return cachedStickers;
  try {
    const result = await cloudinary.search
      .expression('folder:Stickers/*')
      .max_results(50)
      .execute();
    cachedStickers = result.resources.map(r => r.secure_url);
    return cachedStickers;
  } catch (err) {
    console.error("[ai-design] Lỗi lấy sticker từ Cloudinary:", err);
    return []; // Trả về mảng rỗng nếu lỗi
  }
}

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

const elementSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["text", "image"], description: "Loại phần tử: 'text' hoặc 'image'." },
    text: { type: Type.STRING, description: "Nội dung chữ (nếu type='text')." },
    src: { type: Type.STRING, description: "URL của sticker (nếu type='image')." },
    x: { type: Type.NUMBER, description: "Toạ độ X góc trên-trái (0..500)." },
    y: { type: Type.NUMBER, description: "Toạ độ Y góc trên-trái (0..600)." },
    width: { type: Type.NUMBER, description: "Bề rộng." },
    height: { type: Type.NUMBER, description: "Chiều cao." },
    rotation: { type: Type.NUMBER, description: "Góc xoay độ (thường 0)." },
    fontFamily: { type: Type.STRING, description: "Font chữ (nếu type='text'). Phải nằm trong danh sách ALLOWED_FONTS." },
    fontSize: { type: Type.NUMBER, description: "Cỡ chữ (px, đơn vị logic)." },
    fill: { type: Type.STRING, description: "Mã màu hex. Phải tương phản tốt với màu áo." },
    fontStyle: { type: Type.STRING, enum: ["normal", "bold", "italic", "bold italic"] },
    textTransform: { type: Type.STRING, enum: ["uppercase", "none"] },
    align: { type: Type.STRING, enum: ["left", "center", "right"] },
    letterSpacing: { type: Type.NUMBER },
  },
  required: ["type", "x", "y", "width", "height", "rotation"], 
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    elements: { type: Type.ARRAY, items: elementSchema },
  },
  required: ["elements"],
};

const SHIRT_LABEL = { tshirt: "áo thun", polo: "áo polo", hoodie: "áo hoodie" };

async function buildContextBlock({ shirtType, shirtView, shirtColor, printArea }) {
  const stickers = await getAvailableStickers();
  const stickerContext = stickers.length > 0
    ? `\nDanh sách URL Stickers có sẵn để sử dụng (chỉ được dùng URL trong danh sách này nếu tạo element type='image'):\n${stickers.map(s => `- ${s}`).join('\n')}`
    : `\nHiện tại không có Sticker nào khả dụng, vui lòng chỉ tạo phần tử chữ (type='text').`;

  return [
    `Loại áo: ${SHIRT_LABEL[shirtType] || shirtType}, mặt ${shirtView === "back" ? "sau" : "trước"}.`,
    `Màu áo (hex): ${shirtColor}.`,
    `Vùng in cho phép (đơn vị logic, canvas tổng 500x600): left=${printArea.left.toFixed(1)}, top=${printArea.top.toFixed(1)}, width=${printArea.width.toFixed(1)}, height=${printArea.height.toFixed(1)}.`,
    `Mọi phần tử PHẢI nằm trong vùng in này (x >= left, y >= top, x+width <= left+width, y+height <= top+height).`,
    `Chỉ được dùng font trong danh sách: ${ALLOWED_FONTS.join(", ")}.`,
    `Màu (fill) phải tương phản rõ với màu áo để dễ đọc.`,
    stickerContext
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
        temperature: 0.9,
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

async function generateDesign({ shirtType, shirtView, shirtColor, printArea, prompt }) {
  const contextBlock = await buildContextBlock({ shirtType, shirtView, shirtColor, printArea });
  
  const systemInstruction =
    "Bạn là một nhà thiết kế áo thun chuyên nghiệp. Nhiệm vụ: sinh ra 1-4 phần tử thiết kế " +
    "(có thể kết hợp cả type='text' và type='image' - sticker) để in lên áo, bố cục đẹp, cân đối, dễ đọc, phù hợp thẩm mỹ thời trang hiện đại.\n" +
    contextBlock +
    "\nTrả về JSON đúng schema đã cho, không thêm giải thích.";

  const userPrompt = prompt && prompt.trim()
    ? `Yêu cầu của khách hàng: "${prompt.trim()}"`
    : "Khách hàng chưa mô tả gì cụ thể — hãy tự sáng tạo một thiết kế ấn tượng (kết hợp sticker và chữ nếu phù hợp), ngẫu nhiên, khác biệt mỗi lần được gọi.";

  return callGemini(systemInstruction, userPrompt);
}

async function arrangeDesign({ shirtType, shirtView, shirtColor, printArea, elements }) {
  const contextBlock = await buildContextBlock({ shirtType, shirtView, shirtColor, printArea });
  
  const systemInstruction =
    "Bạn là một nhà thiết kế áo thun chuyên nghiệp. Nhiệm vụ: SẮP XẾP LẠI bố cục của các phần tử thiết kế " +
    "đã cho — cải thiện vị trí, kích thước, khoảng cách, màu sắc và font cho cân đối, hài hoà, thẩm mỹ. " +
    "GIỮ NGUYÊN loại phần tử (type), nội dung chữ (text), và URL ảnh (src) của từng phần tử, không được đổi nội dung, không thêm/bớt phần tử.\n" +
    contextBlock +
    "\nTrả về JSON đúng schema đã cho, không thêm giải thích. Trả đúng số lượng phần tử như đầu vào, theo đúng thứ tự.";

  const userPrompt = `Các phần tử hiện tại (JSON):\n${JSON.stringify(
    elements.map((e) => ({
      type: e.type, src: e.src, text: e.text, x: e.x, y: e.y, width: e.width, height: e.height,
      rotation: e.rotation, fontFamily: e.fontFamily, fontSize: e.fontSize,
      fill: e.fill, fontStyle: e.fontStyle, align: e.align,
    }))
  )}`;

  const result = await callGemini(systemInstruction, userPrompt);

  if (result.length !== elements.length) {
    const e = new Error("AI trả về không đúng số lượng phần tử. Vui lòng thử lại.");
    e.statusCode = 502;
    throw e;
  }
  return result;
}

module.exports = { generateDesign, arrangeDesign, ALLOWED_FONTS };
