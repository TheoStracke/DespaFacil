import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as documentoController from '../controllers/documentoController';
import upload, { azureUploadMiddleware } from '../utils/multer';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Upload de documento (despachante)
router.post(
  '/upload',
  roleMiddleware(['DESPACHANTE', 'ADMIN']),
  upload.single('file'),
  azureUploadMiddleware,
  documentoController.upload
);

// Download de documento
router.get('/:id/download', documentoController.downloadDocumento);

// Visualizar documento inline
router.get('/:id/view', documentoController.viewDocumento);

// Atualizar status (apenas admin)
router.put('/:id/status', roleMiddleware(['ADMIN']), documentoController.updateStatus);

export default router;
