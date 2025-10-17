import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email, captcha } = req.body;
    if (!captcha) throw new Error('Captcha obrigatório');
    await authService.forgotPassword(email, captcha);
    res.json({ success: true, message: 'Email de recuperação enviado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: 'Senha redefinida com sucesso' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function markTourVisto(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }
    await authService.markTourVisto(userId);
    res.json({ success: true, message: 'Tour marcado como visto' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getTourStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }
    const tourVisto = await authService.getTourStatus(userId);
    res.json({ success: true, tourVisto });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
