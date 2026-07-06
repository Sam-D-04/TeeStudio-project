require('dotenv').config();
const db = require('./src/database/mysql');

async function updateImages() {
  try {
    console.log("Updating product images...");
    
    // Product 1: Áo thun (White TShirt)
    await db.pool.query(
      `UPDATE ProductImage SET imageUrl = ? WHERE productId = ? AND isPrimary = 1`,
      ['https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', 1]
    );

    // Product 2: Áo oversize (Black TShirt)
    await db.pool.query(
      `UPDATE ProductImage SET imageUrl = ? WHERE productId = ? AND isPrimary = 1`,
      ['https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', 2]
    );

    // Product 4: Polo (White Polo)
    await db.pool.query(
      `UPDATE ProductImage SET imageUrl = ? WHERE productId = ? AND isPrimary = 1`,
      ['https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Front_b11fvx.png', 4]
    );
    
    console.log("Images updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating images:", error);
    process.exit(1);
  }
}

updateImages();
