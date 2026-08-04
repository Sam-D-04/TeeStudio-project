const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    const result = await cloudinary.search
      .expression('folder:Stickers/*')
      .max_results(50)
      .execute();
    console.log("Resources:", result.resources.map(r => ({ url: r.secure_url, name: r.filename })));
  } catch (err) {
    console.error(err);
  }
}
test();
