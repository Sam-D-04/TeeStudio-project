const mysql = require('mysql2/promise');

const images = [
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851344/TshirtWide-Navy_dmghba.png", name: "TshirtWide-Navy_dmghba", productId: 1, colorHex: "#1E3A8A" },
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851343/TshirtWide-Black_ppgbow.png", name: "TshirtWide-Black_ppgbow", productId: 1, colorHex: "#000000" },
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851337/Polo-Beige_levlhg.png", name: "Polo-Beige_levlhg", productId: 4, colorHex: "#D6B89A" },
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851337/Hoodie-Brown_qbpa03.png", name: "Hoodie-Brown_qbpa03", productId: 3, colorHex: "#8B4513" },
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851336/Hoodie-Grey_ftv2an.png", name: "Hoodie-Grey_ftv2an", productId: 3, colorHex: "#9CA3AF" },
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851335/TshirtWide-White_des6zh.png", name: "TshirtWide-White_des6zh", productId: 1, colorHex: "#FFFFFF" },
  { url: "https://res.cloudinary.com/dwol6aarv/image/upload/v1785851335/Polo-White_d5xzmy.png", name: "Polo-White_d5xzmy", productId: 4, colorHex: "#FFFFFF" }
];

(async () => {
  try {
    const db = await mysql.createConnection({ user: 'root', password: '', database: 'teestudio' });
    
    for (const img of images) {
      const [existing] = await db.query(
        "SELECT id FROM productimage WHERE productId = ? AND colorHex = ? AND view = 'model'",
        [img.productId, img.colorHex]
      );
      
      if (existing.length === 0) {
        await db.query(
          "INSERT INTO productimage (productId, imageUrl, altText, sortOrder, isPrimary, colorHex, view) VALUES (?, ?, ?, 0, 0, ?, 'model')",
          [img.productId, img.url, img.name, img.colorHex]
        );
        console.log(`Inserted ${img.name} -> productId: ${img.productId}, colorHex: ${img.colorHex}`);
      } else {
        console.log(`Skipped ${img.name} (already exists)`);
      }
    }
    
    db.end();
  } catch (err) {
    console.error(err);
  }
})();
