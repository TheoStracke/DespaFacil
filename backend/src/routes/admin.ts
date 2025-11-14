import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as documentoController from '../controllers/documentoController';
import upload from '../utils/multer';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar documentos com filtros - permite tanto ADMIN quanto DESPACHANTE
router.get('/documentos', roleMiddleware(['ADMIN', 'DESPACHANTE']), documentoController.listAdmin);

// Histórico de certificados - permite tanto ADMIN quanto DESPACHANTE
import * as certificadoController from '../controllers/certificadoController';
router.get('/certificados', roleMiddleware(['ADMIN', 'DESPACHANTE']), certificadoController.listAll);

// Rotas exclusivas de admin
router.use(roleMiddleware(['ADMIN']));

// Exportar documentos (CSV/XLSX)
router.get('/export', documentoController.exportCSV);

// Enviar certificado
router.post('/certificados/send', upload.single('file'), documentoController.sendCertificate);

// Baixar todos documentos do motorista (ZIP)
router.get('/motoristas/:id/documentos/zip', documentoController.downloadZipMotorista);

// Solicitações de código
import * as solicitacaoCodigoController from '../controllers/solicitacaoCodigoController';
router.post('/solicitacoes-codigo', solicitacaoCodigoController.createSolicitacao);
router.get('/solicitacoes-codigo', solicitacaoCodigoController.listAll);
router.delete('/solicitacoes-codigo/:id', solicitacaoCodigoController.cancelarSolicitacao);

export default router;
