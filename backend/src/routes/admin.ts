import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as documentoController from '../controllers/documentoController';
import upload from '../utils/multer';

const router = Router();

// Todas as rotas requerem autenticação de admin
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// Listar documentos com filtros
router.get('/documentos', documentoController.listAdmin);

// Exportar documentos (CSV/XLSX)
router.get('/export', documentoController.exportCSV);

// Enviar certificado
router.post('/certificados/send', upload.single('file'), documentoController.sendCertificate);

export default router;
