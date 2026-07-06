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

module.exports = {
  getMyDesigns,
  createDesign,
  updateDesign,
  deleteDesign,
};
