import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use memory storage in production for base64 conversion, disk storage in development
const isProductionLike = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const storage = isProductionLike
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        if (file.fieldname === 'receipt') {
          cb(null, path.join(__dirname, '../uploads/receipts'));
        } else if (file.fieldname === 'image') {
          cb(null, path.join(__dirname, '../uploads/products'));
        } else {
          cb(null, path.join(__dirname, '../uploads'));
        }
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml)|application\/pdf/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, BMP, SVG) and PDF files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Export specific upload configurations
export const uploadReceipt = upload.single('receipt');
export const uploadProductImage = upload.single('image');
export const uploadTicketImages = upload.array('images', 5); // Allow up to 5 images per ticket/message

export default upload;
