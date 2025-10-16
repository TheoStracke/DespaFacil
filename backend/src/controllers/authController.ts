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
    await authService.forgotPassword(req.body.email);
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
