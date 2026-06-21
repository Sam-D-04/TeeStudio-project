const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 encoded image string to Cloudinary.
 * @param {string} base64String - Data URL, e.g. "data:image/png;base64,iVBORw0KGgo..."
 * @param {string} folder - Cloudinary folder name (e.g., 'designs', 'previews')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadBase64Image = async (base64String, folder = 'previews') => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `teestudio/${folder}`,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

module.exports = {
  uploadBase64Image,
};
