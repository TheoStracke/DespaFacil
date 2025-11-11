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

// Histórico de certificados (admin)
import * as certificadoController from '../controllers/certificadoController';
router.get('/certificados', certificadoController.listAll);

// Baixar todos documentos do motorista (ZIP)
router.get('/motoristas/:id/documentos/zip', documentoController.downloadZipMotorista);

// Solicitações de código
import * as solicitacaoCodigoController from '../controllers/solicitacaoCodigoController';
router.post('/solicitacoes-codigo', solicitacaoCodigoController.createSolicitacao);
router.get('/solicitacoes-codigo', solicitacaoCodigoController.listAll);
router.delete('/solicitacoes-codigo/:id', solicitacaoCodigoController.cancelarSolicitacao);

export default router;
