import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Optional S3 deps loaded lazily to avoid build-time errors when not used
let multerS3: any = null;
let S3ClientCtor: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  multerS3 = require('multer-s3');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  S3ClientCtor = require('@aws-sdk/client-s3').S3Client;
} catch (_) {
  // keep null if not installed
}

const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function buildFileName(original: string) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const safeOriginalName = original.replace(/[^a-zA-Z0-9.\-]/g, '_');
  return uniqueSuffix + '-' + safeOriginalName;
}

const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();

let storage: multer.StorageEngine;
if (provider === 's3') {
  if (!multerS3 || !S3ClientCtor) {
    throw new Error('STORAGE_PROVIDER=s3, mas as dependências não foram instaladas. Instale @aws-sdk/client-s3 e multer-s3.');
  }
  const region = process.env.S3_REGION || '';
  const bucket = process.env.S3_BUCKET || '';
  const accessKeyId = process.env.S3_ACCESS_KEY || '';
  const secretAccessKey = process.env.S3_SECRET_KEY || '';
  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('Configuração S3 incompleta. Defina S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY.');
  }
  const s3 = new S3ClientCtor({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  storage = multerS3({
    s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: Express.Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
      cb(null, buildFileName(file.originalname));
    },
    metadata: (req: Express.Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
      cb(null, { fieldName: file.fieldname });
    },
  });
} else {
  // local disk (default)
  const disk = multer.diskStorage({
    destination: function (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: any, destination: string) => void
    ) {
      cb(null, uploadsDir);
    },
    filename: function (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: any, filename: string) => void
    ) {
      cb(null, buildFileName(file.originalname));
    },
  });
  storage = disk;
}

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
