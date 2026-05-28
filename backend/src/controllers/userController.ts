import { Request, Response } from 'express';
import prisma from '../prisma/client';

export async function getMe(req: Request, res: Response) {
  try {
    const decoded: any = (req as any).user;
    const userId: string | undefined = decoded?.sub || decoded?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Não autenticado' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, cnpj: true },
    });
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Erro ao carregar perfil' });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const decoded: any = (req as any).user;
    const userId: string | undefined = decoded?.sub || decoded?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Não autenticado' });

    const { name, email } = req.body as { name?: string; email?: string };

    const data: any = {};
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (typeof email === 'string' && email.trim()) data.email = email.trim();

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhuma alteração enviada' });
    }

    // Se email informado, verificar unicidade
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ success: false, error: 'Email já está em uso' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, cnpj: true },
    });

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar perfil' });
  }
}
