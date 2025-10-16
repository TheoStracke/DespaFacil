import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as documentoController from '../controllers/documentoController';
import upload from '../utils/multer';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Upload de documento (despachante)
router.post(
  '/upload',
  roleMiddleware(['DESPACHANTE', 'ADMIN']),
  upload.single('file'),
  documentoController.upload
);

// Download de documento
router.get('/:id/download', documentoController.downloadDocumento);

// Atualizar status (apenas admin)
router.put('/:id/status', roleMiddleware(['ADMIN']), documentoController.updateStatus);

export default router;
