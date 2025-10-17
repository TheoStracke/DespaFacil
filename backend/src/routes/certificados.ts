import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as certificadoController from '../controllers/certificadoController';

const router = Router();

// Autenticação requerida
router.use(authMiddleware);

// Listar certificados do despachante
router.get('/', roleMiddleware(['DESPACHANTE']), certificadoController.listCertificados);

// Baixar certificado
router.get('/:id/download', roleMiddleware(['DESPACHANTE', 'ADMIN']), certificadoController.downloadCertificado);

export default router;
