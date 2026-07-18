const userDesignService = require("./user.design.service");
const uploadService = require("../uploads/upload.service");

/**
 * Uploads preview image if base64 provided.
 * @param {string} previewUrl
 * @returns {string} uploaded URL or default empty
 */
async function processPreviewUrl(previewUrl) {
  if (previewUrl && previewUrl.startsWith('data:image')) {
    try {
      return await uploadService.uploadBase64Image(previewUrl, 'user-designs');
    } catch (err) {
      console.error('Failed to upload preview', err);
      // fallback to placeholder or original string
    }
  }
  return previewUrl || '';
}

/**
 * Upload mọi ảnh do khách tải lên (element.type === "image", src base64) trong
 * canvasData lên Cloudinary, thay src bằng URL vĩnh viễn trước khi lưu DB.
 * Bắt buộc phải xử lý vì base64 lưu thẳng vào canvasData sẽ làm phình cột DB
 * và src blob:/data: không nên tồn tại vĩnh viễn trong dữ liệu đã lưu.
 */
async function processCanvasDataImages(canvasData) {
  if (!canvasData || !Array.isArray(canvasData.elements)) return canvasData;

  const elements = await Promise.all(
    canvasData.elements.map(async (el) => {
      if (el?.type === "image" && typeof el.src === "string" && el.src.startsWith("data:image")) {
        try {
          const uploadedUrl = await uploadService.uploadBase64Image(el.src, "user-designs");
          return { ...el, src: uploadedUrl };
        } catch (err) {
          console.error("Failed to upload canvas image element", err);
          return el;
        }
      }
      return el;
    })
  );

  return { ...canvasData, elements };
}

const getMyDesigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const designs = await userDesignService.getMyDesigns(userId);
    res.json({ success: true, data: designs });
  } catch (error) {
    next(error);
  }
};

const createDesign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = req.body;

    // Upload preview if it's base64
    payload.previewUrl = await processPreviewUrl(payload.previewUrl);
    // Upload từng ảnh khách tải lên (base64) trong canvasData lên Cloudinary
    payload.canvasData = await processCanvasDataImages(payload.canvasData);

    const result = await userDesignService.saveNewDesign(userId, payload);
    res.status(201).json({ success: true, data: result, message: 'Saved successfully' });
  } catch (error) {
    next(error);
  }
};

const updateDesign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const designId = parseInt(req.params.id);
    if (!designId) {
      return res.status(400).json({ success: false, message: "Invalid design ID" });
    }

    const payload = req.body;

    // Upload preview if it's base64
    payload.previewUrl = await processPreviewUrl(payload.previewUrl);
    // Upload từng ảnh khách tải lên (base64) trong canvasData lên Cloudinary
    payload.canvasData = await processCanvasDataImages(payload.canvasData);

    const result = await userDesignService.updateDesign(userId, designId, payload);
    res.json({ success: true, data: result, message: 'Updated successfully' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteDesign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const designId = parseInt(req.params.id);
    if (!designId) {
      return res.status(400).json({ success: false, message: "Invalid design ID" });
    }

    await userDesignService.deleteDesign(userId, designId);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const attachVariant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const designId = parseInt(req.params.id);
    const variantId = parseInt(req.body.variantId);
    if (!designId || !variantId) {
      return res.status(400).json({ success: false, message: "Thiếu designId hoặc variantId" });
    }

    const result = await userDesignService.attachVariant(userId, designId, variantId);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const submitForReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const designId = parseInt(req.params.id);
    if (!designId) {
      return res.status(400).json({ success: false, message: "Invalid design ID" });
    }

    const result = await userDesignService.submitForReview(userId, designId);
    res.json({ success: true, data: result, message: 'Submitted for review successfully' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyDesigns,
  createDesign,
  updateDesign,
  attachVariant,
  deleteDesign,
  submitForReview,
};
