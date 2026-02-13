// src/products/products.constants.ts

// กำหนดชื่อโฟลเดอร์รูปภาพสินค้า
export const PRODUCT_STORAGE_FOLDER = 'products';

export const PRODUCT_IMAGE = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp',
    'application/pdf'],
};
