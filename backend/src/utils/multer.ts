import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { uploadToAzure } from './azureStorage';

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

const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();

const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), 'uploads');
if (provider === 'local' && !fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (_) {
    // filesystem pode ser read-only em ambientes serverless
  }
}

function buildFileName(original: string) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const safeOriginalName = original.replace(/[^a-zA-Z0-9.\-]/g, '_');
  return uniqueSuffix + '-' + safeOriginalName;
}

// Azure Blob Storage custom multer engine
class AzureBlobStorage implements multer.StorageEngine {
  private containerClient: any;

  constructor() {
    const { ContainerClient } = require('@azure/storage-blob');
    const sasUrl = process.env.AZURE_STORAGE_SAS_URL;
    if (!sasUrl) {
      throw new Error('STORAGE_PROVIDER=azure mas AZURE_STORAGE_SAS_URL não foi definido.');
    }
    this.containerClient = new ContainerClient(sasUrl);
  }

  _handleFile(req: Express.Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void) {
    const blobName = buildFileName(file.originalname);
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    blockBlobClient
      .uploadStream(file.stream, undefined, undefined, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      })
      .then((result: any) => {
        cb(null, {
          filename: blobName,
          path: blockBlobClient.url.split('?')[0], // URL sem SAS token — usamos a SAS no download
          size: result.contentLength,
        } as any);
      })
      .catch((err: any) => cb(err));
  }

  _removeFile(req: Express.Request, file: Express.Multer.File & { filename: string }, cb: (error: Error | null) => void) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(file.filename);
    blockBlobClient.delete().then(() => cb(null)).catch(cb);
  }
}

let storage: multer.StorageEngine;
if (provider === 'azure') {
  // Azure: buffer em memória; o middleware azureUploadMiddleware faz o upload real
  storage = multer.memoryStorage();
} else if (provider === 's3') {
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

// Lista completa de tipos permitidos com todas as variações de MIME types
const allowedTypes = (
  process.env.ALLOWED_FILE_TYPES ||
  [
    // PDFs
    'application/pdf',
    // Imagens
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    // Planilhas Excel (.xls)
    'application/vnd.ms-excel',
    'application/msexcel',
    'application/x-msexcel',
    'application/x-ms-excel',
    'application/x-excel',
    'application/x-dos_ms_excel',
    'application/xls',
    // Planilhas Excel (.xlsx)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/xlsx',
    // CSV
    'text/csv',
    'text/x-csv',
    'application/csv',
    'application/x-csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'text/plain', // Alguns navegadores retornam text/plain para CSV
    // Google Sheets
    'application/vnd.google-apps.spreadsheet',
    // ODS (OpenOffice/LibreOffice)
    'application/vnd.oasis.opendocument.spreadsheet',
    // Word (.doc)
    'application/msword',
    // Word (.docx)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ].join(',')
).split(',');

// Normaliza os tipos (remove espaços)
const normalizedTypes = allowedTypes.map(type => type.trim().toLowerCase());

// Extensões permitidas para validação adicional
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.xls', '.xlsx', '.csv', '.ods', '.doc', '.docx'];

export const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileMimeType = file.mimetype.toLowerCase();
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Aceitar se o MIME type está correto OU se a extensão está correta
    const isValidType = normalizedTypes.includes(fileMimeType);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      console.log(`Arquivo rejeitado - MIME type: ${fileMimeType}, Extensão: ${fileExtension}`);
      console.log(`Tipos permitidos: ${normalizedTypes.join(', ')}`);
      return cb(new Error('Tipo de arquivo não permitido. Use PDF, imagens, planilhas (XLS, XLSX, CSV, ODS) ou documentos Word (DOC, DOCX).'));
    }

    console.log(`Arquivo aceito - MIME type: ${fileMimeType}, Extensão: ${fileExtension}`);
    cb(null, true);
  },
});

/**
 * Middleware para upload no Azure Blob Storage.
 * Deve ser usado APÓS o middleware `upload` nas rotas quando STORAGE_PROVIDER=azure.
 *
 * Faz o upload do buffer para o Azure e preenche req.file.filename e req.file.path
 * com o nome do blob — mantendo compatibilidade com o restante da aplicação.
 *
 * Em outros providers (local, s3) é um no-op.
 */
export async function azureUploadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (provider !== 'azure' || !req.file) {
    return next();
  }

  try {
    const blobName = buildFileName(req.file.originalname);
    await uploadToAzure(req.file.buffer, blobName, req.file.mimetype);

    // Preencher campos que o diskStorage preencheria automaticamente
    req.file.filename = blobName;
    (req.file as any).path = blobName; // blob name usado como "path" no banco
    next();
  } catch (err: any) {
    next(err);
  }
}

export default upload;
