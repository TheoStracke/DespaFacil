import { Request, Response } from 'express';
import { getParceiroStatus, solicitarParceria, listarSolicitacoes, aprovarSolicitacao, rejeitarSolicitacao } from '../services/parceiroService';

export async function status(req: Request, res: Response) {
  const { cnpj } = req.query as { cnpj?: string };
  if (!cnpj) return res.status(400).json({ error: 'CNPJ_OBRIGATORIO' });
  const data = await getParceiroStatus(cnpj);
  res.json(data);
}

export async function solicitar(req: Request, res: Response) {
  const { cnpj, empresa, telefone, email, senha, nomeResponsavel, mensagem } = req.body || {};
  if (!cnpj || !empresa || !telefone || !email || !senha) {
    return res.status(400).json({ error: 'CAMPOS_OBRIGATORIOS' });
  }
  const r = await solicitarParceria({ cnpj, empresa, telefone, email, senha, nomeResponsavel, mensagem });
  if (!r.ok) return res.status(429).json(r);
  res.json(r);
}

export async function listar(req: Request, res: Response) {
  const { status } = req.query as { status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO' };
  res.json(await listarSolicitacoes(status));
}

export async function aprovar(req: Request, res: Response) {
  res.json(await aprovarSolicitacao(req.params.id, (req as any).user?.id));
}

export async function rejeitar(req: Request, res: Response) {
  res.json(await rejeitarSolicitacao(req.params.id, req.body?.observacoes, (req as any).user?.id));
}
