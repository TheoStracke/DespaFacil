import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) {
    cb(null, uploadsDir);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, uniqueSuffix + '-' + safeOriginalName);
  },
});

const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE || '10485760', 10);
const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/png,image/jpeg').split(',');

export const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido. Use PDF, PNG ou JPG.'));
    }
    cb(null, true);
  },
});

export default upload;
