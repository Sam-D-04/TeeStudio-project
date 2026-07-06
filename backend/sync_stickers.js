require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function syncStickers() {
  try {
    console.log('Đang kết nối Cloudinary để lấy ảnh trong folder "Stickers"...');
    // Using search API
    const result = await cloudinary.search
      .expression('folder:Stickers')
      .max_results(500)
      .execute();
      
    const assets = result.resources;
    console.log(`Tìm thấy ${assets.length} stickers.`);
    
    if (assets.length === 0) {
      console.log('Không có sticker nào. Hủy thao tác.');
      return;
    }
    
    let sql = 'INSERT INTO `sticker` (`name`, `category`, `imageUrl`, `sortOrder`, `isActive`) VALUES\n';
    const values = [];
    
    assets.forEach((asset, index) => {
      // Dùng tên file (bỏ extension) làm tên sticker
      const name = asset.filename.replace(/'/g, "''");
      const url = asset.secure_url;
      const category = 'hinh_ve'; // Mặc định là hinh_ve
      
      values.push(`('${name}', '${category}', '${url}', ${index}, 1)`);
    });
    
    sql += values.join(',\n') + ';\n';
    
    const sqlFilePath = path.join(__dirname, 'import_stickers.sql');
    fs.writeFileSync(sqlFilePath, sql, 'utf8');
    console.log(`Đã tạo thành công file SQL tại: ${sqlFilePath}`);
  } catch (error) {
    console.error('Lỗi khi fetch stickers:', error);
  }
}

syncStickers();
