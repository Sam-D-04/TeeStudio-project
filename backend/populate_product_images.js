require('dotenv').config();
const db = require('./src/database/mysql');

const images = [
  // Product 1: TShirt (Áo thun cotton)
  { productId: 1, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', altText: 'White-front', isPrimary: 1 },
  { productId: 1, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-White-Back_w0ezzy.png', altText: 'White-back', isPrimary: 0 },
  { productId: 1, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-Navy-Front_wc2lhf.png', altText: 'Navy-front', isPrimary: 0 },
  { productId: 1, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/TShirt-Navy-Back_phdkvi.png', altText: 'Navy-back', isPrimary: 0 },
  { productId: 1, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', altText: 'Black-front', isPrimary: 0 },
  { productId: 1, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/TShirt-Black-Back_bc88nk.png', altText: 'Black-back', isPrimary: 0 },

  // Product 2: TShirt (Áo thun oversize) - reuse same TShirt images, but maybe make Black primary
  { productId: 2, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', altText: 'Black-front', isPrimary: 1 },
  { productId: 2, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/TShirt-Black-Back_bc88nk.png', altText: 'Black-back', isPrimary: 0 },
  { productId: 2, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', altText: 'White-front', isPrimary: 0 },
  { productId: 2, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-White-Back_w0ezzy.png', altText: 'White-back', isPrimary: 0 },
  { productId: 2, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-Navy-Front_wc2lhf.png', altText: 'Navy-front', isPrimary: 0 },
  { productId: 2, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/TShirt-Navy-Back_phdkvi.png', altText: 'Navy-back', isPrimary: 0 },

  // Product 3: Hoodie (Keep dummy image)
  { productId: 3, url: 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-den.jpg', altText: 'Black-front', isPrimary: 1 },

  // Product 4: Polo
  { productId: 4, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Front_b11fvx.png', altText: 'White-front', isPrimary: 1 },
  { productId: 4, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Back_vr6uas.png', altText: 'White-back', isPrimary: 0 },
  { productId: 4, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/Polo-Beige-Front_ulxjri.png', altText: 'Beige-front', isPrimary: 0 },
  { productId: 4, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Beige-Back_d4sp14.png', altText: 'Beige-back', isPrimary: 0 },
  { productId: 4, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Front_rc2pvr.png', altText: 'Navy-front', isPrimary: 0 },
  { productId: 4, url: 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Backt_uvfyjg.png', altText: 'Navy-back', isPrimary: 0 },
];

async function populate() {
  try {
    await db.pool.query('DELETE FROM ProductImage');
    console.log('Cleared ProductImage table');

    for (const img of images) {
      await db.pool.query(
        'INSERT INTO ProductImage (productId, imageUrl, altText, isPrimary) VALUES (?, ?, ?, ?)',
        [img.productId, img.url, img.altText, img.isPrimary]
      );
    }
    console.log('Inserted images successfully!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

populate();
