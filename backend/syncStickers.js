require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const db = require('./src/database/mysql');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function syncStickers() {
  try {
    console.log("Đang lấy danh sách ảnh từ Cloudinary folder 'Sticker'...");
    
    // Lấy danh sách tất cả các folder gốc
    const folders = await cloudinary.api.root_folders();
    console.log("Danh sách thư mục gốc trên Cloudinary:", folders.folders.map(f => f.name));
    
    // Thử tìm tất cả ảnh trong folder Stickers
    const result = await cloudinary.search
      .expression('folder:Stickers')
      .max_results(500)
      .execute();

    const images = result.resources;
    console.log(`Tìm thấy ${images.length} ảnh trên Cloudinary.`);

    if (images.length === 0) {
      console.log("Không tìm thấy ảnh nào. Hãy chắc chắn tên folder trên Cloudinary là 'Sticker'.");
      process.exit(0);
    }

    let insertedCount = 0;

    for (const img of images) {
      const url = img.secure_url;
      // Trích xuất tên file làm tên Sticker (bỏ đuôi mở rộng)
      const filename = img.filename || img.public_id.split('/').pop();
      const name = filename.replace(/[-_]/g, ' ');

      // Kiểm tra xem URL này đã có trong DB chưa
      const [existing] = await db.pool.query(
        "SELECT id FROM sticker WHERE imageUrl = ?", 
        [url]
      );

      if (existing.length === 0) {
        // Chưa có -> Thêm mới
        await db.pool.query(
          "INSERT INTO sticker (name, category, imageUrl, sortOrder, isActive) VALUES (?, ?, ?, 0, 1)",
          [name, 'Mới nhất', url]
        );
        insertedCount++;
        console.log(`[+] Đã thêm: ${name}`);
      }
    }

    console.log(`\n🎉 HOÀN TẤT! Đã đồng bộ thành công ${insertedCount} sticker mới vào Database.`);
    process.exit(0);
  } catch (error) {
    console.error("Lỗi đồng bộ:", error);
    process.exit(1);
  }
}

syncStickers();
