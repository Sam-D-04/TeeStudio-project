require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getMockups() {
  try {
    const result = await cloudinary.search
      .expression('folder:mockups AND resource_type:image')
      .sort_by('public_id', 'desc')
      .max_results(50)
      .execute();

    const hoodieImages = result.resources.filter(r => r.public_id.toLowerCase().includes('hoodie'));
    
    console.log('--- HOODIE MOCKUPS IN CLOUDINARY ---');
    hoodieImages.forEach(img => {
      console.log(`- ${img.public_id}:`);
      console.log(`  URL: ${img.secure_url}`);
    });
  } catch (error) {
    console.error("Error fetching from Cloudinary:", error);
  }
}

getMockups();
