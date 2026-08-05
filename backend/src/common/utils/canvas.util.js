/**
 * Chuẩn hoá và kiểm tra tính hợp lệ của dữ liệu canvas từ client (Admin/Khách)
 * @param {string|object} canvasData Dữ liệu thiết kế (JSON string hoặc object)
 * @param {string} shirtType Loại áo (tshirt, polo, hoodie)
 * @param {number} maxElements Số phần tử tối đa cho phép (mặc định 200)
 * @returns {object} Dữ liệu canvas đã được chuẩn hoá (object)
 */
function chuanHoaCanvasData(canvasData, shirtType, maxElements = 200) {
  let data = canvasData;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      const err = new Error("Dữ liệu thiết kế không phải JSON hợp lệ");
      err.statusCode = 400;
      throw err;
    }
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.elements)) {
    const err = new Error("Dữ liệu thiết kế phải chứa danh sách elements");
    err.statusCode = 400;
    throw err;
  }
  
  if (data.elements.length > maxElements) {
    const err = new Error(`Thiết kế không được vượt quá ${maxElements} phần tử`);
    err.statusCode = 400;
    throw err;
  }

  return {
    ...data,
    version: Number(data.version) || 1,
    shirtType,
    shirtView: data.shirtView === "back" ? "back" : "front",
    logicalCanvas: data.logicalCanvas || { width: 500, height: 600 },
  };
}

module.exports = {
  chuanHoaCanvasData,
};
